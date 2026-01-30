async function loadComponent(id, file) {
  const res = await fetch(file);
  const html = await res.text();
  document.getElementById(id).innerHTML = html;

  if (id === "projects") renderProjects();
  if (id === "dojo") renderDojoFeatures();
}

loadComponent("site-header", "components/header.html");
loadComponent("hero", "components/hero.html");
loadComponent("dojo", "components/dojo.html");
loadComponent("vfa", "components/vfa.html");
loadComponent("projects", "components/projects.html");
loadComponent("about", "components/about.html");
loadComponent("site-footer", "components/footer.html");


const projects = [
  {
    title: "Tarot App",
    description: "A card reading app driven by structured content and expandable decks.",
    url: "apps/Tarot/index.html"
  },
  {
    title: "List App",
    description: "A productivity focused list manager with strong UX fundamentals.",
    url: "apps/List.html"
  },
  {
    title: "Journal App",
    description: "A writing and reflection tool exploring persistent state and UI flow.",
    url: "apps/Journal.html"
  }
];


const dojoFeatures = [
  {
    title: "Map Editor",
    description: "Create and edit game areas, layouts, and navigation."
  },
  {
    title: "Story Editor",
    description: "Write scenes, dialogue, and branching narrative events."
  },
  {
    title: "Item & Data Index",
    description: "Manage items, characters, and game data in structured form."
  }
];


function renderProjects() {
  const grid = document.getElementById("projects-grid");
  if (!grid) return;

  grid.innerHTML = projects.map(p => `
    <a class="card project-card" href="${p.url}">
      <h4>${p.title}</h4>
      <p>${p.description}</p>
    </a>
  `).join("");
}


function renderDojoFeatures() {
  const grid = document.getElementById("dojo-features-grid");
  if (!grid) return;

  grid.innerHTML = dojoFeatures.map(f => `
    <div class="card">
      <h4>${f.title}</h4>
      <p>${f.description}</p>
    </div>
  `).join("");
}
