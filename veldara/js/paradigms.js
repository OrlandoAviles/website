import { players, paradigms, activeParadigmIndex, setActiveParadigmIndex } from "./state.js";
import { updatePartyRoleLabels, updateParadigmHud, logMsg } from "./combat/combatHud.js";

export function paradigmText(p) {
  return p.roles.map(r => r.slice(0, 3).toUpperCase()).join(" / ");
}

export function applyParadigm(index, { silent = false } = {}) {
  if (!paradigms.length) return;

  const newIndex = (index + paradigms.length) % paradigms.length;
  setActiveParadigmIndex(newIndex);

  const p = paradigms[newIndex];

  players.forEach((plr, i) => {
    plr.role = p.roles[i] || "Commando";
  });

  updatePartyRoleLabels();
  updateParadigmHud();

  if (!silent) {
    logMsg(`Paradigm → ${p.name} (${paradigmText(p)})`);
  }
}

export function shiftPrev() {
  applyParadigm(activeParadigmIndex - 1);
}

export function shiftNext() {
  applyParadigm(activeParadigmIndex + 1);
}
