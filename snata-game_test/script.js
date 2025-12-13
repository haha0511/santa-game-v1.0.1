/* ---------- Firebase ---------- */
const firebaseConfig = {
  apiKey: "AIzaSyCg2XAdcBkgD_fdAjENCxPSOAwhdVf-nNY",
  authDomain: "santa-game-test.firebaseapp.com",
  projectId: "santa-game-test",
  storageBucket: "santa-game-test.firebasestorage.app",
  messagingSenderId: "769873430252",
  appId: "1:769873430252:web:1f4de25357ea95b396c7c9"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* ---------- 요소 ---------- */
const game = document.getElementById("game");
const santa = document.getElementById("santa");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");

/* ---------- 게임 변수 ---------- */
const GAME_WIDTH = 360;
const GAME_HEIGHT = 640;

let santaX = GAME_WIDTH / 2 - 40;
let score = 0;
let time = 60;
let gameOver = false;

santa.style.left = santaX + "px";

/* ---------- 산타 이동 ---------- */
function moveSanta(dx) {
  santaX += dx;
  if (santaX < 0) santaX = 0;
  if (santaX > GAME_WIDTH - 80) santaX = GAME_WIDTH - 80;
  santa.style.left = santaX + "px";
}

document.addEventListener("keydown", e => {
  if (e.key === "a" || e.key === "ArrowLeft") moveSanta(-30);
  if (e.key === "d" || e.key === "ArrowRight") moveSanta(30);
});

document.getElementById("left").onclick = () => moveSanta(-40);
document.getElementById("right").onclick = () => moveSanta(40);

/* ---------- 아이템 생성 ---------- */
function spawnItem(type) {
  const item = document.createElement("img");
  item.src = type === "gift" ? "images/gift.png" : "images/bomb.png";
  item.className = "item";
  item.dataset.type = type;

  item.style.left = Math.random() * (GAME_WIDTH - 50) + "px";
  item.style.top = "-60px";
  game.appendChild(item);

  const fall = setInterval(() => {
    if (gameOver) {
      clearInterval(fall);
      item.remove();
      return;
    }

    let top = parseInt(item.style.top);
    top += 5;
    item.style.top = top + "px";

    const itemRect = item.getBoundingClientRect();
    const santaRect = santa.getBoundingClientRect();

    if (
      itemRect.bottom > santaRect.top &&
      itemRect.left < santaRect.right &&
      itemRect.right > santaRect.left
    ) {
      if (item.dataset.type === "gift") score += 10;
      else score -= 20;

      scoreEl.textContent = "점수: " + score;
      clearInterval(fall);
      item.remove();
    }

    if (top > GAME_HEIGHT) {
      clearInterval(fall);
      item.remove();
    }
  }, 30);
}

/* ---------- 반복 ---------- */
setInterval(() => !gameOver && spawnItem("gift"), 800);
setInterval(() => !gameOver && spawnItem("bomb"), 2000);

/* ---------- 타이머 ---------- */
const timer = setInterval(() => {
  if (gameOver) return;
  time--;
  timeEl.textContent = "남은 시간: " + time + "초";

  if (time <= 0) endGame();
}, 1000);

/* ---------- 종료 ---------- */
function endGame() {
  if (gameOver) return;
  gameOver = true;

  const name = prompt("게임 종료!\n이름을 입력하세요");

  if (name) {
    db.collection("scores").add({
      name,
      score,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  location.href = "hall.html";
}
