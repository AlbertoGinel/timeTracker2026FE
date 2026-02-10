import { defineStore } from 'pinia'
import type { Stamp, StampWithActivity } from '@/type/mainTypes'
import { useAPIStamp } from '@/API/useAPIStamp'

export const useStampStore = defineStore('stamp', {
  state: () => ({
    stamps: [] as StampWithActivity[],
    isLoading: false,
    error: null as string | null,
  }),

  getters: {},

  actions: {
    async fetchStamps(): Promise<boolean> {
      console.log('[StampStore] fetchStamps - Starting')
      this.isLoading = true
      this.error = null

      try {
        const api = useAPIStamp()
        console.log('[StampStore] Calling api.getStamps()')
        const stamps = await api.getStamps()

        console.log('[StampStore] Stamps received:', stamps)
        this.stamps = stamps
        return true
      } catch (err) {
        console.error('[StampStore] Error fetching stamps:', err)
        this.error = err instanceof Error ? err.message : 'Failed to fetch stamps'
        return false
      } finally {
        this.isLoading = false
      }
    },

    async createStamp(stamp: Omit<Stamp, 'id' | 'user'>): Promise<StampWithActivity | null> {
      this.isLoading = true
      this.error = null

      try {
        const api = useAPIStamp()
        const newStamp = await api.createStamp(stamp)
        return newStamp
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to create stamp'
        return null
      } finally {
        this.isLoading = false
      }
    },

    async updateStamp(id: string, updates: Partial<Stamp>): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        const api = useAPIStamp()
        const updatedStamp = await api.updateStamp(id, updates)

        const index = this.stamps.findIndex((s) => s.id === id)
        if (index !== -1) {
          this.stamps[index] = updatedStamp
        }

        return true
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to update stamp'
        return false
      } finally {
        this.isLoading = false
      }
    },

    async deleteStamp(id: string): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        const api = useAPIStamp()
        await api.deleteStamp(id)
        this.stamps = this.stamps.filter((s) => s.id !== id)
        return true
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to delete stamp'
        return false
      } finally {
        this.isLoading = false
      }
    },

    clearStamps() {
      this.stamps = []
      this.error = null
    },
  },
})
