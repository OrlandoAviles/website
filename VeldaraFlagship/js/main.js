import { state } from "./state.js";
import { initKeyboard } from "./input.js";
import { attachJoystick } from "./joystick.js";
import { updateField } from "./field.js";
import { drawField, initCanvas } from "./render.js";
import { tryEncounter, shiftPrev, shiftNext } from "./combat.js";

// Canvas setup
const canvas = document.getElementById("c");
initCanvas(canvas);

// Input systems
initKeyboard();
attachJoystick(canvas, state);

// Combat HUD buttons
document.getElementById("shiftPrev")?.addEventListener("click", shiftPrev);
document.getElementById("shiftNext")?.addEventListener("click", shiftNext);

// Keyboard paradigm shifting
addEventListener("keydown", (e) => {
  if (state.gameState !== "combat") return;

  const k = e.key.toLowerCase();
  if (k === "q") shiftPrev();
  if (k === "e") shiftNext();
});

// Main loop
function loop(now) {
  const dt = Math.min(0.05, (now - state.lastTime) / 1000);
  state.lastTime = now;

  if (state.gameState === "field") {
    updateField(dt);
    tryEncounter(dt);
    drawField();
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
