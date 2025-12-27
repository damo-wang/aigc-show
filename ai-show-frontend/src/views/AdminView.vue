<template>
  <div class="page">
    <div class="page-inner">
      <header class="page-header">
        <div>
          <h1 class="page-title">管理后台（MVP）</h1>
          <p class="page-subtitle">
            一次操作：校验 + 上传文件 + 创建作品记录，避免产生无用垃圾文件。
          </p>
        </div>
        <div class="link-home">
          <router-link to="/">← 返回前台首页</router-link>
        </div>
      </header>

      <!-- 登录区 -->
      <section class="card">
        <h2 class="card-title">1. 管理员登录（Admin Token）</h2>
        <p class="card-desc">
          后台接口通过
          <code>x-admin-token</code>
          头部进行保护。这里输入的 Token 会保存在浏览器
          <code>localStorage</code>
          中。
        </p>
        <div class="form-row">
          <label class="label">Admin Token</label>
          <input
            v-model="adminTokenInput"
            type="password"
            class="input"
            placeholder="请输入与后端 ADMIN_TOKEN 一致的值"
          />
        </div>
        <div class="form-actions">
          <button class="btn primary" @click="saveToken">
            保存 Token
          </button>
          <button class="btn" @click="clearToken">
            清除 Token
          </button>
        </div>
        <p class="status-text" v-if="adminToken">
          当前已登录 Token：
          <code>{{ adminTokenPreview }}</code>
        </p>
        <p class="status-text warn" v-else>
          尚未设置 Token，无法调用后台接口。
        </p>
      </section>

      <!-- 创建作品（包含上传） -->
      <section class="card">
        <h2 class="card-title">2. 创建作品（自动上传文件）</h2>
        <p class="card-desc">
          选择作品类型、填写基础信息并选择文件。点击“创建作品”后，前端会先做
          <strong>大小 / 格式</strong>
          校验，再将文件和元数据一并提交给后端，完成“上传 + 创建”。
        </p>

        <div class="form-row">
          <label class="label">作品类型</label>
          <select v-model="workType" class="input">
            <option value="image">图片</option>
            <option value="novel">小说</option>
            <option value="game">游戏</option>
          </select>
        </div>

        <div class="form-row">
          <label class="label">标题</label>
          <input
            v-model="workTitle"
            type="text"
            class="input"
            placeholder="作品标题"
          />
        </div>

        <div class="form-row">
          <label class="label">简介</label>
          <textarea
            v-model="workDescription"
            class="input textarea"
            rows="3"
            placeholder="作品简介"
          ></textarea>
        </div>

        <div class="form-row">
          <label class="label">标签（逗号分隔）</label>
          <input
            v-model="workTagsInput"
            type="text"
            class="input"
            placeholder="例如：图片, 科幻, AI"
          />
        </div>

        <div class="form-row">
          <label class="label">
            选择文件
            <span class="hint">
              （{{ currentFileHint }}）
            </span>
          </label>
          <input type="file" @change="onFileChange" />
        </div>

        <p class="status-text" v-if="selectedFile">
          已选择文件：
          <code>{{ selectedFile.name }}</code>
          （{{ prettyFileSize }}）
        </p>

        <div class="form-actions">
          <button
            class="btn primary"
            @click="createWorkWithFile"
            :disabled="creating"
          >
            {{ creating ? "创建中..." : "创建作品" }}
          </button>
        </div>

        <p class="status-text" v-if="createError">
          创建失败：{{ createError }}
        </p>
      </section>

      <!-- 成功弹窗 -->
      <div v-if="showSuccessDialog" class="dialog-mask">
        <div class="dialog">
          <h3 class="dialog-title">创建成功</h3>
          <p class="dialog-body">
            作品已成功创建！<br />
            作品 ID：
            <code>{{ createdWorkId }}</code>
          </p>

          <div class="dialog-actions">
            <button class="btn" @click="resetForm">
              继续创建
            </button>

            <router-link to="/" class="btn primary">
              去首页查看
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";

// Admin Token 管理
const ADMIN_TOKEN_KEY = "ai_show_admin_token";

const adminToken = ref("");
const adminTokenInput = ref("");

const adminTokenPreview = computed(() => {
  if (!adminToken.value) return "";
  if (adminToken.value.length <= 4) return adminToken.value;
  return (
    adminToken.value.slice(0, 2) +
    "***" +
    adminToken.value.slice(-2)
  );
});

const loadTokenFromStorage = () => {
  const t = window.localStorage.getItem(ADMIN_TOKEN_KEY) || "";
  adminToken.value = t;
  adminTokenInput.value = t;
};

const saveToken = () => {
  adminToken.value = adminTokenInput.value.trim();
  window.localStorage.setItem(ADMIN_TOKEN_KEY, adminToken.value);
};

const clearToken = () => {
  adminToken.value = "";
  adminTokenInput.value = "";
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
};

// 创建作品相关
const workType = ref("image");
const workTitle = ref("");
const workDescription = ref("");
const workTagsInput = ref("");

const selectedFile = ref(null);

const creating = ref(false);
const createError = ref("");
const createdWorkId = ref("");
const showSuccessDialog = ref(false);

