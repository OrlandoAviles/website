import {
  players,
  enemy,
  resetEnemy,
  activeParadigmIndex,
  setGameState
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

let battleOver = false;
let combatTimerId = null;

function alivePlayers() {
  return players.filter(p => p.hp > 0);
}

function addChain(amount) {
  if (enemy.staggered) return;
  enemy.chain = Math.min(100, enemy.chain + amount);
}

function damageEnemy(amount) {
  const mult = enemy.staggered ? 1.75 : 1;
  const dealt = Math.round(amount * mult);
  enemy.hp = Math.max(0, enemy.hp - dealt);
  return dealt;
}

function roleAction(p, i) {
  triggerAttackAnim(i);

  if (p.role === "Commando") {
    addChain(6);
    const dealt = damageEnemy(25);
    triggerEnemyHit();
    logMsg(`P${i + 1} attacks (${dealt})`);
  }

  if (p.role === "Ravager") {
    addChain(16);
    const dealt = damageEnemy(15);
    triggerEnemyHit();
    logMsg(`P${i + 1} rapid hits (${dealt})`);
  }

  if (p.role === "Medic") {
    const targets = alivePlayers().sort((a,b) => (a.hp/a.maxHp) - (b.hp/b.maxHp));
    if (targets.length) {
      const t = targets[0];
      t.hp = Math.min(t.maxHp, t.hp + 30);
      logMsg(`P${i + 1} heals (30)`);
    }
  }
}

function combatLoop() {
  if (battleOver) return;

  players.forEach((p, i) => {
    if (p.hp <= 0) return;

    p.atb += p.atbRate * 1.6;

    if (p.atb >= 100) {
      roleAction(p, i);
      p.atb = 0;
    }
  });

  enemy.atb += 2;

  if (enemy.atb >= 100) {
    const targets = alivePlayers();
    if (targets.length > 0) {
      const t = targets[Math.floor(Math.random() * targets.length)];
      t.hp = Math.max(0, t.hp - 20);
      logMsg("Enemy attacks (20)");
    }
    enemy.atb = 0;
  }

  updateBars();

  if (enemy.hp <= 0) {
    battleOver = true;
    logMsg("Victory!");
    setTimeout(endCombat, 800);
  }

  if (alivePlayers().length === 0) {
    battleOver = true;
    logMsg("Defeat...");
    setTimeout(endCombat, 800);
  }

  combatTimerId = setTimeout(combatLoop, 100);
}

export function startCombat() {
  setGameState("combat");

  const scene = document.getElementById("combatScene");
  scene.style.display = "block";

  battleOver = false;
  clearLog();

  players.forEach(p => p.atb = 0);
  resetEnemy();

  buildPartyHud();
  initBattleStage();
  initBattleActors();
  startBattleRenderLoop();

  applyParadigm(activeParadigmIndex, { silent: true });
  updatePartyRoleLabels();
  updateParadigmHud();
  updateBars();

  logMsg("Encounter!");

  combatLoop();
}

export function endCombat() {
  if (combatTimerId) clearTimeout(combatTimerId);
  stopBattleRenderLoop();

  const scene = document.getElementById("combatScene");
  scene.style.display = "none";

  setGameState("field");
}
