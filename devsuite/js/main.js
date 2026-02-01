import { mount as mountWorld } from "./world.js";
import { mount as mountStory } from "./story.js";
import { mount as mountCombat } from "./combat.js";
import { mount as mountAudio } from "./audio/tool.js";
import { mount as mountPlayer } from "./player.js";
import { mount as mountSprite } from "./sprite.js";

const sidebar = document.getElementById("sidebar");
const inspector = document.getElementById("inspector");
const canvasArea = document.getElementById("canvasArea");
const bottombar = document.getElementById("bottombar");
const tabs = document.querySelectorAll(".tab");

let currentMode = "world";

/* =========================
   CENTRAL PROJECT DATA
========================= */
export const projectData = {
  player: {
    name: "Hero",
    spriteId: null,
    stats: { hp: 100, mp: 30, atk: 10, def: 8, spd: 6 },
    position: { x: 5, y: 5 }, // grid position in world

  },
  world: { nextId: 1, areas: [] },
  story: { nextId: 1, scenes: [] },
  combat: { nextEnemyId: 1, enemies: [] },
  sprites: { nextId: 1, list: [] },

};

/* =========================
   GLOBAL UI UPDATE
========================= */
export function updateBottomBar() {
  const s = projectData.player.stats;
  bottombar.textContent =
    `Mode: ${currentMode.toUpperCase()} | ` +
    `HP ${s.hp}  MP ${s.mp}  ATK ${s.atk}  DEF ${s.def}  SPD ${s.spd}`;
}

/* Called whenever shared data changes */
export function notifyDataChanged() {
  updateBottomBar();

  // If combat tool is open, refresh preview
  if (currentMode === "combat" && window.updateCombatPreviewGlobal) {
    window.updateCombatPreviewGlobal();
  }
}

/* =========================
   TOOL REGISTRY
========================= */
const tools = {
  world: mountWorld,
  story: mountStory,
  combat: mountCombat,
  audio: mountAudio,
  player: mountPlayer,
  sprite: mountSprite
};

/* =========================
   MODE SWITCHING
========================= */
function switchMode(mode) {
  currentMode = mode;
  sidebar.innerHTML = "";
  inspector.innerHTML = "";
  canvasArea.innerHTML = "";

  const mountTool = tools[mode];
  if (mountTool) {
    mountTool({
      sidebar,
      inspector,
      canvasArea,
      bottombar,
      projectData,
      updateBottomBar,
      notifyDataChanged   // 🔥 now passed correctly
    });
  }

  updateBottomBar();
}

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    switchMode(tab.dataset.mode);
  });
});

/* =========================
   INITIAL LOAD
========================= */
switchMode("world");
