import { computed, type ComputedRef } from 'vue'
import { DateTime } from 'luxon'
import type { DayInterval, RegimeInterval } from '@/type/mainTypes'

// Union type that works with both Day and Regime intervals
export type TimelineInterval = DayInterval | RegimeInterval

export type TimelineBlock = {
  x: number
  width: number
  color: string
  startLabel: string
  endLabel: string
  activityName: string
  activityIcon: string
}

export type HourLabel = {
  value: number
  label: string
  x: number
}

export function useCronoDay(
  intervals: ComputedRef<TimelineInterval[]>,
  width = 1200,
  padding = 50,
) {
  const timelineWidth = computed(() => width - padding * 2)

  // Convert time string (HH:mm or ISO) to minutes from start of day
  const timeToMinutes = (timeStr: string): number => {
    // Handle ISO format (e.g., "2026-02-08T20:45:30")
    if (timeStr.includes('T')) {
      const dt = DateTime.fromISO(timeStr)
      return dt.hour * 60 + dt.minute
    }
    // Handle HH:mm format
    const dt = DateTime.fromFormat(timeStr, 'HH:mm')
    return dt.hour * 60 + dt.minute
  }

  // Convert minutes to X position on timeline
  const minutesToPosition = (minutes: number): number => {
    const dayMinutes = 24 * 60
    return padding + (minutes / dayMinutes) * timelineWidth.value
  }

  // Convert time string to position
  const timeToPosition = (timeStr: string): number => {
    const minutes = timeToMinutes(timeStr)
    return minutesToPosition(minutes)
  }

  // Format time from ISO or HH:mm to HH:mm display
  const formatTime = (timeStr: string): string => {
    if (timeStr.includes('T')) {
      const dt = DateTime.fromISO(timeStr)
      return dt.toFormat('HH:mm')
    }
    // Already in HH:mm format, validate and return
    const dt = DateTime.fromFormat(timeStr, 'HH:mm')
    return dt.toFormat('HH:mm')
  }

  // Generate hour labels for timeline
  const hourLabels = computed<HourLabel[]>(() => {
    const hours = [0, 3, 6, 9, 12, 15, 18, 21, 24]
    return hours.map((hour) => ({
      value: hour,
      label: `${String(hour % 24).padStart(2, '0')}:00`,
      x: padding + (hour / 24) * timelineWidth.value,
    }))
  })

  // Convert intervals to timeline blocks
  const timelineBlocks = computed<TimelineBlock[]>(() => {
    return intervals.value.map((interval) => {
      // Handle both DayInterval (startLocal/endLocal) and RegimeInterval (startTime/endTime)
      const startTime = 'startLocal' in interval ? interval.startLocal : interval.startTime
      const endTime = 'endLocal' in interval ? interval.endLocal : interval.endTime

      const startX = timeToPosition(startTime)
      const endX = timeToPosition(endTime)

      return {
        x: startX,
        width: endX - startX,
        color: interval.activity.color,
        startLabel: formatTime(startTime),
        endLabel: formatTime(endTime),
        activityName: interval.activity.name,
        activityIcon: interval.activity.icon,
      }
    })
  })

  return {
    hourLabels,
    timelineBlocks,
    timelineWidth,
    padding,
  }
}
