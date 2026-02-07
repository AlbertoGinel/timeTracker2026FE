import { http, HttpResponse } from 'msw'
import { db, sessionStorage, generateSessionToken } from '../useMSWDatabase'
import type { Session } from '@/types/mainTypes'

const SESSION_EXPIRY = 14 * 24 * 60 * 60 * 1000 // 14 days

// Helper to get session from cookie
const getSessionFromCookie = (request: Request): Session | null => {
  const cookies = request.headers.get('cookie')
  if (!cookies) return null

  const sessionidMatch = cookies.match(/sessionid=([^;]+)/)
  if (!sessionidMatch) return null

  const token = sessionidMatch[1]
  if (!token) return null

  const session = sessionStorage.find(token)

  if (!session) return null

  // Check if expired
  if (Date.now() > session.expiresAt) {
    sessionStorage.remove(token)
    return null
  }

  return session
}

// Helper to get user from session
const getUserFromSession = (request: Request) => {
  const session = getSessionFromCookie(request)
  if (!session) return null

  const user = db.user.findFirst({
    where: { id: { equals: session.userId } },
  })

  return user
}

// Helper to create response with Django-like error format
const errorResponse = (status: number, detail: string) => {
  return HttpResponse.json({ detail }, { status })
}

export const useAuthHandlers = () => {
  return [
    // Login
    http.post('/api/auth/login/', async ({ request }) => {
      const body = (await request.json()) as { username: string; password: string }

      const user = db.user.findFirst({
        where: {
          username: { equals: body.username },
          password: { equals: body.password },
        },
      })

      if (!user) {
        return errorResponse(401, 'Invalid credentials')
      }

      // Create session
      const token = generateSessionToken()
      const session: Session = {
        token,
        userId: user.id,
        createdAt: Date.now(),
        expiresAt: Date.now() + SESSION_EXPIRY,
      }
      sessionStorage.add(session)

      // Return user without password
      const { ...userWithoutPassword } = user

      return HttpResponse.json(userWithoutPassword, {
        status: 200,
        headers: {
          'Set-Cookie': `sessionid=${token}; Path=/; Max-Age=${SESSION_EXPIRY / 1000}; SameSite=Lax`,
        },
      })
    }),

    // Logout
    http.post('/api/auth/logout/', ({ request }) => {
      const session = getSessionFromCookie(request)
      if (session) {
        sessionStorage.remove(session.token)
      }

      return HttpResponse.json(
        {},
        {
          status: 200,
          headers: {
            'Set-Cookie': 'sessionid=; Path=/; Max-Age=0',
          },
        },
      )
    }),

    // Get current user profile
    http.get('/api/auth/profile/', ({ request }) => {
      const user = getUserFromSession(request)

      if (!user) {
        return errorResponse(401, 'Authentication credentials were not provided')
      }

      const { ...userWithoutPassword } = user
      return HttpResponse.json(userWithoutPassword)
    }),

    // Update profile
    http.patch('/api/auth/profile/', async ({ request }) => {
      const user = getUserFromSession(request)

      if (!user) {
        return errorResponse(401, 'Authentication credentials were not provided')
      }

      const updates = (await request.json()) as Partial<typeof user>

      // Don't allow changing id, username, or role via profile update
      const { ...allowedUpdates } = updates

      const updatedUser = db.user.update({
        where: { id: { equals: user.id } },
        data: allowedUpdates,
      })

      if (!updatedUser) {
        return errorResponse(404, 'User not found')
      }

      const { ...userWithoutPassword } = updatedUser
      return HttpResponse.json(userWithoutPassword)
    }),
  ]
}
