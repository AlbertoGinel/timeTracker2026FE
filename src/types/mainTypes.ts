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
