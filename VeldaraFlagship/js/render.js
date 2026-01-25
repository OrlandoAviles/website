import { player } from "./state.js";
import { joy } from "./joystick.js";

let canvas, ctx;

export function initCanvas(c){
  canvas = c;
  ctx = canvas.getContext("2d");
  resize();
  addEventListener("resize", resize);
}

function resize(){
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.style.width = innerWidth+"px";
  canvas.style.height = innerHeight+"px";
  ctx.setTransform(dpr,0,0,dpr,0,0);
}

export function drawField(){
  ctx.clearRect(0,0,innerWidth,innerHeight);
  ctx.fillStyle="#0b0e14";
  ctx.fillRect(0,0,innerWidth,innerHeight);

  ctx.fillStyle="#7CFF8A";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI*2);
  ctx.fill();

  if(joy.active){
    ctx.globalAlpha=.6;
    ctx.beginPath();
    ctx.arc(joy.baseX, joy.baseY, joy.max, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha=1;
  }
}
