<script setup lang="ts">
import type { Day } from '@/type/mainTypes'
import { DateTime } from 'luxon'
import { computed } from 'vue'

const props = defineProps<{
  day: Day
}>()

const formattedDate = computed(() => {
  return DateTime.fromISO(props.day.dateKey, { zone: props.day.timezone }).toFormat('LLL dd, yyyy')
})

const formattedDuration = computed(() => {
  const hours = Math.floor(props.day.totalDurationMs / (1000 * 60 * 60))
  const minutes = Math.floor((props.day.totalDurationMs % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
})

const formattedPoints = computed(() => {
  return Math.round(props.day.totalPoints)
})

const hasData = computed(() => {
  return props.day.intervals.length > 0
})
</script>

<template>
  <div class="day-item" :class="{ 'day-item--empty': !hasData }">
    <div class="day-header">
      <span class="day-date">📅 {{ formattedDate }}</span>
    </div>
    <div v-if="hasData" class="day-content">
      <div class="day-stat">
        <span class="day-stat-label">Duration</span>
        <span class="day-stat-value">⏱️ {{ formattedDuration }}</span>
      </div>
      <div class="day-stat">
        <span class="day-stat-label">Points</span>
        <span class="day-stat-value">⭐ {{ formattedPoints }}</span>
      </div>
      <div class="day-activities">
        <div
          v-for="activityTotal in day.activityTotals"
          :key="activityTotal.activityId"
          class="day-activity"
        >
          <span
            class="day-activity-icon"
            :style="{ backgroundColor: activityTotal.activity.color }"
          >
            {{ activityTotal.activity.icon }}
          </span>
          <span class="day-activity-info">
            ⏱️ {{ Math.floor(activityTotal.durationMs / (1000 * 60 * 60)) }}h
            {{ Math.floor((activityTotal.durationMs % (1000 * 60 * 60)) / (1000 * 60)) }}m ⭐
            {{ Math.round(activityTotal.pointsTotal) }}
          </span>
        </div>
      </div>
    </div>
    <div v-else class="day-empty">
      <span>No activity</span>
    </div>
  </div>
</template>

<style scoped>
.day-item {
  background: #f9fafb;
  border-radius: 8px;
  padding: 0.75rem;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.day-item:hover {
  background: #f3f4f6;
  border-color: #e5e7eb;
}

.day-item--empty {
  opacity: 0.6;
}

.day-header {
  margin-bottom: 0.5rem;
}

.day-date {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.day-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.day-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.day-stat-label {
  color: #666;
}

.day-stat-value {
  color: #333;
  font-weight: 500;
}

.day-activities {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 0.5rem;
}

.day-activity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.day-activity-icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  flex-shrink: 0;
  color: white;
}

.day-activity-info {
  font-size: 0.8rem;
  color: #666;
}

.day-empty {
  text-align: center;
  color: #9ca3af;
  font-size: 0.85rem;
  padding: 0.5rem 0;
}
</style>
