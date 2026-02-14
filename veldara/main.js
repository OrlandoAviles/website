// main.js
/* =========================================================
   CORE STATE
========================================================= */
let gameState = "field"; // "field" | "combat" | "menu"

/* =========================================================
   CANVAS SETUP (FIELD)
========================================================= */
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

function resize() {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  canvas.width = Math.floor(innerWidth * dpr);
  canvas.height = Math.floor(innerHeight * dpr);
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener("resize", resize);
resize();

/* =========================================================
   PLAYER (FIELD)
========================================================= */
const player = {
  x: innerWidth * 0.5,
  y: innerHeight * 0.5,
  r: 16,
  speed: 240,
  vx: 0,
  vy: 0
};

/* =========================================================
   INPUT
========================================================= */
const keys = new Set();
addEventListener("keydown", e => keys.add(e.key.toLowerCase()));
addEventListener("keyup", e => keys.delete(e.key.toLowerCase()));

function keyboardAxis() {
  let x = 0, y = 0;
  if (keys.has("arrowleft") || keys.has("a")) x -= 1;
  if (keys.has("arrowright") || keys.has("d")) x += 1;
  if (keys.has("arrowup") || keys.has("w")) y -= 1;
  if (keys.has("arrowdown") || keys.has("s")) y += 1;
  const len = Math.hypot(x, y);
  if (len > 0) { x /= len; y /= len; }
  return { x, y };
}

/* =========================================================
   VIRTUAL JOYSTICK
========================================================= */
const joy = {
  active: false,
  id: null,
  baseX: 0, baseY: 0,
  knobX: 0, knobY: 0,
  max: 52,
  dead: 0.10,
  axisX: 0, axisY: 0
};

function setJoy(px, py) {
  const dx = px - joy.baseX;
  const dy = py - joy.baseY;
  const dist = Math.hypot(dx, dy);
  const clamped = Math.min(dist, joy.max);
  const nx = dist ? dx / dist : 0;
  const ny = dist ? dy / dist : 0;

  joy.knobX = joy.baseX + nx * clamped;
  joy.knobY = joy.baseY + ny * clamped;

  let ax = (nx * clamped) / joy.max;
  let ay = (ny * clamped) / joy.max;
  const alen = Math.hypot(ax, ay);

  if (alen < joy.dead) {
    ax = ay = 0;
  } else {
    const t = (alen - joy.dead) / (1 - joy.dead);
    ax = (ax / alen) * t;
    ay = (ay / alen) * t;
  }

  joy.axisX = ax;
  joy.axisY = ay;
}

canvas.addEventListener("pointerdown", e => {
  if (gameState !== "field") return;
  canvas.setPointerCapture(e.pointerId);
  if (!joy.active) {
    joy.active = true;
    joy.id = e.pointerId;
    joy.baseX = e.clientX;
    joy.baseY = e.clientY;
    joy.knobX = e.clientX;
    joy.knobY = e.clientY;
  }
});

canvas.addEventListener("pointermove", e => {
  if (gameState !== "field") return;
  if (joy.active && e.pointerId === joy.id) {
    setJoy(e.clientX, e.clientY);
  }
});

function endJoy(e) {
  if (e.pointerId === joy.id) {
    joy.active = false;
    joy.id = null;
    joy.axisX = joy.axisY = 0;
  }
}
canvas.addEventListener("pointerup", endJoy);
canvas.addEventListener("pointercancel", endJoy);
canvas.addEventListener("pointerout", endJoy);

/* =========================================================
   PARADIGMS (FIELD MENU SYSTEM)
========================================================= */
const ROLE_LIST = ["Commando", "Ravager", "Medic"];

let paradigms = [
  { name: "Relentless Assault", roles: ["Commando", "Ravager", "Ravager"] },
  { name: "Delta Attack",       roles: ["Commando", "Commando", "Ravager"] },
  { name: "Solidarity",         roles: ["Commando", "Medic", "Medic"] },
  { name: "Tri-Disaster",       roles: ["Ravager", "Ravager", "Ravager"] },
];

let activeParadigmIndex = 0;

function paradigmText(p) {
  return p.roles.map(r => r.slice(0,3).toUpperCase()).join(" / ");
}

function flashShift() {
  const fx = document.getElementById("shiftFlash");
  fx.classList.add("on");
  setTimeout(() => fx.classList.remove("on"), 160);
}

/* =========================================================
   COMBAT HUD (TOP)
========================================================= */
function updateCombatHud() {
  const p = paradigms[activeParadigmIndex];
  document.getElementById("hudParadigmName").textContent = `Paradigm: ${p.name}`;
  document.getElementById("hudParadigmRoles").textContent = `Roles: ${paradigmText(p)}  (Q/E)`;
}

function applyParadigm(index, { silent = false } = {}) {
  if (!paradigms.length) return;
  activeParadigmIndex = (index + paradigms.length) % paradigms.length;
  const p = paradigms[activeParadigmIndex];

  players.forEach((plr, i) => {
    plr.role = p.roles[i] || "Commando";
  });

  updateCombatHud();
  updatePartyRoleLabels();

  if (!silent && typeof logMsg === "function") {
    logMsg(`Paradigm → ${p.name} (${paradigmText(p)})`);
    flashShift();
  }
}

/* =========================================================
   PARADIGM MENU RENDER
========================================================= */
function renderParadigmMenu() {
  const list = document.getElementById("paradigmList");
  list.innerHTML = "";

  paradigms.forEach((p, idx) => {
    const card = document.createElement("div");
    card.className = "pCard";

    const isActive = idx === activeParadigmIndex;

    card.innerHTML = `
      <div class="pTop">
        <input class="pName" value="${p.name.replaceAll('"','&quot;')}" data-name="${idx}" />
        <div class="pBadge">${isActive ? "ACTIVE" : ""}</div>
      </div>
      <div class="pRoles">
        ${[0,1,2].map(i => `
          <select data-idx="${idx}" data-slot="${i}">
            ${ROLE_LIST.map(r => `<option value="${r}" ${p.roles[i]===r?"selected":""}>${r}</option>`).join("")}
          </select>
        `).join("")}
      </div>
      <div class="pActions">
        <button class="pSet" data-set="${idx}">${isActive ? "Active" : "Set Active"}</button>
        <button class="pDel" data-del="${idx}">Delete</button>
      </div>
    `;

    list.appendChild(card);
  });

  list.querySelectorAll(".pName").forEach(inp => {
    inp.addEventListener("input", () => {
      const idx = +inp.dataset.name;
      paradigms[idx].name = inp.value;
      if (idx === activeParadigmIndex) updateCombatHud();
    });
  });

  list.querySelectorAll("select").forEach(sel => {
    sel.addEventListener("change", () => {
      const pIdx = +sel.dataset.idx;
      const slot = +sel.dataset.slot;
      paradigms[pIdx].roles[slot] = sel.value;
      if (pIdx === activeParadigmIndex) {
        applyParadigm(activeParadigmIndex, { silent: true });
      }
      renderParadigmMenu();
    });
  });

  list.querySelectorAll(".pSet").forEach(btn => {
    btn.addEventListener("click", () => {
      activeParadigmIndex = +btn.dataset.set;
      applyParadigm(activeParadigmIndex, { silent: true });
      renderParadigmMenu();
    });
  });

  list.querySelectorAll(".pDel").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = +btn.dataset.del;
      paradigms.splice(idx, 1);
      if (activeParadigmIndex >= paradigms.length) activeParadigmIndex = Math.max(0, paradigms.length - 1);
      applyParadigm(activeParadigmIndex, { silent: true });
      renderParadigmMenu();
    });
  });
}

