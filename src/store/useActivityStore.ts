import { defineStore } from 'pinia'
import type { Activity } from '@/type/mainTypes'
import { useAPIActivity } from '@/API/useAPIActivity'

export const useActivityStore = defineStore('activity', {
  state: () => ({
    activities: [] as Activity[],
    isLoading: false,
    error: null as string | null,
  }),

  getters: {},

  actions: {
    async fetchActivities(): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        const api = useAPIActivity()
        const activities = await api.getActivities()

        this.activities = activities
        return true
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch activities'
        return false
      } finally {
        this.isLoading = false
      }
    },

    async createActivity(
      activity: Omit<Activity, 'id' | 'created_at' | 'updated_at' | 'user'>,
    ): Promise<Activity | null> {
      this.isLoading = true
      this.error = null

      try {
        const api = useAPIActivity()
        const newActivity = await api.createActivity(activity)
        this.activities.push(newActivity)
        return newActivity
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to create activity'
        return null
      } finally {
        this.isLoading = false
      }
    },

    async updateActivity(id: string, updates: Partial<Activity>): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        const api = useAPIActivity()
        const updatedActivity = await api.updateActivity(id, updates)

        const index = this.activities.findIndex((a) => a.id === id)
        if (index !== -1) {
          this.activities[index] = updatedActivity
        }

        return true
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to update activity'
        return false
      } finally {
        this.isLoading = false
      }
    },

    async deleteActivity(id: string): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        const api = useAPIActivity()
        await api.deleteActivity(id)
        this.activities = this.activities.filter((a) => a.id !== id)
        return true
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to delete activity'
        return false
      } finally {
        this.isLoading = false
      }
    },

    clearActivities() {
      this.activities = []
      this.error = null
    },
  },
})
