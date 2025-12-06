import { indexedDBHelper } from './indexedDBHelper'
import { mockUsers, mockActivities, type User, type ApiActivity } from './mockDatabase'
import { MOCK_CONFIG, MOCK_SESSION_EXPIRY } from './mockConfig'
import {
  createSession,
  getSession,
  getCurrentSessionToken,
  deleteSession,
  cleanupExpiredSessions,
} from './mockSessions'
import { ApiException, HTTP_STATUS } from '../apiTypes'

let isInitialized = false

/**
 * Simulate network delay
 */
const simulateDelay = async (): Promise<void> => {
  const delay = Math.random() * (MOCK_CONFIG.maxDelay - MOCK_CONFIG.minDelay) + MOCK_CONFIG.minDelay
  await new Promise((resolve) => setTimeout(resolve, delay))
}

/**
 * Simulate random errors based on error rate
 */
const simulateError = (): void => {
  if (Math.random() < MOCK_CONFIG.errorRate) {
    const errorType = Math.random()

    if (errorType < 0.33) {
      // 500 Internal Server Error
      throw new ApiException(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Internal Server Error',
        'Something went wrong on the server',
      )
    } else if (errorType < 0.66) {
      // 408 Request Timeout with response
      throw new ApiException(
        HTTP_STATUS.REQUEST_TIMEOUT,
        'Request Timeout',
        'The server took too long to respond',
      )
    } else {
      // 408 Timeout - no response (simulate as a timeout promise)
      throw new ApiException(
        HTTP_STATUS.REQUEST_TIMEOUT,
        'Connection Timeout',
        'No response from server',
      )
    }
  }
}

/**
 * Get current authenticated user from session
 */
const getCurrentUser = async (): Promise<User> => {
  const token = getCurrentSessionToken()

  if (!token) {
    throw new ApiException(HTTP_STATUS.UNAUTHORIZED, 'Not authenticated', 'Please log in')
  }

  const session = getSession(token)

  if (!session) {
    throw new ApiException(HTTP_STATUS.UNAUTHORIZED, 'Session expired', 'Please log in again')
  }

  const user = await indexedDBHelper.getUser(session.userId)

  if (!user) {
    throw new ApiException(HTTP_STATUS.UNAUTHORIZED, 'User not found', 'Invalid session')
  }

  return user
}

/**
 * Check if user is admin
 */
const isAdmin = (user: User): boolean => {
  return user.role === 'admin'
}

/**
 * Check if user owns the resource
 */
const ownsResource = (user: User, resourceUserId: string): boolean => {
  return user.id === resourceUserId
}

