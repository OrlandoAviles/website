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
  hp:600,
  maxHp:600,
  atb:0,
  chain:0,
  staggered:false
};

export function resetEnemy() {
  enemy.hp = 600;
  enemy.maxHp = 600;
  enemy.atb = 0;
  enemy.chain = 0;
  enemy.staggered = false;
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
