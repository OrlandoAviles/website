/*********************************************************
 * TAROT CANVAS DRAWING
 *********************************************************/
const tarotCanvas = document.getElementById("tarotCanvas");
const tarotCtx = tarotCanvas.getContext("2d");
tarotCtx.imageSmoothingEnabled = true;

let draws = [];

let tarotNames = [
  "The Fool",
  "The Magician",
  "The High Priestess",
  "The Empress",
  "The Emperor",
  "The Hierophant",
  "The Lovers",
  "The Chariot",
  "Strength",
  "The Hermit",
  "Wheel of Fortune",
  "Justice",
  "The Hanged Man",
  "Death",
  "Temperance",
  "The Devil",
  "The Tower",
  "The Star",
  "The Moon",
  "The Sun",
  "Judgement",
  "The World",
  "Ace of Wands",
  "Two of Wands",
  "Three of Wands",
  "Four of Wands",
  "Five of Wands",
  "Six of Wands",
  "Seven of Wands",
  "Eight of Wands",
  "Nine of Wands",
  "Ten of Wands",
  "Page of Wands",
  "Knight of Wands",
  "Queen of Wands",
  "King of Wands",
  "Ace of Cups",
  "Two of Cups",
  "Three of Cups",
  "Four of Cups",
  "Five of Cups",
  "Six of Cups",
  "Seven of Cups",
  "Eight of Cups",
  "Nine of Cups",
  "Ten of Cups",
  "Page of Cups",
  "Knight of Cups",
  "Queen of Cups",
  "King of Cups",
  "Ace of Swords",
  "Two of Swords",
  "Three of Swords",
  "Four of Swords",
  "Five of Swords",
  "Six of Swords",
  "Seven of Swords",
  "Eight of Swords",
  "Nine of Swords",
  "Ten of Swords",
  "Page of Swords",
  "Knight of Swords",
  "Queen of Swords",
  "King of Swords",
  "Ace of Pentacles",
  "Two of Pentacles",
  "Three of Pentacles",
  "Four of Pentacles",
  "Five of Pentacles",
  "Six of Pentacles",
  "Seven of Pentacles",
  "Eight of Pentacles",
  "Nine of Pentacles",
  "Ten of Pentacles",
  "Page of Pentacles",
  "Knight of Pentacles",
  "Queen of Pentacles",
  "King of Pentacles",
];

const Playing = (() => {
  const suits = [
    { sym: "♠", color: "#111" },
    { sym: "♥", color: "#b0122b" },
    { sym: "♦", color: "#b0122b" },
    { sym: "♣", color: "#111" },
  ];
  const ranks = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ];

  function makeDeck() {
    const deck = [];
    for (const s of suits)
      for (const r of ranks) deck.push({ rank: r, suit: s.sym, ink: s.color });
    return deck;
  }

  function randomCard() {
    const deck = makeDeck();
    return deck[Math.floor(Math.random() * deck.length)];
  }

  return { randomCard };
})();

function resizeTarotCanvas() {
  const dpr = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1));
  tarotCanvas.width = Math.floor(window.innerWidth * dpr);
  tarotCanvas.height = Math.floor(window.innerHeight * dpr);
  tarotCanvas.style.width = window.innerWidth + "px";
  tarotCanvas.style.height = window.innerHeight + "px";
  tarotCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  redrawAll();
}

window.addEventListener("resize", resizeTarotCanvas, { passive: true });
resizeTarotCanvas();

tarotCanvas.addEventListener("click", (event) => {
  const x = event.clientX;
  const y = event.clientY;

  if (App.activeDeck === "text") {
    shuffleArray(tarotNames);
    const card = { type: "text", x, y, name: tarotNames[0] };
    draws.push(card);
    drawTextCard(card);
    return;
  }

  if (App.activeDeck === "playing") {
    const c = Playing.randomCard();
    const card = {
      type: "playing",
      x,
      y,
      rank: c.rank,
      suit: c.suit,
      ink: c.ink,
      rot: (Math.random() * 10 - 5) * (Math.PI / 180),
    };
    draws.push(card);
    drawPlayingCard(card);
    return;
  }
});

