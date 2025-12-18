/* ===============================
   🎵 캐럴 BGM (기존 로직 절대 미변경)
================================ */

const bgm = document.getElementById("bgm");
let bgmStarted = false;

function startBGM() {
  if (bgmStarted) return;
  bgm.volume = 0.35; // 귀 안 아프게
  bgm.play().catch(() => {});
  bgmStarted = true;
}

/* 최초 입력 시 BGM 시작 */
document.addEventListener("keydown", startBGM, { once: true });
document.addEventListener("touchstart", startBGM, { once: true });
document.addEventListener("mousedown", startBGM, { once: true });

/* ===============================
   ⬇⬇⬇ 기존 게임 코드 (그대로)
   ※ 아래는 너가 쓰던 코드와 동일
================================ */

// ↓↓↓ 여기부터는 네 기존 script.js 전체 그대로 ↓↓↓
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
let speed = 2;
let doubleScore = false;
let isGameOver = false;

/* ===== 시계 관련 변수 ===== */
let clockSpawned = 0;          // 이미 나온 시계 수
let extraClockUsed = false;   // 추가 시계 사용 여부
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

document.getElementById("left").ontouchstart = () => moveSanta(-25);
document.getElementById("right").ontouchstart = () => moveSanta(25);

/* 히트박스 */
function isColliding(item) {
  const s = santa.getBoundingClientRect();
  const i = item.getBoundingClientRect();
  const p = 6;
  return !(s.right - p < i.left || s.left + p > i.right || s.bottom - p < i.top || s.top + p > i.bottom);
}

/* 임팩트 */
function impact(type) {
  santa.classList.remove("hit", "shake");
  santa.classList.add(type === "bomb" || type === "yami" ? "shake" : "hit");
  setTimeout(() => santa.classList.remove("hit", "shake"), 300);
}

/* ===== 아이템 생성 ===== */
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
    else if (r < 0.3) type = "star";
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

/* ===== 효과 ===== */
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

    /* ⭐ 시계 먹었을 때 50% 확률 추가 시계 */
    if (!extraClockUsed && Math.random() < 0.5) {
      extraClockUsed = true;
      setTimeout(() => {
        spawnItem("time");
      }, Math.random() * 75000); // 1분 15초 안 랜덤
    }
  }

  if (type === "star") {
    doubleScore = true;
    setTimeout(() => doubleScore = false, 5000);
  }

  scoreText.textContent = score;
}

/* ===== 타이머 ===== */
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

/* ===== 시계 강제 스폰 시스템 ===== */
const clockSchedule = [10, 25, 40, 55]; // 1분 안에 무조건 4개

setInterval(() => {
  if (isGameOver) return;

  const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);

  if (clockSpawned < 4 && elapsed >= clockSchedule[clockSpawned]) {
    spawnItem("time");
    clockSpawned++;
  }
}, 500);

/* ===== 눈 ===== */
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
