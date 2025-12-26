<template>
  <div v-if="work">
    <h2>{{ work.title }}</h2>
    <p>{{ work.description }}</p>
    <p>
      标签：
      <span v-for="tag in work.tags" :key="tag">{{ tag }} </span>
    </p>

    <div v-if="work.type === 'image'">
      <div v-for="(img, idx) in work.content.images" :key="idx">
        <img :src="img" class="image" />
      </div>
    </div>

    <div v-else-if="work.type === 'novel'">
      <pre class="novel-text" v-if="novelText">{{ novelText }}</pre>
      <p v-else>小说加载中...</p>
    </div>

    <div v-else-if="work.type === 'game'">
      <iframe
        v-if="work.content.playUrl"
        :src="work.content.playUrl"
        class="game-frame"
        frameborder="0"
      ></iframe>
    </div>
  </div>
  <div v-else>
    <p>加载中...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";

const route = useRoute();
const work = ref(null);
const novelText = ref("");

onMounted(async () => {
  const res = await axios.get(`/api/works/${route.params.id}`);
  if (res.data.success) {
    work.value = res.data.data;
    // 如果是小说，拉取小说文件
    if (work.value.type === "novel" && work.value.content?.file) {
      const txt = await fetch(work.value.content.file).then((r) =>
        r.text()
      );
      novelText.value = txt;
    }
  }
});
</script>

<style scoped>
.image {
  max-width: 800px;
  display: block;
  margin-bottom: 12px;
}
.game-frame {
  width: 800px;
  height: 600px;
}
.novel-text {
  white-space: pre-wrap;
  font-family: inherit;
}
</style>
