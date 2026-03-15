import { defineStore } from 'pinia'
import type { UserResponse } from '@/API/APITypes'
import type { ScaleLevel } from '@/type/mainTypes'
import { useAPIAdmin } from '@/API/useAPIAdmin'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [] as UserResponse[],
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
    setUsers(users: UserResponse[]): void {
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

    async updateUserScale(userId: string, scale: ScaleLevel[]): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        const api = useAPIAdmin()
        const user = await api.updateUser(userId, { scale })

        // Update the user in the list
        const userIndex = this.users.findIndex((u) => u.id === userId)
        if (userIndex !== -1) {
          this.users[userIndex] = user
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
