import type { ActivityInfo } from '@/type/mainTypes'
import type { IntervalDB } from '../DBTypes'
import { calculateActivityTotals, calculateTotals } from './calculatePointsService'

/**
 * Calculate duration in milliseconds for a regime interval (HH:mm format)
 * Handles intervals that cross midnight (e.g., 23:00 to 02:00)
 */
export const calculateRegimeIntervalDuration = (startTime: string, endTime: string): number => {
  // Parse times as "HH:mm"
  const startParts = startTime.split(':').map(Number)
  const endParts = endTime.split(':').map(Number)

  const startHour = startParts[0] ?? 0
  const startMinute = startParts[1] ?? 0
  const endHour = endParts[0] ?? 0
  const endMinute = endParts[1] ?? 0

  // Convert to minutes since midnight
  const startMinutes = startHour * 60 + startMinute
  let endMinutes = endHour * 60 + endMinute

  // Handle crossing midnight (e.g., 23:00 to 02:00)
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60 // Add 24 hours
  }

  const durationMinutes = endMinutes - startMinutes
  return durationMinutes * 60 * 1000 // Convert to milliseconds
}

/**
 * Calculate points and duration for a regime
 * Uses the same calculation logic as real days
 */
export const calculateRegimeMetrics = (
  intervals: IntervalDB[],
  getActivity: (activityId: string) => ActivityInfo | null,
): { totalPoints: number; totalDurationMs: number } => {
  // Calculate duration for each interval if not already set
  const intervalsWithDuration = intervals.map((interval) => {
    if (interval.durationMs > 0) {
      return interval
    }
    // Calculate from HH:mm format
    const durationMs = calculateRegimeIntervalDuration(interval.startTime, interval.endTime)
    return { ...interval, durationMs }
  })

  // Use shared calculation logic
  const activityTotals = calculateActivityTotals(intervalsWithDuration, getActivity)
  const totals = calculateTotals(activityTotals)

  return totals
}

/**
 * Validate regime intervals don't overlap and are valid HH:mm format
 */
export const validateRegimeIntervals = (
  intervals: IntervalDB[],
): { valid: boolean; error?: string } => {
  // Check format
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

  for (const interval of intervals) {
    if (!timeRegex.test(interval.startTime) || !timeRegex.test(interval.endTime)) {
      return { valid: false, error: `Invalid time format. Use HH:mm (24-hour format)` }
    }
  }

  // Check for overlaps
  const sortedIntervals = [...intervals].sort((a, b) => {
    const aStart = a.startTime.localeCompare(b.startTime)
    return aStart
  })

  for (let i = 0; i < sortedIntervals.length - 1; i++) {
    const current = sortedIntervals[i]
    const next = sortedIntervals[i + 1]

    if (!current || !next) continue

    // This is a simplified check, doesn't handle midnight crossing perfectly
    // but gives basic validation
    if (current.endTime > next.startTime && current.startTime !== next.startTime) {
      return { valid: false, error: 'Intervals cannot overlap' }
    }
  }

  return { valid: true }
}
