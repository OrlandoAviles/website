// /js/input.js

const keys = new Set();

const joy = {
  active: false,
  id: null,
  baseX: 0,
  baseY: 0,
  knobX: 0,
  knobY: 0,
  max: 52,
  dead: 0.1,
  axisX: 0,
  axisY: 0
};

export function initInput(canvasId = "c") {
  if (initInput._didInit) return;
  initInput._didInit = true;

  const canvas = document.getElementById(canvasId);

  addEventListener("keydown", e => keys.add(e.key.toLowerCase()));
  addEventListener("keyup", e => keys.delete(e.key.toLowerCase()));

  canvas.addEventListener("pointerdown", e => {
    if (!joy.active) {
      joy.active = true;
      joy.id = e.pointerId;
      joy.baseX = e.clientX;
      joy.baseY = e.clientY;
      joy.knobX = e.clientX;
      joy.knobY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    }
  });

  canvas.addEventListener("pointermove", e => {
    if (!joy.active || e.pointerId !== joy.id) return;

    const dx = e.clientX - joy.baseX;
    const dy = e.clientY - joy.baseY;
    const dist = Math.hypot(dx, dy);

    const clamped = Math.min(dist, joy.max);
    const nx = dist ? dx / dist : 0;
    const ny = dist ? dy / dist : 0;

    joy.knobX = joy.baseX + nx * clamped;
    joy.knobY = joy.baseY + ny * clamped;

    let ax = (nx * clamped) / joy.max;
    let ay = (ny * clamped) / joy.max;

    const len = Math.hypot(ax, ay);

    if (len < joy.dead) {
      ax = ay = 0;
    } else {
      const t = (len - joy.dead) / (1 - joy.dead);
      ax = (ax / len) * t;
      ay = (ay / len) * t;
    }

    joy.axisX = ax;
    joy.axisY = ay;
  });

  function endJoy(e) {
    if (e.pointerId === joy.id) {
      joy.active = false;
      joy.id = null;
      joy.axisX = 0;
      joy.axisY = 0;
    }
  }

  canvas.addEventListener("pointerup", endJoy);
  canvas.addEventListener("pointercancel", endJoy);
}

export function getMovementAxis() {
  let x = 0;
  let y = 0;

  if (keys.has("arrowleft") || keys.has("a")) x -= 1;
  if (keys.has("arrowright") || keys.has("d")) x += 1;
  if (keys.has("arrowup") || keys.has("w")) y -= 1;
  if (keys.has("arrowdown") || keys.has("s")) y += 1;

  const len = Math.hypot(x, y);
  if (len > 0) {
    x /= len;
    y /= len;
  }

  // Joystick overrides keyboard if active
  if (joy.axisX !== 0 || joy.axisY !== 0) {
    x = joy.axisX;
    y = joy.axisY;
  }

  return { x, y };
}

export function onKeyOnce(key, handler) {
  const k = String(key).toLowerCase();
  addEventListener("keydown", e => {
    if (e.key.toLowerCase() === k && !e.repeat) handler(e);
  });
}
