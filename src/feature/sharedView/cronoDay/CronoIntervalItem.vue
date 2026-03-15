<script setup lang="ts">
import { computed } from 'vue'
import type { TimelineBlock } from './useCronoDay'

const props = defineProps<{
  block: TimelineBlock
}>()

// Minimum widths for displaying elements
const MIN_WIDTH_FOR_ICON = 30
const MIN_WIDTH_FOR_LABELS = 60

// Check if interval is wide enough for icon
const showIcon = computed(() => props.block.width >= MIN_WIDTH_FOR_ICON)

// Check if interval is wide enough for time labels
const showLabels = computed(() => props.block.width >= MIN_WIDTH_FOR_LABELS)
</script>

<template>
  <g class="interval-block">
    <!-- Colored rectangle -->
    <rect
      :x="block.x"
      :y="30"
      :width="block.width"
      :height="20"
      :fill="block.color"
      class="block-rect"
      rx="2"
    />

    <!-- Start time label - only show if wide enough -->
    <text v-if="showLabels" :x="block.x + 2" :y="65" class="time-label time-label-start">
      {{ block.startLabel }}
    </text>

    <!-- End time label - only show if wide enough -->
    <text
      v-if="showLabels"
      :x="block.x + block.width - 2"
      :y="65"
      class="time-label time-label-end"
    >
      {{ block.endLabel }}
    </text>

    <!-- Activity icon (centered on block) - only show if wide enough -->
    <text
      v-if="showIcon && block.activityIcon"
      :x="block.x + block.width / 2"
      :y="43"
      class="activity-icon"
      :title="block.activityName"
    >
      {{ block.activityIcon }}
    </text>

    <!-- Activity name on hover (optional tooltip effect) -->
    <title>{{ block.activityName }} ({{ block.startLabel }} - {{ block.endLabel }})</title>
  </g>
</template>

<style scoped>
.block-rect {
  opacity: 0.85;
  transition: all 0.2s ease;
}

.block-rect:hover {
  opacity: 1;
  cursor: pointer;
  filter: brightness(1.1);
}

.time-label {
  font-size: 11px;
  fill: #4b5563;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  font-weight: 500;
  pointer-events: none;
  user-select: none;
}

.time-label-start {
  text-anchor: start;
}

.time-label-end {
  text-anchor: end;
}

.activity-icon {
  font-size: 14px;
  text-anchor: middle;
  dominant-baseline: middle;
  pointer-events: none;
  user-select: none;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}

.interval-block:hover .time-label {
  fill: #1f2937;
  font-weight: 600;
}

.interval-block:hover .activity-icon {
  font-size: 16px;
}
</style>
