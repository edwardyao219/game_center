<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from 'vue-router';
const router = useRouter();
// 游戏状态
const grid = ref(Array(100).fill(0));
const selectedIndex = ref(null);
const score = ref(0);
const moves = ref(0);
const maxMoves = ref(999);
const gameOver = ref(false);
const showMessage = ref(false);
const hearts = ref([]);
const currentMessageIndex = ref(0);
const mergingCells = ref([]);
const showWinAnimation = ref(false);

// 浪漫情话
const loveMessages = ref([
  "肉肉，你是我生命中最美的遇见，每一天都因你而甜蜜！",
  "与你在一起的每一刻，都是我生命中最珍贵的礼物。",
  "你的笑容是我每天起床的动力，你的温柔是我最温暖的港湾。",
  "感谢你走进我的生命，让我的世界充满色彩和幸福。",
  "无论合成多少钻戒，都比不上你在我心中的珍贵！",
  "执子之手，与子偕老。爱你是我做过最正确的决定！",
]);

// 初始化游戏
const initGame = () => {
  grid.value = Array(100).fill(0);
  selectedIndex.value = null;
  score.value = 0;
  moves.value = 0;
  gameOver.value = false;
  showWinAnimation.value = false;

  // 初始放置一些物品
  for (let i = 0; i < 10; i++) {
    addRandomItem();
  }
};

const getItemImage = (item) => {
  return new URL(`../assets/item-${item}.jpg`, import.meta.url).href;
};

// 添加随机物品
const addRandomItem = () => {
  const emptyCells = grid.value
    .map((val, index) => (val === 0 ? index : -1))
    .filter((index) => index !== -1);

  if (emptyCells.length > 0) {
    const randomIndex =
      emptyCells[Math.floor(Math.random() * emptyCells.length)];
    // 初始只生成1级物品（糖果）
    grid.value[randomIndex] = 1;
  }
};

// 选择格子 - 修复了重复点击同一个物品的问题
const selectCell = (index) => {
  if (gameOver.value) return;

  // 如果点击的是空白格子
  if (grid.value[index] === 0) {
    selectedIndex.value = null;
    return;
  }

  // 如果点击的是同一个格子 - 修复点
  if (selectedIndex.value === index) {
    // 添加一点动画效果，让用户知道物品被选中
    const cell = document.querySelectorAll(".grid-cell")[index];
    cell.classList.add("selected");
    setTimeout(() => {
      cell.classList.remove("selected");
      selectedIndex.value = null;
    }, 300);
    return;
  }

  // 如果之前没有选中任何格子
  if (selectedIndex.value === null) {
    selectedIndex.value = index;
    return;
  }

  // 检查两个格子是否相邻
  const isAdjacent = checkAdjacent(selectedIndex.value, index);

  // 检查两个格子内容是否相同
  const firstValue = grid.value[selectedIndex.value];
  const secondValue = grid.value[index];

  // 💡 这里加上 shake 判断
  if (firstValue !== secondValue || !isAdjacent) {
    playShakeAnimation(index); // 添加 shake 动画
    selectedIndex.value = index;
    return;
  }

  // 执行合成
  mergeItems(selectedIndex.value, index, firstValue);

  // 重置选择
  selectedIndex.value = null;
};

const playShakeAnimation = (index) => {
  const cell = document.querySelectorAll(".grid-cell")[index];
  if (cell) {
    cell.classList.add("shake");
    setTimeout(() => {
      cell.classList.remove("shake");
    }, 500); // 和 CSS 动画时长一致
  }
};

// 检查两个格子是否相邻
const checkAdjacent = (index1, index2) => {
  const row1 = Math.floor(index1 / 10);
  const col1 = index1 % 10;
  const row2 = Math.floor(index2 / 10);
  const col2 = index2 % 10;

  // 检查是否在同一行且列相邻
  if (row1 === row2 && Math.abs(col1 - col2) === 1) {
    return true;
  }

  // 检查是否在同一列且行相邻
  if (col1 === col2 && Math.abs(row1 - row2) === 1) {
    return true;
  }

  return false;
};