/* =========================================================
   MENU OPEN/CLOSE
========================================================= */
const fieldMenuBtn = document.getElementById("fieldMenuBtn");
const fieldMenu = document.getElementById("fieldMenu");
const paradigmMenu = document.getElementById("paradigmMenu");

function openFieldMenu() {
  if (gameState !== "field") return;
  gameState = "menu";
  fieldMenu.style.display = "block";
}
function closeFieldMenu() {
  if (gameState !== "menu") return;
  fieldMenu.style.display = "none";
  paradigmMenu.style.display = "none";
  gameState = "field";
  last = performance.now();
  requestAnimationFrame(tick);
}

function openParadigms() {
  paradigmMenu.style.display = "block";
  fieldMenu.style.display = "none";
  renderParadigmMenu();
}
function closeParadigms() {
  paradigmMenu.style.display = "none";
  fieldMenu.style.display = "block";
}

fieldMenuBtn.addEventListener("click", () => {
  if (gameState === "field") openFieldMenu();
  else if (gameState === "menu") closeFieldMenu();
});

document.getElementById("openParadigms").addEventListener("click", openParadigms);
document.getElementById("closeMenu").addEventListener("click", closeFieldMenu);
document.getElementById("closeParadigms").addEventListener("click", closeParadigms);

document.getElementById("addParadigm").addEventListener("click", () => {
  paradigms.push({ name: `Paradigm ${paradigms.length+1}`, roles: ["Commando","Ravager","Medic"] });
  renderParadigmMenu();
});

