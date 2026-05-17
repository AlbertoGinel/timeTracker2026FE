<script setup lang="ts">
import type { RegimeInterval, Activity } from '@/type/mainTypes'

interface Props {
  interval: RegimeInterval
  activities: Activity[]
  index: number
}

interface Emits {
  (e: 'update:startTime', value: string): void
  (e: 'update:endTime', value: string): void
  (e: 'update:activityId', value: string): void
  (e: 'delete'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <div class="interval-edit-item">
    <div class="interval-header">
      <span class="interval-number">#{{ index + 1 }}</span>
      <button type="button" @click="emit('delete')" class="btn-delete" title="Delete interval">
        ×
      </button>
    </div>

    <div class="interval-fields">
      <!-- Start Time -->
      <div class="field">
        <label :for="`start-${interval.intervalId}`" class="field-label">Start Time</label>
        <input
          :id="`start-${interval.intervalId}`"
          type="time"
          :value="interval.startTime"
          @input="(e) => emit('update:startTime', (e.target as HTMLInputElement).value)"
          class="input"
        />
      </div>

      <!-- End Time -->
      <div class="field">
        <label :for="`end-${interval.intervalId}`" class="field-label">End Time</label>
        <input
          :id="`end-${interval.intervalId}`"
          type="time"
          :value="interval.endTime"
          @input="(e) => emit('update:endTime', (e.target as HTMLInputElement).value)"
          class="input"
        />
      </div>

      <!-- Activity Dropdown -->
      <div class="field field-grow">
        <label :for="`activity-${interval.intervalId}`" class="field-label">Activity</label>
        <select
          :id="`activity-${interval.intervalId}`"
          :value="interval.activityId"
          @change="(e) => emit('update:activityId', (e.target as HTMLSelectElement).value)"
          class="input"
        >
          <option value="" disabled>Select activity</option>
          <option v-for="activity in activities" :key="activity.id" :value="activity.id">
            {{ activity.icon }} {{ activity.name }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<style scoped>
.interval-edit-item {
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
}

.interval-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.interval-number {
  font-weight: 600;
  color: #2563eb;
  font-size: 12px;
}

.btn-delete {
  background: none;
  border: none;
  color: #e74c3c;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-delete:hover {
  color: #c0392b;
  transform: scale(1.2);
}

.interval-fields {
  display: grid;
  grid-template-columns: 120px 120px 1fr;
  gap: 12px;
  align-items: end;
}

.field {
  display: flex;
  flex-direction: column;
}

.field-grow {
  flex: 1;
}

.field-label {
  display: block;
  margin-bottom: 4px;
  font-size: 11px;
  font-weight: 500;
  color: #555;
}

.input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  transition: all 0.2s;
}

.input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}
</style>
