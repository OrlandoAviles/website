export const state = {
  gameState: "field", // field | combat | menu
  lastTime: performance.now()
};

export const player = {
  x: window.innerWidth * 0.5,
  y: window.innerHeight * 0.5,
  r: 16,
  speed: 240,
  vx: 0,
  vy: 0
};
