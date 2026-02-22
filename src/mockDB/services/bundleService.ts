import type { Stamp, ActivityInfo, Day } from '@/type/mainTypes'
import type { ActivityDB, RegimeDB, StampDB, DayDB, TimeSectionDB, ScaleLevelDB } from '../DBTypes'
import { computeDaysFromStamps, mergeMaterializedAndComputedDays } from './dayService'
import { computeTimeSectionsFromDays } from './timeSectionService'
import { computeIntervalsFromStamps } from './intervalService'

/**
 * Bundle response type - complete snapshot of user data
 */
export type Bundle = {
  regimes: RegimeDB[]
  activities: ActivityDB[]
  stamps: StampDB[]
  intervals: ReturnType<typeof computeIntervalsFromStamps>
  days: Day[]
  timeSections: {
    weeks: TimeSectionDB[]
    months: TimeSectionDB[]
    years: TimeSectionDB[]
  }
}

/**
 * Compute the complete bundle for a user
 * This orchestrates all services in the correct dependency order
 *
 * @param userId - User ID
 * @param timezone - User timezone
 * @param scale - User's achievement scale
 * @param fromDate - Start date (YYYY-MM-DD)
 * @param toDate - End date (YYYY-MM-DD)
 * @param regimes - All user regimes
 * @param activities - All user activities
 * @param stamps - All user stamps
 * @param materializedDaysDB - Materialized days from DB
 * @returns Complete bundle with all computed data
 */
export const computeBundle = (
  userId: string,
  timezone: string,
  scale: ScaleLevelDB[],
  fromDate: string,
  toDate: string,
  regimes: RegimeDB[],
  activities: ActivityDB[],
  stamps: StampDB[],
  materializedDaysDB: DayDB[],
): Bundle => {
  // Helper: Get activity info
  const getActivity = (activityId: string): ActivityInfo | null => {
    const activity = activities.find((a) => a.id === activityId)
    if (!activity) return null
    return {
      id: activity.id,
      name: activity.name,
      color: activity.color,
      icon: activity.icon,
      points_per_hour: activity.points_per_hour,
      seconds_free: activity.seconds_free,
    }
  }

  // Helper: Get activity summary
  const getActivitySummary = (activityId: string): ActivityInfo | null => {
    const activity = activities.find((a) => a.id === activityId)
    if (!activity) return null
    return {
      id: activity.id,
      name: activity.name,
      color: activity.color,
      icon: activity.icon,
      points_per_hour: activity.points_per_hour,
      seconds_free: activity.seconds_free,
    }
  }

  // Helper: Get regime summary
  const getRegime = (regimeId: string) => {
    const regime = regimes.find((r) => r.id === regimeId)
    if (!regime) return null
    return {
      id: regime.id,
      icon: regime.icon,
      name: regime.name,
      isHoliday: regime.isHoliday,
      totalPoints: regime.totalPoints,
      totalDurationMs: regime.totalDurationMs,
    }
  }

  // Convert StampDB to Stamp (activity_id: undefined -> null)
  const stampsAsStamp: Stamp[] = stamps.map((s) => ({
    ...s,
    activity_id: s.activity_id ?? null,
  }))

  // Step 1: Compute intervals from stamps
  const intervals = computeIntervalsFromStamps(stampsAsStamp, getActivity)

  // Step 2: Compute days from stamps
  const computedDays = computeDaysFromStamps(
    stampsAsStamp,
    fromDate,
    toDate,
    userId,
    timezone,
    getActivity,
  )

  // Step 3: Merge materialized and computed days
  const days = mergeMaterializedAndComputedDays(
    materializedDaysDB,
    computedDays,
    getActivitySummary,
    getRegime,
    scale,
  )

  // Step 4: Compute time sections from materialized days only
  const weeks = computeTimeSectionsFromDays(days, 'week', userId, timezone, scale)
  const months = computeTimeSectionsFromDays(days, 'month', userId, timezone, scale)
  const years = computeTimeSectionsFromDays(days, 'year', userId, timezone, scale)

  return {
    regimes,
    activities,
    stamps,
    intervals,
    days,
    timeSections: {
      weeks,
      months,
      years,
    },
  }
}
