// js/combat/battleStage.js

let battleCanvas;
let bctx;
let battleActors = [];
let battleAnimId = null;

export function initBattleStage(canvasId = "battleStage") {
  battleCanvas = document.getElementById(canvasId);
  bctx = battleCanvas.getContext("2d");
  resizeBattleStage();
}

export function resizeBattleStage() {
  if (!battleCanvas) return;

  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const rect = battleCanvas.getBoundingClientRect();

  battleCanvas.width = Math.floor(rect.width * dpr);
  battleCanvas.height = Math.floor(rect.height * dpr);

  bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function initBattleActors() {
  const rect = battleCanvas.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;

  battleActors = [
    { side:"player", i:0, baseX:w*0.18, baseY:h*0.35, state:"idle", t:0 },
    { side:"player", i:1, baseX:w*0.18, baseY:h*0.52, state:"idle", t:0 },
    { side:"player", i:2, baseX:w*0.18, baseY:h*0.69, state:"idle", t:0 },
    { side:"enemy",  i:0, baseX:w*0.80, baseY:h*0.52, state:"idle", t:0 }
  ];
}

export function triggerAttackAnim(playerIndex) {
  const a = battleActors.find(x => x.side === "player" && x.i === playerIndex);
  if (!a) return;
  a.state = "attack";
  a.t = 0;
}

export function triggerEnemyHit() {
  const e = battleActors.find(x => x.side === "enemy");
  if (!e) return;
  e.state = "hit";
  e.t = 0;
}

function drawStick(x, y, color) {
  bctx.fillStyle = color;

  bctx.beginPath();
  bctx.arc(x, y - 22, 8, 0, Math.PI * 2);
  bctx.fill();

  bctx.fillRect(x - 7, y - 16, 14, 24);

  bctx.beginPath();
  bctx.moveTo(x - 7, y + 8);
  bctx.lineTo(x, y + 24);
  bctx.lineTo(x + 7, y + 8);
  bctx.closePath();
  bctx.fill();
}

function drawBattleStage() {
  const rect = battleCanvas.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;

  bctx.clearRect(0, 0, w, h);

  const now = performance.now();

  battleActors.forEach(actor => {

    const bob = Math.sin((now / 1000) * 2.2 + actor.i * 1.7) * 3;

    let x = actor.baseX;
    let y = actor.baseY + bob;

    if (actor.state === "attack") {
      actor.t += 0.07;
      const p = Math.min(actor.t, 1);
      const l = Math.sin(p * Math.PI);

      x += (actor.side === "player" ? 1 : -1) * l * 110;
      y -= l * 30;

      if (p >= 1) {
        actor.state = "idle";
        actor.t = 0;
      }
    }

    if (actor.state === "hit") {
      actor.t += 0.12;
      const p = Math.min(actor.t, 1);
      x += Math.sin(p * Math.PI) * 10;

      if (p >= 1) {
        actor.state = "idle";
        actor.t = 0;
      }
    }

    const color = actor.side === "enemy" ? "#ff6b6b" : "#7CFF8A";
    drawStick(x, y, color);
  });
}

export function startBattleRenderLoop() {
  function loop() {
    drawBattleStage();
    battleAnimId = requestAnimationFrame(loop);
  }
  loop();
}

export function stopBattleRenderLoop() {
  if (battleAnimId) cancelAnimationFrame(battleAnimId);
}
