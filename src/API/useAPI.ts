import { useMockAPI } from './MockAPI/useMockAPI'
import type { User, ApiActivity } from './MockAPI/mockDatabase'
import type { ApiResponse } from './apiTypes'
import { ApiException } from './apiTypes'

// Toggle between mock and production
const USE_MOCK_API = import.meta.env.DEV // Use mock in development

/**
 * Wrapper for API calls that handles mock vs production
 */
const handleApiCall = async <T>(apiCall: () => Promise<T>): Promise<ApiResponse<T>> => {
  try {
    const data = await apiCall()
    return {
      success: true,
      data,
    }
  } catch (error) {
    if (error instanceof ApiException) {
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      }
    }

    // Unknown error
    return {
      success: false,
      error: {
        code: 500,
        message: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error),
      },
    }
  }
}

/**
 * Production API calls (to be implemented when backend is ready)
 */
const productionAPI = {
  login: async (username: string, password: string): Promise<User> => {
    const response = await fetch('/api/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include', // Include cookies
    })

    if (!response.ok) {
      throw new ApiException(response.status, 'Login failed')
    }

    return await response.json()
  },

  logout: async (): Promise<void> => {
    const response = await fetch('/api/auth/logout/', {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) {
      throw new ApiException(response.status, 'Logout failed')
    }
  },

  getCurrentUserProfile: async (): Promise<User> => {
    const response = await fetch('/api/auth/profile/', {
      credentials: 'include',
    })

    if (!response.ok) {
      throw new ApiException(response.status, 'Failed to get profile')
    }

    return await response.json()
  },

  updateProfile: async (updates: Partial<User>): Promise<User> => {
    const response = await fetch('/api/auth/profile/', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
      credentials: 'include',
    })

    if (!response.ok) {
      throw new ApiException(response.status, 'Failed to update profile')
    }

    return await response.json()
  },

  getActivities: async (): Promise<ApiActivity[]> => {
    const response = await fetch('/api/activities/', {
      credentials: 'include',
    })

    if (!response.ok) {
      throw new ApiException(response.status, 'Failed to get activities')
    }

    return await response.json()
  },

  createActivity: async (
    activity: Omit<ApiActivity, 'id' | 'created_at' | 'updated_at' | 'user'>,
  ): Promise<ApiActivity> => {
    const response = await fetch('/api/activities/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity),
      credentials: 'include',
    })

    if (!response.ok) {
      throw new ApiException(response.status, 'Failed to create activity')
    }

    return await response.json()
  },

  updateActivity: async (id: string, updates: Partial<ApiActivity>): Promise<ApiActivity> => {
    const response = await fetch(`/api/activities/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
      credentials: 'include',
    })

    if (!response.ok) {
      throw new ApiException(response.status, 'Failed to update activity')
    }

    return await response.json()
  },

  deleteActivity: async (id: string): Promise<void> => {
    const response = await fetch(`/api/activities/${id}/`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (!response.ok) {
      throw new ApiException(response.status, 'Failed to delete activity')
    }
  },

  // Admin methods
  getAllUsers: async (): Promise<User[]> => {
    const response = await fetch('/api/admin/users/', {
      credentials: 'include',
    })

    if (!response.ok) {
      throw new ApiException(response.status, 'Failed to get users')
    }

    return await response.json()
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await fetch(`/api/admin/users/${id}/`, {
      credentials: 'include',
    })

    if (!response.ok) {
      throw new ApiException(response.status, 'Failed to get user')
    }

    return await response.json()
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<User> => {
    const response = await fetch(`/api/admin/users/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
      credentials: 'include',
    })

    if (!response.ok) {
      throw new ApiException(response.status, 'Failed to update user')
    }

    return await response.json()
  },

  deleteUser: async (id: string): Promise<void> => {
    const response = await fetch(`/api/admin/users/${id}/`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (!response.ok) {
      throw new ApiException(response.status, 'Failed to delete user')
    }
  },

  getActivitiesByUser: async (userId: string): Promise<ApiActivity[]> => {
    const response = await fetch(`/api/admin/users/${userId}/activities/`, {
      credentials: 'include',
    })

    if (!response.ok) {
      throw new ApiException(response.status, 'Failed to get user activities')
    }

    return await response.json()
  },
}

/**
 * Main API composable
 */
export const useAPI = () => {
  const mockAPI = USE_MOCK_API ? useMockAPI() : null

  return {
    // Authentication
    login: (username: string, password: string) =>
      handleApiCall(() =>
        USE_MOCK_API ? mockAPI!.login(username, password) : productionAPI.login(username, password),
      ),

    logout: () => handleApiCall(() => (USE_MOCK_API ? mockAPI!.logout() : productionAPI.logout())),

    getCurrentUserProfile: () =>
      handleApiCall(() =>
        USE_MOCK_API ? mockAPI!.getCurrentUserProfile() : productionAPI.getCurrentUserProfile(),
      ),

    updateProfile: (updates: Partial<User>) =>
      handleApiCall(() =>
        USE_MOCK_API ? mockAPI!.updateProfile(updates) : productionAPI.updateProfile(updates),
      ),

    // Activities
    getActivities: () =>
      handleApiCall(() =>
        USE_MOCK_API ? mockAPI!.getActivities() : productionAPI.getActivities(),
      ),

    createActivity: (activity: Omit<ApiActivity, 'id' | 'created_at' | 'updated_at' | 'user'>) =>
      handleApiCall(() =>
        USE_MOCK_API ? mockAPI!.createActivity(activity) : productionAPI.createActivity(activity),
      ),

    updateActivity: (id: string, updates: Partial<ApiActivity>) =>
      handleApiCall(() =>
        USE_MOCK_API
          ? mockAPI!.updateActivity(id, updates)
          : productionAPI.updateActivity(id, updates),
      ),

    deleteActivity: (id: string) =>
      handleApiCall(() =>
        USE_MOCK_API ? mockAPI!.deleteActivity(id) : productionAPI.deleteActivity(id),
      ),

    // Admin methods
    getAllUsers: () =>
      handleApiCall(() => (USE_MOCK_API ? mockAPI!.getAllUsers() : productionAPI.getAllUsers())),

    getUserById: (id: string) =>
      handleApiCall(() =>
        USE_MOCK_API ? mockAPI!.getUserById(id) : productionAPI.getUserById(id),
      ),

    updateUser: (id: string, updates: Partial<User>) =>
      handleApiCall(() =>
        USE_MOCK_API ? mockAPI!.updateUser(id, updates) : productionAPI.updateUser(id, updates),
      ),

    deleteUser: (id: string) =>
      handleApiCall(() => (USE_MOCK_API ? mockAPI!.deleteUser(id) : productionAPI.deleteUser(id))),

    getActivitiesByUser: (userId: string) =>
      handleApiCall(() =>
        USE_MOCK_API
          ? mockAPI!.getActivitiesByUser(userId)
          : productionAPI.getActivitiesByUser(userId),
      ),
  }
}
