
import { initInput, onKeyOnce } from "./input.js";
import { createField } from "./field.js";
import { initCombatHud } from "./combat/combatHud.js";
import { shiftPrev, shiftNext } from "./paradigms.js";
import { getGameState } from "./state.js";
import { startCombat, endCombat } from "./combat/combatCore.js";

initInput();
initCombatHud();

const field=createField({canvasId:"c"});
field.onEncounter=()=>startCombat();
field.start();

onKeyOnce("q",()=>{
  if(getGameState()==="combat") shiftPrev();
});

onKeyOnce("e",()=>{
  if(getGameState()==="combat") shiftNext();
});

// Combat UI button bindings
document.getElementById("shiftPrev")?.addEventListener("click", () => {
  if (getGameState() === "combat") shiftPrev();
});

document.getElementById("shiftNext")?.addEventListener("click", () => {
  if (getGameState() === "combat") shiftNext();
});

document.getElementById("escapeCombat")?.addEventListener("click", () => {
  if (getGameState() === "combat") {
    endCombat();
  }
});

