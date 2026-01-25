import { state } from "./state.js";
import { getActiveParadigm, shiftParadigm } from "./paradigms.js";
import { createBattle, stepBattle, applyParadigm } from "./combat-engine.js";

let battle = null;
let combatScene = null;
let logEl = null;
let playersContainer = null;
let combatTimer = null;
let encounterTimer = 0;

/* =========================================================
   FIELD ENCOUNTERS
========================================================= */
export function tryEncounter(dt) {
  if (state.gameState !== "field") return;

  encounterTimer += dt;
  if (encounterTimer > 3) {
    encounterTimer = 0;
    if (Math.random() < 0.25) startCombat();
  }
}

/* =========================================================
   START COMBAT
========================================================= */
export function startCombat() {
  combatScene = document.getElementById("combatScene");
  logEl = document.getElementById("log");
  playersContainer = document.getElementById("players");

  if (!combatScene || !logEl || !playersContainer) {
    console.error("Combat UI missing from DOM");
    return;
  }

  state.gameState = "combat";
  combatScene.style.display = "block";

  const paradigm = getActiveParadigm();

  const config = {
    players: paradigm.roles.map(role => ({
      role,
      maxHp: 100,
      atbRate: role === "Medic" ? 1.4 : role === "Ravager" ? 1.2 : 1.0
    })),
    enemy: { maxHp: 600, atbRate: 2 }
  };

  battle = createBattle(config);

  renderPlayers();
  updateParadigmHUD(); // show starting paradigm
  updateUI();

  combatLoop();
}

/* =========================================================
   MAIN COMBAT LOOP
========================================================= */
function combatLoop() {
  if (!battle || battle.over) return endCombat();

  stepBattle(battle, 0.1);
  updateUI();

  combatTimer = setTimeout(combatLoop, 100);
}

/* =========================================================
   END COMBAT
========================================================= */
function endCombat() {
  clearTimeout(combatTimer);
  combatTimer = null;

  combatScene.style.display = "none";
  state.gameState = "field";
}

/* =========================================================
   PARADIGM SHIFTING (ENGINE-DRIVEN)
========================================================= */
export function shiftPrev() {
  shiftParadigm(-1);
  applyShift();
}

export function shiftNext() {
  shiftParadigm(1);
  applyShift();
}

function applyShift() {
  if (!battle) return;

  const paradigm = getActiveParadigm();
  applyParadigm(battle, paradigm.roles);

  updateParadigmHUD();
  renderPlayers();
  updateUI();
}

/* =========================================================
   PARADIGM HUD DISPLAY
========================================================= */
function updateParadigmHUD() {
  const paradigm = getActiveParadigm();

  const nameEl = document.getElementById("hudParadigmName");
  const rolesEl = document.getElementById("hudParadigmRoles");

  if (!nameEl || !rolesEl) return;

  nameEl.textContent = `Paradigm: ${paradigm.name}`;
  rolesEl.textContent =
    "Roles: " + paradigm.roles.map(r => r.slice(0, 3).toUpperCase()).join(" / ");
}

/* =========================================================
   RENDER PLAYERS
========================================================= */
function renderPlayers() {
  playersContainer.innerHTML = "";

  battle.players.forEach((p, i) => {
    const unit = document.createElement("div");
    unit.className = "unit";
    unit.innerHTML = `
      <div class="label">Player ${i + 1} HP · ${p.role}</div>
      <div class="bar hp"><div id="p${i}-hp"></div></div>
      <div class="label">ATB</div>
      <div class="bar atb"><div id="p${i}-atb"></div></div>
    `;
    playersContainer.appendChild(unit);
  });
}

/* =========================================================
   UPDATE UI FROM ENGINE STATE
========================================================= */
function updateUI() {
  if (!battle) return;

  battle.players.forEach((p, i) => {
    document.getElementById(`p${i}-hp`).style.width =
      (p.hp / p.maxHp * 100) + "%";
    document.getElementById(`p${i}-atb`).style.width =
      Math.min(p.atb, 100) + "%";
  });

  document.getElementById("enemy-hp").style.width =
    (battle.enemy.hp / battle.enemy.maxHp * 100) + "%";
  document.getElementById("enemy-atb").style.width =
    Math.min(battle.enemy.atb, 100) + "%";

  renderLog();
}

/* =========================================================
   LOG DISPLAY
========================================================= */
function renderLog() {
  if (!logEl || !battle) return;

  logEl.innerHTML = battle.log
    .slice(-8)
    .map(line => `<div>${line}</div>`)
    .join("");
}
