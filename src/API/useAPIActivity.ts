import type { Activity } from '@/type/mainTypes'
import { useHandleRequest } from './useHandleRequest'

/**
 * Activity API - handles CRUD operations for activities
 * In development: MSW intercepts these requests
 * In production: Will connect to real backend API
 */
export const useAPIActivity = () => {
  const { handleRequest } = useHandleRequest()

  return {
    getActivities: () => handleRequest<Activity[]>('/api/activities/'),

    createActivity: (activity: Omit<Activity, 'id' | 'created_at' | 'updated_at' | 'user'>) =>
      handleRequest<Activity>('/api/activities/', {
        method: 'POST',
        body: JSON.stringify(activity),
      }),

    updateActivity: (id: string, updates: Partial<Activity>) =>
      handleRequest<Activity>(`/api/activities/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),

    deleteActivity: (id: string) =>
      handleRequest(`/api/activities/${id}/`, {
        method: 'DELETE',
      }),
  }
}
