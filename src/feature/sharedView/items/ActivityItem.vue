<script setup lang="ts">
import type { Activity } from '@/type/mainTypes'
import adminStyles from '@/styles/adminListItem.module.css'

const props = defineProps<{
  activity: Activity
  variant?: 'default' | 'admin'
  onClick?: (activity: Activity) => void
}>()

const handleClick = () => {
  if (props.variant === 'admin' && props.onClick) {
    props.onClick(props.activity)
  }
}
</script>

<template>
  <!-- Admin Variant: Simple List Style -->
  <div
    v-if="variant === 'admin'"
    :class="adminStyles.listItem"
    :style="{ '--item-color': activity.color, cursor: 'pointer' }"
    @click="handleClick"
  >
    <span :class="adminStyles.icon">{{ activity.icon }}</span>
    <span :class="adminStyles.content">{{ activity.name }}</span>
    <span :class="adminStyles.valueWide">⚡ {{ activity.points_per_hour }} pts/hr</span>
    <span :class="adminStyles.valueWide">⏱️ {{ Math.floor(activity.seconds_free / 60) }} min</span>
  </div>

  <!-- Default Variant: Full Layout -->
  <div v-else class="activity-item">
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
