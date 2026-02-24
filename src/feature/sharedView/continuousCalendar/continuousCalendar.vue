<template>
  <div class="continuous-calendar">
    <div class="calendar-container">
      <!-- Week Column -->
      <div class="week-column">
        <TimeSectionItem
          v-for="weekRow in weekRows"
          :key="weekRow.weekKey"
          :section-key="weekRow.weekKey"
          :week="weekRow.week"
        />
      </div>

      <!-- Vertical Separator -->
      <div class="separator"></div>

      <!-- Calendar Grid: 7 weeks x 7 days -->
      <div class="calendar-grid">
        <div
          v-for="(week, weekIndex) in calendarGrid"
          :key="'week-' + weekIndex"
          class="calendar-week"
        >
          <CalendarItem
            v-for="cell in week"
            :key="cell.dateKey"
            :cell="cell"
            :variant="variant"
            @click="handleCellClick"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/store/useAuthStore'
import { useContinuousCalendar } from './continuousCalendar'
import CalendarItem from './calendarItem.vue'
import TimeSectionItem from './timeSectionItem.vue'

defineProps<{
  variant?: 'default' | 'admin'
}>()

const authStore = useAuthStore()

// Use user's timezone from auth store
const timezone = computed(() => authStore.currentContextUser?.timezone || 'UTC')

const { calendarGrid, weekRows, handleCellClick } = useContinuousCalendar(timezone.value)
</script>

<style scoped>
.continuous-calendar {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.calendar-container {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.week-column {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.separator {
  width: 2px;
  background: #d1d5db;
  align-self: stretch;
  border-radius: 1px;
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
</style>
