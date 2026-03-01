import { players, enemy, paradigms, getParadigmIndex } from "../state.js";

// ===== DOM REFS =====
let logEl;
let partyHud;

const ui = {
  pHp: [],
  pAtb: [],
  pRole: [],
  enemyHp: null,
  enemyAtb: null,
  enemyChain: null,
  staggerTag: null
};

// ===== INIT =====
export function initCombatHud() {
  logEl = document.getElementById("log");
  partyHud = document.getElementById("partyHud");

  ui.enemyHp = document.getElementById("enemy-hp");
  ui.enemyAtb = document.getElementById("enemy-atb");
  ui.enemyChain = document.getElementById("enemy-chain");
  ui.staggerTag = document.getElementById("staggerTag");
}

// ===== LOG =====
export function logMsg(msg) {
  const div = document.createElement("div");
  div.textContent = msg;
  logEl.appendChild(div);
  logEl.scrollTop = logEl.scrollHeight;
}

export function clearLog() {
  logEl.innerHTML = "";
}

// ===== PARTY HUD BUILD =====
export function buildPartyHud() {
  partyHud.innerHTML = "";
  ui.pHp = [];
  ui.pAtb = [];
  ui.pRole = [];

  players.forEach((p, i) => {
    const row = document.createElement("div");
    row.className = "unitRow";

    row.innerHTML = `
      <div class="portrait"></div>
      <div class="rowMain">
        <div class="rowTop">
          <div class="rowName">${p.name}</div>
          <div class="rowRole" id="p${i}-role">${p.role}</div>
        </div>
        <div class="rowBarWrap hp">
          <div class="rowBarFill" id="p${i}-hp"></div>
        </div>
        <div class="rowBarWrap atb">
          <div class="rowBarFill" id="p${i}-atb"></div>
        </div>
      </div>
    `;

    partyHud.appendChild(row);

    ui.pHp[i] = row.querySelector(`#p${i}-hp`);
    ui.pAtb[i] = row.querySelector(`#p${i}-atb`);
    ui.pRole[i] = row.querySelector(`#p${i}-role`);
  });
}

// ===== ROLE LABELS =====
export function updatePartyRoleLabels() {
  players.forEach((p, i) => {
    if (ui.pRole[i]) {
      ui.pRole[i].textContent = p.role;
    }
  });
}

// ===== BAR UPDATES =====
export function updateBars() {

  // ---- Player Bars ----
  players.forEach((p, i) => {
    if (ui.pHp[i]) {
      ui.pHp[i].style.width = (p.hp / p.maxHp * 100) + "%";
    }

    if (ui.pAtb[i]) {
      ui.pAtb[i].style.width = Math.min(p.atb, 100) + "%";
    }
  });

  // ---- Enemy HP ----
  if (ui.enemyHp) {
    ui.enemyHp.style.width = (enemy.hp / enemy.maxHp * 100) + "%";
  }

  // ---- Enemy ATB ----
  if (ui.enemyAtb) {
    ui.enemyAtb.style.width = Math.min(enemy.atb, 100) + "%";
  }

  // ---- Chain / Stagger ----
  if (ui.enemyChain) {

    // Neutral: decay represents current visible pressure
    if (!enemy.staggered) {

      const THRESHOLD = 350; // must match combatCore
      const pct = enemy.chain > 0
        ? Math.min(enemy.decay / THRESHOLD, 1) * 100
        : 0;

      ui.enemyChain.style.width = pct + "%";
    }

    // Stagger: bar becomes timer
    else {

      const STAGGER_SECONDS = 5.0; // must match combatCore
      const pct = Math.max(enemy.staggerTimer / STAGGER_SECONDS, 0) * 100;

      ui.enemyChain.style.width = pct + "%";
    }
  }

  // ---- Stagger Tag ----
  if (ui.staggerTag) {
    ui.staggerTag.style.display = enemy.staggered ? "block" : "none";
  }
}

// ===== PARADIGM HUD =====
export function updateParadigmHud() {
  const title = document.getElementById("hudParadigmName");
  const roles = document.getElementById("hudParadigmRoles");

  const index = getParadigmIndex();
  const p = paradigms[index];

  if (!p) return;

  if (title) {
    title.textContent = `Paradigm: ${p.name}`;
  }

  if (roles) {
    roles.textContent = p.roles
      .map(r => r.slice(0, 3).toUpperCase())
      .join(" / ");
  }
}