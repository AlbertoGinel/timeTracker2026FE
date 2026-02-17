import type { Regime } from '@/type/mainTypes'
import { useHandleRequest } from './useHandleRequest'

/**
 * Regime API - handles CRUD operations for regimes (24-hour model days)
 * In development: MSW intercepts these requests
 * In production: Will connect to real backend API
 */
export const useAPIRegime = () => {
  const { handleRequest } = useHandleRequest()

  return {
    /**
     * Get all regimes for the current user
     */
    getRegimes: () => handleRequest<Regime[]>('/api/regimes/'),

    /**
     * Get a single regime by ID
     */
    getRegime: (id: string) => handleRequest<Regime>(`/api/regimes/${id}/`),

    /**
     * Create a new regime
     */
    createRegime: (
      regime: Omit<
        Regime,
        'id' | 'createdAt' | 'updatedAt' | 'user' | 'totalPoints' | 'totalDurationMs'
      >,
    ) =>
      handleRequest<Regime>('/api/regimes/', {
        method: 'POST',
        body: JSON.stringify(regime),
      }),

    /**
     * Update an existing regime
     */
    updateRegime: (
      id: string,
      updates: Partial<Omit<Regime, 'id' | 'user' | 'createdAt' | 'updatedAt'>>,
    ) =>
      handleRequest<Regime>(`/api/regimes/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),

    /**
     * Delete a regime
     */
    deleteRegime: (id: string) =>
      handleRequest(`/api/regimes/${id}/`, {
        method: 'DELETE',
      }),
  }
}
