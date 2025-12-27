<template>
  <div class="page">
    <div class="page-inner">
      <header class="page-header">
        <div>
          <h1 class="page-title">AI Creative Showcase（MVP）</h1>
          <p class="page-subtitle">A platform to display AI generated images, stories and mini-games</p>
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
        Loading works…
      </div>
      <div v-else-if="error" class="status-text error">
        Failed to load: {{ error }}
      </div>
      <div v-else-if="works.length === 0" class="status-text">
        No works yet.
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
  { label: "Images", value: "image" },
  { label: "Stories", value: "novel" },
  { label: "Games", value: "game" }
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
      error.value = res.data.message || "Unknown Error";
    }
  } catch (e) {
    error.value = e?.message || "Request failed";
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
