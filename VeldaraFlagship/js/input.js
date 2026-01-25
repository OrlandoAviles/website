export const keys = new Set();

export function initKeyboard() {
  addEventListener("keydown", e => keys.add(e.key.toLowerCase()));
  addEventListener("keyup", e => keys.delete(e.key.toLowerCase()));
}

export function keyboardAxis() {
  let x = 0, y = 0;
  if (keys.has("arrowleft") || keys.has("a")) x -= 1;
  if (keys.has("arrowright") || keys.has("d")) x += 1;
  if (keys.has("arrowup") || keys.has("w")) y -= 1;
  if (keys.has("arrowdown") || keys.has("s")) y += 1;

  const len = Math.hypot(x, y);
  return len ? { x: x/len, y: y/len } : { x:0, y:0 };
}
