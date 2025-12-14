const game = document.getElementById("game");
const santa = document.getElementById("santa");
const scoreText = document.getElementById("score");
const timeText = document.getElementById("time");
const gameOver = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");

let santaX = game.clientWidth / 2;
let score = 0;
let timeLeft = 60;
let speed = 2;
let doubleScore = false;
let timeItemCount = 0;
let isGameOver = false;

const MAX_TIME_ITEM = 4;

/* 이동 */
function moveSanta(dx) {
  if (isGameOver) return;
  santaX += dx;
  santaX = Math.max(0, Math.min(game.clientWidth - 60, santaX));
  santa.style.left = santaX + "px";
}

/* 키보드 */
document.addEventListener("keydown", e => {
  if (e.key === "a" || e.key === "ArrowLeft") moveSanta(-20);
  if (e.key === "d" || e.key === "ArrowRight") moveSanta(20);
});

/* 모바일 버튼 */
document.getElementById("left").ontouchstart = () => moveSanta(-25);
document.getElementById("right").ontouchstart = () => moveSanta(25);

/* 임팩트 */
function impact(type) {
  santa.classList.remove("hit", "shake");
  santa.classList.add(type === "bomb" || type === "yami" ? "shake" : "hit");
  setTimeout(() => santa.classList.remove("hit", "shake"), 300);
}

/* 아이템 생성 */
function spawnItem() {
  if (isGameOver) return;

  const item = document.createElement("div");
  item.classList.add("item");

  const r = Math.random();
  let type = "gift";
  if (r < 0.1) type = "bomb";
  else if (r < 0.18) type = "cookie";
  else if (r < 0.22) type = "yami";
  else if (r < 0.25 && timeItemCount < MAX_TIME_ITEM) type = "time";
  else if (r < 0.28) type = "star";

  item.classList.add(type);
  item.dataset.type = type;

  let x = Math.random() * (game.clientWidth - 40);
  let y = -40;

  item.style.left = x + "px";
  item.style.top = y + "px";
  game.appendChild(item);

  const fall = setInterval(() => {
    if (isGameOver) {
      clearInterval(fall);
      item.remove();
      return;
    }

    y += speed;
    item.style.top = y + "px";

    if (y > game.clientHeight - 110 && Math.abs(x - santaX) < 40) {
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

/* 효과 적용 */
function applyEffect(type) {
  let value = 0;

  if (type === "gift") value = 10;
  if (type === "cookie") value = 50;
  if (type === "bomb") value = -30;
  if (type === "yami") value = -60;

  if (doubleScore) value *= 2;
  score += value;

  if (type === "time") {
    timeLeft += 10;
    timeItemCount++;
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

/* 아이템 생성 주기 */
setInterval(spawnItem, 800);
