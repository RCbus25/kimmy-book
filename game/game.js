const gameArea = document.getElementById("gameArea");
const progressFill = document.getElementById("progressFill");
const percentText = document.getElementById("percentText");
const message = document.getElementById("message");
const winMessage = document.getElementById("winMessage");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const sack = document.getElementById("sack");
const turtle = document.getElementById("turtle");
const encouragement = document.getElementById("encouragement");

const litterImages = [
  "images/bottle.png",
  "images/can.png",
  "images/wrapper.png"
];

const totalLitter = 12;
let score = 0;
let gameRunning = false;

const positions = [
  [44, 72], [55, 66], [67, 75], [76, 62], [86, 72], [38, 58],
  [50, 48], [64, 54], [73, 44], [84, 50], [58, 80], [91, 58]
];

const encouragementMessages = {
  2: "Great job!",
  4: "The beach is cleaner!",
  6: "You’re helping the turtle!",
  8: "Magic sack glowing!",
  10: "Protecting our ocean!",
  12: "Amazing clean-up!"
};

function startGame() {
  score = 0;
  gameRunning = true;

  message.style.display = "none";
  winMessage.style.display = "none";
  turtle.classList.remove("show");
  sack.classList.remove("glow");
  sack.classList.remove("full-glow");
  encouragement.classList.remove("show");
  encouragement.textContent = "";

  updateProgress();

  document.querySelectorAll(".litter, .sparkle").forEach(el => el.remove());

  for (let i = 0; i < totalLitter; i++) {
    createLitter(i);
  }
}

function createLitter(index) {
  const item = document.createElement("img");
  item.src = litterImages[index % litterImages.length];
  item.className = "litter";
  item.alt = "Piece of litter";

  const [left, top] = positions[index];
  item.style.left = `${left}%`;
  item.style.top = `${top}%`;

  const rotation = Math.floor(Math.random() * 50) - 25;
  const delay = (Math.random() * 1.2).toFixed(2);
  item.dataset.rotation = rotation;
  item.style.transform = `rotate(${rotation}deg)`;
  item.style.animationDelay = `${delay}s`;

  item.addEventListener("click", () => collectLitter(item));
  item.addEventListener("touchstart", (event) => {
    event.preventDefault();
    collectLitter(item);
  }, { once: true });

  gameArea.appendChild(item);
}

function collectLitter(item) {
  if (!gameRunning || item.classList.contains("collected")) return;

  item.classList.add("collected");

  const rect = item.getBoundingClientRect();
  const gameRect = gameArea.getBoundingClientRect();

  const x = rect.left - gameRect.left + rect.width / 2;
  const y = rect.top - gameRect.top + rect.height / 2;

  showSparkleBurst(x, y);

  item.style.opacity = "0";
  item.style.transform = "scale(0.1) rotate(360deg)";

  setTimeout(() => item.remove(), 250);

  score++;
  updateProgress();
  pulseSack();

  if (encouragementMessages[score]) {
    showEncouragement(encouragementMessages[score]);
  }

  if (score >= totalLitter) {
    finishGame();
  }
}

function updateProgress() {
  const percent = Math.round((score / totalLitter) * 100);
  progressFill.style.width = `${percent}%`;
  percentText.textContent = `${percent}%`;
}

function pulseSack() {
  sack.classList.add("glow");
  setTimeout(() => {
    if (score < totalLitter) {
      sack.classList.remove("glow");
    }
  }, 350);
}

function showSparkleBurst(x, y) {
  createSparkle(x, y, "big", 0, 0);
  createSparkle(x - 24, y + 8, "small", -18, 8);
  createSparkle(x + 24, y + 8, "small", 18, 8);
  createSparkle(x - 8, y + 24, "small", -6, 16);
  createSparkle(x + 8, y - 12, "small", 6, -8);
}

function createSparkle(x, y, sizeClass, offsetX, offsetY) {
  const sparkle = document.createElement("div");
  sparkle.className = `sparkle ${sizeClass}`;
  sparkle.textContent = "✨";
  sparkle.style.left = `${x + offsetX}px`;
  sparkle.style.top = `${y + offsetY}px`;

  gameArea.appendChild(sparkle);

  setTimeout(() => sparkle.remove(), 900);
}

function showEncouragement(text) {
  encouragement.textContent = text;
  encouragement.classList.remove("show");

  void encouragement.offsetWidth;

  encouragement.classList.add("show");
}

function finishGame() {
  gameRunning = false;

  setTimeout(() => {
    turtle.classList.add("show");
    sack.classList.add("full-glow");
    showEncouragement("Beach saved!");
  }, 350);

  setTimeout(() => {
    winMessage.style.display = "flex";
  }, 1500);
}

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
playAgainBtn.addEventListener("click", startGame);

updateProgress();
