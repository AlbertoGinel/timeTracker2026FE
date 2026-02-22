import { DateTime } from 'luxon'
import type { Stamp, Day, DayInterval, DayActivityTotal, ActivityInfo } from '@/type/mainTypes'
import { computeIntervalsFromStamps } from './intervalService'
import { calculateActivityPoints } from './calculatePointsService'
import { calculateDayAchievement } from './scaleService'
import type { ScaleLevelDB } from '../DBTypes'

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
        const pointsTotal = calculateActivityPoints(
          data.durationMs,
          data.pointsPerHour,
          data.secondsFree,
        )

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
      id: null, // null for computed days (not materialized in DB)
      user: userId,
      timezone,
      dateKey,
      regime: null, // null for computed days (not materialized in DB)
      dayStartUtc: dayStart.toUTC().toISO({ suppressMilliseconds: true })!,
      dayEndUtc: dayEnd.toUTC().toISO({ suppressMilliseconds: true })!,
      dayLengthMs: dayEnd.toMillis() - dayStart.toMillis(),
      timezoneOffsetStart: dayStart.offset,
      timezoneOffsetEnd: dayEnd.offset,
      intervals: populatedIntervals,
      activityTotals,
      totalDurationMs,
      totalPoints,
      percentageAchieved: null, // null for computed days (no regime to compare against)
      achievedLevel: null, // null for computed days (no regime to compare against)
      isShelved: null, // null for computed days (not materialized in DB)
      createdAt: null, // null for computed days (not materialized in DB)
      updatedAt: null, // null for computed days (not materialized in DB)
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
    id: null, // null for computed days (not materialized in DB)
    user: userId,
    timezone,
    dateKey,
    regime: null, // null for computed days (not materialized in DB)
    dayStartUtc: dayStart.toUTC().toISO({ suppressMilliseconds: true })!,
    dayEndUtc: dayEnd.toUTC().toISO({ suppressMilliseconds: true })!,
    dayLengthMs: dayEnd.toMillis() - dayStart.toMillis(),
    timezoneOffsetStart: dayStart.offset,
    timezoneOffsetEnd: dayEnd.offset,
    intervals: [],
    activityTotals: [],
    totalDurationMs: 0,
    totalPoints: 0,
    percentageAchieved: null, // null for computed days (no regime to compare against)
    achievedLevel: null, // null for computed days (no regime to compare against)
    isShelved: null, // null for computed days (not materialized in DB)
    createdAt: null, // null for computed days (not materialized in DB)
    updatedAt: null, // null for computed days (not materialized in DB)
  }
}

/**
 * Merge materialized days from DB with computed days from stamps
 * Handles three cases:
 * 1. Shelved days (use frozen data from DB)
 * 2. Materialized days with stamps (merge DB fields with fresh computed data)
 * 3. Materialized days without stamps (future planned days, use DB fields + empty data)
 */
