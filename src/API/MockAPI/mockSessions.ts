export type Session = {
  token: string
  userId: string
  createdAt: number
  expiresAt: number
}

const SESSIONS_KEY = 'mock_sessions'
const SESSION_TOKEN_KEY = 'sessionid'

/**
 * Generate a random session token (32 chars)
 */
export const generateSessionToken = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

/**
 * Get all sessions from localStorage
 */
const getAllSessions = (): Session[] => {
  const sessionsJson = localStorage.getItem(SESSIONS_KEY)
  return sessionsJson ? JSON.parse(sessionsJson) : []
}

/**
 * Save sessions to localStorage
 */
const saveSessions = (sessions: Session[]): void => {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

/**
 * Create a new session for a user
 */
export const createSession = (userId: string, expiryMs: number): string => {
  const token = generateSessionToken()
  const now = Date.now()

  const session: Session = {
    token,
    userId,
    createdAt: now,
    expiresAt: now + expiryMs,
  }

  const sessions = getAllSessions()
  sessions.push(session)
  saveSessions(sessions)

  // Store current session token
  localStorage.setItem(SESSION_TOKEN_KEY, token)

  return token
}

/**
 * Get session by token
 */
export const getSession = (token: string): Session | null => {
  const sessions = getAllSessions()
  const session = sessions.find((s) => s.token === token)

  if (!session) {
    return null
  }

  // Check if expired
  if (Date.now() > session.expiresAt) {
    deleteSession(token)
    return null
  }

  return session
}

/**
 * Get current session token from storage
 */
export const getCurrentSessionToken = (): string | null => {
  return localStorage.getItem(SESSION_TOKEN_KEY)
}

/**
 * Delete a session
 */
export const deleteSession = (token: string): void => {
  const sessions = getAllSessions()
  const filtered = sessions.filter((s) => s.token !== token)
  saveSessions(filtered)

  // Clear current session if it matches
  if (getCurrentSessionToken() === token) {
    localStorage.removeItem(SESSION_TOKEN_KEY)
  }
}

/**
 * Delete all sessions for a user
 */
export const deleteAllUserSessions = (userId: string): void => {
  const sessions = getAllSessions()
  const filtered = sessions.filter((s) => s.userId !== userId)
  saveSessions(filtered)
}

/**
 * Clean up expired sessions
 */
export const cleanupExpiredSessions = (): void => {
  const sessions = getAllSessions()
  const now = Date.now()
  const active = sessions.filter((s) => s.expiresAt > now)
  saveSessions(active)
}
