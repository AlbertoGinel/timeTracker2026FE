import type { User, Activity } from '@/types/mainTypes'

/**
 * Make API calls using fetch (intercepted by MSW in dev)
 */
export const useAPI = () => {
  const handleRequest = async <T>(url: string, options?: RequestInit): Promise<T> => {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Important for cookies
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    // Handle empty responses (like 204 No Content)
    if (response.status === 204) {
      return undefined as T
    }

    const data = await response.json()

    // Check for Django-style error response
    if (!response.ok) {
      throw new Error(data.detail || `HTTP error ${response.status}`)
    }

    return data
  }

  return {
    // Authentication
    login: (username: string, password: string) =>
      handleRequest<User>('/api/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),

    logout: () =>
      handleRequest('/api/auth/logout/', {
        method: 'POST',
      }),

    getCurrentUserProfile: () => handleRequest<User>('/api/auth/profile/'),

    updateProfile: (updates: Partial<User>) =>
      handleRequest<User>('/api/auth/profile/', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),

    // Activities
    getActivities: () => handleRequest<Activity[]>('/api/activities/'),

    createActivity: (activity: Omit<Activity, 'id' | 'created_at' | 'updated_at' | 'user'>) =>
      handleRequest<Activity>('/api/activities/', {
        method: 'POST',
        body: JSON.stringify(activity),
      }),

    updateActivity: (id: string, updates: Partial<Activity>) =>
      handleRequest<Activity>(`/api/activities/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),

    deleteActivity: (id: string) =>
      handleRequest(`/api/activities/${id}/`, {
        method: 'DELETE',
      }),

    // Admin methods
    getAllUsers: () => handleRequest<User[]>('/api/admin/users/'),

    getUserById: (id: string) => handleRequest<User>(`/api/admin/users/${id}/`),

    updateUser: (id: string, updates: Partial<User>) =>
      handleRequest<User>(`/api/admin/users/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),

    deleteUser: (id: string) =>
      handleRequest(`/api/admin/users/${id}/`, {
        method: 'DELETE',
      }),

    getActivitiesByUser: (userId: string) =>
      handleRequest<Activity[]>(`/api/admin/users/${userId}/activities/`),
  }
}
