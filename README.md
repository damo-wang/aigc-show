# AIGC Show — AI 创作展示平台（MVP）

这是一个用于展示 **AI 生成内容** 的实验性平台，目前支持三类作品：

- 🖼️ AI 图片
- 📖 AI 小说（文本）
- 🎮 AI 小游戏（HTML5，可在线游玩）

平台目标是成为一个 **AI 创作者内容聚合 & 展示社区** 的基础雏形。

---

## 📂 项目目录结构

```text
aigc-show
├── ai-show-backend      # Node.js + Express 后端（API + 静态资源）
├── ai-show-frontend     # Vue 3 + Vite 前端（打包后通过 Nginx 提供）
├── doc                  # 开发文档 / 过程记录
├── nginx.conf           # Nginx 配置（前端 + API 反向代理）
└── docker-compose.yml   # 一键部署（Nginx + Backend）
```

---

## 🛠️ 技术栈

* **前端**：Vue 3 + Vite + Axios
* **后端**：Node.js + Express
* **静态托管 & 反代**：Nginx
* **部署**：Docker + Docker Compose

---

# 🚀 快速启动（推荐：Docker Compose）

### 前置条件

* Linux / Mac / WSL2
* Docker 已安装
* `docker compose` 可用

---

## 1️⃣ 构建前端（仅首次或代码更新后）

```bash
cd ai-show-frontend
npm install      # 首次需要
npm run build    # 生成 dist/
cd ..
```

这会生成：

```
ai-show-frontend/dist/
```

该目录将由 Nginx 直接挂载并提供访问。

---

## 2️⃣ 一键启动（Nginx + Backend）

在项目根目录：

```bash
docker compose up -d --build
```

首次会执行：

* 构建后端镜像
* 启动 Node 后端容器
* 启动 Nginx 容器
* 自动连接同一 Docker 网络

---

## 3️⃣ 打开浏览器访问

```
http://localhost/
```

或如果跑在服务器上：

```
http://<你的服务器IP>/
```

即可看到站点首页：

* 顶部切换：图片 / 小说 / 游戏
* 列表展示作品
* 可进入详情页面阅读或玩游戏

---

# 🧩 运行结构说明

```
Browser
   │
   ▼
Nginx (Docker)
   │
   │ /              → 前端 dist 静态文件
   │ /api/...       → 反向代理到 Node 后端
   │ /public/...    → 反向代理文件（图片 / 小说 / 游戏）
   │
   ▼
Backend (Docker, Express)
```

---

# 📡 API 简述

| Endpoint                   | 说明     |       |        |
| -------------------------- | ------ | ----- | ------ |
| `GET /api/works?type=image` | novel  | game` | 获取作品列表 |
| `GET /api/works/:id`       | 获取作品详情 |       |        |

静态资源：

* `/public/images/...`
* `/public/novels/...`
* `/public/games/...`

---

# 🧪 开发模式（不走 Docker 时）

## 后端开发

```bash
cd ai-show-backend
npm install
npm run dev
```

默认：

```
http://localhost:3000
```

---

## 前端开发

```bash
cd ai-show-frontend
npm install
npm run dev
```

默认：

```
http://localhost:5173
```

---

# 🔮 TODO / 规划

* 用户登录 / 注册
* 用户上传 AI 作品
* 点赞 / 收藏 / 评论
* 排行榜 / 推荐机制
* AI 创作工具内置
* 内容审核与合规

---

# 📜 License

本项目目前为个人实验性项目，暂不开放商业授权。
