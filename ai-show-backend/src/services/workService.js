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
