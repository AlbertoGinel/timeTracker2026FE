<script setup lang="ts">
import type { Regime } from '@/type/mainTypes'
import { computed } from 'vue'

const props = defineProps<{
  regime: Regime
}>()

const formattedPoints = computed(() => {
  return Math.round(props.regime.totalPoints)
})

const hasIntervals = computed(() => {
  return props.regime.intervals.length > 0
})

// Group intervals by activity and sum durations
const activitySummaries = computed(() => {
  const activityMap = new Map<
    string,
    { icon: string; name: string; color: string; durationMs: number }
  >()

  props.regime.intervals.forEach((interval) => {
    const existing = activityMap.get(interval.activityId)
    if (existing) {
      existing.durationMs += interval.durationMs
    } else {
      activityMap.set(interval.activityId, {
        icon: interval.activity.icon,
        name: interval.activity.name,
        color: interval.activity.color,
        durationMs: interval.durationMs,
      })
    }
  })

  return Array.from(activityMap.values()).map((activity) => ({
    ...activity,
    formattedDuration: `${Math.floor(activity.durationMs / (1000 * 60 * 60))}h`,
  }))
})
</script>

<template>
  <div class="regime-item" :class="{ 'regime-item--holiday': regime.isHoliday }">
    <div class="regime-header">
      <span class="regime-name"> {{ regime.icon }} {{ regime.name }} </span>
      <span class="regime-points">⭐ {{ formattedPoints }}</span>
    </div>

    <div v-if="hasIntervals" class="regime-activities">
      <div v-for="activity in activitySummaries" :key="activity.name" class="regime-activity">
        {{ activity.icon }} {{ activity.name }} ({{ activity.formattedDuration }})
      </div>
    </div>
    <div v-else class="regime-empty">No intervals</div>
  </div>
</template>

<style scoped>
.regime-item {
  background: #f9fafb;
  border-radius: 8px;
  padding: 0.75rem;
  transition: all 0.15s ease;
  border: 1px solid transparent;
}

.regime-item:hover {
  background: #f3f4f6;
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.regime-item--holiday {
  background: #fef3c7;
}

.regime-item--holiday:hover {
  background: #fde68a;
  border-color: #f59e0b;
}

.regime-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.95rem;
  color: #1f2937;
}

.regime-name {
  flex: 1;
}

.regime-points {
  font-size: 0.9rem;
  color: #6b7280;
  white-space: nowrap;
}

.regime-activities {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: #4b5563;
}

.regime-activity {
  line-height: 1.4;
}

.regime-empty {
  font-size: 0.85rem;
  color: #9ca3af;
  font-style: italic;
}
</style>
