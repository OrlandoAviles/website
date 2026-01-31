export function mount({ sidebar, canvasArea, inspector, bottombar, projectData }) {
  bottombar.textContent = "Mode: Combat Editor";
  sidebar.innerHTML = `<h3>Enemies</h3>`;

  const btn = document.createElement("button");
  btn.textContent = "+ New Enemy";
  btn.className = "btn-small";
  btn.onclick = () => {
    const e = {
      id: projectData.combat.nextEnemyId++,
      name: "New Enemy",
      role: "Normal",
      stats: { hp: 10, atk: 3, def: 1, spd: 3 },
      xp: 1,
      gold: 0
    };
    projectData.combat.enemies.push(e);
    renderEnemyList();
  };
  sidebar.appendChild(btn);

  const listWrap = document.createElement("div");
  sidebar.appendChild(listWrap);

  function renderEnemyList() {
    listWrap.innerHTML = "";
    projectData.combat.enemies.forEach(enemy => {
      const div = document.createElement("div");
      div.className = "list-item";
      div.textContent = enemy.name;
      div.onclick = () => selectEnemy(enemy, div);
      listWrap.appendChild(div);
    });
  }

  function selectEnemy(e, el) {
    listWrap.querySelectorAll(".list-item").forEach(i => i.classList.remove("active"));
    el.classList.add("active");

    inspector.innerHTML = `
      <h3>Enemy Properties</h3>

      <div class="field"><label>Name</label><input id="eName" value="${e.name}"></div>
      <div class="field"><label>Role</label>
        <select id="eRole">
          <option ${e.role==='Normal'?'selected':''}>Normal</option>
          <option ${e.role==='Elite'?'selected':''}>Elite</option>
          <option ${e.role==='Boss'?'selected':''}>Boss</option>
        </select>
      </div>

      <div class="field"><label>HP</label><input type="number" id="eHP" value="${e.stats.hp}"></div>
      <div class="field"><label>ATK</label><input type="number" id="eATK" value="${e.stats.atk}"></div>
      <div class="field"><label>DEF</label><input type="number" id="eDEF" value="${e.stats.def}"></div>
      <div class="field"><label>SPD</label><input type="number" id="eSPD" value="${e.stats.spd}"></div>
      <div class="field"><label>XP</label><input type="number" id="eXP" value="${e.xp}"></div>
      <div class="field"><label>Gold</label><input type="number" id="eGold" value="${e.gold}"></div>

      <h3>Combat Preview</h3>
      <div class="field">
        <label>Player → Enemy Damage</label>
        <div id="pToEDmg">-</div>
      </div>
      <div class="field">
        <label>Enemy → Player Damage</label>
        <div id="eToPDmg">-</div>
      </div>
    `;

    function updateCombatPreview() {
      const player = projectData.player.stats;

      const playerToEnemy = Math.max(1, player.atk - e.stats.def);
      const enemyToPlayer = Math.max(1, e.stats.atk - player.def);

      document.getElementById("pToEDmg").textContent = playerToEnemy;
      document.getElementById("eToPDmg").textContent = enemyToPlayer;
    }

    // 🔗 allow main.js to trigger refresh when player stats change
    window.updateCombatPreviewGlobal = updateCombatPreview;

    updateCombatPreview();

    eName.oninput = ev => { e.name = ev.target.value; el.textContent = e.name; };
    eRole.onchange = ev => e.role = ev.target.value;
    eHP.oninput = ev => e.stats.hp = +ev.target.value;
    eATK.oninput = ev => { e.stats.atk = +ev.target.value; updateCombatPreview(); };
    eDEF.oninput = ev => { e.stats.def = +ev.target.value; updateCombatPreview(); };
    eSPD.oninput = ev => e.stats.spd = +ev.target.value;
    eXP.oninput = ev => e.xp = +ev.target.value;
    eGold.oninput = ev => e.gold = +ev.target.value;
  }

  canvasArea.innerHTML = `<p>Enemy Preview Area</p>`;
  inspector.innerHTML = `<p>Select an enemy to edit.</p>`;

  renderEnemyList();
}
