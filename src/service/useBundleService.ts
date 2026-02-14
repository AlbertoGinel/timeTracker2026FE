import { DateTime } from 'luxon'
import { useActivityStore } from '@/store/useActivityStore'
import { useStampStore } from '@/store/useStampStore'
import { useIntervalStore } from '@/store/useIntervalStore'
import { useDayStore } from '@/store/useDayStore'
import { useAuthStore } from '@/store/useAuthStore'

/**
 * Bundle Service - orchestrates loading all user data after authentication
 * This is the central place to fetch all necessary user data on login/session restore
 */
export const useBundleService = () => {
  const activityStore = useActivityStore()
  const stampStore = useStampStore()
  const intervalStore = useIntervalStore()
  const dayStore = useDayStore()
  const authStore = useAuthStore()

  /**
   * Load all user data - called after login or session restore
   */
  const loadUserBundle = async (): Promise<void> => {
    try {
      const user = authStore.currentUser
      if (!user) {
        throw new Error('No authenticated user found')
      }

      // Calculate date range: 7 days before and 7 days after today
      const today = DateTime.now().setZone(user.timezone)
      const fromDate = today.minus({ days: 7 }).toISODate()!
      const toDate = today.plus({ days: 7 }).toISODate()!

      await Promise.all([
        activityStore.fetchActivities(),
        stampStore.fetchStamps(),
        intervalStore.fetchIntervals(),
        dayStore.fetchDaysInRange(fromDate, toDate, user.timezone, user.id),
      ])
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
    intervalStore.clearIntervals()
    dayStore.clearDays()
  }

  return {
    loadUserBundle,
    clearUserBundle,
  }
}
