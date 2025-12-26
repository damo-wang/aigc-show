很好，那我们现在把“大目标”收缩成一个 **能在你服务器上跑起来的、功能明确的 MVP**。

> 目标：
> 在你的 Linux 服务器上跑一个网站，支持展示 3 类 AI 作品：
>
> * AI 图片
> * AI 小说
> * AI 小游戏（HTML5）
>   用户可以浏览、分类查看、打开详情并直接阅读/游玩。

先不做注册/登录/评论，先把“展出 AI 作品”这个核心闭环打通，再逐步加互动功能。

---

## 一、整体规划：MVP 功能范围（第一版）

### 1）用户侧功能（游客即可访问）

* 首页：

  * 顶部切换：`图片 / 小说 / 游戏`
  * 列表卡片展示对应内容
* 作品详情页：

  * 图片：大图 + 描述
  * 小说：标题 + 正文
  * 游戏：嵌入 iframe 可以直接玩
* 简单的“作品标签”展示（如：科幻 / 搞笑 / 恐怖 / 益智）

先不做：

* 用户注册登录
* 上传功能（你先后台手工添加）
* 评论 / 点赞（可以放到第二阶段）

---

## 二、技术栈和目录结构

### 1）后端：Node + Express

* 提供 REST API
* 提供静态文件（图片 / 小说文本 / 游戏 HTML）

目录示例：

```bash
ai-show-backend/
  package.json
  .env
  src/
    app.js
    routes/
      works.js        # 作品相关API
    services/
      workService.js
  data/
    works.json        # 所有作品的数据
  public/
    images/           # 图片文件
    novels/           # 小说（可以txt/markdown/html）
    games/
      game_001/
        index.html
        ...
      game_002/
        index.html
```

### 2）前端：Vue 3 + Vite

目录示例：

```bash
ai-show-frontend/
  package.json
  vite.config.js
  src/
    main.js
    router/
      index.js
    views/
      HomeView.vue
      WorkDetailView.vue
    components/
      WorkCard.vue
      TypeTabs.vue
```

---

## 三、数据模型设计（统一“作品”结构）

我们用一个 `works.json` 存所有作品：

```json
[
  {
    "id": "work_001",
    "type": "image",
    "title": "赛博朋克城市",
    "description": "使用 Stable Diffusion 生成的赛博朋克风格城市夜景。",
    "tags": ["图片", "赛博朋克", "科幻"],
    "cover": "/public/images/cyber_city_cover.jpg",
    "content": {
      "images": [
        "/public/images/cyber_city_1.jpg",
        "/public/images/cyber_city_2.jpg"
      ]
    },
    "createdAt": "2025-01-01T12:00:00Z"
  },
  {
    "id": "work_002",
    "type": "novel",
    "title": "火星上的最后一间酒馆",
    "description": "AI 生成的短篇科幻小说。",
    "tags": ["小说", "科幻"],
    "cover": "/public/images/mars_bar_cover.jpg",
    "content": {
      "file": "/public/novels/mars_bar.md"
    },
    "createdAt": "2025-01-02T10:00:00Z"
  },
  {
    "id": "work_003",
    "type": "game",
    "title": "方块躲避",
    "description": "用方向键控制方块躲避障碍的小游戏。",
    "tags": ["游戏", "益智"],
    "cover": "/public/images/block_dodge_cover.png",
    "content": {
      "playUrl": "/public/games/block_dodge/index.html"
    },
    "createdAt": "2025-01-03T09:00:00Z"
  }
]
```

后端通过这个 JSON 提供：

* `GET /api/works?type=image|novel|game`
* `GET /api/works/:id`

---

## 四、后端实现步骤（Node + Express）

### 1）初始化项目

```bash
mkdir ai-show-backend
cd ai-show-backend
npm init -y
npm install express cors dotenv
```

`package.json` 里加：

```json
{
  "type": "module",
  "scripts": {
    "dev": "node src/app.js"
  }
}
```

### 2）`src/app.js`

```js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import worksRouter from "./routes/works.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// 静态文件（图片/小说/游戏）
app.use("/public", express.static(path.join(__dirname, "../public")));

// API 路由
app.use("/api/works", worksRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
```

### 3）`src/routes/works.js`

