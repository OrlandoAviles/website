async function loadComponent(id, file) {
  const res = await fetch(file);
  const html = await res.text();
  document.getElementById(id).innerHTML = html;
}

loadComponent("site-header", "components/header.html");
loadComponent("site-footer", "components/footer.html");
loadComponent("hero", "components/hero.html");
loadComponent("dojo", "components/dojo.html");
loadComponent("vfa", "components/vfa.html");
loadComponent("projects", "components/projects.html");
loadComponent("about", "components/about.html");
