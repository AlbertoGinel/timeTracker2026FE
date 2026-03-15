import { ref, computed } from 'vue'
import type { ScaleLevel } from '@/type/mainTypes'

export interface ScaleLevelWithId extends ScaleLevel {
  id: string
}

export interface ValidationError {
  index: number
  field: keyof ScaleLevel
  message: string
}

const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
const EMOJI_REGEX = /^[\p{Emoji}]$/u

export const useScaleForm = (initialScale?: ScaleLevel[]) => {
  // Store initial state for change detection
  const initialState = initialScale
    ? JSON.stringify(
        initialScale.map((level) => ({ ...level })).sort((a, b) => b.percent - a.percent),
      )
    : null

  // Add temporary IDs for tracking items during editing
  const levels = ref<ScaleLevelWithId[]>(
    initialScale?.map((level, index) => ({
      ...level,
      id: `level-${index}-${Date.now()}`,
    })) ?? [
      {
        id: `level-0-${Date.now()}`,
        name: '',
        color: '#000000',
        icon: '⭐',
        percent: 0,
      },
    ],
  )

  // Sort levels by percentage (descending) on initialization
  if (initialScale) {
    levels.value.sort((a, b) => b.percent - a.percent)
  }

  const errors = ref<ValidationError[]>([])

  // Validation helpers
  const validateColor = (color: string): string | null => {
    if (!color.trim()) return 'Color is required'
    if (!HEX_COLOR_REGEX.test(color)) return 'Must be a valid hex color (e.g., #FF5733 or #F57)'
    return null
  }

  const validateIcon = (icon: string): string | null => {
    if (!icon.trim()) return 'Icon is required'
    if (!EMOJI_REGEX.test(icon)) return 'Must be a single emoji'
    return null
  }

  const validateName = (name: string): string | null => {
    if (!name.trim()) return 'Name is required'
    if (name.length > 50) return 'Name must be 50 characters or less'
    return null
  }

  const validatePercent = (percent: number, index: number): string | null => {
    if (percent < 0 || percent > 100) return 'Percent must be between 0 and 100'

    // Check uniqueness
    const duplicateIndex = levels.value.findIndex(
      (level, i) => i !== index && level.percent === percent,
    )
    if (duplicateIndex !== -1) return 'Percent must be unique'

    return null
  }

  // Validate all levels
  const validateAll = (): boolean => {
    errors.value = []

    levels.value.forEach((level, index) => {
      const colorError = validateColor(level.color)
      if (colorError) {
        errors.value.push({ index, field: 'color', message: colorError })
      }

      const iconError = validateIcon(level.icon)
      if (iconError) {
        errors.value.push({ index, field: 'icon', message: iconError })
      }

      const nameError = validateName(level.name)
      if (nameError) {
        errors.value.push({ index, field: 'name', message: nameError })
      }

      const percentError = validatePercent(level.percent, index)
      if (percentError) {
        errors.value.push({ index, field: 'percent', message: percentError })
      }
    })

    return errors.value.length === 0
  }

  // Get error for specific field
  const getError = (index: number, field: keyof ScaleLevel): string | null => {
    const error = errors.value.find((e) => e.index === index && e.field === field)
    return error?.message ?? null
  }

  // Level management
  const addLevel = () => {
    levels.value.push({
      id: `level-${levels.value.length}-${Date.now()}`,
      name: '',
      color: '#000000',
      icon: '⭐',
      percent: 0,
    })
  }

  const removeLevel = (index: number) => {
    if (levels.value.length > 1) {
      levels.value.splice(index, 1)
      // Re-validate after removal
      validateAll()
    }
  }

  // Auto-sort levels by percentage (descending)
  const sortLevels = () => {
    levels.value.sort((a, b) => b.percent - a.percent)
  }

  // Update level field
  const updateLevel = (index: number, field: keyof ScaleLevel, value: string | number) => {
    const level = levels.value[index]
    if (level) {
      level[field] = value as never

      // Clear error for this field when user starts typing
      errors.value = errors.value.filter((e) => !(e.index === index && e.field === field))
    }
  }

  // Get final data without temp IDs
  const getScaleData = (): ScaleLevel[] => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return levels.value.map(({ id, ...level }) => level)
  }

  // Computed properties
  const isValid = computed(() => {
    return levels.value.every((level) => {
      return (
        validateColor(level.color) === null &&
        validateIcon(level.icon) === null &&
        validateName(level.name) === null &&
        validatePercent(level.percent, levels.value.indexOf(level)) === null
      )
    })
  })

  const hasLevels = computed(() => levels.value.length > 0)

  const hasChanges = computed(() => {
    if (!initialState) return true // New form always has "changes"
    const currentState = JSON.stringify(getScaleData().sort((a, b) => b.percent - a.percent))
    return currentState !== initialState
  })

  return {
    levels,
    errors,
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
  }
}
