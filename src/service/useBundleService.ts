import { DateTime } from 'luxon'
import { useActivityStore } from '@/store/useActivityStore'
import { useStampStore } from '@/store/useStampStore'
import { useIntervalStore } from '@/store/useIntervalStore'
import { useDayStore } from '@/store/useDayStore'
import { useRegimeStore } from '@/store/useRegimeStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useTimeSectionStore } from '@/store/useTimeSectionStore'
import { useAPIBundle } from '@/API/useAPIBundle'

/**
 * Bundle Service - orchestrates loading all user data after authentication
 * This is the central place to fetch all necessary user data on login/session restore
 */
export const useBundleService = () => {
  const activityStore = useActivityStore()
  const stampStore = useStampStore()
  const intervalStore = useIntervalStore()
  const dayStore = useDayStore()
  const regimeStore = useRegimeStore()
  const timeSectionStore = useTimeSectionStore()
  const authStore = useAuthStore()

  /**
   * Load all user data - called after login or session restore
   * Now uses the bundle endpoint to fetch everything in one request
   */
  const loadUserBundle = async (): Promise<void> => {
    try {
      const user = authStore.currentUser
      if (!user) {
        throw new Error('No authenticated user found')
      }

      // Calculate date range: 30 days before and 30 days after today
      const today = DateTime.now().setZone(user.timezone)
      const fromDate = today.minus({ days: 30 }).toISODate()!
      const toDate = today.plus({ days: 30 }).toISODate()!

      // Fetch the complete bundle in one request
      const api = useAPIBundle()
      const bundle = await api.getBundle(fromDate, toDate)

      // Load data into stores
      regimeStore.loadFromBundle(bundle.regimes)
      activityStore.loadFromBundle(bundle.activities)
      stampStore.loadFromBundle(bundle.stamps)
      intervalStore.loadFromBundle(bundle.intervals)
      dayStore.loadFromBundle(bundle.days)
      timeSectionStore.loadFromBundle(bundle.timeSections)
    } catch (error) {
      console.error('Failed to load user bundle:', error)
      throw error
    }
  }

  /**
   * Clear all user data - called on logout
   */
  const clearUserBundle = (): void => {
    regimeStore.clearRegimes()
    activityStore.clearActivities()
    stampStore.clearStamps()
    intervalStore.clearIntervals()
    dayStore.clearDays()
    timeSectionStore.clearTimeSections()
  }

  return {
    loadUserBundle,
    clearUserBundle,
  }
}
