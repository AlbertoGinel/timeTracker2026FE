<script setup lang="ts">
//import { useAuthStore } from '@/stores/useAuthStore'

//const authStore = useAuthStore()
</script>

<template>
  <div class="admin">
    <div class="admin-header">
      <h1>👑 Admin Panel</h1>
      <p>Manage users and system settings</p>
    </div>

    <div class="admin-content">
      <div class="card">
        <h2>User Management</h2>
        <p>User management features will be implemented here</p>
      </div>

      <div class="card">
        <h2>System Settings</h2>
        <p>System configuration options will appear here</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.admin-header {
  text-align: center;
  margin-bottom: 3rem;
}

.admin-header h1 {
  color: #333;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.admin-header p {
  color: #666;
  font-size: 1.2rem;
}

.admin-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card h2 {
  color: #333;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.card p {
  color: #666;
}
</style>
