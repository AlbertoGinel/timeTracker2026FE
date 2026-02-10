import { defineStore } from 'pinia'
import type { Interval } from '@/type/mainTypes'
import { useAPIInterval } from '@/API/useAPIInterval'

export const useIntervalStore = defineStore('interval', {
  state: () => ({
    intervals: [] as Interval[],
    isLoading: false,
    error: null as string | null,
  }),

  getters: {},

  actions: {
    async fetchIntervals(): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        const api = useAPIInterval()
        const intervals = await api.getIntervals()
        this.intervals = intervals
        return true
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch intervals'
        return false
      } finally {
        this.isLoading = false
      }
    },

    clearIntervals() {
      this.intervals = []
      this.error = null
    },
  },
})
