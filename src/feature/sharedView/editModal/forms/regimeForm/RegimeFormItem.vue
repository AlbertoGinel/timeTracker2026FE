<script setup lang="ts">
import { computed } from 'vue'
import type { RegimeWithId } from './useRegimeForm'
import cronoDay from '@/feature/sharedView/cronoDay/cronoDay.vue'
import IntervalEditItem from '@/feature/sharedView/cronoDay/IntervalEditItem.vue'
import { useActivityStore } from '@/store/useActivityStore'

interface Props {
  regime: RegimeWithId
  index: number
  canDelete: boolean
  errors: {
    name: string | null
    icon: string | null
  }
}

interface Emits {
  (e: 'update:name', value: string): void
  (e: 'update:icon', value: string): void
  (e: 'update:intervalStartTime', intervalId: string, value: string): void
  (e: 'update:intervalEndTime', intervalId: string, value: string): void
  (e: 'update:intervalActivity', intervalId: string, value: string): void
  (e: 'delete:interval', intervalId: string): void
  (e: 'delete'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const activityStore = useActivityStore()
const activities = computed(() => activityStore.activities)

const handleIntervalStartTimeUpdate = (intervalId: string, value: string) => {
  emit('update:intervalStartTime', intervalId, value)
}

const handleIntervalEndTimeUpdate = (intervalId: string, value: string) => {
  emit('update:intervalEndTime', intervalId, value)
}

const handleIntervalActivityUpdate = (intervalId: string, value: string) => {
  emit('update:intervalActivity', intervalId, value)
}

const handleIntervalDelete = (intervalId: string) => {
  emit('delete:interval', intervalId)
}
</script>

<template>
  <div class="regime-item">
    <div class="regime-header">
      <span class="regime-number">#{{ index + 1 }}</span>
      <div class="regime-actions">
        <button
          type="button"
          @click="emit('delete')"
          :disabled="!canDelete"
          class="btn-delete"
          title="Delete regime"
        >
          ×
        </button>
      </div>
    </div>

    <div class="regime-fields">
      <!-- Icon Field -->
      <div class="field">
        <label :for="`icon-${regime.id}`" class="field-label">
          Icon (emoji)
          <span class="required">*</span>
        </label>
        <input
          :id="`icon-${regime.id}`"
          type="text"
          :value="regime.icon"
          @input="(e) => emit('update:icon', (e.target as HTMLInputElement).value)"
          maxlength="2"
          placeholder="💼"
          class="input"
          :class="{ 'input-error': errors.icon }"
        />
        <span v-if="errors.icon" class="error-message">{{ errors.icon }}</span>
        <span v-else class="field-hint">Enter a single emoji</span>
      </div>

      <!-- Name Field -->
      <div class="field field-grow">
        <label :for="`name-${regime.id}`" class="field-label">
          Name
          <span class="required">*</span>
        </label>
        <input
          :id="`name-${regime.id}`"
          type="text"
          :value="regime.name"
          @input="(e) => emit('update:name', (e.target as HTMLInputElement).value)"
          maxlength="50"
          placeholder="Workday"
          class="input"
          :class="{ 'input-error': errors.name }"
        />
        <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
      </div>
    </div>

    <!-- Timeline Editor -->
    <div class="timeline-section">
      <cronoDay mode="edit" :intervals="regime.intervals" :width="1000" :height="80" />
    </div>

    <!-- Intervals List -->
    <div class="intervals-section">
      <h4 class="section-title">Intervals</h4>
      <div v-if="regime.intervals.length === 0" class="empty-message">
        No intervals yet. Add one to get started.
      </div>
      <IntervalEditItem
        v-for="(interval, intervalIndex) in regime.intervals"
        :key="interval.intervalId"
        :interval="interval"
        :activities="activities"
        :index="intervalIndex"
        @update:startTime="(value) => handleIntervalStartTimeUpdate(interval.intervalId, value)"
        @update:endTime="(value) => handleIntervalEndTimeUpdate(interval.intervalId, value)"
        @update:activityId="(value) => handleIntervalActivityUpdate(interval.intervalId, value)"
        @delete="handleIntervalDelete(interval.intervalId)"
      />
    </div>
  </div>
</template>

<style scoped>
.regime-item {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.2s;
}

.regime-item:hover {
  border-color: #4a90e2;
}

.regime-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.regime-number {
  font-weight: 600;
  color: #4a90e2;
  font-size: 14px;
}

.regime-actions {
  display: flex;
  gap: 8px;
}

.btn-delete {
  background: none;
  border: none;
  color: #e74c3c;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-delete:hover:not(:disabled) {
  color: #c0392b;
  transform: scale(1.2);
}

.btn-delete:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.regime-fields {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 16px;
  align-items: start;
}

.field {
  display: flex;
  flex-direction: column;
}

.field-grow {
  flex: 1;
}

.field-checkbox {
  padding-top: 20px;
}

.field-label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #555;
}

.required {
  color: #e74c3c;
}

.input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s;
}

.input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.input-error {
  border-color: #e74c3c;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.field-hint {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

.timeline-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.intervals-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.empty-message {
  padding: 16px;
  text-align: center;
  color: #999;
  font-size: 13px;
  background: #f9f9f9;
  border-radius: 4px;
  border: 1px dashed #ddd;
}

.error-message {
  font-size: 11px;
  color: #e74c3c;
  margin-top: 4px;
}
</style>
