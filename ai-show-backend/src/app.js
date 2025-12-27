import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import worksRouter from "./routes/works.js";
import adminRouter from "./routes/admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态资源目录：/public
const publicDir = path.join(__dirname, "../public");
app.use("/public", express.static(publicDir));

// 对前端暴露的公开 API
app.use("/api/works", worksRouter);

// 后台管理 API（需要 x-admin-token）
app.use("/api/admin", adminRouter);

// 健康检查
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "backend ok" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend server listening on port ${PORT}`);
});
