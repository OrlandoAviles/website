// js/combat/combatHud.js

import { players, enemy, paradigms, activeParadigmIndex } from "../state.js";

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

export function initCombatHud() {
  logEl = document.getElementById("log");
  partyHud = document.getElementById("partyHud");

  ui.enemyHp = document.getElementById("enemy-hp");
  ui.enemyAtb = document.getElementById("enemy-atb");
  ui.enemyChain = document.getElementById("enemy-chain");
  ui.staggerTag = document.getElementById("staggerTag");
}

export function logMsg(msg) {
  const div = document.createElement("div");
  div.textContent = msg;
  logEl.appendChild(div);
  logEl.scrollTop = logEl.scrollHeight;
}

export function clearLog() {
  logEl.innerHTML = "";
}

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

export function updatePartyRoleLabels() {
  players.forEach((p, i) => {
    if (ui.pRole[i]) ui.pRole[i].textContent = p.role;
  });
}

export function updateBars() {
  players.forEach((p, i) => {
    if (ui.pHp[i]) ui.pHp[i].style.width = (p.hp / p.maxHp * 100) + "%";
    if (ui.pAtb[i]) ui.pAtb[i].style.width = Math.min(p.atb, 100) + "%";
  });

  ui.enemyHp.style.width = (enemy.hp / enemy.maxHp * 100) + "%";
  ui.enemyAtb.style.width = Math.min(enemy.atb, 100) + "%";
  ui.enemyChain.style.width = Math.max(0, Math.min(enemy.chain, 100)) + "%";

  if (ui.staggerTag) {
    ui.staggerTag.style.display = enemy.staggered ? "inline-block" : "none";
  }
}

export function updateParadigmHud() {
  const title = document.getElementById("hudParadigmName");
  const roles = document.getElementById("hudParadigmRoles");

  const p = paradigms[activeParadigmIndex];

  if (!p) return;

  title.textContent = `Paradigm: ${p.name}`;
  roles.textContent = p.roles.map(r => r.slice(0,3).toUpperCase()).join(" / ");
}
