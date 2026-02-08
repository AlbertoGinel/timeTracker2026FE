import type { User } from '@/type/mainTypes'
import { useHandleRequest } from './useHandleRequest'
/**
 * Authentication API - handles user login, logout, and profile operations
 * In development: MSW intercepts these requests
 * In production: Will connect to real backend API
 */
export const useAPIAuth = () => {
  const { handleRequest } = useHandleRequest()
  return {
    login: (username: string, password: string) =>
      handleRequest<User>('/api/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),

    logout: () =>
      handleRequest('/api/auth/logout/', {
        method: 'POST',
      }),

    getCurrentUserProfile: () => handleRequest<User>('/api/auth/profile/'),

    updateProfile: (updates: Partial<User>) =>
      handleRequest<User>('/api/auth/profile/', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),
  }
}
