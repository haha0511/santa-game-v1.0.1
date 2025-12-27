const game = document.getElementById("game");
const santa = document.getElementById("santa");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const bgm = document.getElementById("bgm");

let santaX = window.innerWidth / 2 - 35;
let santaSpeed = 14;
let score = 0;
let time = 60;
let gameRunning = true;
let doubleScore = false;

/* 눈 생성 */
setInterval(() => {
  const snow = document.createElement("div");
  snow.className = "snow";
  snow.textContent = "❄";
  snow.style.left = Math.random() * window.innerWidth + "px";
  snow.style.animationDuration = 3 + Math.random() * 5 + "s";
  snow.style.fontSize = 8 + Math.random() * 8 + "px";
  game.appendChild(snow);
  setTimeout(() => snow.remove(), 8000);
}, 150);

/* 산타 이동 */
function moveSanta(dir) {
  santaX += dir * santaSpeed;
  santaX = Math.max(0, Math.min(window.innerWidth - 70, santaX));
  santa.style.left = santaX + "px";
}

document.getElementById("leftBtn").ontouchstart = () => moveSanta(-1);
document.getElementById("rightBtn").ontouchstart = () => moveSanta(1);

/* 이펙트 */
function effect(x, y, text, color) {
  const e = document.createElement("div");
  e.className = "effect";
  e.textContent = text;
  e.style.left = x + "px";
  e.style.top = y + "px";
  e.style.color = color;
  game.appendChild(e);
  setTimeout(() => e.remove(), 400);
}

/* 아이템 생성 */
function createItem(type) {
  if (!gameRunning) return;

  const img = document.createElement("img");
  img.className = "item";
  img.src = `${type}.png`;
  img.dataset.type = type;
  img.style.left = Math.random() * (window.innerWidth - 45) + "px";
  img.style.top = "-50px";
  game.appendChild(img);

  let speed = 6;

  const fall = setInterval(() => {
    if (!gameRunning) {
      clearInterval(fall);
      img.remove();
      return;
    }

    img.style.top = img.offsetTop + speed + "px";

    const s = santa.getBoundingClientRect();
    const i = img.getBoundingClientRect();

    if (
      i.bottom > s.top &&
      i.left < s.right &&
      i.right > s.left
    ) {
      handleItem(type, img);
      clearInterval(fall);
      img.remove();
    }

    if (img.offsetTop > window.innerHeight) {
      clearInterval(fall);
      img.remove();
    }
  }, 16);
}

/* 아이템 효과 */
function handleItem(type, img) {
  const x = img.offsetLeft;
  const y = img.offsetTop;

  if (type === "gift") score += doubleScore ? 20 : 10;
  if (type === "cookie") score += doubleScore ? 100 : 50;
  if (type === "bomb") score -= doubleScore ? 40 : 20;
  if (type === "yami") score -= doubleScore ? 120 : 60;

  if (type === "star") {
    doubleScore = true;
    setTimeout(() => doubleScore = false, 5000);
    effect(x, y, "x2", "yellow");
  }

  if (type === "clock") {
    time += 15;
    effect(x, y, "+15s", "#00eaff");
    if (Math.random() < 0.5) {
      setTimeout(() => createItem("clock"), 75000);
    }
  }

  scoreEl.textContent = score;
}

/* 아이템 스폰 */
setInterval(() => {
  if (!gameRunning) return;
  createItem("gift");
  if (Math.random() < 0.35) createItem("bomb");
  if (Math.random() < 0.2) createItem("cookie");
  if (Math.random() < 0.1) createItem("yami");
  if (Math.random() < 0.1) createItem("star");
}, 650);

/* 시계 고정 스폰 */
[5, 20, 35, 50].forEach(t => {
  setTimeout(() => createItem("clock"), t * 1000);
});

/* 타이머 */
bgm.volume = 0.4;
bgm.play();

setInterval(() => {
  if (!gameRunning) return;
  time--;
  timeEl.textContent = time;

  if (time <= 0) {
    gameRunning = false;
    document.getElementById("gameOver").style.display = "flex";
    document.getElementById("finalScore").textContent = `최종 점수: ${score}`;
    bgm.pause();
  }
}, 1000);
