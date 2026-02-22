import type { TimeSectionDB } from '../DBTypes'
import type { ActivitySummary, TimeSection } from '@/type/mainTypes'

/**
 * Serialize TimeSectionDB to TimeSection (populate activity objects)
 */
export const serializeTimeSection = (
  timeSectionDB: TimeSectionDB,
  getActivity: (activityId: string) => ActivitySummary | null,
): TimeSection | null => {
  // Populate activityTotals with activity data
  const activityTotals = timeSectionDB.activityTotals
    .map((total) => {
      const activity = getActivity(total.activityId)
      if (!activity) return null

      return {
        activityId: total.activityId,
        activity,
        durationMs: total.durationMs,
        pointsTotal: total.pointsTotal,
      }
    })
    .filter((t): t is NonNullable<typeof t> => t !== null)

  return {
    id: timeSectionDB.id,
    user: timeSectionDB.user,
    timezone: timeSectionDB.timezone,
    sectionType: timeSectionDB.sectionType,
    sectionKey: timeSectionDB.sectionKey,
    sectionPassed: timeSectionDB.sectionPassed,
    startUtc: timeSectionDB.startUtc,
    endUtc: timeSectionDB.endUtc,
    lengthMs: timeSectionDB.lengthMs,
    activityTotals,
    totalDurationMs: timeSectionDB.totalDurationMs,
    totalPoints: timeSectionDB.totalPoints,
    percentageAchieved: timeSectionDB.percentageAchieved,
    achievedLevel: timeSectionDB.achievedLevel,
    isShelved: timeSectionDB.isShelved,
    createdAt: timeSectionDB.createdAt,
    updatedAt: timeSectionDB.updatedAt,
  }
}
