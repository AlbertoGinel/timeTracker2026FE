<script setup lang="ts">
import { onMounted } from 'vue'
import MainNavbar from './features/auth/MainNavbar.vue'
import { useAppInitializer } from '@/features/auth/useAppInitializer'

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

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.main-content {
  min-height: calc(100vh - 80px);
}
</style>
