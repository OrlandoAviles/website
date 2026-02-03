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

  function slider(label, key, min, max, step = 1, colorPreview = false) {
    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.flexDirection = "column";
    wrap.style.gap = "4px";

    const l = document.createElement("label");
    l.textContent = label;
    l.style.fontSize = "12px";
    l.style.opacity = "0.8";

    const input = document.createElement("input");
    input.type = "range";
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = workingPreset[key];
    input.style.width = "100%";

    input.oninput = () => {
      workingPreset[key] = Number(input.value);
      applyPresetToEngine();
      if (colorPreview) updateColorBars();
    };

    wrap.appendChild(l);
    wrap.appendChild(input);

    if (colorPreview) {
      const bar = document.createElement("div");
      bar.style.height = "8px";
      bar.style.borderRadius = "4px";
      bar.style.width = "100%";
      bar.className = `colorbar-${key}`;
      wrap.appendChild(bar);
    }

    inspector.appendChild(wrap);
  }

  function hsvToRgb(h, s, v) {
    s /= 100; v /= 100;
    const c = v * s;
    const hh = (h % 360) / 60;
    const x = c * (1 - Math.abs((hh % 2) - 1));
    let r=0,g=0,b=0;
    if (hh>=0&&hh<1)[r,g,b]=[c,x,0];
    else if (hh<2)[r,g,b]=[x,c,0];
    else if (hh<3)[r,g,b]=[0,c,x];
    else if (hh<4)[r,g,b]=[0,x,c];
    else if (hh<5)[r,g,b]=[x,0,c];
    else [r,g,b]=[c,0,x];
    const m=v-c;
    return `rgb(${Math.round((r+m)*255)},${Math.round((g+m)*255)},${Math.round((b+m)*255)})`;
  }

  function updateColorBars() {
    const hueA = workingPreset.hueA;
    const hueB = workingPreset.hueB;
    const hueMid = (hueA + hueB) / 2;

    const hueGrad = "linear-gradient(90deg, red, yellow, lime, cyan, blue, magenta, red)";

    const satGrad = `linear-gradient(90deg, ${hsvToRgb(hueMid,0,100)}, ${hsvToRgb(hueMid,100,100)})`;
    const valGrad = `linear-gradient(90deg, ${hsvToRgb(hueMid,100,0)}, ${hsvToRgb(hueMid,100,100)})`;

    const setBar = (cls, bg) => {
      const el = inspector.querySelector(cls);
      if (el) el.style.background = bg;
    };

    setBar('.colorbar-hueA', hueGrad);
    setBar('.colorbar-hueB', hueGrad);
    setBar('.colorbar-satMin', satGrad);
    setBar('.colorbar-satMax', satGrad);
    setBar('.colorbar-valMin', valGrad);
    setBar('.colorbar-valMax', valGrad);
  }

  function buildInspector() {
    inspector.innerHTML = "";

    // --- COLOR ---
    slider("Hue A", "hueA", 0, 360, 1, true);
    slider("Hue B", "hueB", 0, 360, 1, true);
    slider("Sat Min", "satMin", 0, 100, 1, true);
    slider("Sat Max", "satMax", 0, 100, 1, true);
    slider("Val Min", "valMin", 0, 100, 1, true);
    slider("Val Max", "valMax", 0, 100, 1, true);

    // --- MOTION ---
    slider("Speed Min", "speedMin", 0, 800, 1);
    slider("Speed Max", "speedMax", 0, 900, 1);
    slider("Spread A", "spreadA", -180, 180, 1);
    slider("Spread B", "spreadB", -180, 180, 1);
    slider("Drag Min", "dragMin", 0, 5, 0.05);
    slider("Drag Max", "dragMax", 0, 5, 0.05);
    slider("Gravity Scale", "gravityScale", -2, 2, 0.05);

    // --- SIZE & LIFE ---
    slider("Size Min", "sizeMin", 0.5, 30, 0.1);
    slider("Size Max", "sizeMax", 0.5, 50, 0.1);
    slider("Size Decay Min", "sizeDecayMin", 0, 20, 0.1);
    slider("Size Decay Max", "sizeDecayMax", 0, 30, 0.1);
    slider("Life Min", "lifeMin", 0.05, 4, 0.05);
    slider("Life Max", "lifeMax", 0.05, 6, 0.05);
    slider("Fade", "fade", 0.05, 3, 0.05);

    // --- DENSITY ---
    slider("Density Mult", "mult", 0.05, 2, 0.01);

    updateColorBars();
  }
  buildInspector();

  /* ------------------ */
  /* Canvas Interaction */
  /* ------------------ */

  let painting = false;
  let lastX = 0;
  let lastY = 0;
  const brushSpacing = 12;

  function emitAtEvent(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    engine.emit(x, y, 60);
    lastX = x;
    lastY = y;
  }

  canvas.addEventListener("pointerdown", e => {
    painting = true;
    emitAtEvent(e);
  });

  canvas.addEventListener("pointermove", e => {
    if (!painting) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - lastX;
    const dy = y - lastY;
    const dist = Math.hypot(dx, dy);

    if (dist >= brushSpacing) {
      const steps = Math.floor(dist / brushSpacing);
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        engine.emit(lastX + dx * t, lastY + dy * t, 60);
      }
      lastX = x;
      lastY = y;
    }
  });

  window.addEventListener("pointerup", () => {
    painting = false;
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
