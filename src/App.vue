<script setup lang="ts">
import { onMounted } from 'vue'
import MainNavbar from './feature/auth/MainNavbar.vue'
import { useAppInitializer } from '@/feature/initializer/useAppInitializer'

const { initializeApp } = useAppInitializer()

onMounted(async () => {
  await initializeApp()
})
</script>

<template>
  <div class="app">
    <MainNavbar />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  height: 100%;
}
</style>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.main-content {
  min-height: calc(100vh - 80px);
}
</style>