function drawTextCard(card) {
  const s = App.cardScale;
  const paddingX = 8 * s;
  const r = 4 * s;

  tarotCtx.save();
  tarotCtx.font = `${Math.max(10, Math.round(12 * s))}px Arial`;
  tarotCtx.textBaseline = "middle";

  const textW = tarotCtx.measureText(card.name).width;
  const w = Math.ceil(textW + paddingX * 2);
  const h = Math.round(22 * s);

  const x = Math.round(card.x - w / 2);
  const y = Math.round(card.y - h / 2);

  tarotCtx.fillStyle = getCssVar("--cardBg");
  roundRect(tarotCtx, x, y, w, h, r);
  tarotCtx.fill();

  tarotCtx.strokeStyle = getCssVar("--cardStroke");
  tarotCtx.lineWidth = 1;
  tarotCtx.stroke();

  tarotCtx.fillStyle = getCssVar("--cardText");
  tarotCtx.shadowColor = "rgba(0,0,0,0.55)";
  tarotCtx.shadowBlur = 4 * s;
  tarotCtx.fillText(card.name, x + paddingX, y + h / 2 + 0.5);

  tarotCtx.restore();
}

function drawPlayingCard(card) {
  const s = App.cardScale;

  const w = 86 * s;
  const h = 120 * s;
  const r = 10 * s;

  tarotCtx.save();
  tarotCtx.translate(card.x, card.y);
  tarotCtx.rotate(card.rot);

  tarotCtx.shadowColor = "rgba(0,0,0,0.55)";
  tarotCtx.shadowBlur = 18 * s;
  tarotCtx.shadowOffsetY = 10 * s;

  const x = -w / 2;
  const y = -h / 2;

  const g = tarotCtx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, "rgba(255,255,255,0.98)");
  g.addColorStop(1, "rgba(245,245,245,0.96)");

  tarotCtx.fillStyle = g;
  roundRect(tarotCtx, x, y, w, h, r);
  tarotCtx.fill();

  tarotCtx.shadowBlur = 0;
  tarotCtx.shadowOffsetY = 0;

  tarotCtx.strokeStyle = "rgba(0,0,0,0.12)";
  tarotCtx.lineWidth = 1;
  tarotCtx.stroke();

  tarotCtx.strokeStyle = "rgba(0,0,0,0.08)";
  tarotCtx.lineWidth = 1;
  roundRect(
    tarotCtx,
    x + 6 * s,
    y + 6 * s,
    w - 12 * s,
    h - 12 * s,
    Math.max(2, r - 3 * s),
  );
  tarotCtx.stroke();

  tarotCtx.fillStyle = card.ink;
  tarotCtx.font = `900 ${Math.max(10, Math.round(14 * s))}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial`;
  tarotCtx.textBaseline = "top";
  tarotCtx.textAlign = "left";
  tarotCtx.fillText(`${card.rank}${card.suit}`, x + 12 * s, y + 10 * s);

  tarotCtx.font = `900 ${Math.max(18, Math.round(46 * s))}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial`;
  tarotCtx.textAlign = "center";
  tarotCtx.textBaseline = "middle";
  tarotCtx.fillText(card.suit, 0, 2 * s);

  tarotCtx.save();
  tarotCtx.rotate(Math.PI);
  tarotCtx.font = `900 ${Math.max(10, Math.round(14 * s))}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial`;
  tarotCtx.textAlign = "left";
  tarotCtx.textBaseline = "top";
  tarotCtx.fillText(`${card.rank}${card.suit}`, x + 12 * s, y + 10 * s);
  tarotCtx.restore();

  tarotCtx.restore();
}

function clearCanvas() {
  tarotCtx.clearRect(0, 0, tarotCanvas.width, tarotCanvas.height);
  draws = [];
}

function redrawAll() {
  tarotCtx.clearRect(0, 0, tarotCanvas.width, tarotCanvas.height);
  for (const d of draws) {
    if (d.type === "text") drawTextCard(d);
    else if (d.type === "playing") drawPlayingCard(d);
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function getCssVar(name) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}
