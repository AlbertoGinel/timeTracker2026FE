import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/mainTypes'
import { useAPI } from '@/API/useAPI'
import router from '@/router'

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
      const user = await api.login(username, password)

      setUser(user)

      // Navigate to dashboard after successful login
      router.push({ name: 'dashboard' })

      return true
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

      // Navigate to home after logout
      router.push({ name: 'home' })
    }
  }

  /**
   * Try to restore user session from localStorage
   */
  const restoreSession = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/profile/', {
        credentials: 'include',
      })

      if (!response.ok) {
        return false
      }

      const user = await response.json()
      setUser(user)
      return true
    } catch {
      // Silently fail - no session is normal on first visit
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
      const user = await api.updateProfile(updates)

      setUser(user)
      return true
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
