<script setup lang="ts">
import { computed } from 'vue'
import type { ScaleLevel } from '@/type/mainTypes'
import { useScaleForm } from './useScaleForm'
import EditLevelItem from './EditLevelItem.vue'

interface Props {
  initialScale?: ScaleLevel[]
  mode?: 'new' | 'edit'
}

interface Emits {
  (e: 'save', scale: ScaleLevel[]): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'new',
})

const emit = defineEmits<Emits>()

const {
  levels,
  isValid,
  hasLevels,
  hasChanges,
  addLevel,
  removeLevel,
  updateLevel,
  sortLevels,
  validateAll,
  getError,
  getScaleData,
} = useScaleForm(props.initialScale)

const canDelete = computed(() => levels.value.length > 1)

const handleSave = () => {
  if (validateAll()) {
    emit('save', getScaleData())
  }
}

const handleCancel = () => {
  emit('cancel')
}

const getFieldErrors = (index: number) => {
  return {
    name: getError(index, 'name'),
    color: getError(index, 'color'),
    icon: getError(index, 'icon'),
    percent: getError(index, 'percent'),
  }
}
</script>

<template>
  <div class="scale-form">
    <div class="form-header">
      <h2 class="form-title">{{ mode === 'new' ? 'Create Scale' : 'Edit Scale' }}</h2>
      <p class="form-description">
        Define the performance levels for your scale. Each level represents a performance tier.
        Levels are automatically sorted by percentage (highest to lowest).
      </p>
    </div>

    <div class="form-content">
      <div v-if="!hasLevels" class="empty-state">
        <p>No scale levels defined. Add at least one level to continue.</p>
      </div>

      <div v-else class="levels-list">
        <EditLevelItem
          v-for="(level, index) in levels"
          :key="level.id"
          :level="level"
          :index="index"
          :can-delete="canDelete"
          :errors="getFieldErrors(index)"
          @update:name="(value) => updateLevel(index, 'name', value)"
          @update:color="(value) => updateLevel(index, 'color', value)"
          @update:icon="(value) => updateLevel(index, 'icon', value)"
          @update:percent="(value) => updateLevel(index, 'percent', value)"
          @percent-blur="sortLevels"
          @delete="removeLevel(index)"
        />
      </div>

      <button type="button" @click="addLevel" class="btn btn-add">+ Add Scale Level</button>
    </div>

    <div class="form-footer">
      <button type="button" @click="handleCancel" class="btn btn-secondary">Cancel</button>
      <button
        type="button"
        @click="handleSave"
        :disabled="!isValid || !hasChanges"
        class="btn btn-primary"
      >
        {{ mode === 'new' ? 'Create' : 'Save Changes' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.scale-form {
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

.levels-list {
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
