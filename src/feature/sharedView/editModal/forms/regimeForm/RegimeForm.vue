<script setup lang="ts">
import { computed } from 'vue'
import type { Regime } from '@/type/mainTypes'
import { useRegimeForm } from './useRegimeForm'
import RegimeFormItem from './RegimeFormItem.vue'

interface Props {
  initialRegimes?: Regime[]
}

interface Emits {
  (e: 'save', regimes: Array<{ name: string; icon: string }>): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const {
  regimes,
  isValid,
  hasRegimes,
  hasChanges,
  addRegime,
  removeRegime,
  updateRegime,
  updateIntervalStartTime,
  updateIntervalEndTime,
  updateIntervalActivity,
  deleteInterval,
  validateAll,
  getError,
  getRegimeData,
} = useRegimeForm(props.initialRegimes)

const canDelete = computed(() => regimes.value.length > 1)

const handleSave = () => {
  if (validateAll()) {
    emit('save', getRegimeData())
  }
}

const handleCancel = () => {
  emit('cancel')
}

const getFieldErrors = (index: number) => {
  return {
    name: getError(index, 'name'),
    icon: getError(index, 'icon'),
  }
}
</script>

<template>
  <div class="regime-form">
    <div class="form-header">
      <h2 class="form-title">Manage Regimes</h2>
      <p class="form-description">
        Define regime templates for your days. Each regime represents a type of day (workday,
        holiday, etc.).
      </p>
    </div>

    <div class="form-content">
      <div v-if="!hasRegimes" class="empty-state">
        <p>No regimes defined. Add at least one regime to continue.</p>
      </div>

      <div v-else class="regimes-list">
        <RegimeFormItem
          v-for="(regime, index) in regimes"
          :key="regime.id"
          :regime="regime"
          :index="index"
          :can-delete="canDelete"
          :errors="getFieldErrors(index)"
          @update:name="(value: string) => updateRegime(index, 'name', value)"
          @update:icon="(value: string) => updateRegime(index, 'icon', value)"
          @update:intervalStartTime="
            (intervalId: string, value: string) => updateIntervalStartTime(index, intervalId, value)
          "
          @update:intervalEndTime="
            (intervalId: string, value: string) => updateIntervalEndTime(index, intervalId, value)
          "
          @update:intervalActivity="
            (intervalId: string, value: string) => updateIntervalActivity(index, intervalId, value)
          "
          @delete:interval="(intervalId: string) => deleteInterval(index, intervalId)"
          @delete="removeRegime(index)"
        />
      </div>

      <button type="button" @click="addRegime" class="btn btn-add">+ Add Regime</button>
    </div>

    <div class="form-footer">
      <button type="button" @click="handleCancel" class="btn btn-secondary">Cancel</button>
      <button
        type="button"
        @click="handleSave"
        :disabled="!isValid || !hasChanges"
        class="btn btn-primary"
      >
        Save Changes
      </button>
    </div>
  </div>
</template>

<style scoped>
.regime-form {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 600px;
  background: white;
}

.form-header {
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.form-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #222;
}

.form-description {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.form-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  min-height: 0;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: #999;
}

.regimes-list {
  margin-bottom: 24px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-add {
  width: 100%;
  background: #fff;
  border: 2px dashed #ccc;
  color: #666;
  padding: 16px;
}

.btn-add:hover {
  border-color: #4a90e2;
  color: #4a90e2;
  background: #f0f7ff;
}

.btn-primary {
  background: #4a90e2;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #357abd;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e0e0e0;
  flex-shrink: 0;
}
</style>
