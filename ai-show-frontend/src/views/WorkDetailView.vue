<template>
  <div class="page">
    <div class="page-inner">
      <button class="back-btn" @click="goBack">
        ← 返回列表
      </button>

      <div v-if="loading" class="status-text">Loading work details…</div>
      <div v-else-if="error" class="status-text error">Failed: {{ error }}</div>
      <div v-else-if="!work" class="status-text">Work not found.</div>

      <div v-else class="detail">
        <header class="detail-header">
          <h1 class="detail-title">{{ work.title }}</h1>
          <p class="detail-desc">{{ work.description }}</p>
          <div class="detail-tags">
            <span v-for="tag in work.tags" :key="tag" class="tag">
              {{ tag }}
            </span>
          </div>
        </header>

        <section v-if="work.type === 'image'" class="detail-section">
          <div
            v-for="(img, idx) in work.content?.images || []"
            :key="idx"
            class="image-wrap"
          >
            <img :src="img" class="image" alt="image" />
          </div>
        </section>

        <section v-else-if="work.type === 'novel'" class="detail-section">
          <div v-if="novelLoading" class="status-text">Loading story…</div>
          <div v-else-if="novelError" class="status-text error">
            小说加载失败：{{ novelError }}
          </div>
          <pre v-else class="novel-text">{{ novelText }}</pre>
        </section>

        <section v-else-if="work.type === 'game'" class="detail-section">
          <div class="game-wrapper">
            <iframe
              v-if="work.content?.playUrl"
              :src="work.content.playUrl"
              class="game-frame"
              frameborder="0"
              allowfullscreen
            ></iframe>
          </div>
          <p class="game-hint">
            Tip: Best experienced on desktop browser.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const route = useRoute();
const router = useRouter();

const work = ref(null);
const loading = ref(false);
const error = ref("");

const novelText = ref("");
const novelLoading = ref(false);
const novelError = ref("");

const fetchWork = async () => {
  loading.value = true;
  error.value = "";
  try {
    const res = await axios.get(`/api/works/${route.params.id}`);
    if (res.data.success) {
      work.value = res.data.data;
      if (work.value.type === "novel" && work.value.content?.file) {
        await fetchNovel(work.value.content.file);
      }
    } else {
      error.value = res.data.message || "Unknown error";
    }
  } catch (e) {
    error.value = e?.message || "Request failed";
  } finally {
    loading.value = false;
  }
};

const fetchNovel = async (filePath) => {
  novelLoading.value = true;
  novelError.value = "";
  try {
    // filePath 形如 "/public/novels/xxx.md"
    const res = await fetch(filePath);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const txt = await res.text();
    novelText.value = txt;
  } catch (e) {
    novelError.value = e?.message || "Story request failed";
  } finally {
    novelLoading.value = false;
  }
};

const goBack = () => {
  router.back();
};

onMounted(fetchWork);
</script>

<style scoped>
.page {
  min-height: 100vh;
}

.page-inner {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 16px 40px;
}

.back-btn {
  border: none;
  background: transparent;
  color: #4b5563;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 0;
  margin-bottom: 12px;
}

.back-btn:hover {
  color: #111827;
}

.status-text {
  font-size: 14px;
  color: #6b7280;
  padding: 16px 0;
}

.status-text.error {
  color: #b91c1c;
}

.detail {
  background: transparent;
}

.detail-header {
  margin-bottom: 16px;
}

.detail-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.detail-desc {
  margin: 8px 0 10px;
  color: #6b7280;
  font-size: 14px;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4338ca;
}

.detail-section {
  margin-top: 12px;
}

/* 图片展示 */
.image-wrap {
  margin-bottom: 12px;
}

.image {
  width: 100%;
  max-width: 960px;
  display: block;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
}

/* 小说展示 */
.novel-text {
  white-space: pre-wrap;
  font-family: "SF Pro Text", system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
  line-height: 1.7;
  font-size: 15px;
  background: #ffffff;
  padding: 18px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
  max-width: 780px;
}

/* 游戏展示：自适应比例盒子 */
.game-wrapper {
  width: 100%;
  max-width: 960px;
  margin-top: 8px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.12);
  position: relative;
  padding-top: 75%; /* 4:3 比例，需要更扁可改为 56.25% (16:9) */
}

.game-frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.game-hint {
  margin-top: 8px;
  font-size: 13px;
  color: #6b7280;
}
</style>
