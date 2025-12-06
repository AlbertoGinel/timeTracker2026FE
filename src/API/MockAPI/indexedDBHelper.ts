import type { User, ApiActivity } from './mockDatabase'

const DB_NAME = 'TimeTrackerDB'
const DB_VERSION = 1
const USERS_STORE = 'users'
const ACTIVITIES_STORE = 'activities'

class IndexedDBHelper {
  private db: IDBDatabase | null = null

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        reject(new Error('Failed to open database'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create users store
        if (!db.objectStoreNames.contains(USERS_STORE)) {
          const usersStore = db.createObjectStore(USERS_STORE, { keyPath: 'id' })
          usersStore.createIndex('username', 'username', { unique: true })
        }

        // Create activities store
        if (!db.objectStoreNames.contains(ACTIVITIES_STORE)) {
          const activitiesStore = db.createObjectStore(ACTIVITIES_STORE, { keyPath: 'id' })
          activitiesStore.createIndex('user', 'user', { unique: false })
        }
      }
    })
  }

  private getObjectStore(storeName: string, mode: IDBTransactionMode): IDBObjectStore {
    if (!this.db) {
      throw new Error('Database not initialized')
    }
    const transaction = this.db.transaction(storeName, mode)
    return transaction.objectStore(storeName)
  }

  // Users CRUD operations
  async addUser(user: User): Promise<User> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(USERS_STORE, 'readwrite')
      const request = store.add(user)

      request.onsuccess = () => resolve(user)
      request.onerror = () => reject(new Error('Failed to add user'))
    })
  }

  async getUser(id: string): Promise<User | undefined> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(USERS_STORE, 'readonly')
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('Failed to get user'))
    })
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(USERS_STORE, 'readonly')
      const index = store.index('username')
      const request = index.get(username)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('Failed to get user by username'))
    })
  }

  async getAllUsers(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(USERS_STORE, 'readonly')
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('Failed to get all users'))
    })
  }

  async updateUser(user: User): Promise<User> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(USERS_STORE, 'readwrite')
      const request = store.put(user)

      request.onsuccess = () => resolve(user)
      request.onerror = () => reject(new Error('Failed to update user'))
    })
  }

  async deleteUser(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(USERS_STORE, 'readwrite')
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('Failed to delete user'))
    })
  }

  // Activities CRUD operations
  async addActivity(activity: ApiActivity): Promise<ApiActivity> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(ACTIVITIES_STORE, 'readwrite')
      const request = store.add(activity)

      request.onsuccess = () => resolve(activity)
      request.onerror = () => reject(new Error('Failed to add activity'))
    })
  }

  async getActivity(id: string): Promise<ApiActivity | undefined> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(ACTIVITIES_STORE, 'readonly')
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('Failed to get activity'))
    })
  }

  async getAllActivities(): Promise<ApiActivity[]> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(ACTIVITIES_STORE, 'readonly')
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('Failed to get all activities'))
    })
  }

  async getActivitiesByUser(userId: string): Promise<ApiActivity[]> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(ACTIVITIES_STORE, 'readonly')
      const index = store.index('user')
      const request = index.getAll(userId)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('Failed to get activities by user'))
    })
  }

  async updateActivity(activity: ApiActivity): Promise<ApiActivity> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(ACTIVITIES_STORE, 'readwrite')
      const request = store.put(activity)

      request.onsuccess = () => resolve(activity)
      request.onerror = () => reject(new Error('Failed to update activity'))
    })
  }

  async deleteActivity(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getObjectStore(ACTIVITIES_STORE, 'readwrite')
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('Failed to delete activity'))
    })
  }

  // Utility method to clear all data
  async clearAllData(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction([USERS_STORE, ACTIVITIES_STORE], 'readwrite')

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(new Error('Failed to clear data'))

      transaction.objectStore(USERS_STORE).clear()
      transaction.objectStore(ACTIVITIES_STORE).clear()
    })
  }
}

export const indexedDBHelper = new IndexedDBHelper()
