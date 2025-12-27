import express from "express";
import { getWorks, getWorkById } from "../lib/worksStore.js";

const router = express.Router();

// GET /api/works?type=image|novel|game
router.get("/", async (req, res) => {
  try {
    const { type } = req.query;
    const list = await getWorks(type);
    res.json({ success: true, data: list });
  } catch (err) {
    console.error("GET /api/works error:", err);
    res.status(500).json({ success: false, message: "服务器错误" });
  }
});

// GET /api/works/:id
router.get("/:id", async (req, res) => {
  try {
    const work = await getWorkById(req.params.id);
    if (!work) {
      return res
        .status(404)
        .json({ success: false, message: "作品不存在" });
    }
    res.json({ success: true, data: work });
  } catch (err) {
    console.error("GET /api/works/:id error:", err);
    res.status(500).json({ success: false, message: "服务器错误" });
  }
});

export default router;
