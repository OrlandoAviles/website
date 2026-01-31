export function mount({ sidebar, canvasArea, inspector, bottombar, projectData }) {
  bottombar.textContent = "Mode: Story Editor";
  sidebar.innerHTML = `<h3>Scenes</h3>`;

  const btn = document.createElement("button");
  btn.textContent = "+ New Scene";
  btn.className = "btn-small";
  btn.onclick = () => {
    const s = {
      id: projectData.story.nextId++,
      title: "New Scene",
      text: "Scene text...",
      triggerBattleEnemyId: null // 🔥 NEW — links to a combat enemy
    };
    projectData.story.scenes.push(s);
    renderSceneList();
  };
  sidebar.appendChild(btn);

  const listWrap = document.createElement("div");
  sidebar.appendChild(listWrap);

  function renderSceneList() {
    listWrap.innerHTML = "";
    projectData.story.scenes.forEach(scene => {
      const div = document.createElement("div");
      div.className = "list-item";
      div.textContent = scene.title;
      div.onclick = () => selectScene(scene, div);
      listWrap.appendChild(div);
    });
  }

  function selectScene(scene, el) {
    listWrap.querySelectorAll(".list-item").forEach(i => i.classList.remove("active"));
    el.classList.add("active");

    inspector.innerHTML = `
      <h3>Scene Properties</h3>

      <div class="field">
        <label>Title</label>
        <input id="sceneTitle" value="${scene.title}">
      </div>

      <div class="field">
        <label>Dialogue Text</label>
        <textarea id="sceneText" rows="5">${scene.text}</textarea>
      </div>

      <div class="field">
        <label>Trigger Battle</label>
        <select id="sceneBattleSelect">
          <option value="">None</option>
        </select>
      </div>
    `;

    sceneTitle.oninput = e => {
      scene.title = e.target.value;
      el.textContent = scene.title;
    };

    sceneText.oninput = e => scene.text = e.target.value;

    const select = document.getElementById("sceneBattleSelect");

    // Populate dropdown with enemies from Combat system
    projectData.combat.enemies.forEach(enemy => {
      const opt = document.createElement("option");
      opt.value = enemy.id;
      opt.textContent = enemy.name;
      if (scene.triggerBattleEnemyId === enemy.id) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });

    select.onchange = e => {
      scene.triggerBattleEnemyId = e.target.value ? Number(e.target.value) : null;
    };
  }

  canvasArea.innerHTML = `<p>Scene Preview Area</p>`;
  inspector.innerHTML = `<p>Select a scene to edit.</p>`;

  renderSceneList();
}
