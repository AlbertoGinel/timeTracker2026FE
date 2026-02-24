import type { User, Bundle } from '@/type/mainTypes'

/**
 * API Response Types
 * Types for data returned from API endpoints
 */

// User without password (for API responses)
export type UserResponse = Omit<User, 'password'>

// Auth response types (login and session restore)

export type AuthResponseRegularUser = {
  userAuth: UserResponse
  bundle: Bundle
}

export type AuthResponseAdmin = {
  userAuth: UserResponse
  usersList: UserResponse[]
}

export type AuthResponse = AuthResponseRegularUser | AuthResponseAdmin
