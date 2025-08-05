<template>
  <div class="select-page">
    <h1>大小个的游戏世界</h1>
    <p>请选择你要玩的游戏：</p>
    <div class="game-list">
      <button @click="selectGame('merge')">✨ 合成美丽的大小个</button>
      <button @click="selectGame('find')">🐱 大小个猫猫跳</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
const router = useRouter();

const selectGame = (mode) => {
  router.push({ name: mode });
};
</script>

<style scoped>
.select-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  background: linear-gradient(135deg, #f9c6d0, #fddde6);
  height: 100vh;
  text-align: center;
}
.select-page h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #e84393;
}
.select-page .game-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.select-page button {
  font-size: 1.2rem;
  padding: 15px 30px;
  border: none;
  border-radius: 50px;
  background: linear-gradient(to right, #ff6b9d, #ff8eb4);
  color: white;
  cursor: pointer;
  transition: transform 0.2s;
}
.select-page button:hover {
  transform: scale(1.05);
}
</style>
