import type { User, Activity } from '@/type/mainTypes'
import { useHandleRequest } from './useHandleRequest'

/**
 * Admin API - handles admin operations for managing users
 * In development: MSW intercepts these requests
 * In production: Will connect to real backend API
 */
export const useAPIAdmin = () => {
  const { handleRequest } = useHandleRequest()

  return {
    getAllUsers: () => handleRequest<User[]>('/api/admin/users/'),

    getUserById: (id: string) => handleRequest<User>(`/api/admin/users/${id}/`),

    updateUser: (id: string, updates: Partial<User>) =>
      handleRequest<User>(`/api/admin/users/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),

    deleteUser: (id: string) =>
      handleRequest(`/api/admin/users/${id}/`, {
        method: 'DELETE',
      }),

    getActivitiesByUser: (userId: string) =>
      handleRequest<Activity[]>(`/api/admin/users/${userId}/activities/`),
  }
}
