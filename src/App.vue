<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
</script>

<template>
  <div class="app">
    <Sidebar />

    <div class="content">
      <Header />

      <main class="main">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$app-bg: #f4f4f8;
$content-width: 1100px;

.app {
  display: flex;
  min-height: 100vh;
  background: $app-bg;
  color: #222;
}

.content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.main {
  flex: 1;
  overflow: auto;
  padding: 32px 40px;
  display: flex;
  justify-content: center;
}

.main > * {
  width: 100%;
  max-width: $content-width;
}
</style>
