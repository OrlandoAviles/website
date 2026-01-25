// paradigms.js
export const ROLE_LIST = ["Commando", "Ravager", "Medic"];

export let paradigms = [
  { name: "Relentless Assault", roles: ["Commando", "Ravager", "Ravager"] },
  { name: "Delta Attack", roles: ["Commando", "Commando", "Ravager"] },
  { name: "Solidarity", roles: ["Commando", "Medic", "Medic"] },
  { name: "Tri-Disaster", roles: ["Ravager", "Ravager", "Ravager"] }
];

export let activeParadigmIndex = 0;

export function paradigmText(p) {
  return p.roles.map(r => r.slice(0,3).toUpperCase()).join(" / ");
}

export function getActiveParadigm() {
  return paradigms[activeParadigmIndex];
}

export function setActiveParadigm(index) {
  activeParadigmIndex = (index + paradigms.length) % paradigms.length;
}

export function shiftParadigm(dir = 1) {
  setActiveParadigm(activeParadigmIndex + dir);
  return getActiveParadigm();
}
