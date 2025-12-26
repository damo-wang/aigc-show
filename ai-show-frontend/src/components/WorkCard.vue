<template>
  <div class="card" @click="goDetail">
    <img :src="work.cover" class="cover" />
    <h3>{{ work.title }}</h3>
    <p class="desc">{{ work.description }}</p>
    <div class="tags">
      <span v-for="tag in work.tags" :key="tag" class="tag">{{ tag }}</span>
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
  width: 260px;
  border: 1px solid #ddd;
  padding: 8px;
  cursor: pointer;
}
.cover {
  width: 100%;
  height: 150px;
  object-fit: cover;
}
.desc {
  font-size: 14px;
  color: #555;
}
.tag {
  font-size: 12px;
  margin-right: 4px;
}
</style>
