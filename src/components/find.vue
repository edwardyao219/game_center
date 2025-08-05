<template>
  <div class="game-wrapper">
    <button class="back-btn" @click="router.push('/')">返回</button>

    <div class="info-bar">
      <div>分数：{{ score }}</div>
      <div>目标：<img :src="getItemImage(targetItem)" class="target-img" /></div>
      <div>时间：{{ timeLeft }}s</div>
    </div>

    <div class="game-area" ref="gameArea">
      <div
        class="cat"
        :style="{ left: cat.x + 'px', bottom: cat.y + 'px' }"
      >
        🐱
      </div>

      <div
        v-if="item.visible"
        class="item"
        :style="{ left: item.x + 'px', bottom: item.y + 'px' }"
      >
        <img :src="getItemImage(item.level)" />
      </div>

      <div
        v-for="(obs, index) in obstacles"
        :key="index"
        class="obstacle"
        :style="{ left: obs.x + 'px', bottom: obs.y + 'px' }"
      ></div>

      <div
        v-for="(p, index) in particles"
        :key="index"
        class="particle"
        :style="p.style"
      ></div>
    </div>

    <div class="controller">
      <button @click="moveLeft" @touchstart.prevent="moveLeft">⬅️</button>
      <button @click="jump" @touchstart.prevent="jump">⬆️</button>
      <button @click="moveRight" @touchstart.prevent="moveRight">➡️</button>
    </div>

    <div v-if="gameOver" class="result">
      <h2>游戏结束 🎉</h2>
      <p>得分：{{ score }}</p>
      <button @click="restart">重新开始</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

const score = ref(0);
const timeLeft = ref(30);
const gameOver = ref(false);
const targetItem = ref(1);
const particles = ref([]);

const cat = reactive({
  x: 100,
  y: 0,
  velocityY: 0,
  isJumping: false,
  jumpCount: 0,
  maxJumps: 1,
});

const item = reactive({
  x: 200,
  y: 0,
  level: 1,
  visible: true,
});

const obstacles = ref([]);

const gravity = 0.5;
const groundY = 0;
let timer = null;
let physicsTimer = null;
const gameArea = ref(null);
let areaWidth = 360;
let areaHeight = 500;

const getItemImage = (item) =>
  new URL(`../assets/item-${item}.jpg`, import.meta.url).href;

const randomizeItem = () => {
  const itemSize = 40;

  // 基础高度和每跳跃等级增加的高度
  const baseHeight = 40;
  const jumpHeightUnit = 50;

  const jumpLevel = cat.maxJumps || 1;

  // 最大生成高度，确保不超出屏幕顶部和对应跳跃高度
  const maxY = Math.min(areaHeight - 120, baseHeight + jumpHeightUnit * (jumpLevel - 1));

  item.x = Math.random() * (areaWidth - itemSize);
  item.y = Math.random() * maxY + 20; // 保证高度合理，且不低于20px
  item.level = Math.ceil(Math.random() * 7);
  item.visible = true;

  targetItem.value = item.level;
};

const generateObstacles = () => {
  obstacles.value = [];
  for (let i = 0; i < 3; i++) {
    obstacles.value.push({
      x: Math.random() * (areaWidth - 40),
      y: Math.random() * 100 + 10,
    });
  }
};

const updatePhysics = () => {
  if (cat.isJumping) {
    cat.velocityY -= gravity;
    cat.y += cat.velocityY;
    if (cat.y <= groundY) {
      cat.y = groundY;
      cat.velocityY = 0;
      cat.isJumping = false;
      cat.jumpCount = 0;
    }
  }
  checkCollision();
};

const jump = () => {
  if (cat.jumpCount < cat.maxJumps) {
    cat.velocityY = 10;
    cat.isJumping = true;
    cat.jumpCount++;
  }
};

const moveLeft = () => {
  cat.x = Math.max(0, cat.x - 15);
};

const moveRight = () => {
  cat.x = Math.min(areaWidth - 40, cat.x + 15);
};

const showParticles = (x, y) => {
  for (let i = 0; i < 10; i++) {
    particles.value.push({
      style: {
        left: `${x + Math.random() * 20 - 10}px`,
        bottom: `${y + Math.random() * 20}px`,
        animationDelay: `${Math.random()}s`,
      },
    });
  }
  setTimeout(() => (particles.value = []), 1500);
};

const checkCollision = () => {
  if (!item.visible) return;
  const dx = Math.abs(cat.x - item.x);
  const dy = Math.abs(cat.y - item.y);
  if (dx < 40 && dy < 40) {
    score.value += 10;
    item.visible = false;
    showParticles(item.x, item.y);
    if (score.value >= 60) cat.maxJumps = 3;
    else if (score.value >= 30) cat.maxJumps = 2;
    setTimeout(randomizeItem, 500);
  }
  for (const obs of obstacles.value) {
    const ox = Math.abs(cat.x - obs.x);
    const oy = Math.abs(cat.y - obs.y);
    if (ox < 40 && oy < 30) {
      // 碰撞障碍，强制回落
      cat.y = groundY;
      cat.velocityY = -5;
      cat.jumpCount = cat.maxJumps;
    }
  }
};

const restart = () => {
  score.value = 0;
  timeLeft.value = 30;
  gameOver.value = false;

  cat.maxJumps = 1;
  cat.jumpCount = 0;
  cat.velocityY = 0;
  cat.isJumping = false;

  cat.x = 100;
  cat.y = 0;

  generateObstacles();
  randomizeItem();
  startTimers();
};

const startTimers = () => {
  clearInterval(timer);
  clearInterval(physicsTimer);

  timer = setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value <= 0) {
      gameOver.value = true;
      clearInterval(timer);
      clearInterval(physicsTimer);
    }
  }, 1000);

  physicsTimer = setInterval(updatePhysics, 20);
};

onMounted(() => {
  nextTick(() => {
    areaWidth = gameArea.value?.offsetWidth || 360;
    areaHeight = gameArea.value?.offsetHeight || 500;

    setTimeout(() => {
      restart();
    }, 50);
  });
});

onBeforeUnmount(() => {
  clearInterval(timer);
  clearInterval(physicsTimer);
});
</script>

<style scoped >
.game-wrapper {
  position: relative;
  padding: 10px;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff0f5;
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
.info-bar {
  display: flex;
  justify-content: space-around;
  margin-top: 40px;
  font-size: 1.1rem;
  align-items: center;

  &> div {
    display: flex;
    align-items: center;
  }
}
.target-img {
  width: 30px;
  height: 30px;
  border-radius: 5px;
  margin-left: 5px;
}
.game-area {
  flex: 1;
  position: relative;
  background: #fff;
  border: 2px solid #f8c3d0;
  margin: 20px 0;
  overflow: hidden;
}
.cat {
  position: absolute;
  font-size: 2rem;
  transition: left 0.1s linear;
  user-select: none;
}
.item {
  position: absolute;
  width: 40px;
  height: 40px;
  user-select: none;
}
.item img {
  width: 100%;
  height: 100%;
}
.obstacle {
  position: absolute;
  width: 40px;
  height: 20px;
  background: #888;
  border-radius: 5px;
  user-select: none;
}
.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: pink;
  animation: particleFade 1.5s ease-out forwards;
}
@keyframes particleFade {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(50px);
    opacity: 0;
  }
}
.controller {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
}
.controller button {
  flex: 1;
  margin: 0 5px;
  padding: 12px;
  font-size: 1.5rem;
  background: #ff6b9d;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  user-select: none;
}
.result {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  text-align: center;
  user-select: none;
}
</style>
