#!/usr/bin/env bash
set -e

# 1. 构建前端
echo "=== Build frontend ==="
cd ai-show-frontend
npm install
npm run build
cd ..

# 2. 构建并启动 Docker 服务
echo "=== Docker compose up ==="
docker compose up -d --build

echo "=== Done. Visit http://localhost/ ==="
