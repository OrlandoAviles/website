export function initBookmarks() {
  const STORAGE_KEY = "dojo_bookmarks_v6";
  const defaultBookmarks = ["particles", "beatpad", "sprite", "pocketdodge"];

  const bookmarkShelf = document.getElementById("bookmarkShelf");
  const bookmarksSection = document.getElementById("bookmarksSection");
  const bookmarkDivider = document.getElementById("bookmarkDivider");
  const bookmarkCount = document.getElementById("bookmarkCount");
  const resetBtn = document.getElementById("resetBookmarksBtn");

  const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
  const featuredCards = Array.from(
    document.querySelectorAll("#featuredGrid .card-link[data-app]"),
  );
  const countEl = document.getElementById("filterCount");

  if (
    !bookmarkShelf ||
    !bookmarksSection ||
    !bookmarkDivider ||
    !bookmarkCount ||
    !resetBtn
  ) {
    console.warn("[bookmarks] Missing DOM elements, skipping init.");
    return;
  }

  function loadBookmarks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [...defaultBookmarks];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [...defaultBookmarks];
      return parsed;
    } catch {
      return [...defaultBookmarks];
    }
  }

  function saveBookmarks(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function bookmarkSet() {
    return new Set(loadBookmarks());
  }

  function setBookmarked(appId, yes) {
    const list = loadBookmarks();
    const has = list.includes(appId);

    let next = list;
    if (yes && !has) next = [appId, ...list];
    if (!yes && has) next = list.filter((x) => x !== appId);

    saveBookmarks(next);
    renderAll();
  }

  function ensureBookmarkButton(link) {
    const appId = link.dataset.app;
    const card = link.querySelector(".card");
    if (!appId || !card) return;

    let btn = card.querySelector(".bookmark-btn");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "bookmark-btn";
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const set = bookmarkSet();
        setBookmarked(appId, !set.has(appId));
      });
      card.appendChild(btn);
    }
  }

  function syncStars() {
    const set = bookmarkSet();

    featuredCards.forEach((link) => {
      const appId = link.dataset.app;
      if (!appId) return;

      ensureBookmarkButton(link);

      const btn = link.querySelector(".bookmark-btn");
      if (!btn) return;

      const active = set.has(appId);
      btn.classList.toggle("active", active);
      btn.innerHTML = active ? "★" : "☆";
      btn.title = active ? "Remove bookmark" : "Bookmark to top";
    });
  }

  function setupDrag(wrapper) {
    wrapper.setAttribute("draggable", "true");

    wrapper.addEventListener("dragstart", (e) => {
      wrapper.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", wrapper.dataset.app || "");
    });

    wrapper.addEventListener("dragend", () => {
      wrapper.classList.remove("dragging");
    });

    wrapper.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });

    wrapper.addEventListener("drop", (e) => {
      e.preventDefault();
      const fromId = e.dataTransfer.getData("text/plain");
      const toId = wrapper.dataset.app;
      if (!fromId || !toId || fromId === toId) return;

      const list = loadBookmarks().filter(Boolean);
      const fromIndex = list.indexOf(fromId);
      const toIndex = list.indexOf(toId);
      if (fromIndex === -1 || toIndex === -1) return;

      list.splice(fromIndex, 1);
      list.splice(toIndex, 0, fromId);

      saveBookmarks(list);
      renderAll();
    });
  }

  function renderBookmarksShelf() {
    const ids = loadBookmarks();
    const map = new Map();
    featuredCards.forEach((link) => map.set(link.dataset.app, link));

    const links = ids.map((id) => map.get(id)).filter(Boolean);
    bookmarkShelf.innerHTML = "";

    if (links.length === 0) {
      bookmarksSection.style.display = "none";
      bookmarkDivider.style.display = "none";
      return;
    }

    bookmarksSection.style.display = "";
    bookmarkDivider.style.display = "";

    links.forEach((link) => {
      const appId = link.dataset.app;

      const wrapper = document.createElement("div");
      wrapper.className = "bookmark-item";
      wrapper.dataset.app = appId;

      const clone = link.cloneNode(true);
      clone.querySelectorAll(".bookmark-btn").forEach((b) => b.remove());
      clone.classList.remove("hidden");

      wrapper.appendChild(clone);
      bookmarkShelf.appendChild(wrapper);

      setupDrag(wrapper);
    });

    bookmarkCount.textContent = `${links.length} pinned`;
  }

  function getTags(link) {
    return (link.dataset.tags || "").toLowerCase().split(/\s+/).filter(Boolean);
  }

  function matchesFilter(link, filter) {
    if (filter === "all") return true;
    if (filter === "bookmarked") return bookmarkSet().has(link.dataset.app);
    return getTags(link).includes(filter);
  }

  function setActiveFilter(btn) {
    filterButtons.forEach((b) => b.classList.toggle("active", b === btn));
  }

  function applyFilter(filter) {
    let shown = 0;

    featuredCards.forEach((link) => {
      const show = matchesFilter(link, filter);
      link.classList.toggle("hidden", !show);
      if (show) shown++;
    });

    countEl.textContent = `${shown}/${featuredCards.length} shown`;
  }

  function renderAll() {
    renderBookmarksShelf();
    syncStars();

    const activeBtn =
      filterButtons.find((b) => b.classList.contains("active")) ||
      filterButtons[0];

    applyFilter(activeBtn?.dataset?.filter || "all");
  }

  resetBtn.addEventListener("click", () => {
    saveBookmarks([...defaultBookmarks]);
    renderAll();
  });

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setActiveFilter(btn);
      applyFilter(btn.dataset.filter || "all");
    });
  });

  renderAll();
}
