// state.js

export let gameState = "field";

export function setGameState(newState) {
  gameState = newState;
}

export const players = [
  { name: "Unit 1", hp: 100, maxHp: 100, atb: 0, role: "Commando", atbRate: 1.0 },
  { name: "Unit 2", hp: 100, maxHp: 100, atb: 0, role: "Ravager",  atbRate: 1.2 },
  { name: "Unit 3", hp: 100, maxHp: 100, atb: 0, role: "Medic",   atbRate: 1.4 }
];

export let enemy = {
  hp: 200,
  maxHp: 200,
  atb: 0,
  chain: 0,
  staggerPoint: 100,
  staggered: false,
  staggerTime: 0,
  chainDecay: 18,
  chainStabilized: false
};

export function resetEnemy() {
  enemy.hp = 600;
  enemy.maxHp = 600;
  enemy.atb = 0;
  enemy.chain = 0;
  enemy.staggered = false;
  enemy.staggerTime = 0;
  enemy.chainStabilized = false;
}

export let paradigms = [
  { name: "Relentless Assault", roles: ["Commando", "Ravager", "Ravager"] },
  { name: "Delta Attack", roles: ["Commando", "Commando", "Ravager"] },
  { name: "Solidarity", roles: ["Commando", "Medic", "Medic"] },
  { name: "Tri-Disaster", roles: ["Ravager", "Ravager", "Ravager"] },
];

export let activeParadigmIndex = 0;

export function setActiveParadigmIndex(i) {
  activeParadigmIndex = i;
}
