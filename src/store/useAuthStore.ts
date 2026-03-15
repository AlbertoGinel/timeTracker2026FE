import { defineStore } from 'pinia'
import type { User } from '@/type/mainTypes'
import type { AuthResponse, UserResponse } from '@/API/APITypes'
import { useAPIAuth } from '@/API/useAPIAuth'
import { useBundleService } from '@/service/useBundleService'
import router from '@/router'

const STORAGE_KEY = 'timetracker_user'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    loggedInUser: null as UserResponse | null, // The authenticated user (admin or regular)
    currentContextUser: null as UserResponse | null, // The user whose data we're viewing
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => state.loggedInUser !== null,
    isAdmin: (state) => state.loggedInUser?.role === 'admin',
    isViewingAsAdmin: (state) =>
      state.loggedInUser?.role === 'admin' &&
      state.currentContextUser !== null &&
      state.loggedInUser.id !== state.currentContextUser.id,
  },

  actions: {
    /**
     * Set the logged in user and persist to localStorage
     * For regular users, also sets them as the context user
     */
    setUser(user: UserResponse | null) {
      this.loggedInUser = user
      this.error = null

      // For regular users, they are always the context user
      if (user && user.role !== 'admin') {
        this.currentContextUser = user
      }

      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      } else {
        localStorage.removeItem(STORAGE_KEY)
        this.currentContextUser = null
      }
    },

    /**
     * Set the context user (for admin viewing another user's data)
     */
    setContextUser(user: UserResponse) {
      if (this.loggedInUser?.role !== 'admin') {
        throw new Error('Only admins can set context user')
      }
      this.currentContextUser = user
    },

    /**
     * Clear the context user (admin deselects user)
     */
    clearContextUser() {
      if (this.loggedInUser?.role === 'admin') {
        this.currentContextUser = null
      }
    },

    /**
     * Process auth response and load data into stores
     */
    processAuthResponse(authResponse: AuthResponse) {
      const user = authResponse.userAuth
      this.setUser(user)

      // For regular users, load bundle into stores
      if ('bundle' in authResponse) {
        const bundleService = useBundleService()
        bundleService.loadBundleFromAuthResponse(authResponse.bundle)
      }

      // For admins, load users into userStore
      if ('usersList' in authResponse) {
        // Import userStore dynamically to avoid circular dependency
        import('./useUserStore').then(({ useUserStore }) => {
          const userStore = useUserStore()
          userStore.setUsers(authResponse.usersList)
        })
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
        const authResponse = await api.login(username, password)

        // Process the auth response (sets user and loads bundle/users)
        this.processAuthResponse(authResponse)

        // Navigate based on user role
        const routeName = authResponse.userAuth.role === 'admin' ? 'admin' : 'user'
        router.push({ name: routeName })

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

        // Clear users list for admin
        if (this.isAdmin) {
          import('./useUserStore').then(({ useUserStore }) => {
            const userStore = useUserStore()
            userStore.clearUsers()
          })
        }

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
        const authResponse = await api.getCurrentUserProfile()

        // Process the auth response (sets user and loads bundle/users)
        this.processAuthResponse(authResponse)

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

    /**
     * Update user's scale levels
     */
    async updateScale(scale: User['scale']): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        const api = useAPIAuth()
        const user = await api.updateProfile({ scale })

        // Update the user with new scale
        this.setUser(user)

        // Also update context user if we're viewing as admin
        if (this.currentContextUser && this.currentContextUser.id === user.id) {
          this.currentContextUser = user
        }

        return true
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to update scale'
        return false
      } finally {
        this.isLoading = false
      }
    },
  },
})