/* =========================================================
   RANDOM ENCOUNTERS
========================================================= */
let encounterTimer = 0;

function tryEncounter(dt) {
  encounterTimer += dt;
  if (encounterTimer > 3) {
    encounterTimer = 0;
    if (Math.random() < 0.25) startCombat();
  }
}

/* =========================================================
   COMBAT SYSTEM (LOGIC)
========================================================= */
const combatScene = document.getElementById("combatScene");
const logEl = document.getElementById("log");

const players = [
  { name: "Unit 1", hp: 100, maxHp: 100, atb: 0, role: "Commando", atbRate: 1.0 },
  { name: "Unit 2", hp: 100, maxHp: 100, atb: 0, role: "Ravager",  atbRate: 1.2 },
  { name: "Unit 3", hp: 100, maxHp: 100, atb: 0, role: "Medic",   atbRate: 1.4 }
];

let enemy = {
  hp: 200,
  maxHp: 200,
  atb: 0,
  chain: 0,
  staggerPoint: 100,
  staggered: false,
  staggerTime: 0,
  chainDecay: 18,
  chainStabilized: false
};

const speed = 1.6;
let battleOver = false;
let combatTimerId = null;

function logMsg(msg) {
  const div = document.createElement("div");
  div.textContent = msg;
  logEl.appendChild(div);
  logEl.scrollTop = logEl.scrollHeight;
}

/* =========================================================
   PARTY HUD (BOTTOM) – FF13 bars + portrait anchors
========================================================= */
const partyHud = document.getElementById("partyHud");

const ui = {
  pHp: [],
  pAtb: [],
  pRole: [],
  enemyHp: document.getElementById("enemy-hp"),
  enemyAtb: document.getElementById("enemy-atb"),
  enemyChain: document.getElementById("enemy-chain"),
  staggerTag: document.getElementById("staggerTag")
};

function buildPartyHud() {
  partyHud.innerHTML = "";
  ui.pHp = [];
  ui.pAtb = [];
  ui.pRole = [];

  players.forEach((p, i) => {
    const row = document.createElement("div");
    row.className = "unitRow";
    row.innerHTML = `
      <div class="portrait" aria-hidden="true"></div>
      <div class="rowMain">
        <div class="rowTop">
          <div class="rowName" id="p${i}-name">${p.name}</div>
          <div class="rowRole" id="p${i}-role">${p.role}</div>
        </div>
        <div class="rowBarWrap hp"><div class="rowBarFill" id="p${i}-hp"></div></div>
        <div class="rowBarWrap atb"><div class="rowBarFill" id="p${i}-atb"></div></div>
      </div>
    `;
    partyHud.appendChild(row);

    ui.pHp[i] = row.querySelector(`#p${i}-hp`);
    ui.pAtb[i] = row.querySelector(`#p${i}-atb`);
    ui.pRole[i] = row.querySelector(`#p${i}-role`);
  });
}

