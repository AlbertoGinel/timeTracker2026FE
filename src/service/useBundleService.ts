import { useActivityStore } from '@/store/useActivityStore'

/**
 * Bundle Service - orchestrates loading all user data after authentication
 * This is the central place to fetch all necessary user data on login/session restore
 */
export const useBundleService = () => {
  const activityStore = useActivityStore()

  /**
   * Load all user data - called after login or session restore
   */
  const loadUserBundle = async (): Promise<void> => {
    try {
      await activityStore.fetchActivities()
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
  }

  return {
    loadUserBundle,
    clearUserBundle,
  }
}
