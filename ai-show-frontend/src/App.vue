<template>
  <div class="app-root">
    <router-view />
  </div>
</template>

<script setup>
// 不需要额外逻辑，全部交给路由
</script>

<style>
body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #f5f5f7;
  color: #111827;
}

.app-root {
  min-height: 100vh;
}
</style>
