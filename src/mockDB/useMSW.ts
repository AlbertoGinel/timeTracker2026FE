import { setupWorker } from 'msw/browser'
import { initializeDatabase, db, sessionStorage } from './useMSWDatabase'
import { useAuthHandlers } from './handlers/useAuthHandlers'
import { useActivityHandlers } from './handlers/useActivityHandlers'
import { useAdminHandlers } from './handlers/useAdminHandlers'
import { useStampHandlers } from './handlers/useStampHandlers'
import { useIntervalHandlers } from './handlers/useIntervalHandlers'
import { useDayHandlers } from './handlers/useDayHandlers'
import { useRegimeHandlers } from './handlers/useRegimeHandlers'

// Extend Window interface for debug utilities
declare global {
  interface Window {
    mockDB: typeof db
    mockSessions: typeof sessionStorage
  }
}

export const useMSW = () => {
  const setupMSW = async () => {
    // Initialize database with mock data (checks IndexedDB first)
    await initializeDatabase()

    if (import.meta.env.DEV) {
      window.mockDB = db
      window.mockSessions = sessionStorage
    }

    // Combine all handlers
    const handlers = [
      ...useAuthHandlers(),
      ...useActivityHandlers(),
      ...useAdminHandlers(),
      ...useStampHandlers(),
      ...useIntervalHandlers(),
      ...useDayHandlers(),
      ...useRegimeHandlers(),
    ]

    // Setup worker
    const worker = setupWorker(...handlers)

    // Start worker
    await worker.start({
      onUnhandledRequest: 'bypass',
    })

    console.log('🔶 MSW (Mock Service Worker) enabled')
  }

  return { setupMSW }
}
