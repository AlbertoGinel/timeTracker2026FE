import type { Stamp, StampWithActivity } from '@/type/mainTypes'
import { useHandleRequest } from './useHandleRequest'

/**
 * Stamp API - handles CRUD operations for stamps
 * In development: MSW intercepts these requests
 * In production: Will connect to real backend API
 */
export const useAPIStamp = () => {
  const { handleRequest } = useHandleRequest()

  return {
    getStamps: () => {
      console.log('[APIStamp] getStamps - Calling /api/stamps/')
      return handleRequest<StampWithActivity[]>('/api/stamps/')
    },

    createStamp: (stamp: Omit<Stamp, 'id' | 'user'>) =>
      handleRequest<StampWithActivity>('/api/stamps/', {
        method: 'POST',
        body: JSON.stringify(stamp),
      }),

    updateStamp: (id: string, updates: Partial<Stamp>) =>
      handleRequest<StampWithActivity>(`/api/stamps/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),

    deleteStamp: (id: string) =>
      handleRequest(`/api/stamps/${id}/`, {
        method: 'DELETE',
      }),
  }
}
