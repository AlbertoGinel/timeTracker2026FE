<script setup lang="ts">
import { computed } from 'vue'
import { useCronoDay } from './useCronoDay'
import { useCronoDayState } from './useCronoDayState'
import { useAuthStore } from '@/store/useAuthStore'
import CronoIntervalItem from './CronoIntervalItem.vue'

const props = withDefaults(
  defineProps<{
    width?: number
    height?: number
  }>(),
  {
    width: 1200,
    height: 100,
  },
)

const authStore = useAuthStore()
const timezone = computed(() => authStore.currentContextUser?.timezone || 'UTC')

const {
  selectedDateKey,
  selectedDateDisplay,
  selectedDayIntervals,
  isToday,
  resetToToday,
  goToPreviousDay,
  goToNextDay,
} = useCronoDayState(timezone.value)

const { hourLabels, timelineBlocks, padding } = useCronoDay(selectedDayIntervals, props.width, 50)
</script>

<template>
  <!-- Debug area for selected day -->
  <div class="debug-area">
    <div class="debug-content">
      <button @click="goToPreviousDay" class="nav-button">←</button>
      <div class="date-display">
        <span class="date-label">{{ selectedDateDisplay }}</span>
        <span v-if="isToday" class="today-badge">Today</span>
      </div>
      <button @click="goToNextDay" class="nav-button">→</button>
      <button v-if="!isToday" @click="resetToToday" class="today-button">Go to Today</button>
    </div>
    <div class="date-key">Date key: {{ selectedDateKey }}</div>
  </div>

  <div class="crono-day-container">
    <svg :viewBox="`0 0 ${width} ${height}`" class="crono-day-timeline">
      <!-- Hour labels -->
      <g class="hour-labels">
        <text v-for="hour in hourLabels" :key="hour.value" :x="hour.x" :y="20" class="hour-text">
          {{ hour.label }}
        </text>
      </g>

      <!-- Timeline base line -->
      <line
        :x1="padding"
        :y1="40"
        :x2="width - padding"
        :y2="40"
        stroke="#d1d5db"
        stroke-width="2"
      />

      <!-- Time interval blocks -->
      <CronoIntervalItem v-for="(block, index) in timelineBlocks" :key="index" :block="block" />
    </svg>
  </div>
</template>

<style scoped>
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

.crono-day-container {
  width: 100%;
  overflow-x: auto;
  padding: 1rem 0;
}

.crono-day-timeline {
  display: block;
  width: 100%;
  height: auto;
}

.hour-text {
  font-size: 14px;
  fill: #2563eb;
  text-anchor: middle;
  font-weight: 600;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
}

/* Interval block styles are now in CronoIntervalItem.vue */
</style>
