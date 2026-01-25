import { state } from "./state.js";
import { getActiveParadigm, paradigmText, shiftParadigm } from "./paradigms.js";

let combatScene = null;
let logEl = null;
let players = [];
let enemy = null;
let battleOver = false;
let combatTimer = null;
let encounterTimer = 0;
let warnedMissingUI = false;

/* ================= FIELD ENCOUNTERS ================= */

export function tryEncounter(dt) {
  if (state.gameState !== "field") return;

  encounterTimer += dt;
  if (encounterTimer > 3) {
    encounterTimer = 0;
    if (Math.random() < 0.25) startCombat();
  }
}

/* ================= START / END ================= */

export function startCombat() {
  combatScene = document.getElementById("combatScene");
  logEl = document.getElementById("log");

  if (!combatScene || !logEl) {
    if (!warnedMissingUI) {
      console.error("Combat UI not found in DOM");
      warnedMissingUI = true;
    }
    return;
  }

  state.gameState = "combat";
  combatScene.style.display = "block";

  initCombat();
  combatLoop();
}

function endCombat() {
  clearTimeout(combatTimer);
  combatTimer = null;
  battleOver = true;

  combatScene.style.display = "none";
  state.gameState = "field";
}

/* ================= INIT ================= */

function initCombat() {
  battleOver = false;
  logEl.innerHTML = "";

  players = [
    { hp: 100, maxHp: 100, atb: 0, role: "Commando", atbRate: 1.0 },
    { hp: 100, maxHp: 100, atb: 0, role: "Ravager",  atbRate: 1.2 },
    { hp: 100, maxHp: 100, atb: 0, role: "Medic",    atbRate: 1.4 }
  ];

  enemy = { hp: 600, maxHp: 600, atb: 0 };

  applyParadigmRoles();
  log(`Encounter! (Starting Paradigm: ${getActiveParadigm().name})`);
}

/* ================= PARADIGMS ================= */

function applyParadigmRoles() {
  const p = getActiveParadigm();

  players.forEach((plr, i) => {
    plr.role = p.roles[i] || "Commando";
  });

  document.getElementById("hudParadigmName").textContent =
    `Paradigm: ${p.name}`;
  document.getElementById("hudParadigmRoles").textContent =
    `Roles: ${paradigmText(p)}`;

  renderPlayers();
  updateBars();
}

export function shiftPrev() {
  shiftParadigm(-1);
  applyParadigmRoles();
}

export function shiftNext() {
  shiftParadigm(1);
  applyParadigmRoles();
}

/* ================= RENDER PLAYERS ================= */

function renderPlayers() {
  const container = document.getElementById("players");
  container.innerHTML = "";

  players.forEach((p, i) => {
    const unit = document.createElement("div");
    unit.className = "unit";
    unit.innerHTML = `
      <div class="label">Player ${i + 1} HP · ${p.role}</div>
      <div class="bar hp"><div id="p${i}-hp"></div></div>
      <div class="label">ATB</div>
      <div class="bar atb"><div id="p${i}-atb"></div></div>
    `;
    container.appendChild(unit);
  });
}

/* ================= LOOP ================= */

function combatLoop() {
  if (battleOver || state.gameState !== "combat") return;

  players.forEach((p, i) => {
    if (p.hp <= 0) return;

    p.atb += p.atbRate * 1.6;
    if (p.atb >= 100) {
      playerAct(p, i);
      p.atb = 0;
    }
  });

  enemy.atb += 2;
  if (enemy.atb >= 100) {
    enemyAct();
    enemy.atb = 0;
  }

  updateBars();

  if (enemy.hp <= 0) {
    log("Victory!");
    return endCombat();
  }

  if (players.every(p => p.hp <= 0)) {
    log("Defeat...");
    return endCombat();
  }

  combatTimer = setTimeout(combatLoop, 100);
}

/* ================= ACTIONS ================= */

function playerAct(p, i) {
  if (p.role === "Medic") {
    const target = players.reduce((a, b) =>
      a.hp / a.maxHp < b.hp / b.maxHp ? a : b
    );
    target.hp = Math.min(target.maxHp, target.hp + 30);
    log(`P${i + 1} heals`);
  } else {
    enemy.hp = Math.max(0, enemy.hp - 20);
    log(`P${i + 1} attacks`);
  }
}

function enemyAct() {
  const living = players.filter(p => p.hp > 0);
  if (!living.length) return;
  const target = living[Math.floor(Math.random() * living.length)];
  target.hp = Math.max(0, target.hp - 20);
  log("Enemy attacks");
}

/* ================= UI ================= */

function updateBars() {
  players.forEach((p, i) => {
    document.getElementById(`p${i}-hp`).style.width =
      (p.hp / p.maxHp * 100) + "%";
    document.getElementById(`p${i}-atb`).style.width =
      Math.min(p.atb, 100) + "%";
  });

  document.getElementById("enemy-hp").style.width =
    (enemy.hp / enemy.maxHp * 100) + "%";
  document.getElementById("enemy-atb").style.width =
    Math.min(enemy.atb, 100) + "%";
}

function log(msg) {
  const div = document.createElement("div");
  div.textContent = msg;
  logEl.appendChild(div);
  logEl.scrollTop = logEl.scrollHeight;
}
