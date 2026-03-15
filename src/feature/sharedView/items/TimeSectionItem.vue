<script setup lang="ts">
import type { TimeSection } from '@/type/mainTypes'
import { computed } from 'vue'
import adminStyles from '@/styles/adminListItem.module.css'

const props = defineProps<{
  timeSection: TimeSection
  variant?: 'default' | 'admin'
}>()

const percentageLabel = computed(() => {
  if (props.timeSection.percentageAchieved === null) return 'N/A'
  return `${Math.round(props.timeSection.percentageAchieved)}%`
})

const iconDisplay = computed(() => {
  return props.timeSection.achievedLevel?.icon ?? '·'
})

const colorDisplay = computed(() => {
  return props.timeSection.achievedLevel?.color ?? '#9CA3AF'
})
</script>

<template>
  <!-- Admin Variant: Simple List Style -->
  <div
    v-if="variant === 'admin'"
    :class="adminStyles.listItem"
    :style="{ '--item-color': colorDisplay }"
  >
    <span :class="adminStyles.icon">{{ iconDisplay }}</span>
    <span :class="adminStyles.content">{{ timeSection.sectionKey }}</span>
    <span :class="adminStyles.value">{{ percentageLabel }}</span>
  </div>

  <!-- Default Variant: Full Layout -->
  <div v-else class="time-section-item">
    <div class="time-section-icon" :style="{ backgroundColor: colorDisplay }">
      {{ iconDisplay }}
    </div>
    <div class="time-section-content">
      <div class="time-section-top">
        <span class="time-section-key">{{ timeSection.sectionKey }}</span>
        <span class="time-section-percentage">{{ percentageLabel }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.time-section-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem;
  background: #f9fafb;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.time-section-item:hover {
  background: #f3f4f6;
  transform: translateX(4px);
}

.time-section-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
  flex-shrink: 0;
}

.time-section-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.time-section-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.time-section-key {
  font-weight: 600;
  font-size: 0.9375rem;
  color: #1f2937;
}

.time-section-percentage {
  font-weight: 700;
  font-size: 0.875rem;
  color: #059669;
}
</style>
