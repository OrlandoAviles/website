export function mount({ sidebar, canvasArea, inspector, projectData }) {
  sidebar.innerHTML = `<h3>Sprite Editor</h3>
    <div class="field"><label>Name</label><input id="spriteName" value="New Sprite"></div>
    <button id="saveSprite" class="btn-small">Save Sprite</button>
  `;

  inspector.innerHTML = `<p>Click and drag to paint pixels.</p>`;

  const gridSize = 16;
  let pixels = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
  let isPainting = false;

  const grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = `repeat(${gridSize}, 16px)`;
  grid.style.gap = "1px";
  canvasArea.innerHTML = "";
  canvasArea.appendChild(grid);

  function paintCell(x, y) {
    pixels[y][x] = 1;
  }

  function drawGrid() {
    grid.innerHTML = "";

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const cell = document.createElement("div");
        cell.style.width = "16px";
        cell.style.height = "16px";
        cell.style.background = pixels[y][x] ? "#3cff6b" : "#111";
        cell.style.cursor = "pointer";

        cell.onmousedown = () => {
          isPainting = true;
          paintCell(x, y);
          drawGrid();
        };

        cell.onmouseover = () => {
          if (isPainting) {
            paintCell(x, y);
            drawGrid();
          }
        };

        grid.appendChild(cell);
      }
    }
  }

  // Stop painting when mouse released anywhere
  document.addEventListener("mouseup", () => {
    isPainting = false;
  });

  drawGrid();

  saveSprite.onclick = () => {
    const sprite = {
      id: projectData.sprites.nextId++,
      name: spriteName.value,
      pixels: JSON.parse(JSON.stringify(pixels))
    };
    projectData.sprites.list.push(sprite);
    alert(`Saved sprite "${sprite.name}"`);
  };
}
