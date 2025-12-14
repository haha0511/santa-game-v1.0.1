const game = document.getElementById("game");
const santa = document.getElementById("santa");
const scoreText = document.getElementById("score");
const timeText = document.getElementById("time");
const flash = document.getElementById("flash");

let santaX = 150;
let score = 0;
let timeLeft = 60;
let gameOver = false;

let speed = 2;
let doubleScore = false;
let doubleTimer = null;

let timeItemCount = 0;
const MAX_TIME_ITEM = 4;

/* 산타 이동 */
function moveSanta(dx) {
  santaX += dx;
  santaX = Math.max(0, Math.min(300, santaX));
  santa.style.left = santaX + "px";
}

document.addEventListener("keydown", e => {
  if (e.key === "a" || e.key === "ArrowLeft") moveSanta(-20);
  if (e.key === "d" || e.key === "ArrowRight") moveSanta(20);
});

game.addEventListener("touchstart", e => {
  const x = e.touches[0].clientX;
  moveSanta(x < window.innerWidth / 2 ? -30 : 30);
});

/* 아이템 생성 */
function createItem(type) {
  const item = document.createElement("div");
  item.className = "item " + type;
  item.style.left = Math.random() * 300 + "px";
  item.style.top = "-40px";
  game.appendChild(item);

  let y = -40;

  const fall = setInterval(() => {
    if (gameOver) {
      clearInterval(fall);
      item.remove();
      return;
    }

    y += speed;
    item.style.top = y + "px";

    if (y > 340 && Math.abs(parseInt(item.style.left) - santaX) < 40) {
      applyEffect(type);
      impact(item.style.left, y);
      clearInterval(fall);
      item.remove();
    }

    if (y > 400) {
      clearInterval(fall);
      item.remove();
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

  if (type === "time" && timeItemCount < MAX_TIME_ITEM) {
    timeLeft += 10;
    timeItemCount++;
  }

  if (type === "star") startDoubleScore();

  scoreText.innerText = score;
}

/* 별 이벤트 */
function startDoubleScore() {
  doubleScore = true;
  flash.classList.add("flash-on");

  if (doubleTimer) clearTimeout(doubleTimer);

  doubleTimer = setTimeout(() => {
    doubleScore = false;
    flash.classList.remove("flash-on");
  }, 5000);
}

/* 확률 */
function spawnItem() {
  const r = Math.random();

  if (r < 0.45) createItem("gift");
  else if (r < 0.63) createItem("bomb");
  else if (r < 0.72) createItem("yami");
  else if (r < 0.82) createItem("cookie");
  else if (r < 0.90 && timeItemCount < MAX_TIME_ITEM) createItem("time");
  else if (r < 0.96) createItem("star");
}

/* 임팩트 */
function impact(x, y) {
  const fx = document.createElement("div");
  fx.className = "impact";
  fx.style.left = x;
  fx.style.top = y + "px";
  game.appendChild(fx);
  setTimeout(() => fx.remove(), 300);
}

/* 타이머 */
setInterval(() => {
  if (gameOver) return;
  timeLeft--;
  timeText.innerText = timeLeft;

  if (timeLeft <= 0) {
    gameOver = true;
    alert("게임 종료!\n점수: " + score);
    location.href = "hall.html";
  }
}, 1000);

/* 난이도 증가 */
setInterval(() => {
  if (speed < 6) speed += 0.3;
}, 8000);

/* 아이템 반복 */
setInterval(() => {
  if (!gameOver) spawnItem();
}, 700);
