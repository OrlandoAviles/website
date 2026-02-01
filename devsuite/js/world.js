export function mount({ sidebar, canvasArea, inspector, bottombar, projectData }) {
  bottombar.textContent = "Mode: World Editor";
  sidebar.innerHTML = `<h3>World Areas</h3>`;

  /* =============================
     SIDEBAR — AREA LIST
  ============================== */

  const addBtn = document.createElement("button");
  addBtn.textContent = "+ New Area";
  addBtn.className = "btn-small";
  addBtn.onclick = () => {
    const area = {
      id: projectData.world.nextId++,
      name: "New Area",
      biome: "Forest",
      encounterRate: 0.1,
      encounters: []
    };
    projectData.world.areas.push(area);
    renderAreaList();
  };
  sidebar.appendChild(addBtn);

  const listWrap = document.createElement("div");
  sidebar.appendChild(listWrap);

  function renderAreaList() {
    listWrap.innerHTML = "";
    projectData.world.areas.forEach(area => {
      const div = document.createElement("div");
      div.className = "list-item";
      div.textContent = area.name;
      div.onclick = () => selectArea(area, div);
      listWrap.appendChild(div);
    });
  }

  /* =============================
     INSPECTOR — AREA PROPERTIES
  ============================== */

  function selectArea(area, el) {
    listWrap.querySelectorAll(".list-item").forEach(i => i.classList.remove("active"));
    el.classList.add("active");

    inspector.innerHTML = `
      <h3>Area Properties</h3>

      <div class="field">
        <label>Name</label>
        <input id="areaName" value="${area.name}">
      </div>

      <div class="field">
        <label>Biome</label>
        <select id="areaBiome">
          <option ${area.biome === "Forest" ? "selected" : ""}>Forest</option>
          <option ${area.biome === "Dungeon" ? "selected" : ""}>Dungeon</option>
          <option ${area.biome === "Town" ? "selected" : ""}>Town</option>
        </select>
      </div>

      <div class="field">
        <label>Encounter Rate</label>
        <input type="number" step="0.05" id="areaEncounter" value="${area.encounterRate}">
      </div>

      <h3>Encounters</h3>
      <div id="encounterList"></div>
    `;

    areaName.oninput = e => {
      area.name = e.target.value;
      el.textContent = area.name;
    };

    areaBiome.onchange = e => (area.biome = e.target.value);
    areaEncounter.oninput = e => (area.encounterRate = parseFloat(e.target.value) || 0);

    const encounterList = document.getElementById("encounterList");

    function renderEncounterOptions() {
      encounterList.innerHTML = "";

      if (!projectData.combat?.enemies?.length) {
        encounterList.innerHTML = `<p>No enemies created yet.</p>`;
        return;
      }

      projectData.combat.enemies.forEach(enemy => {
        const label = document.createElement("label");
        label.style.display = "block";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = area.encounters.includes(enemy.id);

        checkbox.onchange = () => {
          if (checkbox.checked) {
            if (!area.encounters.includes(enemy.id)) area.encounters.push(enemy.id);
          } else {
            area.encounters = area.encounters.filter(id => id !== enemy.id);
          }
        };

        label.appendChild(checkbox);
        label.append(` ${enemy.name}`);
        encounterList.appendChild(label);
      });
    }

    renderEncounterOptions();
    window.refreshWorldEncounters = renderEncounterOptions;
  }

  /* =============================
     CANVAS — WORLD VIEW
  ============================== */

  // Ensure player position exists (prevents NaN rendering/jumps)
  if (!projectData.player) projectData.player = {};
  if (!projectData.player.position) projectData.player.position = { x: 3, y: 3 };

  // Build canvas with DPR scaling so visual pixels match logical pixels
  canvasArea.innerHTML = "";
  const canvas = document.createElement("canvas");

  const CSS_W = 256;
  const CSS_H = 256;
  const DPR = Math.max(1, Math.min(3, window.devicePixelRatio || 1));

  canvas.width = Math.floor(CSS_W * DPR);
  canvas.height = Math.floor(CSS_H * DPR);
  canvas.style.width = CSS_W + "px";
  canvas.style.height = CSS_H + "px";
  canvas.style.border = "1px solid #444";
  canvas.style.imageRendering = "pixelated";
  canvasArea.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.imageSmoothingEnabled = false;

  const tileSize = 32;
  const gridWidth = Math.floor(CSS_W / tileSize);
  const gridHeight = Math.floor(CSS_H / tileSize);

  // MVP demo event tile
  const worldEvents = [
    { x: 7, y: 5, sceneId: 1 }
  ];

  function drawGrid() {
    ctx.strokeStyle = "#222";
    for (let x = 0; x < gridWidth; x++) {
      for (let y = 0; y < gridHeight; y++) {
        ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }

  function drawEvents() {
    for (const ev of worldEvents) {
      ctx.fillStyle = "#ffcc00";
      ctx.fillRect(ev.x * tileSize, ev.y * tileSize, tileSize, tileSize);
    }
  }

  function drawPlayer() {
    const spriteId = projectData.player.spriteId;
    if (!spriteId) return;

    const sprite = projectData.sprites?.list?.find(s => s.id === spriteId);
    if (!sprite) return;

    // Force logical position to integer tiles (prevents drift)
    const pos = projectData.player.position;
    pos.x = Math.round(pos.x);
    pos.y = Math.round(pos.y);

    const px = pos.x * tileSize;
    const py = pos.y * tileSize;

    const size = tileSize / 16; // 16x16 sprites fit exactly in one tile

    for (let y = 0; y < sprite.pixels.length; y++) {
      const row = sprite.pixels[y];
      for (let x = 0; x < row.length; x++) {
        if (row[x]) {
          ctx.fillStyle = "#3cff6b";
          ctx.fillRect(px + x * size, py + y * size, size, size);
        }
      }
    }
  }

  function renderWorld() {
    ctx.clearRect(0, 0, CSS_W, CSS_H);
    drawGrid();
    drawEvents();
    drawPlayer();
  }

  /* =============================
     KEYBOARD CONTROLS
  ============================== */

  function movePlayer(dx, dy) {
    const pos = projectData.player.position;
    const newX = pos.x + dx;
    const newY = pos.y + dy;

    // Grid-based MVP: move whole tiles only
    if (newX >= 0 && newX < gridWidth && newY >= 0 && newY < gridHeight) {
      pos.x = newX;
      pos.y = newY;
      renderWorld();
    }
  }

  function checkEventTrigger() {
    const px = Math.round(projectData.player.position.x);
    const py = Math.round(projectData.player.position.y);

    const ev = worldEvents.find(e => e.x === px && e.y === py);
    if (!ev) return;

    const scene = projectData.story?.scenes?.find(s => s.id === ev.sceneId);
    if (!scene) {
      alert("Scene not found.");
      return;
    }

    runScene(scene);
  }

  function runScene(scene) {
    alert(scene.text || "(Empty scene)");
    if (scene.triggerBattleEnemyId) startBattle(scene.triggerBattleEnemyId);
  }

  function startBattle(enemyId) {
    window.pendingBattleEnemyId = enemyId;
    const combatTab = document.querySelector('.tab[data-mode="combat"]');
    if (combatTab) combatTab.click();
  }

  function handleKey(e) {
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        movePlayer(0, -1);
        break;
      case "ArrowDown":
        e.preventDefault();
        movePlayer(0, 1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        movePlayer(-1, 0);
        break;
      case "ArrowRight":
        e.preventDefault();
        movePlayer(1, 0);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        checkEventTrigger();
        break;
    }
  }

  document.addEventListener("keydown", handleKey);

  /* =============================
     INITIAL STATE
  ============================== */

  inspector.innerHTML = `<p>Select an area to edit.</p>`;
  renderAreaList();
  renderWorld();

  return {
    unmount() {
      document.removeEventListener("keydown", handleKey);
      if (window.refreshWorldEncounters) delete window.refreshWorldEncounters;
    }
  };
}
