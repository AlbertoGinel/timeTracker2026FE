import { defineStore } from 'pinia'
import type { User } from '@/type/mainTypes'
import { useAPIAuth } from '@/API/useAPIAuth'
import { useBundleService } from '@/service/useBundleService'
import router from '@/router'

const STORAGE_KEY = 'timetracker_user'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: null as User | null,
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => state.currentUser !== null,
    isAdmin: (state) => state.currentUser?.role === 'admin',
  },

  actions: {
    /**
     * Set the current user and persist to localStorage
     */
    setUser(user: User | null) {
      this.currentUser = user
      this.error = null

      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    },

    /**
     * Login with username and password
     */
    async login(username: string, password: string): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        const api = useAPIAuth()
        const user = await api.login(username, password)

        this.setUser(user)

        // Load user bundle after successful login
        const bundleService = useBundleService()
        await bundleService.loadUserBundle()

        // Navigate to dashboard after successful login
        router.push({ name: 'dashboard' })

        return true
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Login failed'
        return false
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Logout the current user
     */
    async logout() {
      this.isLoading = true

      try {
        const api = useAPIAuth()
        await api.logout()
      } catch (err) {
        console.error('Logout error:', err)
      } finally {
        // Clear user bundle before clearing user
        const bundleService = useBundleService()
        bundleService.clearUserBundle()

        this.setUser(null)
        this.isLoading = false

        // Navigate to home after logout
        router.push({ name: 'home' })
      }
    },

    /**
     * Try to restore user session from localStorage
     */
    async restoreSession(): Promise<boolean> {
      try {
        const api = useAPIAuth()
        const user = await api.getCurrentUserProfile()
        this.setUser(user)
        return true
      } catch {
        // Silently fail - no session is normal on first visit
        return false
      }
    },

    /**
     * Update current user profile
     */
    async updateProfile(updates: Partial<User>): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        const api = useAPIAuth()
        const user = await api.updateProfile(updates)

        this.setUser(user)
        return true
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Update failed'
        return false
      } finally {
        this.isLoading = false
      }
    },
  },
})
