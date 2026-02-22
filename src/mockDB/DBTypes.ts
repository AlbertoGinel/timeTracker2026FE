import type { UserRole, StampType } from '@/type/mainTypes'

// DB Types (storage shapes - minimal, with only IDs)

export type ScaleLevelDB = {
  name: string
  color: string
  icon: string
  percent: number
}

export type UserDB = {
  id: string
  username: string
  password: string
  nickname: string
  role: UserRole
  timezone: string
  scale: ScaleLevelDB[]
}

export type ActivityDB = {
  id: string
  color: string
  name: string
  icon: string
  points_per_hour: number
  seconds_free: number
  created_at: string
  updated_at: string
  user: string
}

export type StampDB = {
  id: string
  timestamp: string
  user: string
  type: StampType
  activity_id: string | undefined
}

export type IntervalDB = {
  intervalId: string
  activityId: string
  startTime: string // For regimes: "HH:mm" format. For days: ISO timestamp
  endTime: string // For regimes: "HH:mm" format. For days: ISO timestamp
  durationMs: number
}

export type DayActivityTotalDB = {
  activityId: string
  durationMs: number
  pointsTotal: number
  pointsPerHourSnapshot: number
}

export type RegimeDB = {
  id: string
  user: string
  icon: string
  name: string // "workday", "holidays", "midday", "softday", "epicday", etc.
  isHoliday: boolean // true for holiday regimes (no stamps, not counted in weeks/months/years)
  intervals: IntervalDB[]
  totalPoints: number // calculated points for this 24h model
  totalDurationMs: number // total duration of all intervals
  createdAt: string
  updatedAt: string
}

export type DayDB = {
  id: string
  user: string
  timezone: string
  dateKey: string
  regimeId: string | undefined
  intervals: IntervalDB[]
  activityTotals: DayActivityTotalDB[]
  totalDurationMs: number
  totalPoints: number
  percentageAchieved: number | null
  achievedLevel: ScaleLevelDB | null
  isShelved: boolean
  createdAt: string
  updatedAt: string
}

export type TimeSectionActivityTotalDB = {
  activityId: string
  durationMs: number
  pointsTotal: number
}

export type TimeSectionType = 'week' | 'month' | 'year'

export type TimeSectionDB = {
  id: string // format: userId:sectionType:startDate (e.g., "uuid:month:2026-02")
  user: string
  timezone: string
  sectionType: TimeSectionType
  sectionKey: string // Luxon-generated: "Week 7 2026", "February 2026", "2026"
  sectionPassed: number // percentage (0-100) of the section that has elapsed
  startUtc: string // ISO timestamp
  endUtc: string // ISO timestamp
  lengthMs: number // total duration of the section in milliseconds
  activityTotals: TimeSectionActivityTotalDB[]
  totalDurationMs: number // total activity time within the section
  totalPoints: number // sum of points from all activities
  percentageAchieved: number | null // average of days (0-200% capped, excludes no-regime and holiday days)
  achievedLevel: ScaleLevelDB | null
  isShelved: boolean
  createdAt: string
  updatedAt: string
}
