import type { Bundle } from '@/type/mainTypes'
import { useHandleRequest } from './useHandleRequest'

/**
 * Bundle API - handles fetching complete user data bundle
 * In development: MSW intercepts these requests and computes the bundle
 * In production: Will connect to real backend API
 */
export const useAPIBundle = () => {
  const { handleRequest } = useHandleRequest()

  /**
   * Get complete user bundle (regimes, activities, stamps, intervals, days, time sections)
   * Backend orchestrates all calculations in correct order and returns everything
   *
   * @param fromDate - Start date (YYYY-MM-DD)
   * @param toDate - End date (YYYY-MM-DD)
   * @param userId - Optional: User ID (for admin to fetch other users' data)
   */
  const getBundle = async (
    fromDate: string, // YYYY-MM-DD
    toDate: string, // YYYY-MM-DD
    userId?: string, // Optional: for admin access
  ): Promise<Bundle> => {
    const params = new URLSearchParams({ from: fromDate, to: toDate })
    if (userId) {
      params.append('userId', userId)
    }
    const bundle = await handleRequest<Bundle>(`/api/bundle/?${params.toString()}`)
    return bundle
  }

  return {
    getBundle,
  }
}
