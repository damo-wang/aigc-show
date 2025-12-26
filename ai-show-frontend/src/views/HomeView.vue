<template>
  <div class="page">
    <div class="page-inner">
      <header class="page-header">
        <div>
          <h1 class="page-title">AI 创作展示平台（MVP）</h1>
          <p class="page-subtitle">展示 AI 生成的图片、小说和小游戏作品</p>
        </div>
      </header>

      <div class="tabs">
        <button
          v-for="t in types"
          :key="t.value"
          :class="['tab-btn', { active: currentType === t.value }]"
          @click="changeType(t.value)"
        >
          {{ t.label }}
        </button>
      </div>

      <div v-if="loading" class="status-text">
        正在加载作品…
      </div>
      <div v-else-if="error" class="status-text error">
        加载失败：{{ error }}
      </div>
      <div v-else-if="works.length === 0" class="status-text">
        暂无作品，可以先在后端 data/works.json 中添加。
      </div>

      <div v-else class="work-list">
        <WorkCard
          v-for="work in works"
          :key="work.id"
          :work="work"
        />
      </div>
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
const loading = ref(false);
const error = ref("");

const fetchWorks = async () => {
  loading.value = true;
  error.value = "";
  try {
    const res = await axios.get("/api/works", {
      params: { type: currentType.value }
    });
    if (res.data.success) {
      works.value = res.data.data;
    } else {
      error.value = res.data.message || "未知错误";
    }
  } catch (e) {
    error.value = e?.message || "请求失败";
  } finally {
    loading.value = false;
  }
};

const changeType = (t) => {
  if (t === currentType.value) return;
  currentType.value = t;
  fetchWorks();
};

onMounted(fetchWorks);
</script>

<style scoped>
.page {
  min-height: 100vh;
}

.page-inner {
  max-width: 1120px;
  margin: 0 auto;
  padding: 24px 16px 40px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 16px;
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
}

.page-subtitle {
  margin: 8px 0 0;
  color: #6b7280;
  font-size: 14px;
}

.tabs {
  display: inline-flex;
  border-radius: 999px;
  background: #e4e4e7;
  padding: 4px;
  margin: 16px 0 20px;
}

.tab-btn {
  border: none;
  background: transparent;
  padding: 6px 18px;
  border-radius: 999px;
  font-size: 14px;
  cursor: pointer;
  color: #4b5563;
}

.tab-btn.active {
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  color: #111827;
  font-weight: 600;
}

.status-text {
  font-size: 14px;
  color: #6b7280;
  padding: 16px 4px;
}

.status-text.error {
  color: #b91c1c;
}

.work-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 18px;
}
</style>