export const mergeMaterializedAndComputedDays = (
  materializedDaysDB: import('../DBTypes').DayDB[],
  computedDays: Day[],
  getActivity: (activityId: string) => ActivityInfo | null,
  getRegime: (regimeId: string) => {
    id: string
    icon: string
    name: string
    isHoliday: boolean
    totalPoints: number
    totalDurationMs: number
  } | null,
  userScale: ScaleLevelDB[],
): Day[] => {
  // Create a map of computed days for quick lookup
  const computedDayMap = new Map(computedDays.map((d) => [d.dateKey, d]))

  // Process materialized days (includes future days with regimes)
  const materializedDays: Day[] = materializedDaysDB.map((dbDay) => {
    const regime = dbDay.regimeId ? getRegime(dbDay.regimeId) : null
    const computedDay = computedDayMap.get(dbDay.dateKey)

    // Remove from computed map so we don't duplicate later
    if (computedDay) {
      computedDayMap.delete(dbDay.dateKey)
    }

    // Check if day is shelved AND has frozen data in DB
    const isShelvedWithData = dbDay.isShelved && dbDay.intervals.length > 0

    if (isShelvedWithData) {
      // Case 1: Shelved day - use frozen data from DB
      const intervals = dbDay.intervals
        .map((interval) => {
          const activity = getActivity(interval.activityId)
          if (!activity) return null
          return {
            intervalId: interval.intervalId,
            activityId: interval.activityId,
            activity: {
              id: activity.id,
              name: activity.name,
              color: activity.color,
              icon: activity.icon,
            },
            startLocal: interval.startTime,
            endLocal: interval.endTime,
            durationMs: interval.durationMs ?? 0,
          }
        })
        .filter((i) => i !== null)

      const activityTotals = dbDay.activityTotals
        .map((total) => {
          const activity = getActivity(total.activityId)
          if (!activity) return null
          return {
            activityId: total.activityId,
            activity: {
              id: activity.id,
              name: activity.name,
              color: activity.color,
              icon: activity.icon,
            },
            durationMs: total.durationMs ?? 0,
            pointsTotal: total.pointsTotal ?? 0,
            pointsPerHourSnapshot: total.pointsPerHourSnapshot,
          }
        })
        .filter((t) => t !== null)

      const dayStart = DateTime.fromISO(dbDay.dateKey, { zone: dbDay.timezone }).startOf('day')
      const dayEnd = dayStart.plus({ days: 1 })
      const dayLengthMs = dayEnd.toMillis() - dayStart.toMillis()

      // Calculate achieved level and percentage based on regime points with DST correction
      const achievement = calculateDayAchievement(
        dbDay.totalPoints ?? 0,
        regime?.totalPoints,
        dayLengthMs,
        userScale,
      )

      return {
        id: dbDay.id,
        user: dbDay.user,
        timezone: dbDay.timezone,
        dateKey: dbDay.dateKey,
        regime,
        dayStartUtc: dayStart.toUTC().toISO({ suppressMilliseconds: true })!,
        dayEndUtc: dayEnd.toUTC().toISO({ suppressMilliseconds: true })!,
        dayLengthMs,
        timezoneOffsetStart: dayStart.offset,
        timezoneOffsetEnd: dayEnd.offset,
        intervals,
        activityTotals,
        totalDurationMs: dbDay.totalDurationMs ?? 0,
        totalPoints: dbDay.totalPoints ?? 0,
        percentageAchieved: achievement.percentageAchieved,
        achievedLevel: achievement.achievedLevel,
        isShelved: dbDay.isShelved,
        createdAt: dbDay.createdAt,
        updatedAt: dbDay.updatedAt,
      } as Day
    } else if (computedDay) {
      // Case 2: Materialized day with stamps - merge DB fields with fresh computed data
      // Calculate achieved level and percentage based on regime points with DST correction
      const achievement = calculateDayAchievement(
        computedDay.totalPoints,
        regime?.totalPoints,
        computedDay.dayLengthMs,
        userScale,
      )

      return {
        ...computedDay,
        id: dbDay.id,
        regime,
        percentageAchieved: achievement.percentageAchieved,
        achievedLevel: achievement.achievedLevel,
        isShelved: dbDay.isShelved,
        createdAt: dbDay.createdAt,
        updatedAt: dbDay.updatedAt,
      } as Day
    } else {
      // Case 3: Materialized day without stamps (future planned day or holiday)
      const dayStart = DateTime.fromISO(dbDay.dateKey, { zone: dbDay.timezone }).startOf('day')
      const dayEnd = dayStart.plus({ days: 1 })
      const dayLengthMs = dayEnd.toMillis() - dayStart.toMillis()

      // No points earned yet, calculate based on 0 points with DST correction
      const achievement = calculateDayAchievement(0, regime?.totalPoints, dayLengthMs, userScale)

      return {
        id: dbDay.id,
        user: dbDay.user,
        timezone: dbDay.timezone,
        dateKey: dbDay.dateKey,
        regime,
        dayStartUtc: dayStart.toUTC().toISO({ suppressMilliseconds: true })!,
        dayEndUtc: dayEnd.toUTC().toISO({ suppressMilliseconds: true })!,
        dayLengthMs,
        timezoneOffsetStart: dayStart.offset,
        timezoneOffsetEnd: dayEnd.offset,
        intervals: [],
        activityTotals: [],
        totalDurationMs: 0,
        totalPoints: 0,
        percentageAchieved: achievement.percentageAchieved,
        achievedLevel: achievement.achievedLevel,
        isShelved: dbDay.isShelved,
        createdAt: dbDay.createdAt,
        updatedAt: dbDay.updatedAt,
      } as Day
    }
  })

  // Add remaining computed days (not materialized in DB)
  const remainingComputedDays = Array.from(computedDayMap.values())

  return [...materializedDays, ...remainingComputedDays]
}
