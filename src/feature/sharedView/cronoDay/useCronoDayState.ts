import { ref, computed } from 'vue'
import { DateTime } from 'luxon'
import { useDayStore } from '@/store/useDayStore'

// Shared state for the selected date in cronoDay
const selectedDateKey = ref<string>('')

/**
 * Composable to manage the selected date for the cronoDay timeline
 * Provides a shared state that can be used by both the calendar and the cronoDay component
 */
export function useCronoDayState(timezone: string = 'UTC') {
  const dayStore = useDayStore()

  // Initialize to today if not set
  if (!selectedDateKey.value) {
    selectedDateKey.value = DateTime.now().setZone(timezone).toISODate()!
  }

  // Get the day data for the selected date
  const selectedDay = computed(() => {
    return dayStore.getDayByDateKey(selectedDateKey.value)
  })

  // Get intervals for the selected day
  const selectedDayIntervals = computed(() => {
    return selectedDay.value?.intervals || []
  })

  // Formatted display of the selected date
  const selectedDateDisplay = computed(() => {
    const dt = DateTime.fromISO(selectedDateKey.value, { zone: timezone })
    return dt.toFormat('EEEE, dd MMMM yyyy') // e.g., "Tuesday, 25 February 2026"
  })

  // Short date display
  const selectedDateShort = computed(() => {
    const dt = DateTime.fromISO(selectedDateKey.value, { zone: timezone })
    return dt.toFormat('dd MMM yyyy') // e.g., "25 Feb 2026"
  })

  // Check if selected date is today
  const isToday = computed(() => {
    const today = DateTime.now().setZone(timezone).toISODate()!
    return selectedDateKey.value === today
  })

  // Set the selected date
  const setSelectedDate = (dateKey: string) => {
    selectedDateKey.value = dateKey
  }

  // Reset to today
  const resetToToday = () => {
    selectedDateKey.value = DateTime.now().setZone(timezone).toISODate()!
  }

  // Navigate to previous day
  const goToPreviousDay = () => {
    const dt = DateTime.fromISO(selectedDateKey.value, { zone: timezone })
    selectedDateKey.value = dt.minus({ days: 1 }).toISODate()!
  }

  // Navigate to next day
  const goToNextDay = () => {
    const dt = DateTime.fromISO(selectedDateKey.value, { zone: timezone })
    selectedDateKey.value = dt.plus({ days: 1 }).toISODate()!
  }

  return {
    selectedDateKey: computed(() => selectedDateKey.value),
    selectedDay,
    selectedDayIntervals,
    selectedDateDisplay,
    selectedDateShort,
    isToday,
    setSelectedDate,
    resetToToday,
    goToPreviousDay,
    goToNextDay,
  }
}
