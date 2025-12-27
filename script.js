/* ===============================
   🎵 캐럴 BGM
================================ */
const bgm = document.getElementById("bgm");
let bgmStarted = false;

function startBGM() {
  if (bgmStarted) return;
  bgm.volume = 0.35;
  bgm.play().catch(() => {});
  bgmStarted = true;
}

document.addEventListener("keydown", startBGM, { once: true });
document.addEventListener("touchstart", startBGM, { once: true });
document.addEventListener("mousedown", startBGM, { once: true });

/* ===============================
   🎮 기본 요소
================================ */
const game = document.getElementById("game");
const santa = document.getElementById("santa");
const scoreText = document.getElementById("score");
const timeText = document.getElementById("time");
const gameOver = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");
const snowLayer = document.getElementById("snow");

/* ===============================
   🏃 산타 이동 (렉 제거 버전)
================================ */
let santaX = game.clientWidth / 2;
let santaDir = 0; // -1 왼쪽 / 1 오른쪽
const SANTA_SPEED = 600; // px per second

function updateSanta(dt) {
  santaX += santaDir * SANTA_SPEED * dt;
  santaX = Math.max(0, Math.min(game.clientWidth - santa.offsetWidth, santaX));
  santa.style.left = santaX + "px";
}

/* PC 키 입력 */
document.addEventListener("keydown", e => {
  if (e.key === "a" || e.key === "ArrowLeft") santaDir = -1;
  if (e.key === "d" || e.key === "ArrowRight") santaDir = 1;
});
document.addEventListener("keyup", e => {
  if (
    e.key === "a" ||
    e.key === "ArrowLeft" ||
    e.key === "d" ||
    e.key === "ArrowRight"
  ) santaDir = 0;
});

/* 모바일 버튼 */
document.getElementById("left").ontouchstart = () => santaDir = -1;
document.getElementById("right").ontouchstart = () => santaDir = 1;
document.getElementById("left").ontouchend = () => santaDir = 0;
document.getElementById("right").ontouchend = () => santaDir = 0;

/* ===============================
   🎯 히트박스 (유지)
================================ */
function isColliding(item) {
  const s = santa.getBoundingClientRect();
  const i = item.getBoundingClientRect();
  const p = 6;
  return !(
    s.right - p < i.left ||
    s.left + p > i.right ||
    s.bottom - p < i.top ||
    s.top + p > i.bottom
  );
}

/* ===============================
   🎁 아이템
================================ */
let speed = 5;
let score = 0;
let timeLeft = 60;
let doubleScore = false;
let isGameOver = false;

function impact(type) {
  santa.classList.remove("hit", "shake");
  santa.classList.add(type === "bomb" || type === "yami" ? "shake" : "hit");
  setTimeout(() => santa.classList.remove("hit", "shake"), 300);
}

function spawnItem(forceType = null) {
  if (isGameOver) return;

  const item = document.createElement("div");
  item.classList.add("item");

  let type;
  if (forceType) type = forceType;
  else {
    const r = Math.random();
    if (r < 0.1) type = "bomb";
    else if (r < 0.18) type = "cookie";
    else if (r < 0.22) type = "yami";
    else if (r < 0.295) type = "star";
    else type = "gift";
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

function applyEffect(type) {
  let value = 0;
  if (type === "gift") value = 10;
  if (type === "cookie") value = 50;
  if (type === "bomb") value = -30;
  if (type === "yami") value = -60;

  if (doubleScore) value *= 2;
  score += value;

  if (type === "star") {
    doubleScore = true;
    setTimeout(() => doubleScore = false, 5000);
  }

  scoreText.textContent = score;
}

/* ===============================
   ⏱ 타이머
================================ */
setInterval(() => {
  if (isGameOver) return;

  timeLeft--;
  timeText.textContent = timeLeft;

  if (timeLeft <= 0) {
    isGameOver = true;
    gameOver.style.display = "flex";
    finalScore.textContent = score;
  }

  if (timeLeft % 10 === 0) speed += 1.5;
}, 1000);

/* ===============================
   ❄ 눈
================================ */
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
setInterval(() => spawnItem(), 650);

/* ===============================
   🔄 메인 루프 (렉 제거 핵심)
================================ */
let last = performance.now();
function loop(now) {
  const dt = (now - last) / 1000;
  last = now;

  if (!isGameOver) updateSanta(dt);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
