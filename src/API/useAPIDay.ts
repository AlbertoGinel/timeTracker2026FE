import type { Day } from '@/type/mainTypes'
import { useHandleRequest } from './useHandleRequest'

/**
 * Day API - handles fetching day data (computed from stamps)
 * In development: MSW intercepts these requests and computes days on-the-fly
 * In production: Will connect to real backend API
 */
export const useAPIDay = () => {
  const { handleRequest } = useHandleRequest()

  /**
   * Get days for a date range
   * Backend returns all days (materialized with regimes + computed from stamps)
   * Already sorted by dateKey descending
   */
  const getDaysInRange = async (
    fromDate: string, // YYYY-MM-DD
    toDate: string, // YYYY-MM-DD
  ): Promise<Day[]> => {
    // Backend already returns complete range with all data properly computed
    const days = await handleRequest<Day[]>(`/api/days/?from=${fromDate}&to=${toDate}`)
    return days
  }

  return {
    getDaysInRange,
  }
}
