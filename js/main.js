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
    description: "A dynamic tarot reading application powered by structured card data and expandable decks. Built to explore state management, reusable UI components, and interactive storytelling through divination systems.",
    url: "apps/Tarot/index.html",
    tag: "Creative Tool"
  },
  {
    title: "List App",
    description: "A productivity-focused list manager designed with clean UX principles, intuitive task flows, and persistent state handling.",
    url: "apps/List.html",
    tag: "Productivity Tool"
  },
  {
    title: "Journal App",
    description: "A digital journaling tool centered on reflection and long-form writing, featuring smooth input flows and calm, distraction-free design.",
    url: "apps/Journal.html",
    tag: "Writing Tool"
  },
  {
    title: "Blackjack",
    description: "A fully interactive Blackjack game built in vanilla JavaScript featuring real card logic and smooth UI feedback.",
    url: "apps/Blackjack.html",
    tag: "Game"
  },
  {
    title: "Pocket Dodge",
    description: "A fast-paced mobile canvas game where players dodge hazards and collect stars using a virtual joystick.",
    url: "apps/PocketDodge.html",
    tag: "Mobile Game"
  },
  {
    title: "Shmup",
    description: "A vertical scrolling shoot-’em-up with enemies, stages, and boss encounters using real-time collision and bullet systems.",
    url: "apps/Shmup.html",
    tag: "Arcade Game"
  },
  {
    title: "Slots",
    description: "A stylized slot machine with animated reels, glowing LED cabinet effects, and arcade-style win feedback.",
    url: "apps/Slots.html",
    tag: "Arcade Game"
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
      <div class="project-content">
        <h4>${p.title}</h4>
        <div class="project-tag">${p.tag}</div>
        <p>${p.description}</p>
      </div>
      <!-- Future thumbnail goes here -->
      <!-- <img class="project-thumb" src="${p.thumb}" alt=""> -->
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
