import { useActivityStore } from '@/store/useActivityStore'
import { useStampStore } from '@/store/useStampStore'

/**
 * Bundle Service - orchestrates loading all user data after authentication
 * This is the central place to fetch all necessary user data on login/session restore
 */
export const useBundleService = () => {
  const activityStore = useActivityStore()
  const stampStore = useStampStore()

  /**
   * Load all user data - called after login or session restore
   */
  const loadUserBundle = async (): Promise<void> => {
    try {
      await Promise.all([activityStore.fetchActivities(), stampStore.fetchStamps()])
    } catch (error) {
      console.error('Failed to load user bundle:', error)
      throw error
    }
  }

  /**
   * Clear all user data - called on logout
   */
  const clearUserBundle = (): void => {
    activityStore.clearActivities()
    stampStore.clearStamps()
  }

  return {
    loadUserBundle,
    clearUserBundle,
  }
}
