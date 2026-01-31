export function mount({ sidebar, canvasArea, inspector, bottombar, projectData }) {
  bottombar.textContent = "Mode: World Editor";
  sidebar.innerHTML = `<h3>World Areas</h3>`;

  const btn = document.createElement("button");
  btn.textContent = "+ New Area";
  btn.className = "btn-small";
  btn.onclick = () => {
    const a = { id: projectData.world.nextId++, name: "New Area", biome: "Forest", encounterRate: 0.1 };
    projectData.world.areas.push(a);
    renderAreaList();
  };
  sidebar.appendChild(btn);

  const listWrap = document.createElement("div");
  sidebar.appendChild(listWrap);

  function renderAreaList() {
    listWrap.innerHTML = "";
    projectData.world.areas.forEach(area => {
      const div = document.createElement("div");
      div.className = "list-item";
      div.textContent = area.name;
      div.onclick = () => selectWorldArea(area, div);
      listWrap.appendChild(div);
    });
  }

  function selectWorldArea(area, el) {
    listWrap.querySelectorAll(".list-item").forEach(i => i.classList.remove("active"));
    el.classList.add("active");

    inspector.innerHTML = `
      <h3>Area Properties</h3>
      <div class="field"><label>Name</label><input id="areaName" value="${area.name}"></div>
      <div class="field"><label>Biome</label><select id="areaBiome">
        <option ${area.biome==="Forest"?"selected":""}>Forest</option>
        <option ${area.biome==="Dungeon"?"selected":""}>Dungeon</option>
        <option ${area.biome==="Town"?"selected":""}>Town</option>
      </select></div>
      <div class="field"><label>Encounter Rate</label><input type="number" step="0.05" id="areaEncounter" value="${area.encounterRate}"></div>
    `;

    areaName.oninput = e => { area.name = e.target.value; el.textContent = area.name; };
    areaBiome.onchange = e => area.biome = e.target.value;
    areaEncounter.oninput = e => area.encounterRate = parseFloat(e.target.value);
  }

  canvasArea.innerHTML = `<p>Map Canvas</p>`;
  inspector.innerHTML = `<p>Select an area to edit.</p>`;

  renderAreaList();

  return { unmount() {} };
}
