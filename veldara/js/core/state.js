let gameState = "field";

export function setGameState(v) {
  gameState = v;
}

export function getGameState() {
  return gameState;
}

export const players = [
  { name:"Unit 1", hp:100, maxHp:100, atb:0, role:"Commando", atbRate:1.0 },
  { name:"Unit 2", hp:100, maxHp:100, atb:0, role:"Ravager",  atbRate:1.2 },
  { name:"Unit 3", hp:100, maxHp:100, atb:0, role:"Ravager",  atbRate:1.4 }
];

export const enemy = {
  hp: 600,
  maxHp: 600,
  atb: 0,

  // Chain system
  chain: 0,          // multiplier percent (100 = baseline)
  decay: 0,          // falling value in neutral
  decaySpeed: 0,
  staggered: false,
  staggerTimer: 0
};

export function resetEnemy() {
  enemy.hp = 6000;
  enemy.maxHp = 6000;
  enemy.atb = 0;

  enemy.chain = 0;
  enemy.decay = 0;
  enemy.decaySpeed = 0;
  enemy.staggered = false;
  enemy.staggerTimer = 0;
}

export const paradigms = [
  { name:"Relentless Assault", roles:["Commando","Ravager","Ravager"] },
  { name:"Delta Attack", roles:["Commando","Commando","Ravager"] },
  { name:"Solidarity", roles:["Commando","Medic","Medic"] }
];

let activeParadigmIndex = 0;

export function getParadigmIndex() {
  return activeParadigmIndex;
}

export function setParadigmIndex(i) {
  activeParadigmIndex = i;
}
