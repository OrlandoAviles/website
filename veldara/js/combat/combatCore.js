import {
  players,
  enemy,
  resetEnemy,
  setGameState
} from "../state.js";

import {
  buildPartyHud,
  updateBars,
  updatePartyRoleLabels,
  logMsg,
  clearLog,
  updateParadigmHud,
  spawnFloatingNumber
} from "./combatHud.js";

import {
  initBattleStage,
  initBattleActors,
  startBattleRenderLoop,
  stopBattleRenderLoop,
  triggerAttackAnim,
  triggerEnemyHit,
  triggerStaggerZoom,
  getEnemyScreenPos,
  getPlayerScreenPos
} from "./battleStage.js";

import { applyParadigm } from "../paradigms.js";


let battleOver = false;
let timer = null;

// stagger impact freeze
let freezeTimer = 0;

function alive(){
  return players.filter(p=>p.hp>0);
}


/* =========================
CHAIN CONSTANTS
========================= */

const THRESHOLD = 350;
const FIRST_HIT_CHAIN = 100;

const RAVAGER_CHAIN_GAIN = 45;
const BASE_DECAY_SPEED = 95;
const RAVAGER_ACCEL = 10;

const COMMANDO_STABILIZE = 92;
const MIN_DECAY_SPEED = 15;

const STAGGER_SECONDS = 20.0;
const STAGGER_BASE_MULT = 500;

const TICK_RATE = 0.1;


/* =========================
DAMAGE
========================= */

function damageEnemy(base){

  const mult = enemy.chain > 0 ? enemy.chain/100 : 1;

  const dmg = Math.round(base * mult);

  enemy.hp = Math.max(0, enemy.hp - dmg);

  return dmg;

}


/* =========================
STAGGER
========================= */

function enterStagger(){

  enemy.staggered = true;
  enemy.chain = STAGGER_BASE_MULT;
  enemy.staggerTimer = STAGGER_SECONDS;

  triggerStaggerZoom();

  freezeTimer = 0.5;

  players.forEach(p=>{
    if(p.hp>0) p.atb = 100;
  });

  const pos = getEnemyScreenPos();

  spawnFloatingNumber("STAGGER!",pos.x,pos.y-40,"chain");

  logMsg("STAGGER!");

}


/* =========================
RAVAGER HIT
========================= */

function handleRavagerHit(){

  if(!enemy.staggered){

    if(enemy.chain===0){

      enemy.chain = FIRST_HIT_CHAIN;
      enemy.decaySpeed = BASE_DECAY_SPEED;

    }else{

      enemy.chain += RAVAGER_CHAIN_GAIN;
      enemy.decaySpeed += RAVAGER_ACCEL;

    }

    enemy.decay = enemy.chain;

    if(enemy.chain >= THRESHOLD){
      enterStagger();
    }

  }else{

    enemy.chain += 18;

  }

}


/* =========================
COMMANDO HIT
========================= */

function handleCommandoHit(){

  if(!enemy.staggered){

    if(enemy.chain < 100){

      enemy.chain = 100;

      if(enemy.decaySpeed===0){
        enemy.decaySpeed = BASE_DECAY_SPEED;
      }

    }

    if(enemy.chain>0){

      enemy.decaySpeed = Math.max(
        MIN_DECAY_SPEED,
        enemy.decaySpeed - COMMANDO_STABILIZE
      );

      enemy.decay = enemy.chain;

    }

  }else{

    enemy.chain += 10;

  }

}


/* =========================
CHAIN UPDATE
========================= */

function updateChain(){

  if(!enemy.staggered && enemy.chain>0){

    enemy.decay -= enemy.decaySpeed * TICK_RATE;

    if(enemy.decay > enemy.chain){
      enemy.decay = enemy.chain;
    }

    if(enemy.decay <= 0){

      enemy.chain = 0;
      enemy.decay = 0;
      enemy.decaySpeed = 0;

      logMsg("Chain dropped.");

    }

  }

  else if(enemy.staggered){

    enemy.staggerTimer -= TICK_RATE;

    if(enemy.staggerTimer <= 0){

      enemy.staggered = false;

      enemy.chain = 0;
      enemy.decay = 0;
      enemy.decaySpeed = 0;

      logMsg("Stagger ended.");

    }

  }

}


/* =========================
ROLE ACTION
========================= */

function roleAction(p,i){

  triggerAttackAnim(i);

  if(p.role==="Ravager"){

    const dmg = damageEnemy(35);

    triggerEnemyHit();

    const pos = getEnemyScreenPos();

    spawnFloatingNumber(dmg,pos.x,pos.y,"damage");

    logMsg(`P${i+1} Ravager → ${dmg}`);

    handleRavagerHit();

  }

  if(p.role==="Commando"){

    const dmg = damageEnemy(45);

    triggerEnemyHit();

    const pos = getEnemyScreenPos();

    spawnFloatingNumber(dmg,pos.x,pos.y,"damage");

    logMsg(`P${i+1} Commando → ${dmg}`);

    handleCommandoHit();

  }

  if(p.role==="Medic"){

    const targets = players
      .filter(pl=>pl.hp>0)
      .sort((a,b)=>(a.hp/a.maxHp)-(b.hp/b.maxHp));

    if(targets.length>0){

      const t = targets[0];

      t.hp = Math.min(t.maxHp,t.hp+30);

      const pos = getPlayerScreenPos(players.indexOf(t));

      spawnFloatingNumber("+30",pos.x,pos.y,"heal");

      logMsg(`P${i+1} heals 30`);

    }

  }

}


/* =========================
BATTLE LOOP
========================= */

function loop(){

  if(battleOver) return;

  if(freezeTimer > 0){
    freezeTimer -= TICK_RATE;
    timer = setTimeout(loop,100);
    return;
  }

  players.forEach((p,i)=>{

    if(p.hp<=0) return;

    p.atb += p.atbRate * 1.6;

    if(p.atb >= 100){

      roleAction(p,i);

      p.atb = 0;

    }

  });

  enemy.atb += 2;

  if(enemy.atb >= 100){

    const t = alive()[0];

    if(t){

      triggerAttackAnim(0,true);

      t.hp -= 20;

      const pos = getPlayerScreenPos(players.indexOf(t));

      spawnFloatingNumber("20",pos.x,pos.y,"damage");

    }

    enemy.atb = 0;

  }

  updateChain();
  updateBars();

  if(enemy.hp <= 0){

    battleOver = true;

    logMsg("Victory!");

    setTimeout(endCombat,800);

  }

  timer = setTimeout(loop,100);

}


/* =========================
START COMBAT
========================= */

export function startCombat(){

  setGameState("combat");

  document.getElementById("combatScene").style.display = "block";

  battleOver = false;

  clearLog();

  resetEnemy();

  players.forEach(p=>p.atb=0);

  buildPartyHud();

  initBattleStage();
  initBattleActors();

  startBattleRenderLoop();

  applyParadigm(0,{silent:true});

  updatePartyRoleLabels();
  updateParadigmHud();

  updateBars();

  logMsg("Encounter!");

  loop();

}


/* =========================
END COMBAT
========================= */

export function endCombat(){

  clearTimeout(timer);

  stopBattleRenderLoop();

  document.getElementById("combatScene").style.display = "none";

  setGameState("field");

}