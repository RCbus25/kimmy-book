const gameArea = document.getElementById("gameArea");
const bg = document.getElementById("background");
const levelTitle = document.getElementById("levelTitle");
const progressFill = document.getElementById("progressFill");
const percentText = document.getElementById("percentText");
const scoreText = document.getElementById("scoreText");
const messageBubble = document.getElementById("messageBubble");
const sack = document.getElementById("sack");

const startScreen = document.getElementById("startScreen");
const levelScreen = document.getElementById("levelScreen");
const winScreen = document.getElementById("winScreen");

const startBtn = document.getElementById("startBtn");
const nextLevelBtn = document.getElementById("nextLevelBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const pauseBtn = document.getElementById("pauseBtn");

const levelCompleteTitle = document.getElementById("levelCompleteTitle");
const levelCompleteText = document.getElementById("levelCompleteText");

const levels = [
  {
    title: "Level 1: Town Clean-Up",
    bg: "images/town.jpg",
    goal: 10,
    speed: 0.35,
    litter: ["images/bottle.png", "images/can.png", "images/wrapper.png"],
    animals: ["images/bird.png", "images/pigeon.png", "images/possum.png"],
    reward: "🏘️ Town Helper",
    message: "You stopped litter before it reached the drains!"
  },
  {
    title: "Level 2: River Rescue",
    bg: "images/riverscene.jpg",
    goal: 12,
    speed: 0.45,
    litter: ["images/bottle.png", "images/can.png", "images/wrapper.png"],
    animals: ["images/fish.png"],
    reward: "🐟 River Guardian",
    message: "You helped keep the river clean!"
  },
  {
    title: "Level 3: Ocean Rescue",
    bg: "images/ocean.jpg",
    goal: 14,
    speed: 0.55,
    litter: ["images/bottle.png", "images/can.png", "images/wrapper.png"],
    animals: ["images/seagull.png", "images/sea-turtle.png"],
    reward: "🐢 Ocean Protector",
    message: "You helped protect the ocean animals!"
  }
];

let currentLevel = 0;
let score = 0;
let cleaned = 0;
let running = false;
let paused = false;
let lastTime = 0;
let spawnTimer = 0;
let animalTimer = 0;
let activeItems = [];

function startGame() {
  currentLevel = 0;
  score = 0;
  startScreen.classList.add("hidden");
  winScreen.classList.add("hidden");
  levelScreen.classList.add("hidden");
  loadLevel();
}

function loadLevel() {
  clearItems();

  const level = levels[currentLevel];
  cleaned = 0;
  running = true;
  paused = false;
  spawnTimer = 0;
  animalTimer = 0;

  bg.src = level.bg;
  levelTitle.textContent = level.title;
  updateHud();
  showMessage("Go!");

  for (let i = 0; i < 5; i++) spawnLitter();

  requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
  if (!running || paused) return;

  const delta = Math.min((timestamp - lastTime) / 16.67, 3) || 1;
  lastTime = timestamp;

  spawnTimer += delta;
  animalTimer += delta;

  if (spawnTimer > 55 && activeItems.filter(i => i.type === "litter").length < 8) {
    spawnLitter();
    spawnTimer = 0;
  }

  if (animalTimer > 130 && activeItems.filter(i => i.type === "animal").length < 3) {
    spawnAnimal();
    animalTimer = 0;
  }

  moveItems(delta);

  requestAnimationFrame(gameLoop);
}

function spawnLitter() {
  const level = levels[currentLevel];
  const src = randomFrom(level.litter);

  const item = makeItem(src, "litter");
  item.x = random(35, 95);
  item.y = random(28, 82);

  const targetX = currentLevel === 0 ? 88 : 104;
  const targetY = currentLevel === 0 ? 82 : random(35, 70);

  const angle = Math.atan2(targetY - item.y, targetX - item.x);
  item.vx = Math.cos(angle) * level.speed * random(0.25, 0.55);
  item.vy = Math.sin(angle) * level.speed * random(0.25, 0.55);
  item.spin = random(-1.2, 1.2);

  item.el.addEventListener("pointerdown", e => {
    e.preventDefault();
    collectLitter(item);
  });

  addItem(item);
}

function spawnAnimal() {
  const level = levels[currentLevel];
  const src = randomFrom(level.animals);

  const item = makeItem(src, "animal");
  item.x = -12;
  item.y = random(22, 78);
  item.vx = level.speed * random(0.6, 1.1);
  item.vy = random(-0.15, 0.15);
  item.spin = 0;

  if (Math.random() > 0.5) {
    item.x = 112;
    item.vx *= -1;
    item.el.style.transform = "scaleX(-1)";
  }

  item.el.addEventListener("pointerdown", e => {
    e.preventDefault();
    tapAnimal(item);
  });

  addItem(item);
}

function makeItem(src, type) {
  const el = document.createElement("img");
  el.src = src;
  el.className = `item ${type === "animal" ? "animal" : ""}`;
  el.alt = type;
  gameArea.appendChild(el);

  return {
    el,
    type,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    spin: 0,
    rot: random(-20, 20)
  };
}

function addItem(item) {
  activeItems.push(item);
  renderItem(item);
}

function moveItems(delta) {
  for (const item of [...activeItems]) {
    item.x += item.vx * delta;
    item.y += item.vy * delta;
    item.rot += item.spin * delta;

    renderItem(item);

    if (item.type === "litter" && (item.x > 104 || item.y > 92)) {
      missLitter(item);
    }

    if (item.type === "animal" && (item.x < -18 || item.x > 118)) {
      removeItem(item);
    }
  }
}

function renderItem(item) {
  item.el.style.left = `${item.x}%`;
  item.el.style.top = `${item.y}%`;

  if (item.type === "litter") {
    item.el.style.transform = `translate(-50%, -50%) rotate(${item.rot}deg)`;
  }
}

function collectLitter(item) {
  if (!running) return;

  sparkleAt(item.x, item.y);
  item.el.classList.add("hit");

  cleaned++;
  score += 10;
  pulseSack();
  updateHud();

  if (cleaned === 3) showMessage("Great job!");
  if (cleaned === 6) showMessage("Keep going!");
  if (cleaned === 9) showMessage("Magic sack glowing!");

  setTimeout(() => removeItem(item), 250);

  if (cleaned >= levels[currentLevel].goal) {
    completeLevel();
  }
}

function missLitter(item) {
  score = Math.max(0, score - 5);
  showMessage("Catch the rubbish!");
  removeItem(item);
  updateHud();
}

function tapAnimal(item) {
  score = Math.max(0, score - 10);
  showMessage("Careful! Don’t tap animals.");
  sparkleAt(item.x, item.y, "💙");
  removeItem(item);
  updateHud();
}

function completeLevel() {
  running = false;
  clearItems();

  const level = levels[currentLevel];

  setTimeout(() => {
    levelCompleteTitle.textContent = level.reward;
    levelCompleteText.textContent = level.message;

    if (currentLevel === levels.length - 1) {
      levelScreen.classList.add("hidden");
      winScreen.classList.remove("hidden");
    } else {
      nextLevelBtn.textContent = "Next Level";
      levelScreen.classList.remove("hidden");
    }
  }, 600);
}

function nextLevel() {
  currentLevel++;
  levelScreen.classList.add("hidden");
  loadLevel();
}

function updateHud() {
  const level = levels[currentLevel];
  const percent = Math.min(100, Math.round((cleaned / level.goal) * 100));
  progressFill.style.width = `${percent}%`;
  percentText.textContent = `${percent}%`;
  scoreText.textContent = score;
}

function pulseSack() {
  sack.classList.add("glow");
  setTimeout(() => sack.classList.remove("glow"), 300);
}

function showMessage(text) {
  messageBubble.textContent = text;
  messageBubble.classList.remove("show");
  void messageBubble.offsetWidth;
  messageBubble.classList.add("show");
}

function sparkleAt(x, y, icon = "✨") {
  for (let i = 0; i < 4; i++) {
    const s = document.createElement("div");
    s.className = "sparkle";
    s.textContent = icon;
    s.style.left = `${x + random(-2, 2)}%`;
    s.style.top = `${y + random(-2, 2)}%`;
    gameArea.appendChild(s);
    setTimeout(() => s.remove(), 800);
  }
}

function clearItems() {
  activeItems.forEach(item => item.el.remove());
  activeItems = [];
}

function removeItem(item) {
  item.el.remove();
  activeItems = activeItems.filter(i => i !== item);
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

startBtn.addEventListener("click", startGame);
nextLevelBtn.addEventListener("click", nextLevel);
playAgainBtn.addEventListener("click", startGame);

pauseBtn.addEventListener("click", () => {
  if (!running) return;
  paused = !paused;
  pauseBtn.textContent = paused ? "Resume" : "Pause";
  if (!paused) {
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
  }
});
