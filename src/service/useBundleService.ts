import { DateTime } from 'luxon'
import { useActivityStore } from '@/store/useActivityStore'
import { useStampStore } from '@/store/useStampStore'
import { useIntervalStore } from '@/store/useIntervalStore'
import { useDayStore } from '@/store/useDayStore'
import { useRegimeStore } from '@/store/useRegimeStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useTimeSectionStore } from '@/store/useTimeSectionStore'
import { useAPIBundle } from '@/API/useAPIBundle'
import type { Bundle } from '@/type/mainTypes'

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
   *
   * @param userId - Optional: Load bundle for a specific user (admin only)
   */
  const loadUserBundle = async (userId?: string): Promise<void> => {
    try {
      const loggedInUser = authStore.loggedInUser
      if (!loggedInUser) {
        throw new Error('No authenticated user found')
      }

      // If userId is provided, verify logged in user is admin
      if (userId && loggedInUser.role !== 'admin') {
        throw new Error('Admin access required to load other users data')
      }

      // Use loggedInUser timezone for date calculations (default)
      // This will be used to compute ±30 days from today
      const today = DateTime.now().setZone(loggedInUser.timezone)
      const fromDate = today.minus({ days: 30 }).toISODate()!
      const toDate = today.plus({ days: 30 }).toISODate()!

      // Fetch the complete bundle in one request
      const api = useAPIBundle()
      const bundle = await api.getBundle(fromDate, toDate, userId)

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
   * Load bundle data directly from auth response
   * Called when user logs in or session is restored
   */
  const loadBundleFromAuthResponse = (bundle: Bundle): void => {
    regimeStore.loadFromBundle(bundle.regimes)
    activityStore.loadFromBundle(bundle.activities)
    stampStore.loadFromBundle(bundle.stamps)
    intervalStore.loadFromBundle(bundle.intervals)
    dayStore.loadFromBundle(bundle.days)
    timeSectionStore.loadFromBundle(bundle.timeSections)
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
    loadBundleFromAuthResponse,
    clearUserBundle,
  }
}
