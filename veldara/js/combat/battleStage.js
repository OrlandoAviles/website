let canvas, ctx;

let actors = [];
let enemyActor;

let screenShake = 0;
let running = false;


/* =========================
CAMERA SYSTEM
========================= */

let cameraZoom = 1;
let zoomTarget = 1;

let cameraX = 0;
let cameraY = 0;

let targetX = 0;
let targetY = 0;


/* =========================
ASSETS
========================= */

const SPRITE_PATH = "./assets/soldier.png";
const BG_PATH = "./assets/forest-night.png";

const bgImage = new Image();
bgImage.src = BG_PATH;

let bgLoaded = false;
bgImage.onload = () => bgLoaded = true;


/* =========================
INIT
========================= */

export function initBattleStage(){

  canvas = document.getElementById("battleStage");
  ctx = canvas.getContext("2d");

  resize();

  const rect = canvas.getBoundingClientRect();

  cameraX = rect.width / 2;
  cameraY = rect.height / 2;

  targetX = cameraX;
  targetY = cameraY;

  window.addEventListener("resize", resize);

}

function resize(){

  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  ctx.setTransform(dpr,0,0,dpr,0,0);

}


/* =========================
ACTOR SETUP
========================= */

export function initBattleActors(){

  const rect = canvas.getBoundingClientRect();

  const width = rect.width;
  const height = rect.height;

  const baseY = height * 0.85;
  const spacing = height * 0.18;

  actors = [
    createActor(width * 0.22, baseY, false),
    createActor(width * 0.22, baseY - spacing, false),
    createActor(width * 0.22, baseY - spacing * 2, false)
  ];

  enemyActor = createActor(width * 0.75, baseY - spacing, true);

}

function createActor(x,y,isEnemy){

  const img = new Image();
  img.src = SPRITE_PATH;

  return {
    baseX:x,
    baseY:y,
    img,
    bob:0,
    attackOffset:0,
    isEnemy
  };

}


/* =========================
ANIMATION TRIGGERS
========================= */

export function triggerAttackAnim(index,isEnemy=false){

  if(isEnemy){

    enemyActor.attackOffset = -320;

  }else{

    const actor = actors[index];
    if(!actor) return;

    actor.attackOffset = 220;

  }

  screenShake = 6;

}

export function triggerEnemyHit(){

  if(!enemyActor) return;

  enemyActor.attackOffset = -24;

  screenShake = 10;

}


/* =========================
CAMERA EVENTS
========================= */

export function triggerStaggerZoom(){

  const pos = getEnemyScreenPos();

  targetX = pos.x;
  targetY = pos.y;

  zoomTarget = 1.18;

  setTimeout(()=>{

    zoomTarget = 1;

    const rect = canvas.getBoundingClientRect();

    targetX = rect.width/2;
    targetY = rect.height/2;

  },600);

}


/* =========================
RENDER LOOP
========================= */

export function startBattleRenderLoop(){

  running = true;
  requestAnimationFrame(loop);

}

export function stopBattleRenderLoop(){

  running = false;

}

function loop(){

  if(!running) return;

  update();
  draw();

  requestAnimationFrame(loop);

}


/* =========================
UPDATE
========================= */

function update(){

  cameraZoom += (zoomTarget - cameraZoom) * 0.08;

  cameraX += (targetX - cameraX) * 0.08;
  cameraY += (targetY - cameraY) * 0.08;

  actors.forEach(a=>{
    a.bob += 0.05;
    a.attackOffset *= 0.85;
  });

  if(enemyActor){
    enemyActor.bob += 0.05;
    enemyActor.attackOffset *= 0.85;
  }

  screenShake *= 0.8;

}


/* =========================
DRAW
========================= */

function draw(){

  if(!ctx) return;

  const rect = canvas.getBoundingClientRect();

  ctx.save();

  ctx.translate(cameraX,cameraY);
  ctx.scale(cameraZoom,cameraZoom);
  ctx.translate(-cameraX,-cameraY);

  if(screenShake > 0.5){

    const sx = (Math.random()-0.5) * screenShake;
    const sy = (Math.random()-0.5) * screenShake;

    ctx.translate(sx,sy);

  }

  drawBackground();

  [...actors].reverse().forEach(drawActor);

  if(enemyActor) drawActor(enemyActor);

  ctx.restore();

}


/* =========================
BACKGROUND
========================= */

function drawBackground(){

  const rect = canvas.getBoundingClientRect();

  const width = rect.width;
  const height = rect.height;

  if(bgLoaded){

    const imgAspect = bgImage.width/bgImage.height;
    const canvasAspect = width/height;

    let drawWidth,drawHeight;

    if(canvasAspect > imgAspect){

      drawWidth = width;
      drawHeight = width/imgAspect;

    }else{

      drawHeight = height;
      drawWidth = height*imgAspect;

    }

    drawHeight *= 0.9;

    const x = (width-drawWidth)*0.5;
    const y = (height-drawHeight)*0.65;

    ctx.drawImage(bgImage,x,y,drawWidth,drawHeight);

  }

}


/* =========================
ACTOR DRAW
========================= */

function drawActor(actor){

  const img = actor.img;

  if(!img.complete || img.naturalWidth === 0) return;

  const idle = Math.sin(actor.bob);

  const stretchY = 1 + idle * 0.025;
  const stretchX = 1 - idle * 0.02;

  const drawX = actor.baseX + actor.attackOffset;
  const drawY = actor.baseY;

  const scale = 0.35;

  const w = img.width * scale;
  const h = img.height * scale;

  ctx.save();
  ctx.translate(drawX,drawY);

  if(!actor.isEnemy){

    ctx.scale(-stretchX,stretchY);
    ctx.drawImage(img,-w/2,-h,w,h);

  }else{

    ctx.scale(stretchX,stretchY);
    ctx.filter = "hue-rotate(160deg)";
    ctx.drawImage(img,-w/2,-h,w,h);
    ctx.filter = "none";

  }

  ctx.restore();

}


/* =========================
SCREEN POSITIONS
========================= */

export function getEnemyScreenPos(){

  if(!enemyActor){
    return {x:window.innerWidth*0.75,y:window.innerHeight*0.45};
  }

  return {
    x:enemyActor.baseX + enemyActor.attackOffset,
    y:enemyActor.baseY - 120
  };

}

export function getPlayerScreenPos(i){

  const actor = actors[i];

  if(!actor){
    return {x:window.innerWidth*0.2,y:window.innerHeight*0.7};
  }

  return {
    x:actor.baseX + actor.attackOffset,
    y:actor.baseY - 120
  };

}