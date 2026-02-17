// ---------- Blackjack (with Split Support) ----------

const SUITS = [
  { s: "♠", color: "black" },
  { s: "♥", color: "red" },
  { s: "♦", color: "red" },
  { s: "♣", color: "black" },
];

const RANKS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

function makeDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit: suit.s, color: suit.color });
    }
  }
  return deck;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function cardValue(rank) {
  if (rank === "A") return 11;
  if (["K","Q","J"].includes(rank)) return 10;
  return Number(rank);
}

function handTotals(hand) {
  let total = 0;
  let aces = 0;

  for (const c of hand) {
    total += cardValue(c.rank);
    if (c.rank === "A") aces++;
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  const isSoft = total <= 21 && aces > 0;
  return { total, isSoft };
}

// ---------- State ----------

let deck = shuffle(makeDeck());
let dealer = [];
let hiddenDealer = true;
let roundOver = true;

let playerHands = [];
let activeHandIndex = 0;

let bankroll = 500;
let currentBet = 0;

const stats = { wins: 0, losses: 0, pushes: 0 };

// ---------- DOM ----------

const elDealerHand = document.getElementById("dealerHand");
const elPlayerHand = document.getElementById("playerHand");
const elDealerScore = document.getElementById("dealerScore");
const elDealerHint = document.getElementById("dealerHint");
const elStatus = document.getElementById("status");

const elWins = document.getElementById("wins");
const elLosses = document.getElementById("losses");
const elPushes = document.getElementById("pushes");

const elBankroll = document.getElementById("bankroll");
const elCurrentBet = document.getElementById("currentBet");
const betInput = document.getElementById("betInput");

const btnPlaceBet = document.getElementById("btnPlaceBet");
const btnHit = document.getElementById("btnHit");
const btnStand = document.getElementById("btnStand");
const btnDouble = document.getElementById("btnDouble");
const btnReveal = document.getElementById("btnReveal");

// NEW: Split button (must exist in HTML)
let btnSplit = document.getElementById("btnSplit");

function setStatus(html) {
  elStatus.innerHTML = html;
}

function updateBankrollDisplay() {
  elBankroll.textContent = bankroll;
  elCurrentBet.textContent = currentBet;
}

function ensureDeck() {
  if (deck.length < 15) deck = shuffle(makeDeck());
}

function draw() {
  ensureDeck();
  return deck.pop();
}

function renderCard(c, faceDown=false) {
  const div = document.createElement("div");
  if (faceDown) {
    div.className = "card back";
    return div;
  }
  div.className = `card ${c.color}`;
  const small = document.createElement("div");
  small.className = "small";
  small.textContent = `${c.rank}${c.suit}`;
  const big = document.createElement("div");
  big.className = "big";
  big.textContent = c.suit;
  div.appendChild(small);
  div.appendChild(big);
  return div;
}

function renderHands() {
  elDealerHand.innerHTML = "";
  elPlayerHand.innerHTML = "";

  dealer.forEach((c, idx) => {
    const faceDown = hiddenDealer && idx === 0;
    elDealerHand.appendChild(renderCard(c, faceDown));
  });

  playerHands.forEach((handObj, index) => {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "row";
    wrapper.style.alignItems = "center";
    wrapper.style.gap = "10px";
    wrapper.style.marginRight = "24px";

    if (index === activeHandIndex && !roundOver) {
      wrapper.style.outline = "2px solid var(--accent)";
      wrapper.style.padding = "6px";
      wrapper.style.borderRadius = "12px";
    }

    const cardsContainer = document.createElement("div");
    cardsContainer.style.display = "flex";
    cardsContainer.style.gap = "10px";

    handObj.cards.forEach(c => cardsContainer.appendChild(renderCard(c)));

    const total = handTotals(handObj.cards);
    const score = document.createElement("div");
    score.textContent = `Score: ${total.total}${total.isSoft ? " (soft)" : ""}`;
    score.style.fontSize = "12px";
    score.style.color = "var(--muted)";

    wrapper.appendChild(cardsContainer);
    wrapper.appendChild(score);

    elPlayerHand.appendChild(wrapper);
  });

  if (hiddenDealer) {
    if (dealer.length > 1) {
      const up = handTotals([dealer[1]]);
      elDealerScore.textContent = `${up.total} + ?`;
    } else {
      elDealerScore.textContent = "?";
    }
    elDealerHint.textContent = "";
  } else {
    const d = handTotals(dealer);
    elDealerScore.textContent = d.total;
    elDealerHint.textContent = d.isSoft ? " (soft)" : "";
  }
}

function canSplit() {
  if (roundOver) return false;
  if (playerHands.length !== 1) return false;
  const hand = playerHands[0].cards;
  if (hand.length !== 2) return false;
  if (hand[0].rank !== hand[1].rank) return false;
  if (bankroll < playerHands[0].bet) return false;
  return true;
}

function setButtons() {
  btnHit.disabled = roundOver;
  btnStand.disabled = roundOver;
  btnReveal.disabled = roundOver;
  btnDouble.disabled = roundOver || playerHands[activeHandIndex]?.cards.length !== 2;
  if (btnSplit) btnSplit.disabled = !canSplit();
  btnPlaceBet.disabled = !roundOver;
}

function resetRound() {
  dealer = [];
  playerHands = [];
  activeHandIndex = 0;
  hiddenDealer = true;
  roundOver = false;
}

function startRoundWithBet() {
  const bet = Number(betInput.value);
  if (!Number.isFinite(bet) || bet <= 0 || bet > bankroll) {
    setStatus("Invalid bet amount.");
    return;
  }

  currentBet = bet;
  bankroll -= bet;
  updateBankrollDisplay();

  resetRound();

  dealer.push(draw(), draw());

  playerHands.push({
    cards: [draw(), draw()],
    bet: bet,
    resolved: false
  });

  renderHands();
  setButtons();

  setStatus("Your move.");
}

function playerHit() {
  if (roundOver) return;

  const handObj = playerHands[activeHandIndex];
  handObj.cards.push(draw());

  const total = handTotals(handObj.cards).total;

  if (total > 21) {
    handObj.resolved = true;
    nextHandOrDealer();
  }

  renderHands();
  setButtons();
}

function playerStand() {
  if (roundOver) return;
  playerHands[activeHandIndex].resolved = true;
  nextHandOrDealer();
}

function playerDoubleDown() {
  if (roundOver) return;

  const handObj = playerHands[activeHandIndex];
  if (handObj.cards.length !== 2) return;
  if (bankroll < handObj.bet) return;

  bankroll -= handObj.bet;
  handObj.bet *= 2;
  updateBankrollDisplay();

  handObj.cards.push(draw());
  handObj.resolved = true;

  nextHandOrDealer();
}

function playerSplit() {
  if (!canSplit()) return;

  const original = playerHands[0];

  bankroll -= original.bet;
  updateBankrollDisplay();

  const card1 = original.cards[0];
  const card2 = original.cards[1];

  playerHands = [
    { cards: [card1, draw()], bet: original.bet, resolved: false },
    { cards: [card2, draw()], bet: original.bet, resolved: false }
  ];

  activeHandIndex = 0;

  renderHands();
  setButtons();
}

function nextHandOrDealer() {
  if (activeHandIndex < playerHands.length - 1) {
    activeHandIndex++;
  } else {
    dealerPlayAndSettle();
  }
}

function dealerPlayAndSettle() {
  hiddenDealer = false;

  while (handTotals(dealer).total < 17) {
    dealer.push(draw());
  }

  settleAllHands();
}

function settleAllHands() {
  roundOver = true;

  const dealerTotal = handTotals(dealer).total;

  playerHands.forEach(handObj => {
    const playerTotal = handTotals(handObj.cards).total;

    if (playerTotal > 21) {
      stats.losses++;
    } else if (dealerTotal > 21 || playerTotal > dealerTotal) {
      stats.wins++;
      bankroll += handObj.bet * 2;
    } else if (playerTotal < dealerTotal) {
      stats.losses++;
    } else {
      stats.pushes++;
      bankroll += handObj.bet;
    }
  });

  currentBet = 0;
  updateBankrollDisplay();

  elWins.textContent = stats.wins;
  elLosses.textContent = stats.losses;
  elPushes.textContent = stats.pushes;

  setStatus("Round complete. Place another bet.");
  renderHands();
  setButtons();
}

function revealAndSettle() {
  if (roundOver) return;
  dealerPlayAndSettle();
}

// ---------- Events ----------

btnPlaceBet.addEventListener("click", startRoundWithBet);
btnHit.addEventListener("click", playerHit);
btnStand.addEventListener("click", playerStand);
btnDouble.addEventListener("click", playerDoubleDown);
btnReveal.addEventListener("click", revealAndSettle);
if (btnSplit) btnSplit.addEventListener("click", playerSplit);

// ---------- Boot ----------

updateBankrollDisplay();
renderHands();
setButtons();
setStatus("Place a bet to start a hand.");
