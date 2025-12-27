# AIGC Show — AI Creative Showcase Platform (MVP)

AIGC Show is an experimental platform for displaying **AI-generated content**.
It currently supports three types of works:

* 🖼️ AI Images
* 📖 AI Stories / Text Content
* 🎮 AI Mini Games (HTML5, playable online)

The goal of this project is to become a **community hub for AI creators**, where AI-generated content can be collected, showcased, and shared.

---

## 📂 Project Structure

```text
aigc-show
├── ai-show-backend      # Node.js + Express backend (API + static assets)
├── ai-show-frontend     # Vue 3 + Vite frontend (served via Nginx after build)
├── doc                  # Development notes / documentation
├── nginx.conf           # Nginx configuration (frontend + API reverse proxy)
└── docker-compose.yml   # One-click deployment (Nginx + Backend)
```

---

## 🛠️ Tech Stack

* **Frontend**: Vue 3 + Vite + Axios
* **Backend**: Node.js + Express
* **Static Hosting & Reverse Proxy**: Nginx
* **Deployment**: Docker + Docker Compose

---

# 🚀 Quick Start (Recommended: Docker Compose)

### Requirements

* Linux / macOS / WSL2
* Docker installed
* `docker compose` available

---

## 1️⃣ Build Frontend (first time or after frontend code changes)

```bash
cd ai-show-frontend
npm install      # required on first run
npm run build    # generates dist/
cd ..
```

This will generate:

```
ai-show-frontend/dist/
```

Nginx will mount this directory and serve it directly.

---

## 2️⃣ Start the Platform (Nginx + Backend)

Run in project root:

```bash
docker compose up -d --build
```

On first startup this will:

* Build the backend image
* Start the Node.js backend container
* Start the Nginx container
* Connect them inside the same Docker network

---

## 3️⃣ Open in Browser

Local:

```
http://localhost/
```

Or if deployed to a server:

```
http://<your-server-ip>/
```

You will see:

* Tab switching: Images / Stories / Games
* Works listed in a grid
* Click any item to open detail view (view images, read stories, or play games)

---

# 🧩 Runtime Architecture

```
Browser
   │
   ▼
Nginx (Docker)
   │
   │ /              → serves frontend static files (dist)
   │ /api/...       → reverse proxy to Node backend
   │ /public/...    → reverse proxy static resources (images / stories / games)
   │
   ▼
Backend (Docker, Express)
```

---

# 📡 API Overview

| Endpoint                    | Description      |
| --------------------------- | ---------------- |
| `GET /api/works?type=image` | Get works list   |
| `GET /api/works?type=novel` | Get stories list |
| `GET /api/works?type=game`  | Get games list   |
| `GET /api/works/:id`        | Get work details |

Static content paths:

* `/public/images/...`
* `/public/novels/...`
* `/public/games/...`

---

# 🧪 Development Mode (Without Docker)

## Backend Development

```bash
cd ai-show-backend
npm install
npm run dev
```

Runs at:

```
http://localhost:3000
```

---

## Frontend Development

```bash
cd ai-show-frontend
npm install
npm run dev
```

Runs at:

```
http://localhost:5173
```

---

# 🔮 Roadmap / Planned Features

* User registration & authentication
* User-uploaded AI content
* Likes / Favorites / Comments
* Leaderboards & recommendation
* Built-in AI creation tools
* Content moderation & compliance

---

# 📜 License

This project is currently an experimental personal project and **not licensed for commercial use** at this time.
