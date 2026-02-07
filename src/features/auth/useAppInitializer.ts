import { useAuthStore } from '@/stores/useAuthStore'
import { useMSW } from '@/API/useMSW'

let initialized = false

export const useAppInitializer = () => {
  /**
   * Initialize the application
   * - Set up MSW (Mock Service Worker)
   * - Restore user session if available
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
