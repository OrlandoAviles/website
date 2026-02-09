 const TARGET = 1000;
      const STORAGE_KEY = "journalEntries";

      const paper = document.getElementById("paper");
      const wordCountEl = document.getElementById("wordCount");
      const remainingEl = document.getElementById("remaining");
      const bar = document.getElementById("bar");
      const entryTitle = document.getElementById("entryTitle");
      const entryList = document.getElementById("entryList");

      function todayKey() {
        return new Date().toISOString().slice(0, 10);
      }

      let currentDate = localStorage.getItem("currentEntryDate") || todayKey();

      function getJournal() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      }

      function saveJournal(journal) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(journal));
      }

      function countWords(text) {
        return text.trim().match(/\S+/g)?.length || 0;
      }

      function loadEntry(date) {
        const journal = getJournal();
        const entry = journal[date] || { text: "" };

        currentDate = date;
        localStorage.setItem("currentEntryDate", date);

        entryTitle.textContent = date;
        paper.value = entry.text;
        update(entry.text);
        renderMenu();
      }

      function update(text) {
        const words = countWords(text);
        const pct = Math.min(100, Math.round((words / TARGET) * 100));

        wordCountEl.textContent = words;
        remainingEl.textContent = Math.max(0, TARGET - words);
        bar.style.width = pct + "%";

        const journal = getJournal();
        journal[currentDate] = {
          text,
          wordCount: words,
          completed: words >= TARGET,
          updatedAt: Date.now(),
        };
        saveJournal(journal);
      }

      paper.addEventListener("input", () => update(paper.value));

      function renderMenu() {
        const journal = getJournal();
        entryList.innerHTML = "";

        Object.keys(journal)
          .sort((a, b) => b.localeCompare(a))
          .forEach((date) => {
            const li = document.createElement("li");
            li.textContent = date;

            if (journal[date].completed) {
              const check = document.createElement("span");
              check.textContent = "✓";
              check.className = "done";
              li.appendChild(check);
            }

            li.onclick = () => loadEntry(date);
            entryList.appendChild(li);
          });
      }

      document.getElementById("menuBtn").onclick = () => {
        const menu = document.getElementById("menu");
        menu.style.display =
          getComputedStyle(menu).display === "none" ? "block" : "none";
      };

      // Detect new day on load
      if (currentDate !== todayKey()) {
        currentDate = todayKey();
        localStorage.setItem("currentEntryDate", currentDate);
      }

      loadEntry(currentDate);