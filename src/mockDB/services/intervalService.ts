import { DateTime } from 'luxon'
import type { Stamp, Interval, ActivityInfo } from '@/type/mainTypes'

/**
 * Compute intervals from stamps following these rules:
 * 1. Only 'start' stamps create intervals
 * 2. If next stamp is within 5 seconds:
 *    - Same activity: merge (skip and continue looking for end)
 *    - Different activity: drop this start stamp (no interval)
 * 3. If next stamp is same activity (any time): skip it, continue looking for end
 * 4. toDate is the previous second of the next valid stamp
 * 5. Last stamp with no end: toDate = null (ongoing)
 * 6. Duration is integer seconds (no decimals)
 */
export const computeIntervalsFromStamps = (
  stamps: Stamp[],
  getActivity: (activityId: string) => ActivityInfo | null,
): Interval[] => {
  // Sort stamps ascending by timestamp (UTC)
  const sortedStamps = [...stamps].sort((a, b) => {
    const aTime = DateTime.fromISO(a.timestamp, { zone: 'utc' }).toMillis()
    const bTime = DateTime.fromISO(b.timestamp, { zone: 'utc' }).toMillis()
    return aTime - bTime
  })

  const intervals: Interval[] = []

  for (let i = 0; i < sortedStamps.length; i++) {
    const stamp = sortedStamps[i]
    if (!stamp) continue

    // Only start stamps create intervals
    if (stamp.type !== 'start' || !stamp.activity_id) continue

    // Get the activity
    const activity = getActivity(stamp.activity_id)
    if (!activity) continue

    // Find the end of this interval
    let endIndex = i + 1
    let shouldSkipInterval = false

    while (endIndex < sortedStamps.length) {
      const nextStamp = sortedStamps[endIndex]
      if (!nextStamp) break
      const fromTime = DateTime.fromISO(stamp.timestamp, { zone: 'utc' }).toMillis()
      const nextTime = DateTime.fromISO(nextStamp.timestamp, { zone: 'utc' }).toMillis()
      const secondsDiff = (nextTime - fromTime) / 1000

      // If next stamp is within 5 seconds
      if (secondsDiff < 5) {
        // If same activity, merge (skip this next stamp and continue)
        if (nextStamp.activity_id === stamp.activity_id) {
          endIndex++
          continue
        } else {
          // Different activity within 5 seconds: drop this start stamp
          shouldSkipInterval = true
          break
        }
      }

      // If next stamp is same activity (regardless of time), skip it
      if (nextStamp.activity_id === stamp.activity_id) {
        endIndex++
        continue
      }

      // Found the valid end stamp
      break
    }

    // Skip this interval if it was invalidated by 5-second rule
    if (shouldSkipInterval) continue

    // Calculate toDate and duration
    let toDate: string | null = null
    let duration: number

    if (endIndex < sortedStamps.length) {
      // Found an ending stamp: toDate is 1 second before next stamp
      const nextStamp = sortedStamps[endIndex]
      if (!nextStamp) break
      const nextDate = DateTime.fromISO(nextStamp.timestamp, { zone: 'utc' }).minus({
        seconds: 1,
      })
      toDate = nextDate.toISO({ suppressMilliseconds: true })?.replace('+00:00', 'Z') ?? null

      const fromTime = DateTime.fromISO(stamp.timestamp, { zone: 'utc' }).toMillis()
      const toTime = toDate ? DateTime.fromISO(toDate, { zone: 'utc' }).toMillis() : fromTime
      duration = Math.floor((toTime - fromTime) / 1000)
    } else {
      // No ending stamp: ongoing interval (toDate = null)
      toDate = null
      const fromTime = DateTime.fromISO(stamp.timestamp, { zone: 'utc' }).toMillis()
      const nowTime = DateTime.utc().toMillis()
      duration = Math.floor((nowTime - fromTime) / 1000)
    }

    intervals.push({
      id: crypto.randomUUID(),
      fromDate: stamp.timestamp,
      toDate,
      duration,
      activity,
    })

    // Skip ahead to the stamp that closed this interval
    if (endIndex > i) {
      i = endIndex - 1
    }
  }

  // Sort descending by fromDate (latest first)
  return intervals.sort((a, b) => b.fromDate.localeCompare(a.fromDate))
}
