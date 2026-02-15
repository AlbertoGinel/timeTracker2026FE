import { persistToIndexedDB } from './useMSWDatabase'

let persistTimeout: ReturnType<typeof setTimeout> | null = null
let isPersisting = false

/**
 * Debounced auto-persist to IndexedDB
 * Call this after any mutation to the MSW database
 *
 * @param delayMs - Delay in milliseconds before persisting (default 1000ms)
 */
export const autoPersist = (delayMs = 1000) => {
  // Clear any existing timeout
  if (persistTimeout) {
    clearTimeout(persistTimeout)
  }

  // Set a new timeout
  persistTimeout = setTimeout(async () => {
    if (isPersisting) {
      return // Skip if already persisting
    }

    try {
      isPersisting = true
      await persistToIndexedDB()
      console.log('🔄 Auto-persisted to IndexedDB')
    } catch (error) {
      console.error('Error auto-persisting:', error)
    } finally {
      isPersisting = false
    }
  }, delayMs)
}

/**
 * Force an immediate persist (cancels any pending debounced persist)
 */
export const forcePersist = async () => {
  if (persistTimeout) {
    clearTimeout(persistTimeout)
    persistTimeout = null
  }

  if (isPersisting) {
    return // Already persisting
  }

  try {
    isPersisting = true
    await persistToIndexedDB()
    console.log('🔄 Force-persisted to IndexedDB')
  } catch (error) {
    console.error('Error force-persisting:', error)
  } finally {
    isPersisting = false
  }
}
