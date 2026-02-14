import { gameState } from "./state.js";
import { getMovementAxis } from "./input.js";


export function createField({ canvasId = "c" } = {}) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");

  const field = {
    canvas,
    ctx,
    last: performance.now(),
    encounterTimer: 0,
    player: {
      x: innerWidth * 0.5,
      y: innerHeight * 0.5,
      r: 16,
      speed: 240,
      vx: 0,
      vy: 0
    },
    onEncounter: null
  };

  function resize() {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = Math.floor(innerWidth * dpr);
    canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawGrid(spacing = 48) {
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = "#9bdcff";
    for (let x = 0; x <= innerWidth; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, innerHeight);
      ctx.stroke();
    }
    for (let y = 0; y <= innerHeight; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(innerWidth, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawPlayer() {
    ctx.fillStyle = "#7CFF8A";
    ctx.beginPath();
    ctx.arc(field.player.x, field.player.y, field.player.r, 0, Math.PI * 2);
    ctx.fill();
  }

  function draw() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.fillStyle = "#0b0e14";
    ctx.fillRect(0, 0, innerWidth, innerHeight);
    drawGrid();
    drawPlayer();
  }

  function tryEncounter(dt) {
    field.encounterTimer += dt;
    if (field.encounterTimer > 3) {
      field.encounterTimer = 0;
      if (Math.random() < 0.25) {
        if (typeof field.onEncounter === "function") field.onEncounter();
      }
    }
  }

  function tick(now) {
    if (gameState !== "field") return;

    const dt = Math.min(0.05, (now - field.last) / 1000);
    field.last = now;

    const kb = getMovementAxis();
    
    field.player.vx = kb.x * field.player.speed;
    field.player.vy = kb.y * field.player.speed;

    field.player.x += field.player.vx * dt;
    field.player.y += field.player.vy * dt;

    field.player.x = Math.max(field.player.r, Math.min(innerWidth - field.player.r, field.player.x));
    field.player.y = Math.max(field.player.r, Math.min(innerHeight - field.player.r, field.player.y));

    tryEncounter(dt);
    draw();

    requestAnimationFrame(tick);
  }

  // Public API
  field.resize = resize;
  field.start = () => {
    field.last = performance.now();
    requestAnimationFrame(tick);
  };

  // Init
  addEventListener("resize", resize);
  resize();

  return field;
}

