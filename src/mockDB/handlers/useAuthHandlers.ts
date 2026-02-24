import { http, HttpResponse } from 'msw'
import { db, sessionStorage, generateSessionToken } from '../useMSWDatabase'
import type { Session } from '@/type/mainTypes'
import type { AuthResponse, UserResponse } from '@/API/APITypes'
import type { DayDB, RegimeDB, ActivityDB, StampDB, ScaleLevelDB, UserDB } from '../DBTypes'
import { getSessionFromCookie, getUserFromSession, errorResponse } from './useSession'
import { autoPersist } from '../useAutoPersist'
import { computeBundle } from '../services/bundleService'
import { serializeBundle } from '../serializers/bundleSerializer'
import { DateTime } from 'luxon'

const SESSION_EXPIRY = 14 * 24 * 60 * 60 * 1000 // 14 days

/**
 * Build auth response with bundle (for regular users) or users list (for admins)
 */
const buildAuthResponse = (user: UserDB): AuthResponse => {
  // Remove password from user
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = user

  // For admin users, return list of all users (excluding other admins)
  if (user.role === 'admin') {
    const allUsers = db.user
      .getAll()
      .filter((u) => u.role !== 'admin')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(({ password: _pwd, ...u }): UserResponse => u as UserResponse)
    return {
      userAuth: userWithoutPassword as UserResponse,
      usersList: allUsers,
    }
  }

  // For regular users, compute and return their bundle (±30 days from today)
  const today = DateTime.now().setZone(user.timezone)
  const fromDate = today.minus({ days: 30 }).toISODate()!
  const toDate = today.plus({ days: 30 }).toISODate()!

  // Fetch all user data from DB
  const regimes = db.regime.findMany({
    where: { user: { equals: user.id } },
  }) as RegimeDB[]

  const activities = db.activity.findMany({
    where: { user: { equals: user.id } },
  }) as ActivityDB[]

  const stamps = db.stamp.findMany({
    where: { user: { equals: user.id } },
  }) as StampDB[]

  const materializedDaysDB = db.day.findMany({
    where: {
      user: { equals: user.id },
      dateKey: { gte: fromDate, lte: toDate },
    },
  }) as DayDB[]

  // Compute the complete bundle
  const bundle = computeBundle(
    user.id,
    user.timezone,
    user.scale as ScaleLevelDB[],
    fromDate,
    toDate,
    regimes,
    activities,
    stamps,
    materializedDaysDB,
  )

  // Serialize the bundle
  const serializedBundle = serializeBundle(bundle)

  return {
    userAuth: userWithoutPassword as UserResponse,
    bundle: serializedBundle,
  }
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

      // Build auth response (with bundle for regular users, users list for admins)
      const authResponse = buildAuthResponse(user as UserDB)

      // Store token in localStorage for MSW (since cookies don't work reliably)
      if (typeof window !== 'undefined') {
        localStorage.setItem('msw_session_token', token)
      }

      autoPersist()
      return HttpResponse.json(authResponse, {
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

      // Clear token from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('msw_session_token')
      }

      autoPersist()
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

      // Build auth response (with bundle for regular users, users list for admins)
      const authResponse = buildAuthResponse(user as UserDB)
      return HttpResponse.json(authResponse)
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

      autoPersist()
      const { ...userWithoutPassword } = updatedUser
      return HttpResponse.json(userWithoutPassword)
    }),
  ]
}
