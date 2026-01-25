/* =========================================================
   COMBAT ENGINE (UI-agnostic)
   Pure battle simulation logic
========================================================= */

export function createBattle(config) {
  const battle = {
    time: 0,
    over: false,
    log: [],

    players: config.players.map(p => ({
      role: p.role,
      hp: p.maxHp,
      maxHp: p.maxHp,
      atb: 0,
      atbRate: p.atbRate || 1
    })),

    enemy: {
      hp: config.enemy.maxHp,
      maxHp: config.enemy.maxHp,
      atb: 0,
      atbRate: config.enemy.atbRate || 2
    }
  };

  battle.log.push(`Battle started`);
  return battle;
}

/* =========================================================
   STEP SIMULATION FORWARD
   dt = time slice in seconds (ex: 0.1)
========================================================= */
export function stepBattle(battle, dt) {
  if (battle.over) return;

  battle.time += dt;

  // Players act
  battle.players.forEach((p, i) => {
    if (p.hp <= 0) return;

    p.atb += p.atbRate * dt * 60; // normalized ATB gain
    if (p.atb >= 100) {
      p.atb = 0;
      playerAct(battle, p, i);
    }
  });

  // Enemy acts
  const e = battle.enemy;
  e.atb += e.atbRate * dt * 60;
  if (e.atb >= 100) {
    e.atb = 0;
    enemyAct(battle);
  }

  // Win/Lose checks
  if (battle.enemy.hp <= 0) {
    battle.log.push("Victory");
    battle.over = true;
  }

  if (battle.players.every(p => p.hp <= 0)) {
    battle.log.push("Defeat");
    battle.over = true;
  }
}

/* =========================================================
   PLAYER ACTION LOGIC
========================================================= */
function playerAct(battle, player, index) {
  if (player.role === "Medic") {
    const target = battle.players.reduce((a, b) =>
      a.hp / a.maxHp < b.hp / b.maxHp ? a : b
    );
    const heal = 30;
    target.hp = Math.min(target.maxHp, target.hp + heal);
    battle.log.push(`P${index + 1} heals ${heal}`);
  } else {
    const dmg = 20;
    battle.enemy.hp = Math.max(0, battle.enemy.hp - dmg);
    battle.log.push(`P${index + 1} attacks ${dmg}`);
  }
}

/* =========================================================
   ENEMY ACTION LOGIC
========================================================= */
function enemyAct(battle) {
  const living = battle.players.filter(p => p.hp > 0);
  if (!living.length) return;

  const target = living[Math.floor(Math.random() * living.length)];
  const dmg = 20;
  target.hp = Math.max(0, target.hp - dmg);
  battle.log.push(`Enemy attacks ${dmg}`);
}

/* =========================================================
   APPLY PARADIGM SHIFT
========================================================= */
export function applyParadigm(battle, roles) {
  battle.players.forEach((p, i) => {
    p.role = roles[i] || p.role;
  });

  battle.log.push(
    `Paradigm Shift → ${roles.map(r => r.slice(0,3).toUpperCase()).join(" / ")}`
  );
}
