import { gameState } from "./state.js";
import { initInput, onKeyOnce } from "./input.js";
import { createField } from "./field.js";
import { startCombat } from "./combat/combatCore.js";
import { initCombatHud } from "./combat/combatHud.js";
import { shiftPrev, shiftNext } from "./paradigms.js";

initInput();
initCombatHud();

const field = createField({ canvasId: "c" });
field.onEncounter = () => startCombat();
field.start();

onKeyOnce("q", () => {
  if (gameState === "combat") shiftPrev();
});

onKeyOnce("e", () => {
  if (gameState === "combat") shiftNext();
});
