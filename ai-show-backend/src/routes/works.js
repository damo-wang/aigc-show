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
