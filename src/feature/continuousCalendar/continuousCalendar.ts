import { computed } from 'vue'
import { DateTime } from 'luxon'
import { useDayStore } from '@/store/useDayStore'
import type { Day } from '@/type/mainTypes'

export interface CalendarCell {
  dateKey: string // YYYY-MM-DD
  dayNumber: number // 1-31
  monthLabel: string | null // "JAN", "FEB", etc. (only for 1st of month)
  isToday: boolean
  day: Day | undefined
  regimeIcon: string | null
  regimeName: string | null
  points: number
}

export function useContinuousCalendar(timezone: string) {
  const dayStore = useDayStore()

  /**
   * Get current date in the user's timezone as YYYY-MM-DD
   */
  const getTodayDateKey = (): string => {
    return DateTime.now().setZone(timezone).toISODate()!
  }

  /**
   * Get the start of the week (Monday) for a given dateKey
   */
  const getWeekStart = (dateKey: string): string => {
    const dt = DateTime.fromISO(dateKey, { zone: timezone })
    // weekday: 1=Monday, 7=Sunday
    const dayOfWeek = dt.weekday
    return dt.minus({ days: dayOfWeek - 1 }).toISODate()!
  }

  /**
   * Add days to a dateKey
   */
  const addDays = (dateKey: string, days: number): string => {
    return DateTime.fromISO(dateKey, { zone: timezone }).plus({ days }).toISODate()!
  }

  /**
   * Get month name (3 letters) from dateKey
   */
  const getMonthLabel = (dateKey: string): string => {
    return DateTime.fromISO(dateKey, { zone: timezone }).toFormat('MMM').toUpperCase()
  }

  /**
   * Get day number from dateKey
   */
  const getDayNumber = (dateKey: string): number => {
    return DateTime.fromISO(dateKey, { zone: timezone }).day
  }

  /**
   * Generate 7x7 calendar grid (7 weeks, 7 days each)
   * Current week is always in the center (week 4)
   */
  const calendarGrid = computed((): CalendarCell[][] => {
    const todayDateKey = getTodayDateKey()
    const currentWeekStart = getWeekStart(todayDateKey)

    // Calculate the start date (3 weeks before current week)
    const gridStartDateKey = addDays(currentWeekStart, -3 * 7)

    const grid: CalendarCell[][] = []

    // Generate 7 weeks
    for (let week = 0; week < 7; week++) {
      const weekRow: CalendarCell[] = []

      // Generate 7 days (Monday to Sunday)
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        const dateKey = addDays(gridStartDateKey, week * 7 + dayOfWeek)
        const dayData = dayStore.getDayByDateKey(dateKey)
        const regime = dayData?.regime

        const dayNum = getDayNumber(dateKey)

        const cell: CalendarCell = {
          dateKey,
          dayNumber: dayNum,
          monthLabel: dayNum === 1 ? getMonthLabel(dateKey) : null,
          isToday: dateKey === todayDateKey,
          day: dayData,
          regimeIcon: regime?.icon || null,
          regimeName: regime?.name || null,
          points: Math.round(dayData?.totalPoints || 0),
        }

        weekRow.push(cell)
      }

      grid.push(weekRow)
    }

    return grid
  })

  /**
   * Handle cell click
   */
  const handleCellClick = (cell: CalendarCell) => {
    console.log('Calendar cell clicked:', {
      dateKey: cell.dateKey,
      dayNumber: cell.dayNumber,
      points: cell.points,
      regimeIcon: cell.regimeIcon,
      isToday: cell.isToday,
      hasData: !!cell.day,
    })
  }

  return {
    calendarGrid,
    handleCellClick,
  }
}
