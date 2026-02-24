<template>
  <div
    class="calendar-cell"
    :class="{
      'is-today': cell.isToday,
      'has-regime': cell.regimeIcon,
    }"
    :style="{
      backgroundColor:
        !cell.isFuture && cell.achievedLevelColor
          ? hexToRgba(cell.achievedLevelColor, 0.5)
          : undefined,
    }"
    @click="$emit('click', cell)"
  >
    <!-- Top row: Day Number with Month Label AND Regime Icon -->
    <div class="top-row">
      <div class="day-number" :style="{ color: dayNumberColor }">
        <span v-if="cell.monthLabel" class="month-label"
          >{{ cell.dayNumber }} {{ cell.monthLabel }}</span
        >
        <span v-else>{{ cell.dayNumber }}</span>
      </div>
      <div v-if="cell.regimeIcon" class="regime-icon-top">
        {{ cell.regimeIcon }}
      </div>
    </div>

    <!-- Achievement row: percentage + achievement icon -->
    <div v-if="cell.percentageAchieved !== null && cell.achievedLevelIcon" class="achievement-row">
      <span class="percentage">{{ Math.round(cell.percentageAchieved) }}%</span>
      <span class="achievement-icon" :style="{ color: cell.achievedLevelColor || '#333' }">{{
        cell.achievedLevelIcon
      }}</span>
    </div>

    <!-- Regime name fallback for future days or days without percentage -->
    <div v-else-if="cell.regimeIcon && cell.regimeName" class="regime-name-row">
      <span class="regime-name">{{ cell.regimeName }}</span>
    </div>

    <!-- No regime indicator -->
    <div v-else-if="cell.day && !cell.regimeIcon" class="no-regime-row">
      <span class="no-regime">No Regime</span>
    </div>

    <!-- Points with Star Icon -->
    <div v-if="cell.day && !cell.isFuture && !cell.isHoliday" class="points-info">
      <span class="star-icon">⭐</span>
      <span class="points">{{ cell.points }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CalendarCell } from './continuousCalendar'

const props = defineProps<{
  cell: CalendarCell
  variant?: 'default' | 'admin'
}>()

defineEmits<{
  click: [cell: CalendarCell]
}>()

// Compute day number color for admin variant
const dayNumberColor = computed(() => {
  if (props.variant !== 'admin') return undefined

  // Green if shelved
  if (props.cell.day?.isShelved === true) {
    return '#10b981' // green-500
  }

  // Blue if not materialized (no day data or id is null)
  if (!props.cell.day || props.cell.day.id === null) {
    return '#3b82f6' // blue-500
  }

  // Black otherwise
  return '#000000'
})

// Convert hex color to rgba with opacity
const hexToRgba = (hex: string | null, opacity: number): string => {
  if (!hex) return 'transparent'

  // Remove # if present
  hex = hex.replace('#', '')

  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}
</script>

<style scoped>
.calendar-cell {
  width: 53px;
  height: 53px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 2px 4px;
  position: relative;
  cursor: pointer;
  background-color: #fafafa;
  gap: 0px;
  box-sizing: border-box;
}

.calendar-cell.is-today {
  box-shadow: inset 0 0 0 3px #4a90e2;
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 1px;
}

.day-number {
  font-size: 10px;
  font-weight: 600;
  color: #333;
  text-align: left;
  line-height: 1;
}

.month-label {
  font-weight: bold;
  color: #666;
  letter-spacing: 0.3px;
}

.regime-icon-top {
  font-size: 14px;
  line-height: 1;
}

.achievement-row {
  display: flex;
  align-items: center;
  gap: 3px;
  width: 100%;
  margin-bottom: 1px;
}

.percentage {
  font-size: 10px;
  color: #333;
  font-weight: 600;
  line-height: 1;
}

.achievement-icon {
  font-size: 12px;
  line-height: 1;
}

.regime-name-row {
  display: flex;
  width: 100%;
  margin-bottom: 1px;
}

.regime-name {
  font-size: 8px;
  color: #555;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-regime-row {
  display: flex;
  width: 100%;
  margin-bottom: 1px;
}

.no-regime {
  font-size: 8px;
  color: #999;
  font-style: italic;
  font-weight: 400;
}

.points-info {
  display: flex;
  align-items: center;
  gap: 2px;
  width: 100%;
  margin-top: auto;
}

.star-icon {
  font-size: 10px;
  line-height: 1;
}

.points {
  font-size: 10px;
  font-weight: 600;
  color: #333;
}
</style>
