import type { Bundle as BundleInternal } from '../services/bundleService'
import type { ActivitySummary, Bundle, Activity } from '@/type/mainTypes'
import { serializeStamp } from './stampSerializer'
import { serializeTimeSection } from './timeSectionSerializer'
import type { ActivityDB, StampDB } from '../DBTypes'

/**
 * Serialize the complete bundle (populate all activity objects)
 */
export const serializeBundle = (bundle: BundleInternal): Bundle => {
  // Helper: Get activity summary
  const getActivity = (activityId: string): ActivitySummary | null => {
    const activity = bundle.activities.find((a: ActivityDB) => a.id === activityId)
    if (!activity) return null
    return {
      id: activity.id,
      name: activity.name,
      color: activity.color,
      icon: activity.icon,
    }
  }

  // Serialize regimes with populated activities
  const regimes = bundle.regimes.map((regimeDB) => ({
    id: regimeDB.id,
    user: regimeDB.user,
    icon: regimeDB.icon,
    name: regimeDB.name,
    isHoliday: regimeDB.isHoliday,
    intervals: regimeDB.intervals.map((interval) => {
      const activity = getActivity(interval.activityId)
      return {
        intervalId: interval.intervalId,
        activityId: interval.activityId,
        activity: activity || { id: '', name: '', color: '', icon: '' },
        startTime: interval.startTime,
        endTime: interval.endTime,
        durationMs: interval.durationMs,
      }
    }),
    totalPoints: regimeDB.totalPoints,
    totalDurationMs: regimeDB.totalDurationMs,
    createdAt: regimeDB.createdAt,
    updatedAt: regimeDB.updatedAt,
  }))

  // Serialize activities (convert to full Activity type)
  const activities: Activity[] = bundle.activities.map((a: ActivityDB) => ({
    id: a.id,
    name: a.name,
    color: a.color,
    icon: a.icon,
    points_per_hour: a.points_per_hour,
    seconds_free: a.seconds_free,
    created_at: a.created_at,
    updated_at: a.updated_at,
    user: a.user,
  }))

  // Serialize stamps (convert activity_id undefined to null for Stamp type)
  const stamps = bundle.stamps
    .map((stamp: StampDB) =>
      serializeStamp({ ...stamp, activity_id: stamp.activity_id ?? null }, getActivity),
    )
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  // Intervals and days are already serialized by the services
  const intervals = bundle.intervals
  const days = bundle.days

  // Serialize time sections
  const weeks = bundle.timeSections.weeks
    .map((ts) => serializeTimeSection(ts, getActivity))
    .filter((ts) => ts !== null)

  const months = bundle.timeSections.months
    .map((ts) => serializeTimeSection(ts, getActivity))
    .filter((ts) => ts !== null)

  const years = bundle.timeSections.years
    .map((ts) => serializeTimeSection(ts, getActivity))
    .filter((ts) => ts !== null)

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
