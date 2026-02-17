import type { Regime, RegimeInterval, ActivitySummary } from '@/type/mainTypes'
import type { RegimeDB } from '../DBTypes'

/**
 * Serialize a RegimeDB record to a Regime (populate activity objects)
 */
export const serializeRegime = (
  regimeDB: RegimeDB,
  getActivity: (activityId: string) => ActivitySummary | null,
): Regime | null => {
  // Populate intervals with activity data
  const intervals: RegimeInterval[] = regimeDB.intervals
    .map((interval) => {
      const activity = getActivity(interval.activityId)
      if (!activity) return null

      return {
        intervalId: interval.intervalId,
        activityId: interval.activityId,
        activity,
        startTime: interval.startTime,
        endTime: interval.endTime,
        durationMs: interval.durationMs,
      }
    })
    .filter((i): i is RegimeInterval => i !== null)

  return {
    id: regimeDB.id,
    user: regimeDB.user,
    icon: regimeDB.icon,
    name: regimeDB.name,
    isHoliday: regimeDB.isHoliday,
    intervals,
    totalPoints: regimeDB.totalPoints,
    totalDurationMs: regimeDB.totalDurationMs,
    createdAt: regimeDB.createdAt,
    updatedAt: regimeDB.updatedAt,
  }
}
