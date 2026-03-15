<script setup lang="ts">
import { useCronoDayState } from '@/feature/sharedView/cronoDay/useCronoDayState'

const { selectedDateKey, selectedDay, selectedDateDisplay } = useCronoDayState()
</script>

<template>
  <div>
    <h2>Edit Day</h2>
    <div style="padding: 16px">
      <p><strong>Selected Date Key:</strong> {{ selectedDateKey }}</p>
      <p><strong>Display:</strong> {{ selectedDateDisplay }}</p>
      <p><strong>Day Data:</strong> {{ selectedDay ? 'Loaded' : 'No data' }}</p>

      <div v-if="selectedDay" style="margin-top: 16px">
        <p><strong>Total Duration:</strong> {{ selectedDay.totalDurationMs }}ms</p>
        <p><strong>Intervals:</strong> {{ selectedDay.intervals?.length || 0 }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
h2 {
  margin: 0 0 16px 0;
  padding: 16px;
  border-bottom: 1px solid #ccc;
}

p {
  margin: 8px 0;
}
</style>
