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
          }"
          @click="handleCellClick(cell)"
        >
          <!-- Day Number with Month Label in top left corner -->
          <div class="day-number">
            <span v-if="cell.monthLabel" class="month-label"
              >{{ cell.dayNumber }} {{ cell.monthLabel }}</span
            >
            <span v-else>{{ cell.dayNumber }}</span>
          </div>

          <!-- Regime Info -->
          <div v-if="cell.regimeIcon && cell.regimeName" class="regime-info">
            <span class="regime-icon">{{ cell.regimeIcon }}</span>
            <span class="regime-name">{{ cell.regimeName }}</span>
          </div>
          <div v-else-if="cell.day && !cell.regimeIcon" class="regime-info">
            <span class="no-regime">No Regime</span>
          </div>

          <!-- Points with Star Icon -->
          <div v-if="cell.points > 0" class="points-info">
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
const timezone = computed(() => authStore.currentUser?.timezone || 'UTC')

const { calendarGrid, handleCellClick } = useContinuousCalendar(timezone.value)
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
  gap: 2px;
  box-sizing: border-box;
}

.calendar-cell.is-today {
  box-shadow: inset 0 0 0 3px #4a90e2;
}

.day-number {
  font-size: 10px;
  font-weight: 600;
  color: #333;
  width: 100%;
  text-align: left;
}

.month-label {
  font-weight: bold;
  color: #666;
  letter-spacing: 0.3px;
}

.regime-info {
  display: flex;
  align-items: center;
  gap: 2px;
  width: 100%;
}

.regime-icon {
  font-size: 12px;
  line-height: 1;
}

.regime-name {
  font-size: 8px;
  color: #555;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
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
