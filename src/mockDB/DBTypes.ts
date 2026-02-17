import type { UserRole, StampType } from '@/type/mainTypes'

// DB Types (storage shapes - minimal, with only IDs)

export type UserDB = {
  id: string
  username: string
  password: string
  nickname: string
  role: UserRole
  timezone: string
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
  isFinalized: boolean
  createdAt: string
  updatedAt: string
}
