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
 * 仍然保留：
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
 * 仍然保留：
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

/**
 * 新增：
 * POST /api/admin/works/upload-and-create
 *
 * form-data:
 *  - type: image|novel|game
 *  - title: string
 *  - description: string
 *  - tags: 逗号分隔字符串，如 "图片, 科幻"
 *  - file: 上传文件
 *
 * 一次完成：文件上传 + 创建作品记录。
 * 若写入 works.json 失败，会尝试删除刚刚上传的文件。
 */
router.post(
  "/works/upload-and-create",
  upload.single("file"),
  async (req, res) => {
    const { type, title, description, tags: tagsStr } = req.body;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "缺少文件" });
    }

    if (!["image", "novel", "game"].includes(type)) {
      // 删除刚才上传的文件
      if (req.file?.path) {
        fs.unlink(req.file.path).catch(() => {});
      }
      return res
        .status(400)
        .json({ success: false, message: "type 必须是 image|novel|game" });
    }

    if (!title || typeof title !== "string") {
      if (req.file?.path) {
        fs.unlink(req.file.path).catch(() => {});
      }
      return res
        .status(400)
        .json({ success: false, message: "title 必须是非空字符串" });
    }

    // 构造 URL
    let subDir;
    if (type === "image") subDir = "images/uploads";
    else if (type === "novel") subDir = "novels/uploads";
    else if (type === "game") subDir = "games/uploads";
    const urlPath = `/public/${subDir}/${req.file.filename}`;

    const tags =
      typeof tagsStr === "string"
        ? tagsStr
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
        : [];

    let content = {};
    let cover = urlPath;

    if (type === "image") {
      content = { images: [urlPath] };
    } else if (type === "novel") {
      content = { file: urlPath };
    } else if (type === "game") {
      content = { playUrl: urlPath };
    }

    try {
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
      console.error(
        "POST /api/admin/works/upload-and-create error:",
        err
      );

      // 写入失败时删除文件，避免垃圾文件
      if (req.file?.path) {
        fs.unlink(req.file.path).catch(() => {});
      }

      res.status(500).json({ success: false, message: "服务器错误" });
    }
  }
);

export default router;
