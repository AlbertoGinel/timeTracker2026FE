<script setup lang="ts">
import type { Activity } from '@/type/mainTypes'

defineProps<{
  activity: Activity
}>()
</script>

<template>
  <div class="activity-item">
    <div class="activity-icon" :style="{ backgroundColor: activity.color }">
      {{ activity.icon }}
    </div>
    <div class="activity-info">
      <h3 class="activity-name">{{ activity.name }}</h3>
      <div class="activity-details">
        <span class="detail">⚡ {{ activity.points_per_hour }} pts/hr</span>
        <span class="detail">⏱️ {{ Math.floor(activity.seconds_free / 60) }} min free</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.activity-item:hover {
  background: #f3f4f6;
  transform: translateX(4px);
}

.activity-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.activity-info {
  flex: 1;
}

.activity-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.activity-details {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.detail {
  font-size: 0.875rem;
  color: #666;
}
</style>
