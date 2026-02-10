<script setup lang="ts">
import type { StampWithActivity } from '@/type/mainTypes'
import { computed } from 'vue'

const props = defineProps<{
  stamp: StampWithActivity
}>()

const formattedTime = computed(() => {
  const date = new Date(props.stamp.timestamp)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const isStop = computed(() => props.stamp.type === 'stop')

const typeIcon = computed(() => {
  return props.stamp.type === 'start' ? '▶️' : '⏹️'
})

const iconBackground = computed(() => {
  return isStop.value ? '#9CA3AF' : props.stamp.activity?.color
})
</script>

<template>
  <div class="stamp-item">
    <div class="stamp-icon" :style="{ backgroundColor: iconBackground }">
      {{ isStop ? typeIcon : props.stamp.activity?.icon }}
    </div>
    <div class="stamp-line">
      <span class="stamp-activity">{{
        isStop ? 'STOP' : (stamp.activity?.name ?? 'No activity')
      }}</span>
      <span class="stamp-time">🕐 {{ formattedTime }}</span>
    </div>
  </div>
</template>

<style scoped>
.stamp-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.stamp-item:hover {
  background: #f3f4f6;
  transform: translateX(4px);
}

.stamp-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
  color: white;
}

.stamp-line {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
}

.stamp-activity {
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stamp-time,
.stamp-type {
  font-size: 0.85rem;
  color: #666;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
</style>
