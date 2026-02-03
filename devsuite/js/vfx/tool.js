// VFX Tool UI
// Connects editor UI to Particle Engine Core + Preset system

import { createParticleEngine } from "./particleEngineCore.js";
import { getDefaultVfxPresets, normalizeVfxPreset } from "./vfxPresets.js";

export function mount({ sidebar, inspector, canvasArea, projectData, notifyDataChanged }) {
  sidebar.innerHTML = "";
  inspector.innerHTML = "";
  canvasArea.innerHTML = "";

  /* ------------------ */
  /* Canvas + Engine    */
  /* ------------------ */

  const canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.background = "#0f0f14";
  canvasArea.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const engine = createParticleEngine(ctx);

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    engine.update(dt);
    engine.render(canvas.width, canvas.height);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ------------------ */
  /* Preset State       */
  /* ------------------ */

  const defaultPresets = getDefaultVfxPresets();
  projectData.vfx = projectData.vfx || { presets: { ...defaultPresets } };

  let currentId = Object.keys(projectData.vfx.presets)[0];
  let workingPreset = { ...projectData.vfx.presets[currentId] };

  function applyPresetToEngine() {
    engine.setPreset(normalizeVfxPreset(workingPreset));
  }
  applyPresetToEngine();

  /* ------------------ */
  /* Sidebar UI         */
  /* ------------------ */

  const title = document.createElement("h3");
  title.textContent = "VFX Presets";
  sidebar.appendChild(title);

  const select = document.createElement("select");
  sidebar.appendChild(select);

  function refreshPresetList() {
    select.innerHTML = "";
    Object.values(projectData.vfx.presets).forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name;
      select.appendChild(opt);
    });
    select.value = currentId;
  }
  refreshPresetList();

  select.onchange = () => {
    currentId = select.value;
    workingPreset = { ...projectData.vfx.presets[currentId] };
    applyPresetToEngine();
    buildInspector();
  };

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save Changes";
  sidebar.appendChild(saveBtn);

  saveBtn.onclick = () => {
    projectData.vfx.presets[currentId] = { ...workingPreset };
    notifyDataChanged();
  };

  /* ------------------ */
  /* Inspector Controls */
  /* ------------------ */

  function slider(label, key, min, max, step = 1) {
    const wrap = document.createElement("div");
    const l = document.createElement("label");
    l.textContent = label;
    const input = document.createElement("input");
    input.type = "range";
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = workingPreset[key];

    input.oninput = () => {
      workingPreset[key] = Number(input.value);
      applyPresetToEngine();
    };

    wrap.appendChild(l);
    wrap.appendChild(input);
    inspector.appendChild(wrap);
  }

  function buildInspector() {
    inspector.innerHTML = "";
    slider("Hue A", "hueA", 0, 360);
    slider("Hue B", "hueB", 0, 360);
    slider("Size Min", "sizeMin", 1, 20, 0.1);
    slider("Size Max", "sizeMax", 1, 40, 0.1);
    slider("Life Min", "lifeMin", 0.1, 3, 0.05);
    slider("Life Max", "lifeMax", 0.1, 5, 0.05);
  }
  buildInspector();

  /* ------------------ */
  /* Canvas Interaction */
  /* ------------------ */

  canvas.addEventListener("pointerdown", e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    engine.emit(x, y, 60);
  });

  return {
    unmount() {
      window.removeEventListener("resize", resize);
      sidebar.innerHTML = "";
      inspector.innerHTML = "";
      canvasArea.innerHTML = "";
    }
  };
}