function updatePartyRoleLabels() {
  if (!ui.pRole.length) return;
  players.forEach((p, i) => {
    if (ui.pRole[i]) ui.pRole[i].textContent = p.role;
  });
}

function updateBars() {
  players.forEach((p, i) => {
    if (ui.pHp[i]) ui.pHp[i].style.width = (p.hp / p.maxHp * 100) + "%";
    if (ui.pAtb[i]) ui.pAtb[i].style.width = Math.min(p.atb, 100) + "%";
  });

  ui.enemyHp.style.width = (enemy.hp / enemy.maxHp * 100) + "%";
  ui.enemyAtb.style.width = Math.min(enemy.atb, 100) + "%";
  ui.enemyChain.style.width = Math.max(0, Math.min(enemy.chain, 100)) + "%";

  if (ui.staggerTag) ui.staggerTag.style.display = enemy.staggered ? "inline-block" : "none";
}

/* =========================================================
   STAGGER / CHAIN
========================================================= */
function alivePlayers() {
  return players.filter(p => p.hp > 0);
}

function endBattle(resultText) {
  battleOver = true;
  logMsg(resultText);
  setTimeout(() => endCombat(), 900);
}

function addChain(amount) {
  if (enemy.staggered) return;
  enemy.chain = Math.min(100, enemy.chain + amount);
  if (enemy.chain >= enemy.staggerPoint) startStagger();
}

function startStagger() {
  if (enemy.staggered) return;
  enemy.staggered = true;
  enemy.staggerTime = 8.0;
  logMsg("STAGGERED!");
  flashShift();
}

function endStagger() {
  enemy.staggered = false;
  enemy.staggerTime = 0;
  enemy.chain = 0;
  logMsg("Stagger ended.");
}

function updateEnemyChain(dt) {
  if (enemy.staggered) {
    enemy.staggerTime -= dt;
    if (enemy.staggerTime <= 0) endStagger();
    return;
  }
  const decayFactor = enemy.chainStabilized ? 0.25 : 1;
  enemy.chain = Math.max(0, enemy.chain - (enemy.chainDecay * decayFactor) * dt);
  enemy.chainStabilized = false;
}

function damageEnemy(amount) {
  const mult = enemy.staggered ? 1.75 : 1;
  const dealt = Math.round(amount * mult);
  enemy.hp = Math.max(0, enemy.hp - dealt);
  return dealt;
}

/* =========================================================
   BATTLE STAGE (CANVAS RENDERER)
========================================================= */
const battleCanvas = document.getElementById("battleStage");
const bctx = battleCanvas.getContext("2d");

let battleActors = [];
let battleAnimId = null;

