const STORAGE_KEY_SETTINGS = "tarot_settings_v1";

function saveSettings() {
  const settings = {
    fx: {
      intensity: FX.intensity,
      hueA: FX.hueA,
      hueB: FX.hueB,
    },
    app: {
      activeDeck: App.activeDeck,
      cardScale: App.cardScale,
    },
  };
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return false;

    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return false;

    if (data.fx) {
      if (typeof data.fx.intensity === "number")
        FX.intensity = clamp(data.fx.intensity, 0, 1);
      if (typeof data.fx.hueA === "number")
        FX.hueA = ((data.fx.hueA % 360) + 360) % 360;
      if (typeof data.fx.hueB === "number")
        FX.hueB = ((data.fx.hueB % 360) + 360) % 360;
    }

    if (data.app) {
      if (data.app.activeDeck === "text" || data.app.activeDeck === "playing") {
        App.activeDeck = data.app.activeDeck;
      }
      if (typeof data.app.cardScale === "number") {
        App.cardScale = clamp(data.app.cardScale, 0.6, 1.6);
      }
    }

    return true;
  } catch {
    return false;
  }
}
