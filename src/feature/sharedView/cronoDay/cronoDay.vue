<script setup lang="ts">
import { computed } from 'vue'
import { useCronoDayState } from './useCronoDayState'
import { useAuthStore } from '@/store/useAuthStore'
import CronoDayTimeline from './CronoDayTimeline.vue'
import type { TimelineInterval } from './useCronoDay'

const props = withDefaults(
  defineProps<{
    intervals?: TimelineInterval[]
    width?: number
    height?: number
    mode?: 'view' | 'edit'
  }>(),
  {
    width: 1200,
    height: 100,
    mode: 'view',
  },
)

const authStore = useAuthStore()
const timezone = computed(() => authStore.currentContextUser?.timezone || 'UTC')

// Only use state management in view mode
const cronoDayState = props.mode === 'view' ? useCronoDayState(timezone.value) : null

// Use provided intervals or fetch from state (view mode only)
const displayIntervals = computed(() => {
  if (props.mode === 'edit') {
    return props.intervals ?? []
  }
  return cronoDayState?.selectedDayIntervals.value ?? []
})
</script>

<template>
  <div class="crono-day-container">
    <!-- Date selector - only show in view mode -->
    <div v-if="mode === 'view' && cronoDayState" class="debug-area">
      <div class="debug-content">
        <button @click="cronoDayState.goToPreviousDay" class="nav-button">←</button>
        <div class="date-display">
          <span class="date-label">{{ cronoDayState.selectedDateDisplay }}</span>
          <span v-if="cronoDayState.isToday" class="today-badge">Today</span>
        </div>
        <button @click="cronoDayState.goToNextDay" class="nav-button">→</button>
        <button
          v-if="!cronoDayState.isToday"
          @click="cronoDayState.resetToToday"
          class="today-button"
        >
          Go to Today
        </button>
      </div>
      <div class="date-key">Date key: {{ cronoDayState.selectedDateKey }}</div>
    </div>

    <!-- Timeline visualization -->
    <CronoDayTimeline :intervals="displayIntervals" :width="width" :height="height" :mode="mode" />
  </div>
</template>

<style scoped>
.crono-day-container {
  width: 100%;
}

.debug-area {
  padding: 0.75rem 1rem;
  background: #f3f4f6;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
}

.debug-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.date-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.date-label {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.today-badge {
  background: #3b82f6;
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.date-key {
  font-size: 0.75rem;
  color: #6b7280;
  font-family: monospace;
}

.nav-button {
  padding: 0.375rem 0.75rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.nav-button:hover {
  background: #f9fafb;
  border-color: #3b82f6;
}

.today-button {
  padding: 0.375rem 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.today-button:hover {
  background: #2563eb;
}
</style>
