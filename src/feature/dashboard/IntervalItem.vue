<script setup lang="ts">
import type { Interval } from '@/type/mainTypes'
import { useAuthStore } from '@/store/useAuthStore'
import { DateTime, Duration } from 'luxon'
import { computed } from 'vue'

const props = defineProps<{
  interval: Interval
}>()

const authStore = useAuthStore()

const formattedFrom = computed(() => {
  const zone = authStore.currentUser?.timezone ?? 'UTC'
  return DateTime.fromISO(props.interval.fromDate, { zone }).toFormat('LLL dd, HH:mm')
})

const formattedTo = computed(() => {
  if (!props.interval.toDate) return 'Ongoing'
  const zone = authStore.currentUser?.timezone ?? 'UTC'
  return DateTime.fromISO(props.interval.toDate, { zone }).toFormat('LLL dd, HH:mm')
})

const durationLabel = computed(() => {
  const totalSeconds = Math.max(0, props.interval.duration)
  return Duration.fromObject({ seconds: totalSeconds }).toFormat('hh:mm:ss')
})
</script>

<template>
  <div class="interval-item">
    <div class="interval-icon" :style="{ backgroundColor: interval.activity.color }">
      {{ interval.activity.icon }}
    </div>
    <div class="interval-content">
      <div class="interval-top">
        <span class="interval-activity">{{ interval.activity.name }}</span>
        <span class="interval-duration">⏱️ {{ durationLabel }}</span>
      </div>
      <div class="interval-bottom">
        <span class="interval-time">🕐 {{ formattedFrom }} → {{ formattedTo }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.interval-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.interval-item:hover {
  background: #f3f4f6;
  transform: translateX(4px);
}

.interval-icon {
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

.interval-content {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.interval-top,
.interval-bottom {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
}

.interval-activity {
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
}

.interval-time,
.interval-duration {
  font-size: 0.85rem;
  color: #666;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
</style>
