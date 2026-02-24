<template>
  <div class="continuous-calendar">
    <!-- Calendar Grid: 7 weeks x 7 days -->
    <div class="calendar-grid">
      <div
        v-for="(week, weekIndex) in calendarGrid"
        :key="'week-' + weekIndex"
        class="calendar-week"
      >
        <div
          v-for="cell in week"
          :key="cell.dateKey"
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
          @click="handleCellClick(cell)"
        >
          <!-- Top row: Day Number with Month Label AND Regime Icon -->
          <div class="top-row">
            <div class="day-number">
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
          <div
            v-if="cell.percentageAchieved !== null && cell.achievedLevelIcon"
            class="achievement-row"
          >
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/store/useAuthStore'
import { useContinuousCalendar } from './continuousCalendar'

const authStore = useAuthStore()

// Use user's timezone from auth store
const timezone = computed(() => authStore.currentContextUser?.timezone || 'UTC')

const { calendarGrid, handleCellClick } = useContinuousCalendar(timezone.value)

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
.continuous-calendar {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.calendar-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.calendar-week {
  display: flex;
  gap: 4px;
}

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
