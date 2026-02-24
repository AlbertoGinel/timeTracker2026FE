<template>
  <div
    class="time-section-item"
    :style="{
      backgroundColor: week?.achievedLevel?.color
        ? hexToRgba(week.achievedLevel.color, 0.5)
        : '#f5f5f5',
    }"
  >
    <div class="week-label">{{ sectionKey }}</div>
    <div v-if="week?.achievedLevel?.icon" class="level-icon">
      {{ week.achievedLevel.icon }}
    </div>
    <div v-else class="debug-text">No icon: {{ week ? 'has week' : 'no week' }}</div>
    <div v-if="week && week.percentageAchieved !== null" class="percentage">
      {{ Math.round(week.percentageAchieved) }}%
    </div>
    <div v-else class="debug-text">
      {{ week ? `%: ${week.percentageAchieved}` : 'no week data' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TimeSection } from '@/type/mainTypes'

defineProps<{
  sectionKey: string
  week: TimeSection | undefined
}>()

// Convert hex color to rgba with opacity
const hexToRgba = (hex: string, opacity: number): string => {
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
.time-section-item {
  width: 53px;
  height: 53px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px;
  gap: 2px;
  box-sizing: border-box;
}

.week-label {
  font-size: 9px;
  font-weight: 600;
  color: #666;
  text-align: center;
  line-height: 1.1;
}

.level-icon {
  font-size: 16px;
  line-height: 1;
}

.percentage {
  font-size: 10px;
  font-weight: 700;
  color: #333;
  text-align: center;
}

.debug-text {
  font-size: 8px;
  color: #999;
  text-align: center;
  line-height: 1.1;
}
</style>
