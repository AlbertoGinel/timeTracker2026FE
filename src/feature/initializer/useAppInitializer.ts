import { useAuthStore } from '@/store/useAuthStore'
import { useMSW } from '@/mockDB/useMSW'

let initialized = false

export const useAppInitializer = () => {
  /**
   * Initialize the application
   * - Set up MSW (Mock Service Worker)
   * - Restore user session if available
   * - Bundle/users are loaded automatically from auth response
   */
  const initializeApp = async (): Promise<void> => {
    if (initialized) return
    initialized = true

    try {
      console.log('Initializing application...')

      // Initialize MSW in development
      if (import.meta.env.DEV) {
        const { setupMSW } = useMSW()
        await setupMSW()
        console.log('MSW initialized')
      }

      // Try to restore user session
      // This will automatically load bundle/users from the auth response
      const authStore = useAuthStore()
      const sessionRestored = await authStore.restoreSession()

      if (sessionRestored) {
        console.log('User session restored')
      } else {
        console.log('No previous session found')
      }

      console.log('Application initialized successfully')
    } catch (error) {
      console.error('Failed to initialize application:', error)
      throw error
    }
  }

  return {
    initializeApp,
  }
}
