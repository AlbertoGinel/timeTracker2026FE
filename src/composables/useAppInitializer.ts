import { useMockAPI } from '@/API/MockAPI/useMockAPI'
import { useAuthStore } from '@/stores/useAuthStore'

export const useAppInitializer = () => {
  /**
   * Initialize the application
   * - Set up the mock database
   * - Restore user session if available
   */
  const initializeApp = async (): Promise<void> => {
    try {
      console.log('Initializing application...')

      // Initialize mock database
      const mockAPI = useMockAPI()
      await mockAPI.initializeMockDB()

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
