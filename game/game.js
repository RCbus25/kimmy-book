const gameArea = document.getElementById("gameArea");
const scoreEl = document.getElementById("score");
const totalEl = document.getElementById("total");
const message = document.getElementById("message");
const winMessage = document.getElementById("winMessage");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const sack = document.getElementById("sack");
const turtle = document.getElementById("turtle");

const litterImages = [
  "images/bottle.png",
  "images/can.png",
  "images/wrapper.png"
];

const totalLitter = 10;
let score = 0;

const positions = [
  [44, 72], [55, 66], [67, 75], [76, 62], [86, 72],
  [38, 58], [50, 48], [64, 54], [73, 44], [84, 50]
];

function startGame() {
  score = 0;
  scoreEl.textContent = score;
  totalEl.textContent = totalLitter;
  message.style.display = "none";
  winMessage.style.display = "none";
  turtle.classList.remove("show");
  sack.classList.remove("glow");

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
  item.style.transform = `rotate(${Math.floor(Math.random() * 50) - 25}deg)`;

  item.addEventListener("click", () => collectLitter(item));
  item.addEventListener("touchstart", () => collectLitter(item), { once: true });

  gameArea.appendChild(item);
}

function collectLitter(item) {
  if (item.classList.contains("collected")) return;

  item.classList.add("collected");

  const rect = item.getBoundingClientRect();
  const gameRect = gameArea.getBoundingClientRect();

  showSparkle(rect.left - gameRect.left, rect.top - gameRect.top);

  item.style.opacity = "0";
  item.style.transform = "scale(0.1) rotate(360deg)";

  setTimeout(() => item.remove(), 250);

  score++;
  scoreEl.textContent = score;

  sack.classList.add("glow");
  setTimeout(() => sack.classList.remove("glow"), 350);

  if (score >= totalLitter) {
    finishGame();
  }
}

function showSparkle(x, y) {
  const sparkle = document.createElement("div");
  sparkle.className = "sparkle";
  sparkle.textContent = "✨";
  sparkle.style.left = `${x}px`;
  sparkle.style.top = `${y}px`;

  gameArea.appendChild(sparkle);

  setTimeout(() => sparkle.remove(), 600);
}

function finishGame() {
  setTimeout(() => {
    turtle.classList.add("show");
    sack.classList.add("glow");
  }, 350);

  setTimeout(() => {
    winMessage.style.display = "flex";
  }, 1200);
}

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
playAgainBtn.addEventListener("click", startGame);

totalEl.textContent = totalLitter;
