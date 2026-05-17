import type { RegimeInterval } from '@/type/mainTypes'
import { DateTime } from 'luxon'

/**
 * Convert HH:mm to minutes from midnight
 */
const toMinutes = (time: string): number => {
  const dt = DateTime.fromFormat(time, 'HH:mm')
  return dt.hour * 60 + dt.minute
}

/**
 * Convert minutes from midnight to HH:mm
 */
const toTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return DateTime.fromObject({ hour: hours, minute: mins }).toFormat('HH:mm')
}

/**
 * Check intervals for collision and auto-adjust if needed
 * Returns adjusted { startTime, endTime }
 * Minimum duration: 10 minutes
 */
export const validateIntervalTime = (
  intervalId: string,
  newStart: string,
  newEnd: string,
  allIntervals: RegimeInterval[],
): { startTime: string; endTime: string } => {
  const MIN_DURATION = 10 // 10 minutes minimum
  let startMin = toMinutes(newStart)
  let endMin = toMinutes(newEnd)

  // Ensure end is at least 10 minutes after start
  if (endMin < startMin + MIN_DURATION) {
    endMin = startMin + MIN_DURATION
  }

  // Check other intervals for collisions
  const others = allIntervals.filter((i) => i.intervalId !== intervalId)

  for (const interval of others) {
    const otherStart = toMinutes(interval.startTime)
    const otherEnd = toMinutes(interval.endTime)

    // Check if our start is inside another interval
    if (startMin >= otherStart && startMin < otherEnd) {
      startMin = otherEnd // Snap to end of blocking interval
      if (endMin < startMin + MIN_DURATION) endMin = startMin + MIN_DURATION
    }

    // Check if our end is inside another interval
    if (endMin > otherStart && endMin <= otherEnd) {
      endMin = otherStart - 1 // Snap to 1 min before blocking interval
      if (endMin < startMin + MIN_DURATION) startMin = Math.max(0, endMin - MIN_DURATION)
    }

    // Check if we completely wrap another interval
    if (startMin < otherStart && endMin > otherEnd) {
      endMin = otherStart - 1 // Snap end before blocking interval
      if (endMin < startMin + MIN_DURATION) endMin = startMin + MIN_DURATION
    }
  }

  // Clamp to day bounds
  startMin = Math.max(0, Math.min(startMin, 1430)) // 1430 to allow 10 min before midnight
  endMin = Math.max(MIN_DURATION, Math.min(endMin, 1440))

  // Final check: ensure minimum duration is maintained
  if (endMin < startMin + MIN_DURATION) {
    endMin = startMin + MIN_DURATION
  }

  return {
    startTime: toTime(startMin),
    endTime: toTime(endMin),
  }
}
