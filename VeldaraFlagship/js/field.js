import { player, state } from "./state.js";
import { keyboardAxis } from "./input.js";
import { joy } from "./joystick.js";
import { tryEncounter } from "./combat.js";

export function updateField(dt){
  const kb = keyboardAxis();
  const ax = joy.axisX || kb.x;
  const ay = joy.axisY || kb.y;

  player.vx = ax * player.speed;
  player.vy = ay * player.speed;

  player.x += player.vx * dt;
  player.y += player.vy * dt;

  player.x = Math.max(player.r, Math.min(innerWidth-player.r, player.x));
  player.y = Math.max(player.r, Math.min(innerHeight-player.r, player.y));

  tryEncounter(dt);
}
