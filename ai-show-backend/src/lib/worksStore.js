import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "../../data/works.json");

// 读取全部作品
async function readAllWorks() {
  const content = await fs.readFile(DATA_FILE, "utf-8");
  const data = JSON.parse(content);
  if (!Array.isArray(data)) {
    throw new Error("works.json 格式错误，预期为数组");
  }
  return data;
}

// 写回全部作品
async function writeAllWorks(works) {
  await fs.writeFile(DATA_FILE, JSON.stringify(works, null, 2), "utf-8");
}

// 对外导出：按类型获取列表
export async function getWorks(type) {
  const all = await readAllWorks();
  if (!type) return all;
  return all.filter((w) => w.type === type);
}

// 对外导出：按 id 获取
export async function getWorkById(id) {
  const all = await readAllWorks();
  return all.find((w) => w.id === id);
}

// 对外导出：创建新作品
export async function createWork(workInput) {
  const all = await readAllWorks();

  // 简单 id 生成策略：work_ + 时间戳
  const baseId = `work_${Date.now()}`;
  const id = all.some((w) => w.id === baseId)
    ? `${baseId}_${all.length + 1}`
    : baseId;

  const nowIso = new Date().toISOString();

  const newWork = {
    id,
    type: workInput.type,
    title: workInput.title,
    description: workInput.description || "",
    tags: Array.isArray(workInput.tags) ? workInput.tags : [],
    cover: workInput.cover || "",
    content: workInput.content || {},
    createdAt: nowIso
  };

  all.push(newWork);
  await writeAllWorks(all);
  return newWork;
}
