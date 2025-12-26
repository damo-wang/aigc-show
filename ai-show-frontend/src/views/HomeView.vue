<template>
  <div class="home">
    <h1>AI 创作展示平台（MVP）</h1>

    <div class="tabs">
      <button
        v-for="t in types"
        :key="t.value"
        :class="{ active: currentType === t.value }"
        @click="changeType(t.value)"
      >
        {{ t.label }}
      </button>
    </div>

    <div class="work-list">
      <WorkCard
        v-for="work in works"
        :key="work.id"
        :work="work"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import WorkCard from "../components/WorkCard.vue";

const types = [
  { label: "图片", value: "image" },
  { label: "小说", value: "novel" },
  { label: "游戏", value: "game" }
];

const currentType = ref("image");
const works = ref([]);

const fetchWorks = async () => {
  const res = await axios.get("/api/works", {
    params: { type: currentType.value }
  });
  if (res.data.success) {
    works.value = res.data.data;
  }
};

const changeType = (t) => {
  currentType.value = t;
  fetchWorks();
};

onMounted(fetchWorks);
</script>

<style scoped>
.tabs button {
  margin-right: 8px;
}
.tabs .active {
  font-weight: bold;
}
.work-list {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
</style>
