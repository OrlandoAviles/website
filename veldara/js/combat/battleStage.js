let canvas, ctx;

let actors = [];
let enemyActor;

let screenShake = 0;
let running = false;

const SPRITE_PATH = "./assets/soldier.png";
const BG_PATH = "./assets/forest-night.png";

const bgImage = new Image();
bgImage.src = BG_PATH;

let bgLoaded = false;
bgImage.onload = () => (bgLoaded = true);

export function initBattleStage() {
  canvas = document.getElementById("battleStage");
  ctx = canvas.getContext("2d");

  resize();
  window.addEventListener("resize", resize);
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function initBattleActors() {
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  const baseY = height * 0.88;
  const spacing = height * 0.18;

  actors = [
    createActor(width * 0.18, baseY, false),
    createActor(width * 0.18, baseY - spacing, false),
    createActor(width * 0.18, baseY - spacing * 2, false)
  ];

  enemyActor = createActor(width * 0.75, baseY - spacing, true);
}

function createActor(x, y, isEnemy) {
  const img = new Image();
  img.src = SPRITE_PATH;

  return {
    baseX: x,
    baseY: y,
    img,
    bob: 0,
    attackOffset: 0,
    isEnemy
  };
}

export function triggerAttackAnim(index, isEnemy = false) {
  if (isEnemy) {
    enemyActor.attackOffset = -300;
  } else {
    const actor = actors[index];
    if (!actor) return;
    actor.attackOffset = 200;
  }

  screenShake = 6;
}

export function triggerEnemyHit() {
  enemyActor.attackOffset = -20;
  screenShake = 10;
}

export function startBattleRenderLoop() {
  running = true;
  requestAnimationFrame(loop);
}

export function stopBattleRenderLoop() {
  running = false;
}

function loop() {
  if (!running) return;

  update();
  draw();

  requestAnimationFrame(loop);
}

function update() {
  actors.forEach((a) => {
    a.bob += 0.05;
    a.attackOffset *= 0.85;
  });

  enemyActor.bob += 0.05;
  enemyActor.attackOffset *= 0.85;

  screenShake *= 0.8;
}

function draw() {
  ctx.save();

  if (screenShake > 0.5) {
    const shakeX = (Math.random() - 0.5) * screenShake;
    const shakeY = (Math.random() - 0.5) * screenShake;
    ctx.translate(shakeX, shakeY);
  }

  drawBackground();

  [...actors].reverse().forEach(drawActor);
  drawActor(enemyActor);

  ctx.restore();
}

function drawBackground() {
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  if (bgLoaded) {
    const imgAspect = bgImage.width / bgImage.height;
    const canvasAspect = width / height;

    let drawWidth, drawHeight;

    if (canvasAspect > imgAspect) {
      drawWidth = width;
      drawHeight = width / imgAspect;
    } else {
      drawHeight = height;
      drawWidth = height * imgAspect;
    }

    drawHeight *= 0.85;

    const x = (width - drawWidth) * 0.5;
    const y = (height - drawHeight) * 0.6;

    ctx.drawImage(bgImage, x, y, drawWidth, drawHeight);
  } else {
    ctx.fillStyle = "#0b0e14";
    ctx.fillRect(0, 0, width, height);
  }

  const grad = ctx.createRadialGradient(
    width * 0.5,
    height * 0.6,
    height * 0.3,
    width * 0.5,
    height * 0.6,
    height * 0.9
  );

  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.65)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

function drawActor(actor) {
  const img = actor.img;
  if (!img.complete || img.naturalWidth === 0) return;

  const idle = Math.sin(actor.bob);

  const stretchY = 1 + idle * 0.025;
  const stretchX = 1 - idle * 0.02;

  const drawX = actor.baseX + actor.attackOffset;
  const drawY = actor.baseY;

  const scale = 0.35;
  const w = img.width * scale;
  const h = img.height * scale;

  ctx.save();

  ctx.translate(drawX, drawY);

  if (!actor.isEnemy) {
    ctx.scale(-stretchX, stretchY);
    ctx.drawImage(img, -w / 2, -h, w, h);
  } else {
    ctx.scale(stretchX, stretchY);
    ctx.filter = "hue-rotate(160deg)";
    ctx.drawImage(img, -w / 2, -h, w, h);
    ctx.filter = "none";
  }

  ctx.restore();
}

export function getEnemyScreenPos() {
  return {
    x: enemyActor.baseX + enemyActor.attackOffset,
    y: enemyActor.baseY - 120
  };
}

export function getPlayerScreenPos(i) {
  const actor = actors[i];

  return {
    x: actor.baseX + actor.attackOffset,
    y: actor.baseY - 120
  };
}