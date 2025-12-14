import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* 🔥 Firebase 설정 */
const firebaseConfig = {
  apiKey: "AIzaSyCg2XAdcBkgD_fdAjENCxPSOAwhdVf-nNY",
  authDomain: "santa-game-test.firebaseapp.com",
  projectId: "santa-game-test",
  storageBucket: "santa-game-test.firebasestorage.app",
  messagingSenderId: "769873430252",
  appId: "1:769873430252:web:1f4de25357ea95b396c7c9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* 🎮 캔버스 */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/* 🖼 이미지 */
const santaImg = new Image();
santaImg.src = "images/santa.png";

const giftImg = new Image();
giftImg.src = "images/gift.png";

const bombImg = new Image();
bombImg.src = "images/bomb.png";

/* 🎅 산타 */
let santa = { x: 160, y: 560, w: 50, h: 60 };

/* 🎁 오브젝트 */
let items = [];
let score = 0;
let timeLeft = 60;
let gameOver = false;

/* ⌨️ 키보드 */
let left = false, right = false;

document.addEventListener("keydown", e => {
  if (e.key === "a" || e.key === "ArrowLeft") left = true;
  if (e.key === "d" || e.key === "ArrowRight") right = true;
});
document.addEventListener("keyup", e => {
  if (e.key === "a" || e.key === "ArrowLeft") left = false;
  if (e.key === "d" || e.key === "ArrowRight") right = false;
});

/* 📱 모바일 터치 */
canvas.addEventListener("touchstart", e => {
  const x = e.touches[0].clientX;
  if (x < window.innerWidth / 2) left = true;
  else right = true;
});
canvas.addEventListener("touchend", () => {
  left = right = false;
});

/* 🎁 생성 */
setInterval(() => {
  if (gameOver) return;
  items.push({
    x: Math.random() * 320,
    y: -40,
    type: Math.random() < 0.8 ? "gift" : "bomb"
  });
}, 800);

/* ⏱ 타이머 */
const timer = setInterval(() => {
  timeLeft--;
  document.getElementById("time").textContent = timeLeft;
  if (timeLeft <= 0) endGame();
}, 1000);

/* 🔚 게임 종료 */
async function endGame() {
  if (gameOver) return;
  gameOver = true;
  clearInterval(timer);

  const name = prompt("이름을 입력하세요");
  if (name) {
    await addDoc(collection(db, "scores"), {
      name,
      score,
      created: Date.now()
    });
  }
  location.href = "hall.html";
}

/* 🔁 게임 루프 */
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (left) santa.x -= 5;
  if (right) santa.x += 5;
  santa.x = Math.max(0, Math.min(310, santa.x));

  ctx.drawImage(santaImg, santa.x, santa.y, santa.w, santa.h);

  items.forEach((it, i) => {
    it.y += 4;

    const hit =
      it.x < santa.x + santa.w &&
      it.x + 40 > santa.x &&
      it.y < santa.y + santa.h &&
      it.y + 40 > santa.y;

    if (hit) {
      if (it.type === "gift") score += 10;
      else score -= 20;
      items.splice(i, 1);
    }

    const img = it.type === "gift" ? giftImg : bombImg;
    ctx.drawImage(img, it.x, it.y, 40, 40);
  });

  document.getElementById("score").textContent = score;

  requestAnimationFrame(loop);
}

loop();
