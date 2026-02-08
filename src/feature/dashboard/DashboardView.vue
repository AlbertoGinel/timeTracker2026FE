<script setup lang="ts">
import { useAuthStore } from '@/store/useAuthStore'
import { useActivityStore } from '@/store/useActivityStore'
import ActivityItem from './components/ActivityItem.vue'

const authStore = useAuthStore()
const activityStore = useActivityStore()
</script>

<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>📊 Dashboard</h1>
      <p>
        Welcome back, <strong>{{ authStore.currentUser?.nickname }}</strong
        >!
      </p>
    </div>

    <div class="dashboard-content">
      <div class="card">
        <h2>Your Activities</h2>

        <div v-if="activityStore.isLoading" class="loading">Loading activities...</div>

        <div v-else-if="activityStore.error" class="error">
          {{ activityStore.error }}
        </div>

        <div v-else-if="activityStore.activities.length === 0" class="empty">
          No activities yet. Create your first activity!
        </div>

        <div v-else class="activities-list">
          <ActivityItem
            v-for="activity in activityStore.activities"
            :key="activity.id"
            :activity="activity"
          />
        </div>
      </div>

      <div class="card">
        <h2>Statistics</h2>
        <p>Your stats and progress will appear here</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 3rem;
}

.dashboard-header h1 {
  color: #333;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.dashboard-header p {
  color: #666;
  font-size: 1.2rem;
}

.dashboard-header strong {
  color: #667eea;
}

.dashboard-content {
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

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.loading,
.error,
.empty {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.error {
  color: #ef4444;
  background: #fef2f2;
  border-radius: 8px;
}

.empty {
  color: #9ca3af;
}
</style>
