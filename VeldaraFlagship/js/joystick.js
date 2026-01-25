export const joy = {
  active:false, id:null,
  baseX:0, baseY:0,
  knobX:0, knobY:0,
  max:52, dead:0.1,
  axisX:0, axisY:0
};

export function attachJoystick(canvas, state) {
  function setJoy(px, py) {
    const dx = px - joy.baseX;
    const dy = py - joy.baseY;
    const dist = Math.hypot(dx, dy);
    const clamped = Math.min(dist, joy.max);
    const nx = dist ? dx/dist : 0;
    const ny = dist ? dy/dist : 0;

    joy.knobX = joy.baseX + nx * clamped;
    joy.knobY = joy.baseY + ny * clamped;

    let ax = (nx * clamped)/joy.max;
    let ay = (ny * clamped)/joy.max;
    const len = Math.hypot(ax, ay);

    if (len < joy.dead) ax = ay = 0;
    else {
      const t = (len - joy.dead)/(1-joy.dead);
      ax = (ax/len)*t;
      ay = (ay/len)*t;
    }

    joy.axisX = ax;
    joy.axisY = ay;
  }

  canvas.addEventListener("pointerdown", e => {
    if (state.gameState !== "field") return;
    canvas.setPointerCapture(e.pointerId);
    joy.active = true;
    joy.id = e.pointerId;
    joy.baseX = joy.knobX = e.clientX;
    joy.baseY = joy.knobY = e.clientY;
  });

  canvas.addEventListener("pointermove", e => {
    if (joy.active && e.pointerId === joy.id) {
      setJoy(e.clientX, e.clientY);
    }
  });

  function end(e){
    if(e.pointerId===joy.id){
      joy.active=false;
      joy.axisX=joy.axisY=0;
    }
  }

  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
}
