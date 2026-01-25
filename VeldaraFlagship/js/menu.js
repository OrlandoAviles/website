// menu.js
import { paradigms, ROLE_LIST, activeParadigmIndex, setActiveParadigm, paradigmText } from "./paradigms.js";
import { state } from "./state.js";

const fieldMenu = document.getElementById("fieldMenu");
const paradigmMenu = document.getElementById("paradigmMenu");
const fieldMenuBtn = document.getElementById("fieldMenuBtn");
const paradigmList = document.getElementById("paradigmList");

export function initMenus() {
  fieldMenuBtn.addEventListener("click", () => {
    if (state.gameState === "field") openFieldMenu();
    else if (state.gameState === "menu") closeMenus();
  });

  document.getElementById("openParadigms").addEventListener("click", () => {
    fieldMenu.style.display = "none";
    paradigmMenu.style.display = "block";
    renderParadigmMenu();
  });

  document.getElementById("closeParadigms").addEventListener("click", () => {
    paradigmMenu.style.display = "none";
    fieldMenu.style.display = "block";
  });

  document.getElementById("closeMenu").addEventListener("click", closeMenus);

  document.getElementById("addParadigm").addEventListener("click", () => {
    paradigms.push({ name: `Paradigm ${paradigms.length+1}`, roles: ["Commando","Ravager","Medic"] });
    renderParadigmMenu();
  });
}

function openFieldMenu(){
  state.gameState = "menu";
  fieldMenu.style.display = "block";
}

function closeMenus(){
  state.gameState = "field";
  fieldMenu.style.display = "none";
  paradigmMenu.style.display = "none";
}

function renderParadigmMenu() {
  paradigmList.innerHTML = "";

  paradigms.forEach((p, idx) => {
    const card = document.createElement("div");
    card.className = "pCard";

    card.innerHTML = `
      <div class="pTop">
        <input class="pName" value="${p.name}" data-name="${idx}" />
        <div class="pBadge">${idx === activeParadigmIndex ? "ACTIVE" : ""}</div>
      </div>
      <div class="pRoles">
        ${[0,1,2].map(i => `
          <select data-idx="${idx}" data-slot="${i}">
            ${ROLE_LIST.map(r => `<option ${p.roles[i]===r?"selected":""}>${r}</option>`).join("")}
          </select>
        `).join("")}
      </div>
      <div class="pActions">
        <button data-set="${idx}">Set Active</button>
        <button data-del="${idx}">Delete</button>
      </div>
    `;

    paradigmList.appendChild(card);
  });

  paradigmList.querySelectorAll("[data-name]").forEach(inp => {
    inp.addEventListener("input", () => paradigms[inp.dataset.name].name = inp.value);
  });

  paradigmList.querySelectorAll("select").forEach(sel => {
    sel.addEventListener("change", () => {
      paradigms[sel.dataset.idx].roles[sel.dataset.slot] = sel.value;
    });
  });

  paradigmList.querySelectorAll("[data-set]").forEach(btn => {
    btn.addEventListener("click", () => {
      setActiveParadigm(+btn.dataset.set);
      renderParadigmMenu();
    });
  });

  paradigmList.querySelectorAll("[data-del]").forEach(btn => {
    btn.addEventListener("click", () => {
      paradigms.splice(btn.dataset.del, 1);
      renderParadigmMenu();
    });
  });
}
