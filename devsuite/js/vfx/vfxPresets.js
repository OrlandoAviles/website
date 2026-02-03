// VFX Preset Definitions
// Pure data + helpers. No DOM, no canvas, no storage.

export function getDefaultVfxPresets() {
  return {
    hitSpark: {
      id: "hitSpark",
      name: "Hit Sparks",
      shape: "circle",

      hueA: 35,
      hueB: 55,
      satMin: 70,
      satMax: 100,
      valMin: 70,
      valMax: 100,
      hueAnim: false,

      mult: 0.8,
      spreadA: 0,
      spreadB: 360,
      speedMin: 140,
      speedMax: 520,
      sizeMin: 2,
      sizeMax: 5,
      sizeDecayMin: 7,
      sizeDecayMax: 14,
      lifeMin: 0.25,
      lifeMax: 0.6,
      dragMin: 1.0,
      dragMax: 3.0,
      gravityScale: 1.0,
      jitter: 25,
      fade: 1.1
    },

    healAura: {
      id: "healAura",
      name: "Heal Aura",
      shape: "plus",

      hueA: 155,
      hueB: 190,
      satMin: 45,
      satMax: 90,
      valMin: 75,
      valMax: 100,
      hueAnim: true,

      mult: 0.5,
      spreadA: -135,
      spreadB: -45,
      speedMin: 40,
      speedMax: 170,
      sizeMin: 4,
      sizeMax: 10,
      sizeDecayMin: 3,
      sizeDecayMax: 6,
      lifeMin: 0.6,
      lifeMax: 1.2,
      dragMin: 0.2,
      dragMax: 1.3,
      gravityScale: -0.15,
      jitter: 10,
      fade: 0.8
    },

    smokePuff: {
      id: "smokePuff",
      name: "Smoke Puff",
      shape: "circle",

      hueA: 0,
      hueB: 360,
      satMin: 0,
      satMax: 8,
      valMin: 30,
      valMax: 65,
      hueAnim: false,

      mult: 0.3,
      spreadA: -180,
      spreadB: 0,
      speedMin: 10,
      speedMax: 70,
      sizeMin: 10,
      sizeMax: 24,
      sizeDecayMin: 0.5,
      sizeDecayMax: 2.2,
      lifeMin: 1.2,
      lifeMax: 2.6,
      dragMin: 0.0,
      dragMax: 0.9,
      gravityScale: -0.08,
      jitter: 5,
      fade: 0.35
    }
  };
}

// Ensures preset values are sane before being used by engine
export function normalizeVfxPreset(p) {
  const preset = { ...p };

  function swapIfNeeded(a, b) {
    return a > b ? [b, a] : [a, b];
  }

  [preset.satMin, preset.satMax] = swapIfNeeded(preset.satMin, preset.satMax);
  [preset.valMin, preset.valMax] = swapIfNeeded(preset.valMin, preset.valMax);
  [preset.speedMin, preset.speedMax] = swapIfNeeded(preset.speedMin, preset.speedMax);
  [preset.sizeMin, preset.sizeMax] = swapIfNeeded(preset.sizeMin, preset.sizeMax);
  [preset.sizeDecayMin, preset.sizeDecayMax] = swapIfNeeded(preset.sizeDecayMin, preset.sizeDecayMax);
  [preset.lifeMin, preset.lifeMax] = swapIfNeeded(preset.lifeMin, preset.lifeMax);
  [preset.dragMin, preset.dragMax] = swapIfNeeded(preset.dragMin, preset.dragMax);

  preset.mult = Math.max(0.01, preset.mult ?? 1);
  preset.fade = Math.max(0.01, preset.fade ?? 1);

  return preset;
}
