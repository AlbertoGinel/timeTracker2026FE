import { DateTime } from 'luxon'
import type { Stamp, Day, DayInterval, DayActivityTotal, ActivityInfo } from '@/type/mainTypes'
import { computeIntervalsFromStamps } from './intervalService'

/**
 * Split an interval at midnight boundaries in the given timezone
 * Returns array of interval fragments, one per day
 */
const splitIntervalAtMidnight = (
  intervalId: string,
  activityId: string,
  fromDateUTC: string,
  toDateUTC: string | null,
  timezone: string,
): DayInterval[] => {
  const fragments: DayInterval[] = []

  // Convert to timezone
  let currentStart = DateTime.fromISO(fromDateUTC, { zone: 'utc' }).setZone(timezone)
  const endTime = toDateUTC
    ? DateTime.fromISO(toDateUTC, { zone: 'utc' }).setZone(timezone)
    : DateTime.now().setZone(timezone)

  while (currentStart < endTime) {
    // Find the next midnight
    const nextMidnight = currentStart.plus({ days: 1 }).startOf('day')
    const fragmentEnd = nextMidnight < endTime ? nextMidnight.minus({ milliseconds: 1 }) : endTime

    fragments.push({
      intervalId,
      activityId,
      activity: { id: '', name: '', color: '', icon: '' }, // Will be populated by serializer
      startLocal: currentStart.toISO({ suppressMilliseconds: true })!,
      endLocal: fragmentEnd.toISO({ suppressMilliseconds: true })!,
      durationMs: fragmentEnd.toMillis() - currentStart.toMillis(),
    })

    currentStart = nextMidnight
  }

  return fragments
}

/**
 * Compute days from stamps for a given date range
 * Returns only days that have stamps/intervals (materialized days)
 */
export const computeDaysFromStamps = (
  stamps: Stamp[],
  fromDate: string, // YYYY-MM-DD
  toDate: string, // YYYY-MM-DD
  userId: string,
  timezone: string,
  getActivity: (activityId: string) => ActivityInfo | null,
): Day[] => {
  // Filter stamps in date range
  const fromDt = DateTime.fromISO(fromDate, { zone: timezone }).startOf('day').toUTC()
  const toDt = DateTime.fromISO(toDate, { zone: timezone }).endOf('day').toUTC()

  const stampsInRange = stamps.filter((stamp) => {
    const stampTime = DateTime.fromISO(stamp.timestamp, { zone: 'utc' })
    return stampTime >= fromDt && stampTime <= toDt
  })

  if (stampsInRange.length === 0) {
    return []
  }

  // Compute intervals from stamps
  const intervals = computeIntervalsFromStamps(stampsInRange, getActivity)

  // Split intervals at midnight and group by day
  const dayMap = new Map<string, DayInterval[]>()

  intervals.forEach((interval) => {
    if (!interval.toDate) {
      // Ongoing interval - use current time as end
      interval.toDate = DateTime.now().toUTC().toISO({ suppressMilliseconds: true })!
    }

    const fragments = splitIntervalAtMidnight(
      interval.id,
      interval.activity.id,
      interval.fromDate,
      interval.toDate,
      timezone,
    )

    fragments.forEach((fragment) => {
      const dateKey = DateTime.fromISO(fragment.startLocal, { zone: timezone })
        .startOf('day')
        .toISODate()!

      if (!dayMap.has(dateKey)) {
        dayMap.set(dateKey, [])
      }
      dayMap.get(dateKey)!.push(fragment)
    })
  })

  // Build Day objects
  const days: Day[] = []

  dayMap.forEach((intervals, dateKey) => {
    // Populate activity info for each interval
    const populatedIntervals = intervals
      .map((interval) => {
        const activity = getActivity(interval.activityId)
        if (!activity) return null
        return {
          ...interval,
          activity: {
            id: activity.id,
            name: activity.name,
            color: activity.color,
            icon: activity.icon,
          },
        }
      })
      .filter((i): i is DayInterval => i !== null)

    // Compute activity totals
    const activityMap = new Map<
      string,
      { durationMs: number; activity: ActivityInfo; pointsPerHour: number; secondsFree: number }
    >()

    populatedIntervals.forEach((interval) => {
      const activity = getActivity(interval.activityId)
      if (!activity) return

      if (!activityMap.has(interval.activityId)) {
        activityMap.set(interval.activityId, {
          durationMs: 0,
          activity,
          pointsPerHour: activity.points_per_hour,
          secondsFree: activity.seconds_free,
        })
      }
      const entry = activityMap.get(interval.activityId)!
      entry.durationMs += interval.durationMs
    })

    const activityTotals: DayActivityTotal[] = Array.from(activityMap.entries()).map(
      ([activityId, data]) => {
        // Calculate billable duration (subtract free seconds from total)
        const totalSeconds = data.durationMs / 1000
        const billableSeconds = Math.max(0, totalSeconds - data.secondsFree)
        const billableHours = billableSeconds / (60 * 60)
        const pointsTotal = billableHours * data.pointsPerHour

        return {
          activityId,
          activity: {
            id: data.activity.id,
            name: data.activity.name,
            color: data.activity.color,
            icon: data.activity.icon,
          },
          durationMs: data.durationMs,
          pointsTotal,
          pointsPerHourSnapshot: data.pointsPerHour,
        }
      },
    )

    // Compute day totals
    const totalDurationMs = activityTotals.reduce((sum, at) => sum + at.durationMs, 0)
    const totalPoints = activityTotals.reduce((sum, at) => sum + at.pointsTotal, 0)

    // Compute day boundaries
    const dayStart = DateTime.fromISO(dateKey, { zone: timezone }).startOf('day')
    const dayEnd = dayStart.plus({ days: 1 })

    days.push({
      id: `${userId}:${dateKey}`,
      user: userId,
      timezone,
      dateKey,
      dayStartUtc: dayStart.toUTC().toISO({ suppressMilliseconds: true })!,
      dayEndUtc: dayEnd.toUTC().toISO({ suppressMilliseconds: true })!,
      dayLengthMs: dayEnd.toMillis() - dayStart.toMillis(),
      timezoneOffsetStart: dayStart.offset,
      timezoneOffsetEnd: dayEnd.offset,
      intervals: populatedIntervals,
      activityTotals,
      totalDurationMs,
      totalPoints,
      isFinalized: false,
      createdAt: DateTime.now().toISO()!,
      updatedAt: DateTime.now().toISO()!,
    })
  })

  // Sort by dateKey descending
  return days.sort((a, b) => b.dateKey.localeCompare(a.dateKey))
}

/**
 * Generate an empty day for a given date
 */
export const generateEmptyDay = (dateKey: string, userId: string, timezone: string): Day => {
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
}
