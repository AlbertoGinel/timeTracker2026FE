import { ref, computed } from 'vue'
import { useAuthStore } from '@/store/useAuthStore'

// Shared form state across all component instances
const username = ref('')
const password = ref('')

export const useAuth = () => {
  const authStore = useAuthStore()

  // Computed properties from store
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isAdmin = computed(() => authStore.isAdmin)
  const currentUser = computed(() => authStore.currentUser)
  const isLoading = computed(() => authStore.isLoading)
  const error = computed(() => authStore.error)

  // Business logic actions
  const login = async () => {
    if (!username.value || !password.value) {
      return
    }

    const success = await authStore.login(username.value, password.value)

    if (success) {
      username.value = ''
      password.value = ''
    }
  }

  const logout = async () => {
    await authStore.logout()
  }

  // Dev helper: Quick fill credentials
  const quickFillCredentials = (user: string, pass: string) => {
    username.value = user
    password.value = pass
  }

  return {
    // Form state
    username,
    password,
    // Computed state
    isAuthenticated,
    isAdmin,
    currentUser,
    isLoading,
    error,
    // Actions
    login,
    logout,
    quickFillCredentials,
  }
}
