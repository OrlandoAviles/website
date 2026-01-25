console.log("Combat Sim Loaded");

import { createBattle, stepBattle } from "./combat-engine.js";

let battle = null;
let timer = null;

let logEl;
let playersEl;

/* ================= HELPERS ================= */

function slider(id) {
  const el = document.getElementById(id);
  return el ? parseFloat(el.value) : 0;
}

function select(id) {
  const el = document.getElementById(id);
  return el ? el.value : "Commando";
}

function buildConfig() {
  return {
    players: [
      { role: select("p1role"), maxHp: slider("p1hp"), atbRate: 1.0 },
      { role: select("p2role"), maxHp: slider("p2hp"), atbRate: 1.2 },
      { role: select("p3role"), maxHp: slider("p3hp"), atbRate: 1.4 }
    ],
    enemy: {
      maxHp: slider("enemyhp"),
      atbRate: slider("enemyatb")
    }
  };
}

/* ================= RENDER ================= */

function renderPlayers() {
  playersEl.innerHTML = "";
  battle.players.forEach((p, i) => {
    const div = document.createElement("div");
    div.className = "unit";
    div.innerHTML = `
      <div class="label">P${i+1} HP · ${p.role}</div>
      <div class="bar hp"><div id="p${i}-hp"></div></div>
      <div class="label">ATB</div>
      <div class="bar atb"><div id="p${i}-atb"></div></div>
    `;
    playersEl.appendChild(div);
  });
}

function updateUI() {
  if (!battle) return;

  battle.players.forEach((p,i) => {
    const hpBar = document.getElementById(`p${i}-hp`);
    const atbBar = document.getElementById(`p${i}-atb`);
    if (hpBar) hpBar.style.width = (p.hp/p.maxHp*100)+"%";
    if (atbBar) atbBar.style.width = Math.min(p.atb,100)+"%";
  });

  const eHp = document.getElementById("enemy-hp");
  const eAtb = document.getElementById("enemy-atb");

  if (eHp) eHp.style.width = (battle.enemy.hp/battle.enemy.maxHp*100)+"%";
  if (eAtb) eAtb.style.width = Math.min(battle.enemy.atb,100)+"%";

  logEl.innerHTML = battle.log.slice(-8).map(l=>`<div>${l}</div>`).join("");
}

/* ================= LOOP ================= */

function loop() {
  if (!battle || battle.over) return;
  stepBattle(battle, 0.1);
  updateUI();
  timer = setTimeout(loop, 100);
}

/* ================= INIT AFTER DOM READY ================= */

window.addEventListener("DOMContentLoaded", () => {
  console.log("Combat Sim Ready");

  logEl = document.getElementById("log");
  playersEl = document.getElementById("players");

  document.getElementById("runBattle").onclick = () => {
    clearTimeout(timer);
    battle = createBattle(buildConfig());
    renderPlayers();
    updateUI();
    loop();
  };

  document.getElementById("resetBattle").onclick = () => {
    clearTimeout(timer);
    battle = null;
    playersEl.innerHTML = "";
    logEl.innerHTML = "";
  };

  document.getElementById("pauseBattle").onclick = () => {
    clearTimeout(timer);
  };
});
