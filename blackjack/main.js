    // ---------- Blackjack ----------
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
      // Returns best total <= 21 if possible, else the lowest total.
      // isSoft = at least one Ace is still being counted as 11.
      let total = 0;
      let aces = 0;

      for (const c of hand) {
        total += cardValue(c.rank);
        if (c.rank === "A") aces++;
      }

      // Convert A(11) -> A(1) by subtracting 10 as needed.
      // Each subtraction represents one Ace no longer counted as 11.
      while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
      }

      const isSoft = total <= 21 && aces > 0;
      return { total, isSoft };
    }

    // ---------- State ----------
    let deck = shuffle(makeDeck());
    let player = [];
    let dealer = [];
    let hiddenDealer = true;
    let roundOver = true;

    let bankroll = 500;
    let currentBet = 0;

    const stats = { wins: 0, losses: 0, pushes: 0 };

    // ---------- DOM ----------
    const elDealerHand = document.getElementById("dealerHand");
    const elPlayerHand = document.getElementById("playerHand");
    const elDealerScore = document.getElementById("dealerScore");
    const elPlayerScore = document.getElementById("playerScore");
    const elDealerHint = document.getElementById("dealerHint");
    const elPlayerHint = document.getElementById("playerHint");
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

    function setStatus(html) {
      elStatus.innerHTML = html;
    }

    function updateBankrollDisplay() {
      elBankroll.textContent = bankroll;
      elCurrentBet.textContent = currentBet;
    }

    function ensureDeck() {
      // infinite shoe feel: reshuffle when low
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
        div.title = "Face down";
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
      div.title = `${c.rank}${c.suit}`;
      return div;
    }

    function renderHands() {
      elDealerHand.innerHTML = "";
      elPlayerHand.innerHTML = "";

      dealer.forEach((c, idx) => {
        const faceDown = hiddenDealer && idx === 0;
        elDealerHand.appendChild(renderCard(c, faceDown));
      });

      player.forEach(c => elPlayerHand.appendChild(renderCard(c)));

      const p = handTotals(player);
      elPlayerScore.textContent = p.total;
      elPlayerHint.textContent = p.isSoft ? " (soft)" : "";

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

    function setButtons() {
      btnHit.disabled = roundOver;
      btnStand.disabled = roundOver;
      btnReveal.disabled = roundOver;
      btnDouble.disabled = roundOver || player.length !== 2;
      btnPlaceBet.disabled = !roundOver;
    }

    function resetRound() {
      player = [];
      dealer = [];
      hiddenDealer = true;
      roundOver = false;
      setButtons();
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

      // Initial deal
      dealer.push(draw(), draw());
      player.push(draw(), draw());

      renderHands();
      setButtons(); // enables Double Down while player has exactly 2 cards

      const p = handTotals(player).total;
      const d = handTotals(dealer).total;

      // Natural check
      if (p === 21 || d === 21) {
        hiddenDealer = false;
        renderHands();
        settle(true);
        return;
      }

      setStatus("Your move: <b>Hit</b>, <b>Stand</b>, or <b>Double Down</b>.");
    }

    function playerHit() {
      if (roundOver) return;

      player.push(draw());
      renderHands();
      setButtons();

      const p = handTotals(player).total;
      if (p > 21) {
        hiddenDealer = false;
        renderHands();
        settle(false);
      } else if (p === 21) {
        setStatus("You hit <b>21</b>. Dealer will play out.");
        dealerPlayAndSettle();
      } else {
        setStatus("You drew a card. Still your move.");
      }
    }

    function playerStand() {
      if (roundOver) return;
      setStatus("You stand. Dealer's turn.");
      dealerPlayAndSettle();
    }

    function playerDoubleDown() {
      if (roundOver) return;
      if (player.length !== 2) return;

      // must match current bet
      if (bankroll < currentBet) {
        setStatus("Not enough chips to double down.");
        return;
      }

      bankroll -= currentBet;
      currentBet *= 2;
      updateBankrollDisplay();

      player.push(draw());
      renderHands();
      setButtons();

      setStatus("Double down! One card only.");
      dealerPlayAndSettle();
    }

    function dealerPlayAndSettle() {
      hiddenDealer = false;
      renderHands();

      // Dealer hits to 17; stands on soft 17.
      while (handTotals(dealer).total < 17) {
        dealer.push(draw());
        renderHands();
      }

      settle(false);
    }

    function settle(fromNatural=false) {
      hiddenDealer = false;
      renderHands();

      const p = handTotals(player).total;
      const d = handTotals(dealer).total;

      roundOver = true;
      setButtons();

      let result = "";

      if (p > 21) {
        stats.losses++;
        result = "You busted. <b>Dealer wins</b>.";
      } else if (d > 21) {
        stats.wins++;
        bankroll += currentBet * 2;
        result = "Dealer busted. <b>You win</b>.";
      } else if (p > d) {
        stats.wins++;
        if (fromNatural && p === 21 && player.length === 2) {
          // blackjack: 3:2. total return to player is 2.5x of original bet.
          bankroll += Math.floor(currentBet * 2.5);
          result = "<b>Blackjack!</b> Paid 3:2.";
        } else {
          bankroll += currentBet * 2;
          result = "<b>You win</b>.";
        }
      } else if (p < d) {
        stats.losses++;
        result = "Dealer wins.";
      } else {
        stats.pushes++;
        bankroll += currentBet;
        result = "<b>Push</b> (tie).";
      }

      currentBet = 0;
      updateBankrollDisplay();

      elWins.textContent = stats.wins;
      elLosses.textContent = stats.losses;
      elPushes.textContent = stats.pushes;

      setStatus(`${result} Place another bet to continue.`);
    }

    function revealAndSettle() {
      if (roundOver) return;
      setStatus("Revealing and settling…");
      dealerPlayAndSettle();
    }

    // ---------- Events ----------
    btnPlaceBet.addEventListener("click", startRoundWithBet);
    btnHit.addEventListener("click", playerHit);
    btnStand.addEventListener("click", playerStand);
    btnDouble.addEventListener("click", playerDoubleDown);
    btnReveal.addEventListener("click", revealAndSettle);

    window.addEventListener("keydown", (e) => {
      const k = e.key.toLowerCase();
      if (k === "p") startRoundWithBet();
      if (k === "h") playerHit();
      if (k === "s") playerStand();
      if (k === "d") playerDoubleDown();
    });

    // ---------- Self-tests (console) ----------
    // No framework. These run once on load and log results.
    function assert(name, condition) {
      if (!condition) {
        console.error(`❌ Test failed: ${name}`);
        return false;
      }
      console.log(`✅ ${name}`);
      return true;
    }

    function runSelfTests() {
      // handTotals tests
      assert("handTotals: A + 9 = 20 (soft)", (() => {
        const h = [{rank:"A",suit:"♠",color:"black"},{rank:"9",suit:"♣",color:"black"}];
        const t = handTotals(h);
        return t.total === 20 && t.isSoft === true;
      })());

      assert("handTotals: A + A + 9 = 21 (soft)", (() => {
        const h = [{rank:"A",suit:"♠",color:"black"},{rank:"A",suit:"♥",color:"red"},{rank:"9",suit:"♣",color:"black"}];
        const t = handTotals(h);
        return t.total === 21 && t.isSoft === true;
      })());

      assert("handTotals: A + A + 9 + 9 = 20 (hard)", (() => {
        const h = [{rank:"A",suit:"♠",color:"black"},{rank:"A",suit:"♥",color:"red"},{rank:"9",suit:"♣",color:"black"},{rank:"9",suit:"♦",color:"red"}];
        const t = handTotals(h);
        return t.total === 20 && t.isSoft === false;
      })());

      // Added: more Ace edge cases
      assert("handTotals: A + K = 21 (soft)", (() => {
        const h = [{rank:"A",suit:"♠",color:"black"},{rank:"K",suit:"♣",color:"black"}];
        const t = handTotals(h);
        return t.total === 21 && t.isSoft === true;
      })());

      assert("handTotals: A + 9 + 9 = 19 (hard)", (() => {
        const h = [{rank:"A",suit:"♠",color:"black"},{rank:"9",suit:"♣",color:"black"},{rank:"9",suit:"♦",color:"red"}];
        const t = handTotals(h);
        return t.total === 19 && t.isSoft === false;
      })());

      assert("handTotals: A + A + 8 = 20 (soft)", (() => {
        const h = [{rank:"A",suit:"♠",color:"black"},{rank:"A",suit:"♥",color:"red"},{rank:"8",suit:"♦",color:"red"}];
        const t = handTotals(h);
        return t.total === 20 && t.isSoft === true;
      })());

      // payout sanity tests (simulate settle outcomes)
      const snapshot = {
        deck, player, dealer, hiddenDealer, roundOver, bankroll, currentBet,
        stats: { ...stats },
        ui: {
          wins: elWins.textContent,
          losses: elLosses.textContent,
          pushes: elPushes.textContent,
          status: elStatus.innerHTML,
        }
      };

      // force a deterministic win (non-blackjack): bet 10, bankroll 100 -> should end at 120
      bankroll = 100;
      currentBet = 10;
      player = [{rank:"10",suit:"♠",color:"black"},{rank:"9",suit:"♣",color:"black"}]; // 19
      dealer = [{rank:"10",suit:"♥",color:"red"},{rank:"8",suit:"♦",color:"red"}]; // 18
      hiddenDealer = false;
      roundOver = false;
      settle(false);
      assert("payout: normal win pays 1:1", bankroll === 120); // +20 (return 2x bet)

      // restore snapshot (so UI/game starts clean)
      deck = snapshot.deck;
      player = snapshot.player;
      dealer = snapshot.dealer;
      hiddenDealer = snapshot.hiddenDealer;
      roundOver = snapshot.roundOver;
      bankroll = snapshot.bankroll;
      currentBet = snapshot.currentBet;
      stats.wins = snapshot.stats.wins;
      stats.losses = snapshot.stats.losses;
      stats.pushes = snapshot.stats.pushes;

      elWins.textContent = snapshot.ui.wins;
      elLosses.textContent = snapshot.ui.losses;
      elPushes.textContent = snapshot.ui.pushes;
      elStatus.innerHTML = snapshot.ui.status;

      updateBankrollDisplay();
      renderHands();
      setButtons();
    }

    // Boot
    updateBankrollDisplay();
    renderHands();
    setButtons();
    setStatus('Place a bet to start a hand.');

    runSelfTests();