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
      dialogue: ""
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
      <div class="field"><label>Title</label><input id="sceneTitle" value="${scene.title}"></div>
      <div class="field"><label>Dialogue</label><textarea id="sceneDialogue" rows="6">${scene.dialogue}</textarea></div>
    `;

    sceneTitle.oninput = e => { scene.title = e.target.value; el.textContent = scene.title; };
    sceneDialogue.oninput = e => scene.dialogue = e.target.value;
  }

  canvasArea.innerHTML = `<p>Scene Preview Area</p>`;
  inspector.innerHTML = `<p>Select a scene to edit.</p>`;

  renderSceneList();

  return {
    unmount() {
      // future cleanup hooks
    }
  };
}