export const useMockAPI = () => {
  /**
   * Initialize the mock database with sample data
   */
  const initializeMockDB = async (): Promise<void> => {
    if (isInitialized) {
      return
    }

    try {
      // Initialize IndexedDB
      await indexedDBHelper.initDB()

      // Cleanup expired sessions
      cleanupExpiredSessions()

      // Check if database already has data
      const existingUsers = await indexedDBHelper.getAllUsers()

      if (existingUsers.length === 0) {
        // Populate with mock data
        console.log('Populating mock database with initial data...')

        // Add users
        for (const user of mockUsers) {
          await indexedDBHelper.addUser(user)
        }

        // Add activities
        for (const activity of mockActivities) {
          await indexedDBHelper.addActivity(activity)
        }

        console.log('Mock database initialized successfully')
      } else {
        console.log('Mock database already contains data')
      }

      isInitialized = true
    } catch (error) {
      console.error('Failed to initialize mock database:', error)
      throw error
    }
  }

  /**
   * Authentication - Login
   */
  const login = async (username: string, password: string): Promise<User> => {
    await simulateDelay()
    simulateError()

    const user = await indexedDBHelper.getUserByUsername(username)

    if (!user || user.password !== password) {
      throw new ApiException(
        HTTP_STATUS.UNAUTHORIZED,
        'Invalid credentials',
        'Username or password is incorrect',
      )
    }

    // Create session
    const token = createSession(user.id, MOCK_SESSION_EXPIRY)
    console.log('Session created:', token)

    // Return user without password
    return { ...user, password: '' }
  }

  /**
   * Authentication - Logout
   */
  const logout = async (): Promise<void> => {
    await simulateDelay()
    simulateError()

    const token = getCurrentSessionToken()
    if (token) {
      deleteSession(token)
    }
  }

  /**
   * Get current user profile
   */
  const getCurrentUserProfile = async (): Promise<User> => {
    await simulateDelay()
    simulateError()

    const user = await getCurrentUser()
    return { ...user, password: '' }
  }

  /**
   * Update current user profile
   */
  const updateProfile = async (updates: Partial<User>): Promise<User> => {
    await simulateDelay()
    simulateError()

    const user = await getCurrentUser()

    // Don't allow changing id, username, or role
    const updatedUser: User = {
      ...user,
      nickname: updates.nickname ?? user.nickname,
      password: updates.password ?? user.password,
    }

    await indexedDBHelper.updateUser(updatedUser)

    return { ...updatedUser, password: '' }
  }

  /**
   * Get activities for current user
   */
  const getActivities = async (): Promise<ApiActivity[]> => {
    await simulateDelay()
    simulateError()

    const user = await getCurrentUser()
    return await indexedDBHelper.getActivitiesByUser(user.id)
  }

  /**
   * Create a new activity
   */
  const createActivity = async (
    activity: Omit<ApiActivity, 'id' | 'created_at' | 'updated_at' | 'user'>,
  ): Promise<ApiActivity> => {
    await simulateDelay()
    simulateError()

    const user = await getCurrentUser()

    const newActivity: ApiActivity = {
      ...activity,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: user.id,
    }

    return await indexedDBHelper.addActivity(newActivity)
  }

  /**
   * Update an existing activity
   */
  const updateActivity = async (
    id: string,
    updates: Partial<ApiActivity>,
  ): Promise<ApiActivity> => {
    await simulateDelay()
    simulateError()

    const user = await getCurrentUser()
    const activity = await indexedDBHelper.getActivity(id)

    if (!activity) {
      throw new ApiException(HTTP_STATUS.NOT_FOUND, 'Activity not found')
    }

    // Check authorization
    if (!isAdmin(user) && !ownsResource(user, activity.user)) {
      throw new ApiException(
        HTTP_STATUS.FORBIDDEN,
        'Forbidden',
        'You do not have permission to update this activity',
      )
    }

    const updatedActivity: ApiActivity = {
      ...activity,
      ...updates,
      id: activity.id, // Preserve ID
      user: activity.user, // Preserve owner
      created_at: activity.created_at, // Preserve creation date
      updated_at: new Date().toISOString(),
    }

    return await indexedDBHelper.updateActivity(updatedActivity)
  }

  /**
   * Delete an activity
   */
  const deleteActivity = async (id: string): Promise<void> => {
    await simulateDelay()
    simulateError()

    const user = await getCurrentUser()
    const activity = await indexedDBHelper.getActivity(id)

    if (!activity) {
      throw new ApiException(HTTP_STATUS.NOT_FOUND, 'Activity not found')
    }

    // Check authorization
    if (!isAdmin(user) && !ownsResource(user, activity.user)) {
      throw new ApiException(
        HTTP_STATUS.FORBIDDEN,
        'Forbidden',
        'You do not have permission to delete this activity',
      )
    }

    await indexedDBHelper.deleteActivity(id)
  }

  // ========== ADMIN ONLY METHODS ==========

  /**
   * Get all users (admin only)
   */
  const getAllUsers = async (): Promise<User[]> => {
    await simulateDelay()
    simulateError()

    const user = await getCurrentUser()

    if (!isAdmin(user)) {
      throw new ApiException(HTTP_STATUS.FORBIDDEN, 'Forbidden', 'Admin access required')
    }

    const users = await indexedDBHelper.getAllUsers()
    // Remove passwords
    return users.map((u) => ({ ...u, password: '' }))
  }

  /**
   * Get user by ID (admin only)
   */
  const getUserById = async (id: string): Promise<User> => {
    await simulateDelay()
    simulateError()

    const currentUser = await getCurrentUser()

    if (!isAdmin(currentUser)) {
      throw new ApiException(HTTP_STATUS.FORBIDDEN, 'Forbidden', 'Admin access required')
    }

    const user = await indexedDBHelper.getUser(id)

    if (!user) {
      throw new ApiException(HTTP_STATUS.NOT_FOUND, 'User not found')
    }

    return { ...user, password: '' }
  }

  /**
   * Update any user (admin only)
   */
  const updateUser = async (id: string, updates: Partial<User>): Promise<User> => {
    await simulateDelay()
    simulateError()

    const currentUser = await getCurrentUser()

    if (!isAdmin(currentUser)) {
      throw new ApiException(HTTP_STATUS.FORBIDDEN, 'Forbidden', 'Admin access required')
    }

    const user = await indexedDBHelper.getUser(id)

    if (!user) {
      throw new ApiException(HTTP_STATUS.NOT_FOUND, 'User not found')
    }

    const updatedUser: User = {
      ...user,
      ...updates,
      id: user.id, // Preserve ID
    }

    await indexedDBHelper.updateUser(updatedUser)

    return { ...updatedUser, password: '' }
  }

  /**
   * Delete any user (admin only)
   */
  const deleteUser = async (id: string): Promise<void> => {
    await simulateDelay()
    simulateError()

    const currentUser = await getCurrentUser()

    if (!isAdmin(currentUser)) {
      throw new ApiException(HTTP_STATUS.FORBIDDEN, 'Forbidden', 'Admin access required')
    }

    const user = await indexedDBHelper.getUser(id)

    if (!user) {
      throw new ApiException(HTTP_STATUS.NOT_FOUND, 'User not found')
    }

    // Delete user's activities first
    const activities = await indexedDBHelper.getActivitiesByUser(id)
    for (const activity of activities) {
      await indexedDBHelper.deleteActivity(activity.id)
    }

    // Delete user
    await indexedDBHelper.deleteUser(id)
  }

  /**
   * Get all activities for any user (admin only)
   */
  const getActivitiesByUser = async (userId: string): Promise<ApiActivity[]> => {
    await simulateDelay()
    simulateError()

    const currentUser = await getCurrentUser()

    if (!isAdmin(currentUser)) {
      throw new ApiException(HTTP_STATUS.FORBIDDEN, 'Forbidden', 'Admin access required')
    }

    return await indexedDBHelper.getActivitiesByUser(userId)
  }

  /**
   * Clear all data (useful for testing/reset)
   */
  const clearAllData = async (): Promise<void> => {
    await indexedDBHelper.clearAllData()
    isInitialized = false
  }

  return {
    // Initialization
    initializeMockDB,

    // Authentication
    login,
    logout,
    getCurrentUserProfile,
    updateProfile,

    // Activities (user's own)
    getActivities,
    createActivity,
    updateActivity,
    deleteActivity,

    // Admin methods
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getActivitiesByUser,

    // Utility
    clearAllData,
  }
}
