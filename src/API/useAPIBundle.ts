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
   */
  const getBundle = async (
    fromDate: string, // YYYY-MM-DD
    toDate: string, // YYYY-MM-DD
  ): Promise<Bundle> => {
    const bundle = await handleRequest<Bundle>(`/api/bundle/?from=${fromDate}&to=${toDate}`)
    return bundle
  }

  return {
    getBundle,
  }
}
