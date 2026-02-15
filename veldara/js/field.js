import { getGameState } from "./state.js";
import { getMovementAxis } from "./input.js";

export function createField({canvasId="c"}={}){

  const canvas=document.getElementById(canvasId);
  const ctx=canvas.getContext("2d");

  const player={
    x:innerWidth*0.5,
    y:innerHeight*0.5,
    r:16,
    speed:240
  };

  let last=performance.now();
  let encounterTimer=0;

  const field={
    onEncounter:null,
    start(){ requestAnimationFrame(tick); }
  };

  function resize(){
    canvas.width=innerWidth;
    canvas.height=innerHeight;
  }
  addEventListener("resize",resize);
  resize();

  function drawJoystick(){
    const joy=window.__joy;
    if(!joy||!joy.active)return;

    ctx.globalAlpha=0.4;

    ctx.beginPath();
    ctx.arc(joy.baseX,joy.baseY,joy.max,0,Math.PI*2);
    ctx.strokeStyle="#88ccff";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(joy.knobX,joy.knobY,18,0,Math.PI*2);
    ctx.fillStyle="#88ccff";
    ctx.fill();

    ctx.globalAlpha=1;
  }

  function draw(){
    ctx.fillStyle="#0b0e14";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle="#7CFF8A";
    ctx.beginPath();
    ctx.arc(player.x,player.y,player.r,0,Math.PI*2);
    ctx.fill();

    drawJoystick();
  }

  function tick(now){

    const dt=(now-last)/1000;
    last=now;

    if(getGameState()==="field"){

      const axis=getMovementAxis();
      player.x+=axis.x*player.speed*dt;
      player.y+=axis.y*player.speed*dt;

      encounterTimer+=dt;
      if(encounterTimer>3){
        encounterTimer=0;
        if(Math.random()<0.25 && field.onEncounter){
          field.onEncounter();
        }
      }

      draw();
    }

    requestAnimationFrame(tick);
  }

  return field;
}
