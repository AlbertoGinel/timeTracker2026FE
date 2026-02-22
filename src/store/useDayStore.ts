import { defineStore } from 'pinia'
import type { Day } from '@/type/mainTypes'
import { useAPIDay } from '@/API/useAPIDay'

export const useDayStore = defineStore('day', {
  state: () => ({
    days: [] as Day[],
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    getDayByDateKey: (state) => (dateKey: string) => {
      return state.days.find((day) => day.dateKey === dateKey)
    },
  },

  actions: {
    async fetchDaysInRange(fromDate: string, toDate: string): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        const api = useAPIDay()
        const days = await api.getDaysInRange(fromDate, toDate)
        this.days = days
        return true
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch days'
        return false
      } finally {
        this.isLoading = false
      }
    },

    loadFromBundle(days: Day[]): void {
      this.days = days
      this.error = null
    },

    clearDays() {
      this.days = []
      this.error = null
    },
  },
})
