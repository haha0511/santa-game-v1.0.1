const game = document.getElementById("game");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");

// =====================
// 기본 상태
// =====================
let score = 0;
let timeLeft = 60;
let gameOver = false;

// 난이도
let fallSpeed = 4;
let spawnGiftTime = 1200;
let spawnBombTime = 2200;
let spawnCookieTime = 6000;

// =====================
// 산타
// =====================
const santa = document.createElement("img");
santa.src = "images/santa.png";
santa.style.width = "80px";
santa.style.bottom = "10px";
santa.style.left = "140px";
game.appendChild(santa);

let santaX = 140;
const moveSpeed = 10;

// =====================
// 이동
// =====================
document.addEventListener("keydown", (e) => {
  if (gameOver) return;

  if (e.key === "ArrowLeft" || e.key === "a") santaX -= moveSpeed;
  if (e.key === "ArrowRight" || e.key === "d") santaX += moveSpeed;

  santaX = Math.max(0, Math.min(game.clientWidth - 80, santaX));
  santa.style.left = santaX + "px";
});

game.addEventListener("touchstart", (e) => {
  if (gameOver) return;

  const rect = game.getBoundingClientRect();
  santaX = e.touches[0].clientX - rect.left - 40;
  santaX = Math.max(0, Math.min(game.clientWidth - 80, santaX));
  santa.style.left = santaX + "px";
});

// =====================
// ✨ 선물/쿠키 임팩트
// =====================
function showEffect(x, y, text) {
  const effect = document.createElement("div");
  effect.className = "effect";
  effect.style.left = x + "px";
  effect.style.top = y + "px";
  game.appendChild(effect);
  setTimeout(() => effect.remove(), 400);

  if (text) {
    const scoreText = document.createElement("div");
    scoreText.className = "score-text";
    scoreText.innerText = text;
    scoreText.style.left = x + "px";
    scoreText.style.top = y + "px";
    game.appendChild(scoreText);
    setTimeout(() => scoreText.remove(), 800);
  }
}

// =====================
// 💣 폭탄 임팩트
// =====================
function showBombEffect(x, y) {
  const boom = document.createElement("div");
  boom.className = "bomb-effect";
  boom.style.left = x + "px";
  boom.style.top = y + "px";
  game.appendChild(boom);
  setTimeout(() => boom.remove(), 400);

  // 화면 흔들림
  game.classList.add("shake");
  setTimeout(() => game.classList.remove("shake"), 200);
}

// =====================
// 아이템 생성
// =====================
function createItem(type) {
  const item = document.createElement("img");
  let scoreValue = 0;

  if (type === "gift") {
    item.src = "images/gift.png";
    scoreValue = 10;
  } else if (type === "bomb") {
    item.src = "images/bomb.png";
    scoreValue = -20;
  } else if (type === "cookie") {
    item.src = "images/cookie.png";
    scoreValue = 50;
  }

  item.style.width = "50px";
  item.style.top = "0px";
  item.style.left =
    Math.random() * (game.clientWidth - 50) + "px";

  game.appendChild(item);

  let y = 0;

  const fall = setInterval(() => {
    if (gameOver) {
      clearInterval(fall);
      item.remove();
      return;
    }

    y += fallSpeed;
    item.style.top = y + "px";

    const itemRect = item.getBoundingClientRect();
    const santaRect = santa.getBoundingClientRect();

    if (
      itemRect.bottom > santaRect.top &&
      itemRect.left < santaRect.right &&
      itemRect.right > santaRect.left
    ) {
      score += scoreValue;
      scoreEl.innerText = "점수: " + score;

      const x = item.offsetLeft + 20;
      const y = item.offsetTop;

      if (scoreValue > 0) {
        showEffect(x, y, "+" + scoreValue);
      } else {
        showBombEffect(x, y);
      }

      clearInterval(fall);
      item.remove();
    }

    if (y > game.clientHeight) {
      clearInterval(fall);
      item.remove();
    }
  }, 20);
}

// =====================
// 스폰 루프
// =====================
function spawnLoop(type) {
  let interval;

  function start() {
    interval = setInterval(() => {
      if (!gameOver) createItem(type);
    }, getTime());
  }

  function getTime() {
    if (type === "gift") return spawnGiftTime;
    if (type === "bomb") return spawnBombTime;
    return spawnCookieTime;
  }

  start();
  return () => {
    clearInterval(interval);
    start();
  };
}

let restartGift = spawnLoop("gift");
let restartBomb = spawnLoop("bomb");
let restartCookie = spawnLoop("cookie");

// =====================
// 난이도 상승
// =====================
const difficultyTimer = setInterval(() => {
  if (gameOver) return;

  fallSpeed += 0.5;
  spawnGiftTime = Math.max(400, spawnGiftTime - 150);
  spawnBombTime = Math.max(700, spawnBombTime - 200);
  spawnCookieTime = Math.max(3000, spawnCookieTime - 300);

  restartGift();
  restartBomb();
  restartCookie();
}, 10000);

// =====================
// 타이머
// =====================
const timer = setInterval(() => {
  if (gameOver) return;

  timeLeft--;
  timeEl.innerText = "남은 시간: " + timeLeft + "초";

  if (timeLeft <= 0) {
    gameOver = true;
    alert("게임 종료!\n점수: " + score);
    clearInterval(timer);
    clearInterval(difficultyTimer);
  }
}, 1000);
