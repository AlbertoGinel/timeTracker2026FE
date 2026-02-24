import { defineStore } from 'pinia'
import type { User } from '@/type/mainTypes'
import { useAPIAdmin } from '@/API/useAPIAdmin'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [] as User[],
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    /**
     * Get regular users (non-admins)
     */
    regularUsers: (state) => {
      return state.users.filter((user) => user.role !== 'admin')
    },
  },

  actions: {
    /**
     * Set users from auth response (for admins)
     */
    setUsers(users: User[]): void {
      this.users = users
      this.error = null
    },

    async fetchUsers(): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        const api = useAPIAdmin()
        const users = await api.getAllUsers()

        this.users = users
        return true
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch users'
        return false
      } finally {
        this.isLoading = false
      }
    },

    clearUsers(): void {
      this.users = []
      this.error = null
    },
  },
})
