import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/API/MockAPI/mockDatabase'
import { useAPI } from '@/API/useAPI'

const STORAGE_KEY = 'timetracker_user'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => currentUser.value !== null)
  const isAdmin = computed(() => currentUser.value?.role === 'admin')

  /**
   * Set the current user and persist to localStorage
   */
  const setUser = (user: User | null) => {
    currentUser.value = user
    error.value = null

    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  /**
   * Login with username and password
   */
  const login = async (username: string, password: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const api = useAPI()
      const response = await api.login(username, password)

      if (response.success) {
        setUser(response.data)
        return true
      } else {
        error.value = response.error.message
        return false
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Logout the current user
   */
  const logout = async () => {
    isLoading.value = true

    try {
      const api = useAPI()
      await api.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setUser(null)
      isLoading.value = false
    }
  }

  /**
   * Try to restore user session from localStorage
   */
  const restoreSession = async (): Promise<boolean> => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEY)

      if (storedUser) {
        // Verify user still exists and session is valid
        const api = useAPI()
        const response = await api.getCurrentUserProfile()

        if (response.success) {
          currentUser.value = response.data
          return true
        } else {
          // Session invalid, clear storage
          localStorage.removeItem(STORAGE_KEY)
        }
      }

      return false
    } catch (err) {
      console.error('Failed to restore session:', err)
      localStorage.removeItem(STORAGE_KEY)
      return false
    }
  }

  /**
   * Update current user profile
   */
  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const api = useAPI()
      const response = await api.updateProfile(updates)

      if (response.success) {
        setUser(response.data)
        return true
      } else {
        error.value = response.error.message
        return false
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Update failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    currentUser,
    isAuthenticated,
    isAdmin,
    isLoading,
    error,
    login,
    logout,
    setUser,
    restoreSession,
    updateProfile,
  }
})
