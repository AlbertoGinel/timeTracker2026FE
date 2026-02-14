import type { Stamp, StampWithActivity, ActivitySummary } from '@/type/mainTypes'

/**
 * Serialize a Stamp to StampWithActivity (populate activity object)
 */
export const serializeStamp = (
  stamp: Stamp,
  getActivity: (activityId: string) => ActivitySummary | null,
): StampWithActivity => {
  if (!stamp.activity_id) {
    return { ...stamp, activity: null }
  }

  const activity = getActivity(stamp.activity_id)

  if (!activity) {
    return { ...stamp, activity: null }
  }

  return {
    ...stamp,
    activity,
  }
}