// 合并物品
const mergeItems = (index1, index2, value) => {
  // 增加步数
  moves.value++;

  // 计算分数
  score.value += value * 10;

  // 标记正在合并的单元格
  mergingCells.value = [index1, index2];

  // 清空第一个格子
  grid.value[index1] = 0;

  // 在第二个格子生成新物品（升级）
  const newValue = value + 1;

  // 添加合并动画效果
  setTimeout(() => {
    grid.value[index2] = newValue;
    mergingCells.value = [];

    // 添加随机物品
    addRandomItem();

    // 检查是否合成钻戒（最高级）
    if (newValue === 7) {
      showWinAnimation.value = true;
      setTimeout(() => {
        showLoveMessage();
        createHearts(30);
      }, 1500);
    }

    // 检查步数是否用完
    if (moves.value >= maxMoves.value) {
      gameOver.value = true;
      setTimeout(() => {
        showMessage.value = true;
        currentMessageIndex.value = 4; // 显示特定消息
      }, 500);
    }
  }, 300);
};

// 重置游戏
const resetGame = () => {
  initGame();
};

// 显示爱的告白
const showLoveMessage = () => {
  currentMessageIndex.value = Math.floor(
    Math.random() * loveMessages.value.length
  );
  showMessage.value = true;
  createHearts(20);
};

// 创建漂浮爱心
const createHearts = (count) => {
  const newHearts = [];
  for (let i = 0; i < count; i++) {
    newHearts.push({
      style: {
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        fontSize: `${Math.random() * 2 + 1}rem`,
      },
    });
  }
  hearts.value = newHearts;

  // 5秒后清除爱心
  setTimeout(() => {
    hearts.value = [];
  }, 5000);
};

// 初始化游戏
onMounted(initGame);
</script>

<template>
  <div id="app">
    <div class="game-container">
      <button class="back-btn" @click="router.push('/')">返回</button>
      <div class="game-header">
        <h1 class="game-title">大小个合成</h1>
      </div>

      <div class="game-info">
        <div class="info-item">
          <div class="info-label">分数</div>
          <div class="info-value">{{ score }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">目标</div>
          <div class="info-value">究极大小个</div>
        </div>
        <div class="info-item">
          <div class="info-label">步数</div>
          <div class="info-value">{{ moves }}/{{ maxMoves }}</div>
        </div>
      </div>

      <div class="grid-container">
        <div
          v-for="(cell, index) in grid"
          :key="index"
          class="grid-cell"
          :class="{
            selected: selectedIndex === index,
            'merge-animation': mergingCells.includes(index),
          }"
          @click="selectCell(index)"
        >
          <div v-if="cell > 0" class="item-content">
            <img
              :src="getItemImage(cell)"
              :alt="'物品' + cell"
              class="item-image"
            />
          </div>
        </div>
      </div>

      <div class="win-message" :class="{ show: showWinAnimation }">
        肉肉大人太棒了！❤️
      </div>

      <div class="controls">
        <button class="btn" @click="resetGame">重新开始</button>
        <button class="btn" @click="addRandomItem">添加大小个</button>
      </div>

      <div class="instructions">
        <h3>游戏说明</h3>
        <ul>
          <li>点击两个相邻的相同大小个，它们会合成更高级的大小个</li>
          <li>合成究极拉屎小个即可获胜！</li>
          <li>每合成一次获得分数，步数有限</li>
        </ul>
      </div>
      <div class="routes">
        <img v-for="i in 7" :key="i" :src="getItemImage(i)" alt="大小个" />
      </div>

      <div class="hearts">
        <div
          v-for="(heart, index) in hearts"
          :key="index"
          class="heart"
          :style="heart.style"
        >
          ❤️
        </div>
      </div>
    </div>

    <div class="message-container" :class="{ show: showMessage }">
      <div class="message-box">
        <h2 class="message-title">给最爱的肉肉</h2>
        <p class="message-content">
          {{ loveMessages[currentMessageIndex] }}
        </p>
        <button class="btn" @click="showMessage = false">❤️ 爱你 ❤️</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  user-select: none;
}

