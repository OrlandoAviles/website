import {
  players,
  enemy,
  resetEnemy,
  setGameState,
  getGameState
} from "../state.js";

import {
  buildPartyHud,
  updateBars,
  updatePartyRoleLabels,
  logMsg,
  clearLog,
  updateParadigmHud
} from "./combatHud.js";

import {
  initBattleStage,
  initBattleActors,
  startBattleRenderLoop,
  stopBattleRenderLoop,
  triggerAttackAnim,
  triggerEnemyHit
} from "./battleStage.js";

import { applyParadigm } from "../paradigms.js";

let battleOver=false;
let timer=null;

function alive(){return players.filter(p=>p.hp>0);}

function damageEnemy(amount){
  enemy.hp=Math.max(0,enemy.hp-amount);
}

function roleAction(p,i){
  triggerAttackAnim(i);

  if(p.role==="Commando"){
    damageEnemy(45);
    triggerEnemyHit();
    logMsg(`P${i+1} attacks`);
  }
  if(p.role==="Ravager"){
    damageEnemy(35);
    triggerEnemyHit();
    logMsg(`P${i+1} rapid hits`);
  }
  if (p.role === "Medic") {
    const targets = players
      .filter(pl => pl.hp > 0)
      .sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));

    if (targets.length > 0) {
      const t = targets[0];
      t.hp = Math.min(t.maxHp, t.hp + 30);
      logMsg(`P${i+1} heals 30`);
    }
  }
}

function loop(){
  if(battleOver)return;

  players.forEach((p,i)=>{
    if(p.hp<=0)return;
    p.atb+=p.atbRate*1.6;
    if(p.atb>=100){
      roleAction(p,i);
      p.atb=0;
    }
  });

  enemy.atb += 2;
  if (enemy.atb >= 100) {
    const t = alive()[0];
    if (t) {
      triggerAttackAnim(0, true); // enemy lunge
      t.hp -= 20;
    }
    enemy.atb = 0;
  }

  updateBars();

  if(enemy.hp<=0){
    battleOver=true;
    logMsg("Victory!");
    setTimeout(endCombat,800);
  }

  timer=setTimeout(loop,100);
}

export function startCombat(){
  setGameState("combat");
  document.getElementById("combatScene").style.display="block";

  battleOver=false;
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

export function endCombat(){
  clearTimeout(timer);
  stopBattleRenderLoop();
  document.getElementById("combatScene").style.display="none";
  setGameState("field");
}
