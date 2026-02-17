import { DateTime } from 'luxon'
import type {
  Day,
  DayInterval,
  DayActivityTotal,
  ActivitySummary,
  RegimeSummary,
} from '@/type/mainTypes'
import type { DayDB } from '../DBTypes'

/**
 * Serialize a DayDB record to a Day (populate activity and regime objects)
 */
export const serializeDay = (
  dayDB: DayDB,
  getActivity: (activityId: string) => ActivitySummary | null,
  getRegime: (regimeId: string) => RegimeSummary | null,
): Day | null => {
  // Compute day boundaries from dateKey + timezone
  const dayStart = DateTime.fromISO(dayDB.dateKey, { zone: dayDB.timezone }).startOf('day')
  const dayEnd = dayStart.plus({ days: 1 })

  const dayStartUtc = dayStart.toUTC().toISO({ suppressMilliseconds: true })!
  const dayEndUtc = dayEnd.toUTC().toISO({ suppressMilliseconds: true })!
  const dayLengthMs = dayEnd.toMillis() - dayStart.toMillis()
  const timezoneOffsetStart = dayStart.offset
  const timezoneOffsetEnd = dayEnd.offset

  // Populate intervals with activity data
  const intervals: DayInterval[] = dayDB.intervals
    .map((interval) => {
      const activity = getActivity(interval.activityId)
      if (!activity) return null

      return {
        intervalId: interval.intervalId,
        activityId: interval.activityId,
        activity,
        startLocal: interval.startLocal,
        endLocal: interval.endLocal,
        durationMs: interval.durationMs,
      }
    })
    .filter((i): i is DayInterval => i !== null)

  // Populate activityTotals with activity data
  const activityTotals: DayActivityTotal[] = dayDB.activityTotals
    .map((total) => {
      const activity = getActivity(total.activityId)
      if (!activity) return null

      return {
        activityId: total.activityId,
        activity,
        durationMs: total.durationMs,
        pointsTotal: total.pointsTotal,
        pointsPerHourSnapshot: total.pointsPerHourSnapshot,
      }
    })
    .filter((t): t is DayActivityTotal => t !== null)

  // Populate regime data
  const regime = dayDB.regimeId ? getRegime(dayDB.regimeId) : null

  return {
    id: dayDB.id,
    user: dayDB.user,
    timezone: dayDB.timezone,
    dateKey: dayDB.dateKey,
    regime,
    dayStartUtc,
    dayEndUtc,
    dayLengthMs,
    timezoneOffsetStart,
    timezoneOffsetEnd,
    intervals,
    activityTotals,
    totalDurationMs: dayDB.totalDurationMs,
    totalPoints: dayDB.totalPoints,
    isFinalized: dayDB.isFinalized,
    createdAt: dayDB.createdAt,
    updatedAt: dayDB.updatedAt,
  }
}
