<script setup lang="ts">
import { computed, type ComputedRef } from 'vue'
import { useCronoDay, type TimelineInterval } from './useCronoDay'
import CronoIntervalItem from './CronoIntervalItem.vue'

const props = withDefaults(
  defineProps<{
    intervals: TimelineInterval[]
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

// Convert intervals array to computed for useCronoDay
const intervalsComputed = computed(() => props.intervals) as ComputedRef<TimelineInterval[]>

const { hourLabels, timelineBlocks, padding } = useCronoDay(intervalsComputed, props.width, 50)
</script>

<template>
  <div class="crono-day-timeline-container">
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
.crono-day-timeline-container {
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
</style>
