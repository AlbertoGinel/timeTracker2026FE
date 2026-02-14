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

export type DayIntervalDB = {
  intervalId: string
  activityId: string
  startLocal: string
  endLocal: string
  durationMs: number
}

export type DayActivityTotalDB = {
  activityId: string
  durationMs: number
  pointsTotal: number
  pointsPerHourSnapshot: number
}

export type DayDB = {
  id: string
  user: string
  timezone: string
  dateKey: string
  intervals: DayIntervalDB[]
  activityTotals: DayActivityTotalDB[]
  totalDurationMs: number
  totalPoints: number
  isFinalized: boolean
  createdAt: string
  updatedAt: string
}
