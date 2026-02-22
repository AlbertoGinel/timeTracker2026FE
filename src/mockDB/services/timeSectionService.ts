import { DateTime } from 'luxon'
import type { Day } from '@/type/mainTypes'
import type {
  TimeSectionDB,
  TimeSectionType,
  TimeSectionActivityTotalDB,
  ScaleLevelDB,
} from '../DBTypes'

/**
 * Find the achievement level for a given percentage
 */
const findAchievementLevel = (
  percentageAchieved: number,
  scale: ScaleLevelDB[],
): ScaleLevelDB | null => {
  const sortedScale = [...scale].sort((a, b) => b.percent - a.percent)
  for (const level of sortedScale) {
    if (percentageAchieved >= level.percent) {
      return level
    }
  }
  return sortedScale[sortedScale.length - 1] || null
}

/**
 * Get the week boundaries (Monday to Sunday) for a given date
 */
const getWeekBoundaries = (date: DateTime): { start: DateTime; end: DateTime; key: string } => {
  const weekStart = date.startOf('week') // Luxon weeks start on Monday
  const weekEnd = weekStart.endOf('week')

  return {
    start: weekStart,
    end: weekEnd,
    key: `Week ${weekStart.weekNumber} ${weekStart.year}`,
  }
}

/**
 * Get the month boundaries for a given date
 */
const getMonthBoundaries = (date: DateTime): { start: DateTime; end: DateTime; key: string } => {
  const monthStart = date.startOf('month')
  const monthEnd = monthStart.endOf('month')

  return {
    start: monthStart,
    end: monthEnd,
    key: monthStart.toFormat('MMMM yyyy'), // e.g., "February 2026"
  }
}

/**
 * Get the year boundaries for a given date
 */
const getYearBoundaries = (date: DateTime): { start: DateTime; end: DateTime; key: string } => {
  const yearStart = date.startOf('year')
  const yearEnd = yearStart.endOf('year')

  return {
    start: yearStart,
    end: yearEnd,
    key: yearStart.toFormat('yyyy'), // e.g., "2026"
  }
}

/**
 * Calculate the percentage of a time section that has passed
 */
const calculateSectionPassed = (startUtc: DateTime, endUtc: DateTime, now: DateTime): number => {
  const totalDuration = endUtc.toMillis() - startUtc.toMillis()
  const elapsed = now.toMillis() - startUtc.toMillis()

  if (elapsed <= 0) return 0
  if (elapsed >= totalDuration) return 100

  return (elapsed / totalDuration) * 100
}

/**
 * Group days by time section (week, month, or year)
 */
const groupDaysBySection = (
  days: Day[],
  sectionType: TimeSectionType,
  timezone: string,
): Map<string, Day[]> => {
  const sectionMap = new Map<string, Day[]>()

  days.forEach((day) => {
    const date = DateTime.fromISO(day.dateKey, { zone: timezone })

    let boundaries
    switch (sectionType) {
      case 'week':
        boundaries = getWeekBoundaries(date)
        break
      case 'month':
        boundaries = getMonthBoundaries(date)
        break
      case 'year':
        boundaries = getYearBoundaries(date)
        break
    }

    const sectionId = `${boundaries.start.toISODate()}`

    if (!sectionMap.has(sectionId)) {
      sectionMap.set(sectionId, [])
    }
    sectionMap.get(sectionId)!.push(day)
  })

  return sectionMap
}

/**
 * Aggregate activity totals from days
 */
const aggregateActivityTotals = (days: Day[]): TimeSectionActivityTotalDB[] => {
  const activityMap = new Map<string, { durationMs: number; pointsTotal: number }>()

  days.forEach((day) => {
    day.activityTotals.forEach((total) => {
      if (!activityMap.has(total.activityId)) {
        activityMap.set(total.activityId, { durationMs: 0, pointsTotal: 0 })
      }
      const entry = activityMap.get(total.activityId)!
      entry.durationMs += total.durationMs
      entry.pointsTotal += total.pointsTotal
    })
  })

  return Array.from(activityMap.entries()).map(([activityId, data]) => ({
    activityId,
    durationMs: data.durationMs,
    pointsTotal: data.pointsTotal,
  }))
}

/**
 * Calculate average achievement percentage from days
 * Only includes days with regimes (excludes non-regime and holiday days)
 * Caps each day's achievement between 0-200%
 */
const calculateAverageAchievement = (days: Day[]): number | null => {
  const eligibleDays = days.filter((day) => {
    // Only include days with a regime
    if (!day.regime) return false
    // Exclude holiday regimes
    if (day.regime.isHoliday) return false
    // Must have an achievement percentage
    if (day.percentageAchieved === null) return false
    return true
  })

  if (eligibleDays.length === 0) return null

  // Cap each day's achievement between 0-200%
  const cappedAchievements = eligibleDays.map((day) => {
    const achievement = day.percentageAchieved!
    return Math.max(0, Math.min(200, achievement))
  })

  const sum = cappedAchievements.reduce((acc, val) => acc + val, 0)
  return sum / cappedAchievements.length
}

/**
 * Compute time sections (weeks, months, years) from materialized days
 */
export const computeTimeSectionsFromDays = (
  days: Day[],
  sectionType: TimeSectionType,
  userId: string,
  timezone: string,
  scale: ScaleLevelDB[],
): TimeSectionDB[] => {
  // Only use materialized days (days that have been saved to DB)
  const materializedDays = days.filter((day) => day.id !== null)

  if (materializedDays.length === 0) return []

  const sectionMap = groupDaysBySection(materializedDays, sectionType, timezone)
  const sections: TimeSectionDB[] = []
  const now = DateTime.now().setZone(timezone)

  sectionMap.forEach((daysInSection, sectionStartDate) => {
    const date = DateTime.fromISO(sectionStartDate, { zone: timezone })

    let boundaries
    switch (sectionType) {
      case 'week':
        boundaries = getWeekBoundaries(date)
        break
      case 'month':
        boundaries = getMonthBoundaries(date)
        break
      case 'year':
        boundaries = getYearBoundaries(date)
        break
    }

    // Aggregate activity totals
    const activityTotals = aggregateActivityTotals(daysInSection)
    const totalDurationMs = activityTotals.reduce((sum, at) => sum + at.durationMs, 0)
    const totalPoints = activityTotals.reduce((sum, at) => sum + at.pointsTotal, 0)

    // Calculate average achievement
    const percentageAchieved = calculateAverageAchievement(daysInSection)

    // Find achievement level (if there's a percentage)
    const achievedLevel =
      percentageAchieved !== null ? findAchievementLevel(percentageAchieved, scale) : null

    // Calculate section progress
    const startUtc = boundaries.start.toUTC()
    const endUtc = boundaries.end.toUTC()
    const lengthMs = endUtc.toMillis() - startUtc.toMillis()
    const sectionPassed = calculateSectionPassed(startUtc, endUtc, now.toUTC())

    // Generate ID: userId:sectionType:startDate
    const id = `${userId}:${sectionType}:${boundaries.start.toISODate()}`

    sections.push({
      id,
      user: userId,
      timezone,
      sectionType,
      sectionKey: boundaries.key,
      sectionPassed,
      startUtc: startUtc.toISO({ suppressMilliseconds: true })!,
      endUtc: endUtc.toISO({ suppressMilliseconds: true })!,
      lengthMs,
      activityTotals,
      totalDurationMs,
      totalPoints,
      percentageAchieved,
      achievedLevel,
      isShelved: false, // Time sections are not shelved in this implementation
      createdAt: now.toISO()!,
      updatedAt: now.toISO()!,
    })
  })

  return sections
}