```js
import { Router } from "express";
import { getAllWorks, getWorkById } from "../services/workService.js";

const router = Router();

// 列表：可按 type 筛选
router.get("/", async (req, res) => {
  const type = req.query.type; // image / novel / game
  const works = await getAllWorks(type);
  res.json({ success: true, data: works });
});

// 详情
router.get("/:id", async (req, res) => {
  const work = await getWorkById(req.params.id);
  if (!work) {
    return res.status(404).json({ success: false, message: "Not found" });
  }
  res.json({ success: true, data: work });
});

export default router;
```

### 4）`src/services/workService.js`

```js
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../../data/works.json");

async function loadAll() {
  const text = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(text);
}

export async function getAllWorks(type) {
  const works = await loadAll();
  if (!type) return works;
  return works.filter((w) => w.type === type);
}

export async function getWorkById(id) {
  const works = await loadAll();
  return works.find((w) => w.id === id);
}
```

### 5）准备静态资源

```bash
mkdir -p public/images
mkdir -p public/novels
mkdir -p public/games
mkdir -p data
```

* 把你的 AI 图片放在 `public/images/`
* 把 AI 小说写成 `.md` 或 `.txt` 放在 `public/novels/`
* 把 AI 生成的 HTML5 游戏放在 `public/games/game_xxx/index.html`
* 写好 `data/works.json`

运行后端：

```bash
npm run dev
```

用浏览器测试：

* `http://localhost:3000/api/works`
* `http://localhost:3000/api/works?type=game`
* `http://localhost:3000/public/games/xxx/index.html`

---

## 五、前端实现步骤（Vue 3）

### 1）初始化项目

```bash
mkdir ai-show-frontend
cd ai-show-frontend
npm create vite@latest . -- --template vue
npm install
npm install axios
```

### 2）`src/main.js`

```js
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

createApp(App).use(router).mount("#app");
```

### 3）`src/router/index.js`

```js
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import WorkDetailView from "../views/WorkDetailView.vue";

const routes = [
  { path: "/", component: HomeView },
  { path: "/works/:id", component: WorkDetailView, props: true }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
```

### 4）`src/views/HomeView.vue`（顶部切换 + 列表）

```vue
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
  const res = await axios.get("http://localhost:3000/api/works", {
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
```

### 5）`src/components/WorkCard.vue`

```vue
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
```

### 6）`src/views/WorkDetailView.vue`（根据 type 不同展示）

```vue
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
  const res = await axios.get(`http://localhost:3000/api/works/${route.params.id}`);
  if (res.data.success) {
    work.value = res.data.data;
    // 如果是小说，拉取小说文件
    if (work.value.type === "novel" && work.value.content?.file) {
      const txt = await fetch("http://localhost:3000" + work.value.content.file).then((r) =>
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
```

到这里：
只要你往 `works.json` 中添数据，往 `public/` 里放对应文件，前端就能自动展示你的 AI 图片/小说/游戏。

---

## 六、部署到你的 Linux 服务器（简要）

1. 在服务器上准备：

   * 安装 Node（推荐 Node 18+）
   * 克隆/上传 `ai-show-backend` 和 `ai-show-frontend`

2. 后端：

   * 在 `ai-show-backend`：

     ```bash
     npm install
     npm run dev   # 测试
     ```
   * 正式运行可以用 `pm2`：

     ```bash
     npm install -g pm2
     pm2 start src/app.js --name ai-backend
     ```

3. 前端：

   * 在 `ai-show-frontend`：

     ```bash
     npm install
     npm run build
     ```
   * 生成的 `dist/` 用 Nginx 做静态站点

4. Nginx：

   * 前端：`/` → 指向 `dist/`
   * 后端：`/api/` → 反向代理到 `http://127.0.0.1:3000`
   * `/public/` 也代理到后端或直接由 Nginx 静态文件托管（都可以）

---

## 七、下一步升级（等 MVP 跑起来以后）

* 增加用户注册/登录
* 作品上传（前端表单 + 后端存储）
* 评论系统
* 点赞 / 收藏
* 简单“搜索”和“标签筛选”
* 后台管理（审核、删除）

---

你现在可以先做这几件事作为起点：

1. 搭好 backend 最小版本（跑通 `/api/works`）
2. 放 1~2 个 AI 小说、几张 AI 图片、1 个 HTML5 游戏到对应目录
3. 搭前端，能看到列表、进详情并实际读/玩

如果你在某一步卡住（例如接口 404、CORS 问题、Nginx 配置等），把错误信息和你的配置贴给我，我帮你排问题。
