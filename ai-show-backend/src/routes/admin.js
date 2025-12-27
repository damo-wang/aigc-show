import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";

import { requireAdmin } from "../lib/adminAuth.js";
import { createWork } from "../lib/worksStore.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 根目录：public
const uploadRoot = path.join(__dirname, "../../public");

// 各类型上传目录
const uploadDirs = {
  image: path.join(uploadRoot, "images/uploads"),
  novel: path.join(uploadRoot, "novels/uploads"),
  game: path.join(uploadRoot, "games/uploads")
};

// 确保目录存在
async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {
    console.error("创建目录失败:", dir, e);
  }
}
for (const d of Object.values(uploadDirs)) {
  ensureDir(d).catch(() => {});
}

// multer storage：根据 type 决定目录
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const type = req.body.type;
    let dir = uploadRoot;

    if (type === "image") dir = uploadDirs.image;
    else if (type === "novel") dir = uploadDirs.novel;
    else if (type === "game") dir = uploadDirs.game;

    cb(null, dir);
  },
  filename(req, file, cb) {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${timestamp}_${safeName}`);
  }
});

const upload = multer({ storage });

const router = express.Router();

// 所有 /api/admin/* 都需要管理员身份
router.use(requireAdmin);

/**
 * POST /api/admin/upload
 * form-data:
 *  - type: image|novel|game
 *  - file: 上传文件
 */
router.post("/upload", upload.single("file"), (req, res) => {
  try {
    const { type } = req.body;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "缺少文件" });
    }

    if (!["image", "novel", "game"].includes(type)) {
      return res
        .status(400)
        .json({ success: false, message: "type 必须是 image|novel|game" });
    }

    let subDir;
    if (type === "image") subDir = "images/uploads";
    else if (type === "novel") subDir = "novels/uploads";
    else if (type === "game") subDir = "games/uploads";

    const urlPath = `/public/${subDir}/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        type,
        url: urlPath,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (err) {
    console.error("POST /api/admin/upload error:", err);
    res.status(500).json({ success: false, message: "服务器错误" });
  }
});

/**
 * POST /api/admin/works
 * JSON body:
 * {
 *   "type": "image" | "novel" | "game",
 *   "title": "...",
 *   "description": "...",
 *   "tags": ["..."],
 *   "cover": "/public/images/xxx",
 *   "content": { ... }
 * }
 */
router.post("/works", async (req, res) => {
  try {
    const { type, title, description, tags, cover, content } = req.body;

    if (!["image", "novel", "game"].includes(type)) {
      return res
        .status(400)
        .json({ success: false, message: "type 必须是 image|novel|game" });
    }
    if (!title || typeof title !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "title 必须是非空字符串" });
    }

    const newWork = await createWork({
      type,
      title,
      description,
      tags,
      cover,
      content
    });

    res.json({ success: true, data: newWork });
  } catch (err) {
    console.error("POST /api/admin/works error:", err);
    res.status(500).json({ success: false, message: "服务器错误" });
  }
});

export default router;
