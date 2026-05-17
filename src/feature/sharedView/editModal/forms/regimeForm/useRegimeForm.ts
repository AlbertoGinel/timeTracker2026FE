import { ref, computed } from 'vue'
import type { Regime, RegimeInterval } from '@/type/mainTypes'
import { useActivityStore } from '@/store/useActivityStore'
import { validateIntervalTime } from '@/feature/sharedView/cronoDay/useIntervalValidation'

export interface RegimeWithId {
  id: string
  name: string
  icon: string
  intervals: RegimeInterval[]
}

export interface ValidationError {
  index: number
  field: keyof Omit<RegimeWithId, 'id'>
  message: string
}

const EMOJI_REGEX = /^[\p{Emoji}]$/u

export const useRegimeForm = (initialRegimes?: Regime[]) => {
  const activityStore = useActivityStore()
  // Filter out holiday regimes - they are managed separately
  const nonHolidayRegimes = initialRegimes?.filter((r) => !r.isHoliday)

  // Store initial state for change detection
  const initialState = nonHolidayRegimes
    ? JSON.stringify(
        nonHolidayRegimes.map((regime) => ({
          name: regime.name,
          icon: regime.icon,
        })),
      )
    : null

  // Add temporary IDs for tracking items during editing
  const regimes = ref<RegimeWithId[]>(
    nonHolidayRegimes?.map((regime, index) => ({
      id: `regime-${index}-${Date.now()}`,
      name: regime.name,
      icon: regime.icon,
      intervals: regime.intervals || [],
    })) ?? [
      {
        id: `regime-0-${Date.now()}`,
        name: '',
        icon: '💼',
        intervals: [],
      },
    ],
  )

  const errors = ref<ValidationError[]>([])

  // Validation helpers
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

  // Validate all regimes
  const validateAll = (): boolean => {
    errors.value = []

    regimes.value.forEach((regime, index) => {
      const iconError = validateIcon(regime.icon)
      if (iconError) {
        errors.value.push({ index, field: 'icon', message: iconError })
      }

      const nameError = validateName(regime.name)
      if (nameError) {
        errors.value.push({ index, field: 'name', message: nameError })
      }
    })

    return errors.value.length === 0
  }

  // Get error for specific field
  const getError = (index: number, field: keyof Omit<RegimeWithId, 'id'>): string | null => {
    const error = errors.value.find((e) => e.index === index && e.field === field)
    return error?.message ?? null
  }

  // Regime management
  const addRegime = () => {
    regimes.value.push({
      id: `regime-${regimes.value.length}-${Date.now()}`,
      name: '',
      icon: '💼',
      intervals: [],
    })
  }

  const removeRegime = (index: number) => {
    if (regimes.value.length > 1) {
      regimes.value.splice(index, 1)
      // Re-validate after removal
      validateAll()
    }
  }

  // Update regime field
  const updateRegime = (index: number, field: keyof Omit<RegimeWithId, 'id'>, value: string) => {
    const regime = regimes.value[index]
    if (regime) {
      regime[field] = value as never

      // Clear error for this field when user starts typing
      errors.value = errors.value.filter((e) => !(e.index === index && e.field === field))
    }
  }

  // Interval management functions
  const updateIntervalStartTime = (regimeIndex: number, intervalId: string, value: string) => {
    const regime = regimes.value[regimeIndex]
    if (!regime) return

    const interval = regime.intervals.find((i) => i.intervalId === intervalId)
    if (!interval) return

    // Validate and auto-adjust to avoid collisions
    const validated = validateIntervalTime(intervalId, value, interval.endTime, regime.intervals)

    interval.startTime = validated.startTime
    interval.endTime = validated.endTime

    // Recalculate duration
    const start = new Date(`2000-01-01T${interval.startTime}:00`)
    const end = new Date(`2000-01-01T${interval.endTime}:00`)
    interval.durationMs = end.getTime() - start.getTime()
  }

  const updateIntervalEndTime = (regimeIndex: number, intervalId: string, value: string) => {
    const regime = regimes.value[regimeIndex]
    if (!regime) return

    const interval = regime.intervals.find((i) => i.intervalId === intervalId)
    if (!interval) return

    // Validate and auto-adjust to avoid collisions
    const validated = validateIntervalTime(intervalId, interval.startTime, value, regime.intervals)

    interval.startTime = validated.startTime
    interval.endTime = validated.endTime

    // Recalculate duration
    const start = new Date(`2000-01-01T${interval.startTime}:00`)
    const end = new Date(`2000-01-01T${interval.endTime}:00`)
    interval.durationMs = end.getTime() - start.getTime()
  }

  const updateIntervalActivity = (regimeIndex: number, intervalId: string, activityId: string) => {
    const regime = regimes.value[regimeIndex]
    if (!regime) return

    const interval = regime.intervals.find((i) => i.intervalId === intervalId)
    if (interval) {
      interval.activityId = activityId

      // Update the activity summary object from the store
      const activity = activityStore.activities.find((a) => a.id === activityId)
      if (activity) {
        interval.activity = {
          id: activity.id,
          name: activity.name,
          icon: activity.icon,
          color: activity.color,
        }
      }
    }
  }

  const deleteInterval = (regimeIndex: number, intervalId: string) => {
    const regime = regimes.value[regimeIndex]
    if (!regime) return

    const intervalIndex = regime.intervals.findIndex((i) => i.intervalId === intervalId)
    if (intervalIndex !== -1) {
      regime.intervals.splice(intervalIndex, 1)
    }
  }

  // Get final data without temp IDs
  const getRegimeData = (): Array<{ name: string; icon: string }> => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return regimes.value.map(({ id, ...regime }) => regime)
  }

  // Computed properties
  const isValid = computed(() => {
    return regimes.value.every((regime) => {
      return validateIcon(regime.icon) === null && validateName(regime.name) === null
    })
  })

  const hasRegimes = computed(() => regimes.value.length > 0)

  const hasChanges = computed(() => {
    if (!initialState) return true // New form always has "changes"
    const currentState = JSON.stringify(getRegimeData())
    return currentState !== initialState
  })

  return {
    regimes,
    errors,
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
  }
}
