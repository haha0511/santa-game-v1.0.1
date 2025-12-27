/* ===============================
   🎵 캐럴 BGM
================================ */
const bgm = document.getElementById("bgm");
let bgmStarted = false;

function startBGM() {
  if (bgmStarted) return;
  bgm.volume = 0.2;
  bgm.play().catch(() => {});
  bgmStarted = true;
}

document.addEventListener("keydown", startBGM, { once: true });
document.addEventListener("touchstart", startBGM, { once: true });
document.addEventListener("mousedown", startBGM, { once: true });

/* ===============================
   🎮 게임 로직
================================ */

const game = document.getElementById("game");
const santa = document.getElementById("santa");
const scoreText = document.getElementById("score");
const timeText = document.getElementById("time");
const gameOver = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");
const snowLayer = document.getElementById("snow");

let santaX = game.clientWidth / 2;
let score = 0;
let timeLeft = 60;
let speed = 6.5;
let doubleScore = false;
let isGameOver = false;

/* 시계 */
let clockSpawned = 0;
let extraClockUsed = false;
let gameStartTime = Date.now();

/* 이동 */
function moveSanta(dx) {
  if (isGameOver) return;
  santaX += dx;
  santaX = Math.max(0, Math.min(game.clientWidth - santa.offsetWidth, santaX));
  santa.style.left = santaX + "px";
}

document.addEventListener("keydown", e => {
  if (e.key === "a" || e.key === "ArrowLeft") moveSanta(-20);
  if (e.key === "d" || e.key === "ArrowRight") moveSanta(20);
});

document.getElementById("left").ontouchstart = () => moveSanta(-30000);
document.getElementById("right").ontouchstart = () => moveSanta(30000);

/* 히트박스 */
function isColliding(item) {
  const s = santa.getBoundingClientRect();
  const i = item.getBoundingClientRect();
  const p = 7;
  return !(s.right - p < i.left || s.left + p > i.right || s.bottom - p < i.top || s.top + p > i.bottom);
}

/* 임팩트 */
function impact(type) {
  santa.classList.remove("hit", "shake");
  santa.classList.add(type === "bomb" || type === "yami" ? "shake" : "hit");
  setTimeout(() => santa.classList.remove("hit", "shake"), 300);
}

/* 아이템 생성 */
function spawnItem(forceType = null) {
  if (isGameOver) return;

  const item = document.createElement("div");
  item.classList.add("item");

  let type;

  if (forceType) {
    type = forceType;
  } else {
    const r = Math.random();
    type = "gift";
    if (r < 0.1) type = "bomb";
    else if (r < 0.18) type = "cookie";
    else if (r < 0.22) type = "yami";
    else if (r < 0.25) type = "star"; 
    else if (r < 0.295) type = "star"; // ⭐ 확률 소폭 증가
  }

  item.classList.add(type);

  let x = Math.random() * (game.clientWidth - 40);
  let y = -40;
  item.style.left = x + "px";
  item.style.top = y + "px";

  game.appendChild(item);

  const fall = setInterval(() => {
    if (isGameOver) {
      item.remove();
      clearInterval(fall);
      return;
    }

    y += speed;
    item.style.top = y + "px";

    if (isColliding(item)) {
      applyEffect(type);
      impact(type);
      item.remove();
      clearInterval(fall);
    }

    if (y > game.clientHeight) {
      item.remove();
      clearInterval(fall);
    }
  }, 16);
}

/* 효과 */
function applyEffect(type) {
  let value = 0;

  if (type === "gift") value = 10;
  if (type === "cookie") value = 50;
  if (type === "bomb") value = -30;
  if (type === "yami") value = -60;

  if (doubleScore) value *= 2;
  score += value;

  if (type === "time") {
    timeLeft += 15;

    if (!extraClockUsed && Math.random() < 0.5) {
      extraClockUsed = true;
      setTimeout(() => spawnItem("time"), Math.random() * 75000);
    }
  }

  if (type === "star") {
    doubleScore = true;
    setTimeout(() => doubleScore = false, 5000);
  }

  scoreText.textContent = score;
}

/* 타이머 */
setInterval(() => {
  if (isGameOver) return;

  timeLeft--;
  timeText.textContent = timeLeft;

  if (timeLeft <= 0) {
    isGameOver = true;
    gameOver.style.display = "flex";
    finalScore.textContent = score;
  }

  if (timeLeft % 15 === 0) speed += 0.5;
}, 1000);

/* 시계 고정 스폰 */
const clockSchedule = [10, 25, 40, 55];

setInterval(() => {
  if (isGameOver) return;

  const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
  if (clockSpawned < 4 && elapsed >= clockSchedule[clockSpawned]) {
    spawnItem("time");
    clockSpawned++;
  }
}, 500);

/* 눈 */
function createSnow() {
  if (isGameOver) return;

  const snow = document.createElement("div");
  snow.className = "snowflake";
  const size = Math.random() * 4 + 2;
  snow.style.width = size + "px";
  snow.style.height = size + "px";
  snow.style.left = Math.random() * 100 + "%";
  const duration = Math.random() * 3 + 4;
  snow.style.animationDuration = duration + "s";

  snowLayer.appendChild(snow);
  setTimeout(() => snow.remove(), duration * 1000);
}

setInterval(createSnow, 200);
setInterval(() => spawnItem(), 800);

