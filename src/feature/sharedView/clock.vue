<template>
  <div class="clock">
    <div class="clock-time">{{ formattedDateTime.time }}</div>
    <div class="clock-date">{{ formattedDateTime.date }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { DateTime } from 'luxon'
import { useAuthStore } from '@/store/useAuthStore'

defineOptions({
  name: 'ClockDisplay',
})

const authStore = useAuthStore()

const currentTime = ref(DateTime.now())
let intervalId: number | null = null

const formattedDateTime = computed(() => {
  const tz = authStore.currentContextUser?.timezone || 'UTC'
  const dt = currentTime.value.setZone(tz)
  return {
    time: dt.toFormat('HH:mm:ss'),
    date: dt.toFormat('EEEE, MMMM d, yyyy'),
  }
})

onMounted(() => {
  intervalId = setInterval(() => {
    currentTime.value = DateTime.now()
  }, 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<style scoped>
.clock {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.clock-time {
  font-size: 1.8rem;
  font-weight: 700;
  color: #667eea;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.05em;
}

.clock-date {
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
}
</style>
