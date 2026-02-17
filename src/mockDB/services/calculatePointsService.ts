import type { ActivityInfo } from '@/type/mainTypes'
import type { IntervalDB, DayActivityTotalDB } from '../DBTypes'

/**
 * Calculate points for a single activity based on duration
 * Applies the "seconds_free" deduction before calculating billable time
 */
export const calculateActivityPoints = (
  durationMs: number,
  pointsPerHour: number,
  secondsFree: number,
): number => {
  const totalSeconds = durationMs / 1000
  const billableSeconds = Math.max(0, totalSeconds - secondsFree)
  const billableHours = billableSeconds / (60 * 60)
  return billableHours * pointsPerHour
}

/**
 * Calculate activity totals from a list of intervals
 * Groups by activity and computes duration and points
 */
export const calculateActivityTotals = (
  intervals: IntervalDB[],
  getActivity: (activityId: string) => ActivityInfo | null,
): DayActivityTotalDB[] => {
  const activityMap = new Map<
    string,
    { durationMs: number; pointsPerHour: number; secondsFree: number }
  >()

  intervals.forEach((interval) => {
    const activity = getActivity(interval.activityId)
    if (!activity) return

    if (!activityMap.has(interval.activityId)) {
      activityMap.set(interval.activityId, {
        durationMs: 0,
        pointsPerHour: activity.points_per_hour,
        secondsFree: activity.seconds_free,
      })
    }
    const entry = activityMap.get(interval.activityId)!
    entry.durationMs += interval.durationMs
  })

  return Array.from(activityMap.entries()).map(([activityId, data]) => {
    const pointsTotal = calculateActivityPoints(
      data.durationMs,
      data.pointsPerHour,
      data.secondsFree,
    )

    return {
      activityId,
      durationMs: data.durationMs,
      pointsTotal,
      pointsPerHourSnapshot: data.pointsPerHour,
    }
  })
}

/**
 * Calculate total duration and points from activity totals
 */
export const calculateTotals = (
  activityTotals: DayActivityTotalDB[],
): { totalDurationMs: number; totalPoints: number } => {
  const totalDurationMs = activityTotals.reduce((sum, at) => sum + at.durationMs, 0)
  const totalPoints = activityTotals.reduce((sum, at) => sum + at.pointsTotal, 0)
  return { totalDurationMs, totalPoints }
}
