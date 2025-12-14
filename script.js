const game = document.getElementById("game");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");

// =====================
// 기본 상태
// =====================
let score = 0;
let timeLeft = 60;
let gameOver = false;

// =====================
// 산타 생성
// =====================
const santa = document.createElement("img");
santa.src = "images/santa.png";
santa.style.width = "80px";
santa.style.bottom = "10px";
santa.style.left = "140px"; // 가운데
game.appendChild(santa);

let santaX = 140;
const speed = 10;

// =====================
// 산타 이동 (키보드)
// =====================
document.addEventListener("keydown", (e) => {
  if (gameOver) return;

  if (e.key === "ArrowLeft" || e.key === "a") {
    santaX -= speed;
  }

  if (e.key === "ArrowRight" || e.key === "d") {
    santaX += speed;
  }

  santaX = Math.max(0, Math.min(game.clientWidth - 80, santaX));
  santa.style.left = santaX + "px";
});

// =====================
// 모바일 터치 이동
// =====================
game.addEventListener("touchstart", (e) => {
  if (gameOver) return;

  const rect = game.getBoundingClientRect();
  const touchX = e.touches[0].clientX - rect.left;

  santaX = touchX - 40;
  santaX = Math.max(0, Math.min(game.clientWidth - 80, santaX));
  santa.style.left = santaX + "px";
});

// =====================
// 아이템 생성
// =====================
function createItem(type) {
  const item = document.createElement("img");

  if (type === "gift") {
    item.src = "images/gift.png";
    item.dataset.type = "gift";
  } else {
    item.src = "images/bomb.png";
    item.dataset.type = "bomb";
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

    y += 5;
    item.style.top = y + "px";

    const itemRect = item.getBoundingClientRect();
    const santaRect = santa.getBoundingClientRect();

    // 충돌 판정
    if (
      itemRect.bottom > santaRect.top &&
      itemRect.left < santaRect.right &&
      itemRect.right > santaRect.left
    ) {
      if (item.dataset.type === "gift") {
        score += 10;
      } else {
        score -= 20;
      }

      scoreEl.innerText = "점수: " + score;
      clearInterval(fall);
      item.remove();
    }

    // 바닥 도달
    if (y > game.clientHeight) {
      clearInterval(fall);
      item.remove();
    }
  }, 20);
}

// =====================
// 아이템 주기
// =====================
setInterval(() => {
  if (!gameOver) createItem("gift");
}, 1000);

setInterval(() => {
  if (!gameOver) createItem("bomb");
}, 2000);

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
  }
}, 1000);
