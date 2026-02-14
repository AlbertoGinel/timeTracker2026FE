import { DateTime } from 'luxon'
import type { Day } from '@/type/mainTypes'
import { useHandleRequest } from './useHandleRequest'

/**
 * Day API - handles fetching day data (computed from stamps)
 * In development: MSW intercepts these requests and computes days on-the-fly
 * In production: Will connect to real backend API
 */
export const useAPIDay = () => {
  const { handleRequest } = useHandleRequest()

  /**
   * Get days for a date range
   * Backend returns only materialized days (days with stamps)
   * Frontend fills gaps with empty days
   */
  const getDaysInRange = async (
    fromDate: string, // YYYY-MM-DD
    toDate: string, // YYYY-MM-DD
    timezone: string,
    userId: string,
  ): Promise<Day[]> => {
    // Fetch materialized days from backend
    const materializedDays = await handleRequest<Day[]>(`/api/days/?from=${fromDate}&to=${toDate}`)

    // Generate full date range
    const allDates: string[] = []
    let current = DateTime.fromISO(fromDate, { zone: timezone })
    const end = DateTime.fromISO(toDate, { zone: timezone })

    while (current <= end) {
      allDates.push(current.toISODate()!)
      current = current.plus({ days: 1 })
    }

    // Create a map of materialized days
    const dayMap = new Map<string, Day>()
    materializedDays.forEach((day) => {
      dayMap.set(day.dateKey, day)
    })

    // Fill gaps with empty days
    const fullDays: Day[] = allDates.map((dateKey) => {
      if (dayMap.has(dateKey)) {
        return dayMap.get(dateKey)!
      }

      // Generate empty day
      const dayStart = DateTime.fromISO(dateKey, { zone: timezone }).startOf('day')
      const dayEnd = dayStart.plus({ days: 1 })

      return {
        id: `${userId}:${dateKey}`,
        user: userId,
        timezone,
        dateKey,
        dayStartUtc: dayStart.toUTC().toISO({ suppressMilliseconds: true })!,
        dayEndUtc: dayEnd.toUTC().toISO({ suppressMilliseconds: true })!,
        dayLengthMs: dayEnd.toMillis() - dayStart.toMillis(),
        timezoneOffsetStart: dayStart.offset,
        timezoneOffsetEnd: dayEnd.offset,
        intervals: [],
        activityTotals: [],
        totalDurationMs: 0,
        totalPoints: 0,
        isFinalized: false,
        createdAt: DateTime.now().toISO()!,
        updatedAt: DateTime.now().toISO()!,
      }
    })

    return fullDays
  }

  return {
    getDaysInRange,
  }
}
