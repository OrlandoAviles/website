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
          <option ${area.biome==="Forest"?"selected":""}>Forest</option>
          <option ${area.biome==="Dungeon"?"selected":""}>Dungeon</option>
          <option ${area.biome==="Town"?"selected":""}>Town</option>
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

    areaBiome.onchange = e => area.biome = e.target.value;
    areaEncounter.oninput = e => area.encounterRate = parseFloat(e.target.value);

    const encounterList = document.getElementById("encounterList");

    function renderEncounterOptions() {
      encounterList.innerHTML = "";

      if (projectData.combat.enemies.length === 0) {
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
            if (!area.encounters.includes(enemy.id)) {
              area.encounters.push(enemy.id);
            }
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

    // Allow future refresh if enemies change
    window.refreshWorldEncounters = renderEncounterOptions;
  }

  /* =============================
     CANVAS — WORLD VIEW
  ============================== */

canvasArea.innerHTML = "";
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.style.border = "1px solid #444";
canvasArea.appendChild(canvas);

const ctx = canvas.getContext("2d");

const tileSize = 32;
const gridWidth = canvas.width / tileSize;
const gridHeight = canvas.height / tileSize;

function drawGrid() {
  ctx.strokeStyle = "#222";
  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }
}

function drawPlayer() {
  const spriteId = projectData.player.spriteId;
  if (!spriteId) return;

  const sprite = projectData.sprites.list.find(s => s.id === spriteId);
  if (!sprite) return;

  const size = tileSize / 16;
  const px = projectData.player.position.x * tileSize;
  const py = projectData.player.position.y * tileSize;

  sprite.pixels.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val) {
        ctx.fillStyle = "#3cff6b";
        ctx.fillRect(px + x * size, py + y * size, size, size);
      }
    });
  });
}

function renderWorld() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawPlayer();
}

renderWorld();

/* =============================
     KEYBOARD CONTROLS
  ============================== */

function movePlayer(dx, dy) {
  const pos = projectData.player.position;
  const newX = pos.x + dx;
  const newY = pos.y + dy;

  if (newX >= 0 && newX < gridWidth && newY >= 0 && newY < gridHeight) {
    pos.x = newX;
    pos.y = newY;
    renderWorld();
  }
}

function handleKey(e) {
  switch (e.key) {
    case "ArrowUp": movePlayer(0, -1); break;
    case "ArrowDown": movePlayer(0, 1); break;
    case "ArrowLeft": movePlayer(-1, 0); break;
    case "ArrowRight": movePlayer(1, 0); break;
  }
}

document.addEventListener("keydown", handleKey);


  /* =============================
     INITIAL STATE
  ============================== */

  inspector.innerHTML = `<p>Select an area to edit.</p>`;
  renderAreaList();

  return {
    unmount() {
      document.removeEventListener("keydown", handleKey);
    }
  };
}
