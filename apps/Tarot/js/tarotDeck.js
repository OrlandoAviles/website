// js/tarotDeck.js
window.Tarot = (() => {
  // Major arcana naming rule you gave:
  // Most majors use TheX.png
  // Exceptions: Temperance, Judgement, WheelOfFortune, Justice (no "The")

  const majors = [
    "TheFool",
    "TheMagician",
    "TheHighPriestess",
    "TheEmpress",
    "TheEmperor",
    "TheHierophant",
    "TheLovers",
    "TheChariot",
    "Strength",
    "TheHermit",
    "WheelOfFortune", // exception (no The)
    "Justice", // exception
    "TheHangedMan",
    "Death",
    "Temperance", // exception
    "TheDevil",
    "TheTower",
    "TheStar",
    "TheMoon",
    "TheSun",
    "Judgement", // exception
    "TheWorld",
  ];

  const wands = [
    "AceOfWands",
    "TwoOfWands",
    "ThreeOfWands",
    "FourOfWands",
    "FiveOfWands",
    "SixOfWands",
    "SevenOfWands",
    "EightOfWands",
    "NineOfWands",
    "TenOfWands",
    "PageOfWands",
    "KnightOfWands",
    "QueenOfWands",
    "KingOfWands",
  ];

  const cups = [
    "AceOfCups",
    "TwoOfCups",
    "ThreeOfCups",
    "FourOfCups",
    "FiveOfCups",
    "SixOfCups",
    "SevenOfCups",
    "EightOfCups",
    "NineOfCups",
    "TenOfCups",
    "PageOfCups",
    "KnightOfCups",
    "QueenOfCups",
    "KingOfCups",
  ];

  const swords = [
    "AceOfSwords",
    "TwoOfSwords",
    "ThreeOfSwords",
    "FourOfSwords",
    "FiveOfSwords",
    "SixOfSwords",
    "SevenOfSwords",
    "EightOfSwords",
    "NineOfSwords",
    "TenOfSwords",
    "PageOfSwords",
    "KnightOfSwords",
    "QueenOfSwords",
    "KingOfSwords",
  ];

  const pentacles = [
    "AceOfPentacles",
    "TwoOfPentacles",
    "ThreeOfPentacles",
    "FourOfPentacles",
    "FiveOfPentacles",
    "SixOfPentacles",
    "SevenOfPentacles",
    "EightOfPentacles",
    "NineOfPentacles",
    "TenOfPentacles",
    "PageOfPentacles",
    "KnightOfPentacles",
    "QueenOfPentacles",
    "KingOfPentacles",
  ];

  const cardNames = [...majors, ...wands, ...cups, ...swords, ...pentacles];

  const images = new Map();
  let loaded = false;

  function getPath(name) {
    return `./TarotCards/${name}.png`;
  }

  function preload() {
    if (loaded) return Promise.resolve(true);

    const promises = cardNames.map((name) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          images.set(name, img);
          resolve(true);
        };
        img.onerror = () => {
          console.warn("Missing tarot image:", getPath(name));
          resolve(false);
        };
        img.src = getPath(name);
      });
    });

    return Promise.all(promises).then(() => {
      loaded = true;
      return true;
    });
  }

  function randomCard() {
    const name = cardNames[Math.floor(Math.random() * cardNames.length)];
    return { name, img: images.get(name) || null };
  }

  function getImage(name) {
    return images.get(name) || null;
  }

  function isReady() {
    return loaded;
  }

  return { preload, randomCard, getImage, isReady };
})();
