<template>
  <div class="card" @click="goDetail">
    <div class="cover-wrap">
      <img :src="work.cover" class="cover" alt="封面" />
    </div>
    <div class="card-body">
      <h3 class="title">{{ work.title }}</h3>
      <p class="desc">{{ work.description }}</p>
      <div class="tags">
        <span v-for="tag in work.tags" :key="tag" class="tag">
          {{ tag }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const props = defineProps({
  work: { type: Object, required: true }
});

const router = useRouter();
const goDetail = () => {
  router.push(`/works/${props.work.id}`);
};
</script>

<style scoped>
.card {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: transform 0.12s ease-out, box-shadow 0.12s ease-out;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.16);
}

.cover-wrap {
  width: 100%;
  padding-top: 56.25%; /* 16:9 比例 */
  position: relative;
  background: #111827;
}

.cover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-body {
  padding: 12px 14px 14px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 6px;
}

.desc {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 10px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
}
</style>
