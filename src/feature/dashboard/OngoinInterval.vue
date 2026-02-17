<script setup lang="ts">
import type { Interval } from '@/type/mainTypes'
import { useAuthStore } from '@/store/useAuthStore'
import { DateTime, Duration } from 'luxon'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{
  interval: Interval | null
  onStop: () => void
}>()

const authStore = useAuthStore()

const nowTick = ref(Date.now())
let timerId: number | undefined

onMounted(() => {
  timerId = window.setInterval(() => {
    nowTick.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timerId) {
    window.clearInterval(timerId)
  }
})

const formattedFrom = computed(() => {
  if (!props.interval) return ''
  const zone = authStore.currentUser?.timezone ?? 'UTC'
  return DateTime.fromISO(props.interval.fromDate, { zone: 'utc' })
    .setZone(zone)
    .toFormat('LLL dd, HH:mm')
})

const durationClock = computed(() => {
  if (!props.interval) return '00:00:00'
  const fromTime = DateTime.fromISO(props.interval.fromDate, { zone: 'utc' }).toMillis()
  const diffSeconds = Math.max(0, Math.floor((nowTick.value - fromTime) / 1000))
  return Duration.fromObject({ seconds: diffSeconds }).toFormat('hh:mm:ss')
})
</script>

<template>
  <div v-if="!interval" class="ongoing-empty">No ongoing interval</div>
  <button v-else type="button" class="ongoing-item" @click="onStop">
    <div class="ongoing-icon" :style="{ backgroundColor: interval.activity.color }">
      {{ interval.activity.icon }}
    </div>
    <div class="ongoing-content">
      <div class="ongoing-top">
        <span class="ongoing-activity">{{ interval.activity.name }}</span>
        <span class="ongoing-clock">⏱️ {{ durationClock }}</span>
      </div>
      <div class="ongoing-bottom">
        <span class="ongoing-time">🕐 {{ formattedFrom }}</span>
      </div>
    </div>
  </button>
</template>

<style scoped>
.ongoing-empty {
  padding: 0.75rem 0.5rem;
  text-align: center;
  color: #9ca3af;
}

.ongoing-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f9fafb;
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.ongoing-item:hover {
  background: #f3f4f6;
  transform: translateX(4px);
}

.ongoing-item:focus-visible {
  outline: 2px solid #667eea;
  outline-offset: 3px;
}

.ongoing-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
  color: white;
}

.ongoing-content {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.ongoing-top,
.ongoing-bottom {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
}

.ongoing-activity {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ongoing-time,
.ongoing-clock {
  font-size: 0.85rem;
  color: #666;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
</style>