function resizeBattleStage() {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const rect = battleCanvas.getBoundingClientRect();
  battleCanvas.width = Math.floor(rect.width * dpr);
  battleCanvas.height = Math.floor(rect.height * dpr);
  bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function initBattleActors() {
  resizeBattleStage();
  const w = battleCanvas.getBoundingClientRect().width;
  const h = battleCanvas.getBoundingClientRect().height;

  battleActors = [
    { side:"player", i:0, x: w*0.18, y: h*0.35, baseX:w*0.18, baseY:h*0.35, state:"idle", t:0 },
    { side:"player", i:1, x: w*0.18, y: h*0.52, baseX:w*0.18, baseY:h*0.52, state:"idle", t:0 },
    { side:"player", i:2, x: w*0.18, y: h*0.69, baseX:w*0.18, baseY:h*0.69, state:"idle", t:0 },
    { side:"enemy",  i:0, x: w*0.80, y: h*0.52, baseX:w*0.80, baseY:h*0.52, state:"idle", t:0 }
  ];
}

function triggerAttackAnim(playerIndex) {
  const a = battleActors.find(x => x.side === "player" && x.i === playerIndex);
  if (!a) return;
  a.state = "attack";
  a.t = 0;
}

function triggerEnemyHit() {
  const e = battleActors.find(x => x.side === "enemy");
  if (!e) return;
  e.state = "hit";
  e.t = 0;
}

function drawStick(x, y, color) {
  // Slightly chunkier-than-stick MVP, easier to judge motion.
  bctx.fillStyle = color;

  // head
  bctx.beginPath();
  bctx.arc(x, y - 24, 9, 0, Math.PI * 2);
  bctx.fill();

  // body
  bctx.fillRect(x - 8, y - 18, 16, 26);

  // legs
  bctx.beginPath();
  bctx.moveTo(x - 8, y + 8);
  bctx.lineTo(x, y + 26);
  bctx.lineTo(x + 8, y + 8);
  bctx.closePath();
  bctx.fill();

  // weapon nub (just to read direction)
  bctx.fillRect(x + 10, y - 10, 14, 4);
}

function drawBattleStage() {
  const rect = battleCanvas.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;

  bctx.clearRect(0, 0, w, h);

  // subtle ground line (light)
  bctx.globalAlpha = 0.18;
  bctx.strokeStyle = "#9bdcff";
  bctx.beginPath();
  bctx.moveTo(w*0.08, h*0.78);
  bctx.lineTo(w*0.92, h*0.78);
  bctx.stroke();
  bctx.globalAlpha = 1;

  const now = performance.now();

  battleActors.forEach(actor => {
    // idle float
    const bob = Math.sin((now / 1000) * 2.2 + actor.i * 1.7) * 3.0;

    let x = actor.baseX;
    let y = actor.baseY + bob;

    if (actor.state === "attack") {
      actor.t += 0.07;
      const p = Math.min(actor.t, 1);
      const l = Math.sin(p * Math.PI);

      x += (actor.side === "player" ? 1 : -1) * l * 120;
      y -= l * 36;

      if (p >= 1) {
        actor.state = "idle";
        actor.t = 0;
      }
    } else if (actor.state === "hit") {
      actor.t += 0.12;
      const p = Math.min(actor.t, 1);
      const kick = Math.sin(p * Math.PI) * 10;
      x += kick;
      if (p >= 1) {
        actor.state = "idle";
        actor.t = 0;
      }
    }

    const color = actor.side === "enemy" ? "#ff6b6b" : "#7CFF8A";
    drawStick(x, y, color);
  });
}

function battleRenderLoop() {
  if (gameState !== "combat") return;
  drawBattleStage();
  battleAnimId = requestAnimationFrame(battleRenderLoop);
}

/* =========================================================
   ROLE ACTIONS (LOGIC + ANIM HOOKS)
========================================================= */
function roleAction(p, i) {
  triggerAttackAnim(i);

  if (p.role === "Commando") {
    enemy.chainStabilized = true;
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

/* =========================================================
   COMBAT LOOP
========================================================= */
let combatLast = performance.now();

function combatLoop() {
  if (battleOver || gameState !== "combat") return;

  const now = performance.now();
  const dt = Math.min(0.25, (now - combatLast) / 1000);
  combatLast = now;

  players.forEach((p, i) => {
    if (p.hp <= 0) return;
    p.atb += p.atbRate * speed;
    if (p.atb >= 100) {
      roleAction(p, i);
      p.atb = 0;
    }
  });

  enemy.atb += 2 * speed;
  if (enemy.atb >= 100) {
    const targets = alivePlayers();
    if (targets.length > 0) {
      const t = targets[Math.floor(Math.random() * targets.length)];
      t.hp = Math.max(0, t.hp - 20);
      logMsg("Enemy attacks (20)");
    }
    enemy.atb = 0;
  }

  updateEnemyChain(dt);
  updateBars();

  if (enemy.hp <= 0) return endBattle("Victory!");
  if (alivePlayers().length === 0) return endBattle("Defeat...");

  combatTimerId = setTimeout(combatLoop, 100);
}

function initCombat() {
  battleOver = false;
  if (combatTimerId) clearTimeout(combatTimerId);

  logEl.innerHTML = "";
  players.forEach(p => p.atb = 0);

  enemy = {
    hp: 600,
    maxHp: 600,
    atb: 0,
    chain: 0,
    staggerPoint: 100,
    staggered: false,
    staggerTime: 0,
    chainDecay: 18,
    chainStabilized: false
  };

  buildPartyHud();

  applyParadigm(activeParadigmIndex, { silent: true });
  updateCombatHud();

  initBattleActors();
  updateBars();

  combatLast = performance.now();
  logMsg(`Encounter! (Starting Paradigm: ${paradigms[activeParadigmIndex]?.name || "N/A"})`);
}

function startCombat() {
  gameState = "combat";
  combatScene.style.display = "block";
  combatScene.setAttribute("aria-hidden", "false");

  initCombat();
  battleRenderLoop();
  combatLoop();
}

function endCombat() {
  if (combatTimerId) clearTimeout(combatTimerId);
  combatTimerId = null;
  battleOver = true;

  if (battleAnimId) cancelAnimationFrame(battleAnimId);
  battleAnimId = null;

  combatScene.style.display = "none";
  combatScene.setAttribute("aria-hidden", "true");

  gameState = "field";
  last = performance.now();
  requestAnimationFrame(tick);
}

window.addEventListener("resize", () => {
  if (gameState === "combat") resizeBattleStage();
});

/* =========================================================
   COMBAT CONTROLS: PARADIGM SHIFT
========================================================= */
function shiftPrev() {
  if (gameState !== "combat") return;
  applyParadigm(activeParadigmIndex - 1);
}
function shiftNext() {
  if (gameState !== "combat") return;
  applyParadigm(activeParadigmIndex + 1);
}

document.getElementById("shiftPrev").addEventListener("click", shiftPrev);
document.getElementById("shiftNext").addEventListener("click", shiftNext);
document.getElementById("escapeCombat").addEventListener("click", () => {
  if (gameState !== "combat") return;
  logMsg("You fled...");
  setTimeout(() => endCombat(), 400);
});

addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();

  if (gameState === "field") {
    if (k === "escape" || k === "m") openFieldMenu();
  }

  if (gameState === "menu") {
    if (k === "escape") closeFieldMenu();
  }

  if (gameState === "combat") {
    if (k === "q") shiftPrev();
    if (k === "e") shiftNext();
    if (k === "escape") {
      logMsg("You fled...");
      setTimeout(() => endCombat(), 400);
    }
  }
});

/* =========================================================
   GAME LOOP (FIELD)
========================================================= */
let last = performance.now();

function tick(now) {
  if (gameState !== "field") return;

  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  const kb = keyboardAxis();
  let ax = kb.x, ay = kb.y;
  if (joy.axisX || joy.axisY) {
    ax = joy.axisX;
    ay = joy.axisY;
  }

  player.vx = ax * player.speed;
  player.vy = ay * player.speed;
  player.x += player.vx * dt;
  player.y += player.vy * dt;

  player.x = Math.max(player.r, Math.min(innerWidth - player.r, player.x));
  player.y = Math.max(player.r, Math.min(innerHeight - player.r, player.y));

  tryEncounter(dt);
  draw();
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/* =========================================================
   RENDERING (FIELD)
========================================================= */
function drawGrid(spacing = 48) {
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = "#9bdcff";
  for (let x = 0; x <= innerWidth; x += spacing) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, innerHeight); ctx.stroke();
  }
  for (let y = 0; y <= innerHeight; y += spacing) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(innerWidth, y); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawPlayer() {
  ctx.fillStyle = "#7CFF8A";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fill();
}

function drawJoystick() {
  if (!joy.active) return;
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = "#1b2433";
  ctx.beginPath();
  ctx.arc(joy.baseX, joy.baseY, joy.max, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "#9bdcff";
  ctx.beginPath();
  ctx.arc(joy.knobX, joy.knobY, joy.max * 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function draw() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  ctx.fillStyle = "#0b0e14";
  ctx.fillRect(0, 0, innerWidth, innerHeight);
  drawGrid();
  drawPlayer();
  drawJoystick();
}

/* =========================================================
   INIT
========================================================= */
applyParadigm(activeParadigmIndex, { silent: true });
updateCombatHud();
