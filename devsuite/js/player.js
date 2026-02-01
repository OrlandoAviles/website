export function mount({ sidebar, inspector, projectData, updateBottomBar, notifyDataChanged }) {
  sidebar.innerHTML = `<h3>Player</h3><p>Edit core character stats.</p>`;

  const p = projectData.player;

  inspector.innerHTML = `
    <h3>Player Properties</h3>
    <div class="field"><label>Name</label><input id="pName" value="${p.name}"></div>

    <h3>Appearance</h3>
    <div class="field"><label>Sprite</label><select id="pSprite"></select></div>

    <h3>Base Stats</h3>
    <div class="field"><label>HP</label><input type="number" id="pHP" value="${p.stats.hp}"></div>
    <div class="field"><label>MP</label><input type="number" id="pMP" value="${p.stats.mp}"></div>
    <div class="field"><label>ATK</label><input type="number" id="pATK" value="${p.stats.atk}"></div>
    <div class="field"><label>DEF</label><input type="number" id="pDEF" value="${p.stats.def}"></div>
    <div class="field"><label>SPD</label><input type="number" id="pSPD" value="${p.stats.spd}"></div>
  `;

  const spriteSelect = document.getElementById("pSprite");

  function refreshSpriteOptions() {
    spriteSelect.innerHTML = `<option value="">None</option>`;
    projectData.sprites.list.forEach(sprite => {
      const opt = document.createElement("option");
      opt.value = sprite.id;
      opt.textContent = sprite.name;
      if (projectData.player.spriteId === sprite.id) opt.selected = true;
      spriteSelect.appendChild(opt);
    });
  }

  refreshSpriteOptions();

  spriteSelect.onchange = e => {
    projectData.player.spriteId = e.target.value ? Number(e.target.value) : null;
  };


  pName.oninput = e => {
    p.name = e.target.value;
    updateBottomBar();
    notifyDataChanged();
  };

  pHP.oninput = e => {
    p.stats.hp = +e.target.value;
    updateBottomBar();
    notifyDataChanged();
  };

  pMP.oninput = e => {
    p.stats.mp = +e.target.value;
    updateBottomBar();
    notifyDataChanged();
  };

  pATK.oninput = e => {
    p.stats.atk = +e.target.value;
    updateBottomBar();
    notifyDataChanged();
  };

  pDEF.oninput = e => {
    p.stats.def = +e.target.value;
    updateBottomBar();
    notifyDataChanged();
  };

  pSPD.oninput = e => {
    p.stats.spd = +e.target.value;
    updateBottomBar();
    notifyDataChanged();
  };
}
