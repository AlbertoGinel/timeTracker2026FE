<script setup lang="ts">
import { useValidatedInput } from './useValidatedInput'
import type { ScaleLevelWithId } from './useScaleForm'

const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
const EMOJI_REGEX = /^[\p{Emoji}]$/u

interface Props {
  level: ScaleLevelWithId
  index: number
  canDelete: boolean
  errors: {
    name: string | null
    color: string | null
    icon: string | null
    percent: string | null
  }
}

interface Emits {
  (e: 'update:name', value: string): void
  (e: 'update:color', value: string): void
  (e: 'update:icon', value: string): void
  (e: 'update:percent', value: number): void
  (e: 'percent-blur'): void
  (e: 'delete'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Validators for each field
const isValidIcon = (value: string) => EMOJI_REGEX.test(value) && value.trim().length > 0
const isValidName = (value: string) => value.trim().length > 0 && value.length <= 50
const isValidColor = (value: string) => HEX_COLOR_REGEX.test(value)
const isValidPercent = (value: number) => !isNaN(value) && value >= 0 && value <= 100

// Validated inputs using composable
const iconInput = useValidatedInput(
  () => props.level.icon,
  isValidIcon,
  (value) => emit('update:icon', value),
)

const nameInput = useValidatedInput(
  () => props.level.name,
  isValidName,
  (value) => emit('update:name', value),
)

const colorInput = useValidatedInput(
  () => props.level.color,
  isValidColor,
  (value) => emit('update:color', value),
)

const percentInput = useValidatedInput(
  () => props.level.percent,
  isValidPercent,
  (value) => emit('update:percent', value),
)

// Handle percent input with number conversion
const handlePercentInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = parseFloat(target.value)
  percentInput.inputValue.value = isNaN(value) ? 0 : value
}

const handlePercentBlur = () => {
  percentInput.handleBlur()
  emit('percent-blur')
}
</script>

<template>
  <div class="level-item">
    <div class="level-header">
      <span class="level-number">#{{ index + 1 }}</span>
      <div class="level-actions">
        <button
          type="button"
          @click="emit('delete')"
          :disabled="!canDelete"
          class="btn-delete"
          title="Delete level"
        >
          ×
        </button>
      </div>
    </div>

    <div class="level-fields">
      <!-- Icon Field -->
      <div class="field">
        <label :for="`icon-${level.id}`" class="field-label">
          Icon (emoji)
          <span class="required">*</span>
        </label>
        <input
          :id="`icon-${level.id}`"
          type="text"
          :value="iconInput.inputValue.value"
          @input="iconInput.handleInput"
          @blur="iconInput.handleBlur"
          maxlength="2"
          placeholder="😊"
          class="input"
          :class="{ 'input-error': errors.icon }"
        />
        <span v-if="errors.icon" class="error-message">{{ errors.icon }}</span>
        <span v-else class="field-hint">Enter a single emoji</span>
      </div>

      <!-- Name Field -->
      <div class="field">
        <label :for="`name-${level.id}`" class="field-label">
          Name
          <span class="required">*</span>
        </label>
        <input
          :id="`name-${level.id}`"
          type="text"
          :value="nameInput.inputValue.value"
          @input="nameInput.handleInput"
          @blur="nameInput.handleBlur"
          maxlength="50"
          placeholder="amazing"
          class="input"
          :class="{ 'input-error': errors.name }"
        />
        <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
      </div>

      <!-- Color Field -->
      <div class="field">
        <label :for="`color-${level.id}`" class="field-label">
          Color (hex)
          <span class="required">*</span>
        </label>
        <div class="color-input-wrapper">
          <input
            :id="`color-${level.id}`"
            type="text"
            :value="colorInput.inputValue.value"
            @input="colorInput.handleInput"
            @blur="colorInput.handleBlur"
            placeholder="#FF5733"
            pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
            class="input input-color"
            :class="{ 'input-error': errors.color }"
          />
          <div class="color-preview" :style="{ backgroundColor: level.color }"></div>
        </div>
        <span v-if="errors.color" class="error-message">{{ errors.color }}</span>
        <span v-else class="field-hint">Format: #RRGGBB or #RGB</span>
      </div>

      <!-- Percent Field -->
      <div class="field">
        <label :for="`percent-${level.id}`" class="field-label">
          Percentage
          <span class="required">*</span>
        </label>
        <input
          :id="`percent-${level.id}`"
          type="number"
          :value="percentInput.inputValue.value"
          @input="handlePercentInput"
          @blur="handlePercentBlur"
          min="0"
          max="100"
          step="1"
          placeholder="85"
          class="input input-number"
          :class="{ 'input-error': errors.percent }"
        />
        <span v-if="errors.percent" class="error-message">{{ errors.percent }}</span>
        <span v-else class="field-hint">0-100, must be unique</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.level-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background: #f9f9f9;
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.level-number {
  font-weight: 600;
  color: #555;
  font-size: 14px;
}

.level-actions {
  display: flex;
  gap: 8px;
}

.btn-delete {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-delete {
  color: #d9534f;
  font-size: 24px;
}

.btn-delete:hover:not(:disabled) {
  background: #d9534f;
  color: white;
  border-color: #d9534f;
}

.btn-delete:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.level-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.required {
  color: #d9534f;
}

.input {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
}

.input-error {
  border-color: #d9534f;
}

.input-error:focus {
  box-shadow: 0 0 0 2px rgba(217, 83, 79, 0.1);
}

.color-input-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.input-color {
  flex: 1;
  font-family: monospace;
}

.color-preview {
  width: 40px;
  height: 38px;
  border: 1px solid #ccc;
  border-radius: 4px;
  flex-shrink: 0;
}

.input-number {
  max-width: 120px;
}

.field-hint {
  font-size: 12px;
  color: #666;
}

.error-message {
  font-size: 12px;
  color: #d9534f;
  font-weight: 500;
}

/* Remove number input arrows on some browsers */
.input-number::-webkit-inner-spin-button,
.input-number::-webkit-outer-spin-button {
  opacity: 1;
}
</style>
