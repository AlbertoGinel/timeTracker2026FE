export type UserRole = 'admin' | 'regular'

export type ScaleLevel = {
  name: string
  color: string
  icon: string
  percent: number
}

export type User = {
  id: string
  username: string
  password: string
  nickname: string
  role: UserRole
  timezone: string
  scale: ScaleLevel[]
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
  id: string | null // null if not materialized in DB
  user: string
  timezone: string
  dateKey: string
  regime: RegimeSummary | null // Populated regime summary, null if no regime assigned or not materialized
  dayStartUtc: string
  dayEndUtc: string
  dayLengthMs: number
  timezoneOffsetStart: number
  timezoneOffsetEnd: number
  intervals: DayInterval[]
  activityTotals: DayActivityTotal[]
  totalDurationMs: number
  totalPoints: number
  percentageAchieved: number | null
  achievedLevel: ScaleLevel | null
  isShelved: boolean | null // null if not materialized in DB, false if materialized but not shelved, true if shelved
  createdAt: string | null // null if not materialized in DB
  updatedAt: string | null // null if not materialized in DB
}

// Regime types (24-hour model days created by user)

export type RegimeInterval = {
  intervalId: string
  activityId: string
  activity: ActivitySummary // Populated from activities table
  startTime: string // HH:mm format (e.g., "09:00")
  endTime: string // HH:mm format (e.g., "17:00")
  durationMs: number
}

export type Regime = {
  id: string
  user: string
  icon: string // Emoji icon for the regime (e.g., "💼", "🏖️", "🌅")
  name: string // "workday", "holidays", "midday", "softday", "epicday", etc.
  isHoliday: boolean // true for holiday regimes (no stamps, not counted in weeks/months/years)
  intervals: RegimeInterval[]
  totalPoints: number // calculated points for this 24h model
  totalDurationMs: number // total duration of all intervals
  createdAt: string
  updatedAt: string
}

export type RegimeSummary = Pick<
  Regime,
  'id' | 'icon' | 'name' | 'isHoliday' | 'totalPoints' | 'totalDurationMs'
>

// TimeSection types (weeks, months, years aggregated from days)

export type TimeSectionType = 'week' | 'month' | 'year'

export type TimeSectionActivityTotal = {
  activityId: string
  activity: ActivitySummary
  durationMs: number
  pointsTotal: number
}

export type TimeSection = {
  id: string
  user: string
  timezone: string
  sectionType: TimeSectionType
  sectionKey: string
  sectionPassed: number
  startUtc: string
  endUtc: string
  lengthMs: number
  activityTotals: TimeSectionActivityTotal[]
  totalDurationMs: number
  totalPoints: number
  percentageAchieved: number | null
  achievedLevel: ScaleLevel | null
  isShelved: boolean
  createdAt: string
  updatedAt: string
}

// Bundle type (complete user data snapshot)

export type Bundle = {
  regimes: Regime[]
  activities: Activity[]
  stamps: StampWithActivity[]
  intervals: Interval[]
  days: Day[]
  timeSections: {
    weeks: TimeSection[]
    months: TimeSection[]
    years: TimeSection[]
  }
}