body {
  font-family: "Arial Rounded MT Bold", "Arial", sans-serif;
  background: linear-gradient(135deg, #ffafbd, #ffc3a0);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  overflow: hidden;
}

.back-btn {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #ff6b9d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  z-index: 10;
}

.game-container {
  width: 100%;
  max-width: 800px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(255, 105, 180, 0.3);
  padding: 25px;
  position: relative;
  overflow: hidden;
}

.game-header {
  text-align: center;
  margin-bottom: 20px;
  position: relative;
}

.game-title {
  color: #ff6b9d;
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.subtitle {
  color: #ff8eb4;
  font-size: 1.2rem;
  margin-bottom: 15px;
}

.game-info {
  display: flex;
  justify-content: space-around;
  background: #fff5f8;
  padding: 15px;
  border-radius: 15px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.info-item {
  text-align: center;
}

.info-label {
  color: #ff6b9d;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.info-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #e84393;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 5px;
  margin: 0 auto;
  background: #ffebf2;
  padding: 10px;
  border-radius: 15px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
}

.grid-cell {
  aspect-ratio: 1;
  background: #fff;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.grid-cell:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.grid-cell.selected {
  box-shadow: 0 0 0 4px #ff6b9d;
  transform: scale(1.1);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 107, 157, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 107, 157, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 107, 157, 0);
  }
}

.item-image {
  width: 80%;
  height: 80%;
  object-fit: contain;
}

.item-1 {
  color: #ff9ff3;
} /* 糖果 */
.item-2 {
  color: #feca57;
} /* 巧克力 */
.item-3 {
  color: #ff6b6b;
} /* 玫瑰 */
.item-4 {
  color: #48dbfb;
} /* 香水 */
.item-5 {
  color: #1dd1a1;
} /* 包包 */
.item-6 {
  color: #ff9ff3;
} /* 项链 */
.item-7 {
  color: #f368e0;
} /* 钻戒 */

.controls {
  display: flex;
  justify-content: center;
  margin-top: 25px;
  gap: 15px;
}

.btn {
  background: linear-gradient(to right, #ff6b9d, #ff8eb4);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 50px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(255, 107, 157, 0.4);
}

.btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(255, 107, 157, 0.6);
}

.btn:active {
  transform: translateY(1px);
}

.message-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.7);
  z-index: 100;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.5s ease;
}

.message-container.show {
  opacity: 1;
  pointer-events: all;
}

.message-box {
  background: white;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  max-width: 90%;
  width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transform: scale(0.8);
  transition: transform 0.5s ease;
}

.message-container.show .message-box {
  transform: scale(1);
}

.message-title {
  color: #ff6b9d;
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.message-content {
  font-size: 1.3rem;
  line-height: 1.6;
  color: #555;
  margin-bottom: 30px;
}

.hearts {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.heart {
  position: absolute;
  font-size: 2rem;
  opacity: 0;
  animation: float 6s ease-in infinite;
}

@keyframes float {
  0% {
    transform: translateY(100px) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

.instructions {
  background: #fff5f8;
  padding: 15px;
  border-radius: 15px;
  margin-top: 20px;
  font-size: 0.95rem;
  color: #e84393;
  line-height: 1.5;
}

.instructions h3 {
  margin-bottom: 10px;
  text-align: center;
  color: #ff6b9d;
}

.instructions ul {
  padding-left: 20px;
}

.instructions li {
  margin-bottom: 8px;
}

.win-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  font-size: 4rem;
  font-weight: bold;
  color: #ff6b9d;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
  z-index: 50;
  pointer-events: none;
  transition: transform 0.5s ease, opacity 0.5s ease;
  opacity: 0;
}

.win-message.show {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
  animation: winPulse 2s infinite;
}

@keyframes winPulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
}

@media (max-width: 600px) {
  .grid-container {
    gap: 3px;
    padding: 5px;
  }

  .item-content {
    font-size: 1.4rem;
  }

  .game-title {
    font-size: 2rem;
  }

  .btn {
    padding: 10px 20px;
    font-size: 1rem;
  }
  .game-container {
    padding: 15px;
  }

  .game-info {
    flex-direction: column;
    gap: 10px;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .info-label {
    font-size: 1rem;
  }

  .info-value {
    font-size: 1.2rem;
  }

  .routes img {
    width: 50px;
    height: 50px;
  }
}

@keyframes shake {
  0% {
    transform: translate(0);
  }
  25% {
    transform: translateX(-5px);
  }
  50% {
    transform: translateX(5px);
  }
  75% {
    transform: translateX(-5px);
  }
  100% {
    transform: translateX(0);
  }
}

.shake {
  animation: shake 0.5s ease;
}
.routes {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.routes img {
  width: 100px;
  height: 100px;
}
</style>
