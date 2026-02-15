import type { UserDB, ActivityDB, StampDB, DayDB } from './DBTypes'
import type { Session } from '@/type/mainTypes'

const DB_NAME = 'TimeTrackerMockDB'
const DB_VERSION = 1

// Store names match our MSW factory stores
const STORES = {
  users: 'users',
  activities: 'activities',
  stamps: 'stamps',
  days: 'days',
  sessions: 'sessions',
} as const

export type IndexedDBData = {
  users: UserDB[]
  activities: ActivityDB[]
  stamps: StampDB[]
  days: DayDB[]
  sessions: Session[]
}

/**
 * Opens or creates the IndexedDB database
 */
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.users)) {
        db.createObjectStore(STORES.users, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STORES.activities)) {
        db.createObjectStore(STORES.activities, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STORES.stamps)) {
        db.createObjectStore(STORES.stamps, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STORES.days)) {
        db.createObjectStore(STORES.days, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STORES.sessions)) {
        db.createObjectStore(STORES.sessions, { keyPath: 'token' })
      }

      console.log('📦 IndexedDB: Database structure created')
    }
  })
}

/**
 * Get all records from a specific store
 */
const getAllFromStore = <T>(db: IDBDatabase, storeName: string): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result as T[])
  })
}

/**
 * Add multiple records to a store (replaces existing data)
 */
const putAllToStore = <T extends { id?: string; token?: string }>(
  db: IDBDatabase,
  storeName: string,
  data: T[],
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)

    // Clear existing data first
    store.clear()

    // Add all records
    data.forEach((item) => store.put(item))

    transaction.onerror = () => reject(transaction.error)
    transaction.oncomplete = () => resolve()
  })
}

/**
 * Clear all data from a specific store
 */
const clearStore = (db: IDBDatabase, storeName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.clear()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

/**
 * Check if the database has been initialized (has any users)
 */
export const isIndexedDBInitialized = async (): Promise<boolean> => {
  try {
    const db = await openDB()
    const users = await getAllFromStore<UserDB>(db, STORES.users)
    db.close()
    return users.length > 0
  } catch (error) {
    console.error('Error checking IndexedDB initialization:', error)
    return false
  }
}

/**
 * Load all data from IndexedDB
 */
export const loadFromIndexedDB = async (): Promise<IndexedDBData> => {
  const db = await openDB()

  try {
    const [users, activities, stamps, days, sessions] = await Promise.all([
      getAllFromStore<UserDB>(db, STORES.users),
      getAllFromStore<ActivityDB>(db, STORES.activities),
      getAllFromStore<StampDB>(db, STORES.stamps),
      getAllFromStore<DayDB>(db, STORES.days),
      getAllFromStore<Session>(db, STORES.sessions),
    ])

    console.log(
      `📦 IndexedDB: Loaded ${users.length} users, ${activities.length} activities, ${stamps.length} stamps, ${days.length} days, ${sessions.length} sessions`,
    )

    return { users, activities, stamps, days, sessions }
  } finally {
    db.close()
  }
}

/**
 * Save all data to IndexedDB
 */
export const saveToIndexedDB = async (data: IndexedDBData): Promise<void> => {
  const db = await openDB()

  try {
    await Promise.all([
      putAllToStore(db, STORES.users, data.users),
      putAllToStore(db, STORES.activities, data.activities),
      putAllToStore(db, STORES.stamps, data.stamps),
      putAllToStore(db, STORES.days, data.days),
      putAllToStore(db, STORES.sessions, data.sessions),
    ])

    console.log(
      `📦 IndexedDB: Saved ${data.users.length} users, ${data.activities.length} activities, ${data.stamps.length} stamps, ${data.days.length} days, ${data.sessions.length} sessions`,
    )
  } finally {
    db.close()
  }
}

/**
 * Clear all data from IndexedDB (for development/testing)
 */
export const clearIndexedDB = async (): Promise<void> => {
  const db = await openDB()

  try {
    await Promise.all([
      clearStore(db, STORES.users),
      clearStore(db, STORES.activities),
      clearStore(db, STORES.stamps),
      clearStore(db, STORES.days),
      clearStore(db, STORES.sessions),
    ])

    console.log('📦 IndexedDB: All data cleared')
  } finally {
    db.close()
  }
}

/**
 * Delete the entire database (nuclear option)
 */
export const deleteIndexedDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      console.log('📦 IndexedDB: Database deleted')
      resolve()
    }
  })
}

/**
 * Get database statistics
 */
export const getIndexedDBStats = async () => {
  try {
    const db = await openDB()
    const [users, activities, stamps, days, sessions] = await Promise.all([
      getAllFromStore<UserDB>(db, STORES.users),
      getAllFromStore<ActivityDB>(db, STORES.activities),
      getAllFromStore<StampDB>(db, STORES.stamps),
      getAllFromStore<DayDB>(db, STORES.days),
      getAllFromStore<Session>(db, STORES.sessions),
    ])
    db.close()

    return {
      initialized: users.length > 0,
      counts: {
        users: users.length,
        activities: activities.length,
        stamps: stamps.length,
        days: days.length,
        sessions: sessions.length,
      },
    }
  } catch (error) {
    console.error('Error getting IndexedDB stats:', error)
    return {
      initialized: false,
      counts: {
        users: 0,
        activities: 0,
        stamps: 0,
        days: 0,
        sessions: 0,
      },
    }
  }
}