const currentFileHint = computed(() => {
  if (workType.value === "image") {
    return "建议：png/jpg/jpeg/webp，大小 ≤ 10MB";
  }
  if (workType.value === "novel") {
    return "建议：md/txt，大小 ≤ 2MB";
  }
  if (workType.value === "game") {
    return "建议：zip/html，大小 ≤ 50MB";
  }
  return "";
});

const prettyFileSize = computed(() => {
  if (!selectedFile.value) return "";
  const size = selectedFile.value.size;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
});

const onFileChange = (e) => {
  const files = e.target.files;
  if (files && files[0]) {
    selectedFile.value = files[0];
  } else {
    selectedFile.value = null;
  }
};

const validateFile = () => {
  if (!selectedFile.value) {
    return "请先选择文件。";
  }

  const file = selectedFile.value;
  const name = file.name.toLowerCase();
  const size = file.size;

  if (workType.value === "image") {
    const exts = [".png", ".jpg", ".jpeg", ".webp", ".gif"];
    if (!exts.some((ext) => name.endsWith(ext))) {
      return "图片作品建议使用：png/jpg/jpeg/webp/gif。";
    }
    if (size > 10 * 1024 * 1024) {
      return "图片文件大小不能超过 10MB。";
    }
  }

  if (workType.value === "novel") {
    const exts = [".md", ".txt"];
    if (!exts.some((ext) => name.endsWith(ext))) {
      return "小说作品建议使用：md 或 txt 文件。";
    }
    if (size > 2 * 1024 * 1024) {
      return "小说文件大小不能超过 2MB。";
    }
  }

  if (workType.value === "game") {
    const exts = [".zip", ".html", ".htm"];
    if (!exts.some((ext) => name.endsWith(ext))) {
      return "游戏建议上传 zip 包或 html 文件。";
    }
    if (size > 50 * 1024 * 1024) {
      return "游戏文件大小不能超过 50MB。";
    }
  }

  return "";
};

const resetForm = () => {
  showSuccessDialog.value = false;
  createdWorkId.value = "";
  workTitle.value = "";
  workDescription.value = "";
  workTagsInput.value = "";
  selectedFile.value = null;
  createError.value = "";
};

const createWorkWithFile = async () => {
  if (!adminToken.value) {
    createError.value = "请先设置 Admin Token。";
    return;
  }
  if (!workTitle.value.trim()) {
    createError.value = "标题不能为空。";
    return;
  }

  const fileErr = validateFile();
  if (fileErr) {
    createError.value = fileErr;
    return;
  }

  createError.value = "";
  createdWorkId.value = "";
  creating.value = true;

  try {
    const formData = new FormData();
    formData.append("type", workType.value);
    formData.append("title", workTitle.value.trim());
    formData.append("description", workDescription.value.trim());
    formData.append("tags", workTagsInput.value);
    formData.append("file", selectedFile.value);

    const res = await axios.post(
      "/api/admin/works/upload-and-create",
      formData,
      {
        headers: {
          "x-admin-token": adminToken.value,
          "Content-Type": "multipart/form-data"
        }
      }
    );

    if (res.data.success) {
      createdWorkId.value = res.data.data.id;
      showSuccessDialog.value = true;
    } else {
      createError.value =
        res.data.message || "创建失败（后端返回非 success）";
    }
  } catch (e) {
    createError.value = e?.message || "创建失败（请求异常）";
  } finally {
    creating.value = false;
  }
};

onMounted(() => {
  loadTokenFromStorage();
});
</script>

<style scoped>
.page {
  min-height: 100vh;
}

.page-inner {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 16px 40px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 16px;
  gap: 16px;
}

.page-title {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
}

.page-subtitle {
  margin: 6px 0 0;
  color: #6b7280;
  font-size: 13px;
}

.link-home a {
  font-size: 13px;
  color: #2563eb;
  text-decoration: none;
}

.link-home a:hover {
  text-decoration: underline;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px 16px 18px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
  margin-bottom: 18px;
}

.card-title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
}

.card-desc {
  margin: 0 0 12px;
  color: #6b7280;
  font-size: 13px;
}

.form-row {
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
}

.hint {
  font-weight: 400;
  color: #9ca3af;
  font-size: 12px;
  margin-left: 4px;
}

.input {
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 6px 10px;
  font-size: 14px;
  outline: none;
}

.input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.3);
}

.textarea {
  resize: vertical;
  min-height: 70px;
}

.form-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}

.btn {
  border-radius: 8px;
  border: 1px solid #d1d5db;
  padding: 6px 12px;
  font-size: 14px;
  background: #f9fafb;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn:hover {
  background: #f3f4f6;
}

.btn.primary {
  background: #2563eb;
  border-color: #2563eb;
  color: #ffffff;
}

.btn.primary:hover {
  background: #1d4ed8;
}

.status-text {
  margin-top: 8px;
  font-size: 13px;
  color: #6b7280;
}

.status-text.warn {
  color: #b45309;
}

/* 成功弹窗 */
.dialog-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.dialog {
  background: white;
  border-radius: 14px;
  padding: 18px 20px 16px;
  width: 320px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.3);
}

.dialog-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 700;
}

.dialog-body {
  font-size: 14px;
  color: #374151;
  margin: 6px 0 14px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
