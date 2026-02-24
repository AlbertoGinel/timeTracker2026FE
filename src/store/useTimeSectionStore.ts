import { defineStore } from 'pinia'
import type { TimeSection } from '@/type/mainTypes'

export const useTimeSectionStore = defineStore('timeSection', {
  state: () => ({
    weeks: [] as TimeSection[],
    months: [] as TimeSection[],
    years: [] as TimeSection[],
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    /**
     * Get a week by its sectionKey
     */
    getWeekByKey: (state) => (sectionKey: string) => {
      const found = state.weeks.find((w) => w.sectionKey === sectionKey)
      console.log('🔍 [getWeekByKey]', sectionKey, {
        found: !!found,
        availableKeys: state.weeks.map((w) => w.sectionKey),
        totalWeeks: state.weeks.length,
      })
      return found
    },

    /**
     * Get a month by its sectionKey
     */
    getMonthByKey: (state) => (sectionKey: string) => {
      return state.months.find((m) => m.sectionKey === sectionKey)
    },

    /**
     * Get a year by its sectionKey
     */
    getYearByKey: (state) => (sectionKey: string) => {
      return state.years.find((y) => y.sectionKey === sectionKey)
    },
  },

  actions: {
    loadFromBundle(timeSections: {
      weeks: TimeSection[]
      months: TimeSection[]
      years: TimeSection[]
    }): void {
      this.weeks = timeSections.weeks
      this.months = timeSections.months
      this.years = timeSections.years
      this.error = null
    },

    clearTimeSections() {
      this.weeks = []
      this.months = []
      this.years = []
      this.error = null
    },
  },
})
