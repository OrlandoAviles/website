/*********************************************************
 * FX STATE
 *********************************************************/
window.FX = {
  intensity: 0.8,
  hueA: 220,
  hueB: 120,
};

window.App = {
  activeDeck: "text",
  cardScale: 1.0,
};

/*********************************************************
 * FX HELPERS / GLOBAL FX FUNCTIONS
 *********************************************************/
window.setIntensity = function setIntensity(v01) {
  FX.intensity = clamp(v01, 0, 1);
  Starfield.setIntensity(FX.intensity);
};

window.applyAuras = function applyAuras() {
  Starfield.setHues(FX.hueA, FX.hueB);

  document.documentElement.style.setProperty(
    "--cardStroke",
    `hsla(${FX.hueA} 92% 70% / 0.26)`,
  );
};

window.randomizeAuras = function randomizeAuras() {
  const a = Math.floor(Math.random() * 361);

  let b = Math.floor(Math.random() * 361);
  const minDiff = 60;
  const diff = Math.abs(b - a);
  if (diff < minDiff) b = (a + minDiff + Math.floor(Math.random() * 140)) % 360;

  Starfield.morphTo(a, b, 1000);

  FX.hueA = a;
  FX.hueB = b;

  applyAuras();
  syncVisualUI();
};

/*********************************************************
 * INIT
 *********************************************************/
loadSettings();

// ✅ Load tarot card images immediately at startup
Tarot.preload();

syncVisualUI();
syncDeckUI();

setIntensity(FX.intensity);
applyAuras();

redrawAll();
