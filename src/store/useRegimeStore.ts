import { defineStore } from 'pinia'
import type { Regime } from '@/type/mainTypes'
import { useAPIRegime } from '@/API/useAPIRegime'

export const useRegimeStore = defineStore('regime', {
  state: () => ({
    regimes: [] as Regime[],
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    /**
     * Get regimes that are not holidays
     */
    activeRegimes: (state) => state.regimes.filter((r) => !r.isHoliday),

    /**
     * Get holiday regimes
     */
    holidayRegimes: (state) => state.regimes.filter((r) => r.isHoliday),

    /**
     * Find a regime by ID
     */
    getRegimeById: (state) => (id: string) => state.regimes.find((r) => r.id === id),
  },

  actions: {
    async fetchRegimes(): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        const api = useAPIRegime()
        const regimes = await api.getRegimes()

        this.regimes = regimes
        return true
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch regimes'
        return false
      } finally {
        this.isLoading = false
      }
    },

    async createRegime(
      regime: Omit<
        Regime,
        'id' | 'createdAt' | 'updatedAt' | 'user' | 'totalPoints' | 'totalDurationMs'
      >,
    ): Promise<Regime | null> {
      this.isLoading = true
      this.error = null

      try {
        const api = useAPIRegime()
        const newRegime = await api.createRegime(regime)
        this.regimes.push(newRegime)
        return newRegime
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to create regime'
        return null
      } finally {
        this.isLoading = false
      }
    },

    async updateRegime(
      id: string,
      updates: Partial<Omit<Regime, 'id' | 'user' | 'createdAt' | 'updatedAt'>>,
    ): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        const api = useAPIRegime()
        const updatedRegime = await api.updateRegime(id, updates)

        const index = this.regimes.findIndex((r) => r.id === id)
        if (index !== -1) {
          this.regimes[index] = updatedRegime
        }

        return true
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to update regime'
        return false
      } finally {
        this.isLoading = false
      }
    },

    async deleteRegime(id: string): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        const api = useAPIRegime()
        await api.deleteRegime(id)
        this.regimes = this.regimes.filter((r) => r.id !== id)
        return true
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to delete regime'
        return false
      } finally {
        this.isLoading = false
      }
    },

    clearRegimes() {
      this.regimes = []
      this.error = null
    },
  },
})
