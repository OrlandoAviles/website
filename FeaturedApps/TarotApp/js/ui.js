/*********************************************************
 * UI PANELS
 *********************************************************/
const visualsPanel = document.getElementById("visualsPanel");
const decksPanel = document.getElementById("decksPanel");
const visualsBtn = document.getElementById("visualsBtn");
const decksBtn = document.getElementById("decksBtn");
const clearBtn = document.getElementById("clearBtn");

function openPanel(panel) {
  panel.classList.add("open");
  panel.setAttribute("aria-hidden", "false");
}
function closePanel(panel) {
  panel.classList.remove("open");
  panel.setAttribute("aria-hidden", "true");
}
function togglePanel(panel) {
  panel.classList.contains("open") ? closePanel(panel) : openPanel(panel);
}
function closeAllPanels() {
  closePanel(visualsPanel);
  closePanel(decksPanel);
}

visualsBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  closePanel(decksPanel);
  togglePanel(visualsPanel);
});

decksBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  closePanel(visualsPanel);
  togglePanel(decksPanel);
});

document.addEventListener("click", () => {
  if (
    visualsPanel.classList.contains("open") ||
    decksPanel.classList.contains("open")
  ) {
    closeAllPanels();
  }
});

visualsPanel.addEventListener("click", (e) => e.stopPropagation());
decksPanel.addEventListener("click", (e) => e.stopPropagation());

clearBtn.addEventListener("click", () => {
  clearCanvas();
});

/*********************************************************
 * VISUAL CONTROLS
 *********************************************************/
const intensitySlider = document.getElementById("intensitySlider");
const intensityValue = document.getElementById("intensityValue");

const cardSizeSlider = document.getElementById("cardSizeSlider");
const cardSizeValue = document.getElementById("cardSizeValue");

const hueASlider = document.getElementById("hueASlider");
const hueAValue = document.getElementById("hueAValue");

const hueBSlider = document.getElementById("hueBSlider");
const hueBValue = document.getElementById("hueBValue");

const randomizeBtn = document.getElementById("randomizeBtn");

function syncVisualUI() {
  intensitySlider.value = String(Math.round(FX.intensity * 100));
  intensityValue.textContent = `${Math.round(FX.intensity * 100)}%`;

  cardSizeSlider.value = String(Math.round(App.cardScale * 100));
  cardSizeValue.textContent = `${Math.round(App.cardScale * 100)}%`;

  hueASlider.value = String(FX.hueA);
  hueAValue.textContent = `${FX.hueA}°`;

  hueBSlider.value = String(FX.hueB);
  hueBValue.textContent = `${FX.hueB}°`;
}

intensitySlider.addEventListener("input", () => {
  setIntensity((Number(intensitySlider.value) || 0) / 100);
  syncVisualUI();
  saveSettings();
});

cardSizeSlider.addEventListener("input", () => {
  App.cardScale = clamp((Number(cardSizeSlider.value) || 100) / 100, 0.6, 1.6);
  syncVisualUI();
  redrawAll();
  saveSettings();
});

hueASlider.addEventListener("input", () => {
  FX.hueA = Number(hueASlider.value) || 0;
  applyAuras();
  syncVisualUI();
  saveSettings();
});

hueBSlider.addEventListener("input", () => {
  FX.hueB = Number(hueBSlider.value) || 0;
  applyAuras();
  syncVisualUI();
  saveSettings();
});

function randomizeAuras() {
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
}

randomizeBtn.addEventListener("click", () => {
  randomizeAuras();
  saveSettings();
});

/*********************************************************
 * DECK CONTROLS
 *********************************************************/
const deckSelect = document.getElementById("deckSelect");
const deckLabel = document.getElementById("deckLabel");

function syncDeckUI() {
  deckSelect.value = App.activeDeck;
  deckLabel.textContent = App.activeDeck === "text" ? "Text" : "Playing";
}

deckSelect.addEventListener("change", () => {
  App.activeDeck = deckSelect.value;
  syncDeckUI();
  saveSettings();
});
