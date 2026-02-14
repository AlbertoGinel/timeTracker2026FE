export type UserRole = 'admin' | 'regular'

export type User = {
  id: string
  username: string
  password: string
  nickname: string
  role: UserRole
  timezone: string
}

export type Activity = {
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

export type Session = {
  token: string
  userId: string
  createdAt: number
  expiresAt: number
}

export type StampType = 'start' | 'stop'

export interface Stamp {
  id: string
  timestamp: string // ISO string without timezone (e.g., "2026-02-08T20:45:30")
  user: string // User ID
  type: StampType
  activity_id: string | null // Required for 'start', null for 'stop'
}

export type ActivitySummary = Pick<Activity, 'id' | 'color' | 'name' | 'icon'>

export interface StampWithActivity extends Stamp {
  activity: ActivitySummary | null
}

export type ActivityInfo = Pick<
  Activity,
  'id' | 'name' | 'color' | 'icon' | 'points_per_hour' | 'seconds_free'
>

export interface Interval {
  id: string
  fromDate: string // ISO string with Z (UTC), e.g., "2025-06-21T20:31:50Z"
  toDate: string | null // ISO string with Z (UTC), null if ongoing
  duration: number // integer seconds (no decimals)
  activity: ActivityInfo
}

// Day types (serialized responses with populated activity objects)

export type DayInterval = {
  intervalId: string
  activityId: string
  activity: ActivitySummary // Populated from activities table
  startLocal: string
  endLocal: string
  durationMs: number
}

export type DayActivityTotal = {
  activityId: string
  activity: ActivitySummary // Populated from activities table
  durationMs: number
  pointsTotal: number
  pointsPerHourSnapshot: number
}

export type Day = {
  id: string
  user: string
  timezone: string
  dateKey: string
  dayStartUtc: string
  dayEndUtc: string
  dayLengthMs: number
  timezoneOffsetStart: number
  timezoneOffsetEnd: number
  intervals: DayInterval[]
  activityTotals: DayActivityTotal[]
  totalDurationMs: number
  totalPoints: number
  isFinalized: boolean
  createdAt: string
  updatedAt: string
}
