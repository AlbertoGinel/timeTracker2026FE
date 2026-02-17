<script setup lang="ts">
import type { Activity } from '@/type/mainTypes'

defineProps<{
  activity: Activity
}>()
</script>

<template>
  <div class="activity-item">
    <span class="activity-icon" :style="{ backgroundColor: activity.color }">
      {{ activity.icon }}
    </span>
    <span class="activity-info">
      {{ activity.name }} ⚡ {{ activity.points_per_hour }} pts/hr ⏱️
      {{ Math.floor(activity.seconds_free / 60) }} min free
    </span>
  </div>
</template>

<style scoped>
.activity-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
  transition: all 0.15s ease;
  border: 1px solid transparent;
  font-size: 0.9rem;
  color: #1f2937;
  line-height: 1.4;
}

.activity-item:hover {
  background: #f3f4f6;
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.activity-info {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
