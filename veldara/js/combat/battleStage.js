// js/combat/battleStage.js

let battleCanvas;
let bctx;
let battleActors = [];
let battleAnimId = null;

let shakeTime = 0;
let shakeStrength = 0;

const sprite = new Image();
sprite.src = "./assets/soldier.png"; // adjust path if needed

let spriteReady = false;
sprite.onload = () => {
  spriteReady = true;
};

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
    { side:"player", i:0, baseX:w*0.20, baseY:h*0.40, state:"idle", t:0 },
    { side:"player", i:1, baseX:w*0.20, baseY:h*0.60, state:"idle", t:0 },
    { side:"player", i:2, baseX:w*0.20, baseY:h*0.80, state:"idle", t:0 },
    { side:"enemy",  i:0, baseX:w*0.78, baseY:h*0.60, state:"idle", t:0 }
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

  // Trigger screen shake
  shakeTime = 0.18;
  shakeStrength = 12;
}

function drawSprite(x, y, scale, isEnemy, scaleX = 1, scaleY = 1) {
  if (!spriteReady) return;

  const w = sprite.width * scale;
  const h = sprite.height * scale;

  bctx.save();

  if (isEnemy) {
    bctx.filter = "hue-rotate(180deg) saturate(1.3)";
  }

  bctx.translate(x, y);

  // Flip players to face right
  bctx.scale(
    isEnemy ? scaleX : -scaleX,
    scaleY
  );

  bctx.drawImage(
    sprite,
    -w / 2,
    -h,
    w,
    h
  );

  bctx.restore();
}

function drawBattleStage() {
  const rect = battleCanvas.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;

  bctx.clearRect(0, 0, w, h);

  // Screen shake
  if (shakeTime > 0) {
    const dx = (Math.random() - 0.5) * shakeStrength;
    const dy = (Math.random() - 0.5) * shakeStrength;
    bctx.save();
    bctx.translate(dx, dy);
    shakeTime -= 0.016;
  }

  const now = performance.now();

  battleActors.forEach(actor => {

    const bob = Math.sin((now / 1000) * 2.2 + actor.i * 1.7) * 4;

    let x = actor.baseX;
    let y = actor.baseY;

    let scaleX = 1 + (bob * 0.01);
    let scaleY = 1 - (bob * 0.015);

    // Horizontal attack lunge
    if (actor.state === "attack") {
      actor.t += 0.08;
      const p = Math.min(actor.t, 1);
      const l = Math.sin(p * Math.PI);

      x += (actor.side === "player" ? 1 : -1) * l * 140;

      scaleX += l * 0.15;
      scaleY -= l * 0.15;

      if (p >= 1) {
        actor.state = "idle";
        actor.t = 0;
      }
    }

    // Strong enemy recoil
    if (actor.state === "hit") {
      actor.t += 0.14;
      const p = Math.min(actor.t, 1);
      const impact = Math.sin(p * Math.PI);

      x += impact * 18;
      scaleX += impact * 0.2;
      scaleY -= impact * 0.2;

      if (p >= 1) {
        actor.state = "idle";
        actor.t = 0;
      }
    }

    const scale = 0.18;

    drawSprite(x, y, scale, actor.side === "enemy", scaleX, scaleY);
  });

  if (shakeTime > 0) {
    bctx.restore();
  }
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
