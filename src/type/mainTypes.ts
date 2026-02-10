export type UserRole = 'admin' | 'regular'

export type User = {
  id: string
  username: string
  password: string
  nickname: string
  role: UserRole
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
