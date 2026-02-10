import type { Interval } from '@/type/mainTypes'
import { useHandleRequest } from './useHandleRequest'

/**
 * Interval API - derived data, fetched from backend
 * In development: MSW intercepts these requests
 * In production: Will connect to real backend API
 */
export const useAPIInterval = () => {
  const { handleRequest } = useHandleRequest()

  return {
    getIntervals: () => handleRequest<Interval[]>('/api/intervals/'),
  }
}
