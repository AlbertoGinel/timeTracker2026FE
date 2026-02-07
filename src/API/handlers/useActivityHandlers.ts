import { http, HttpResponse } from 'msw'
import { db, sessionStorage } from '../useMSWDatabase'
import type { Session, Activity } from '@/types/mainTypes'

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

  if (Date.now() > session.expiresAt) {
    sessionStorage.remove(token)
    return null
  }

  return session
}

const getUserFromSession = (request: Request) => {
  const session = getSessionFromCookie(request)
  if (!session) return null

  return db.user.findFirst({
    where: { id: { equals: session.userId } },
  })
}

const errorResponse = (status: number, detail: string) => {
  return HttpResponse.json({ detail }, { status })
}

export const useActivityHandlers = () => {
  return [
    // Get user's activities
    http.get('/api/activities/', ({ request }) => {
      const user = getUserFromSession(request)

      if (!user) {
        return errorResponse(401, 'Authentication credentials were not provided')
      }

      const activities = db.activity.findMany({
        where: { user: { equals: user.id } },
      })

      return HttpResponse.json(activities)
    }),

    // Create activity
    http.post('/api/activities/', async ({ request }) => {
      const user = getUserFromSession(request)

      if (!user) {
        return errorResponse(401, 'Authentication credentials were not provided')
      }

      const body = (await request.json()) as Omit<
        Activity,
        'id' | 'created_at' | 'updated_at' | 'user'
      >
      const now = new Date().toISOString()

      const activity = db.activity.create({
        id: crypto.randomUUID(),
        ...body,
        user: user.id,
        created_at: now,
        updated_at: now,
      })

      return HttpResponse.json(activity, { status: 201 })
    }),

    // Update activity
    http.patch('/api/activities/:id/', async ({ request, params }) => {
      const user = getUserFromSession(request)

      if (!user) {
        return errorResponse(401, 'Authentication credentials were not provided')
      }

      const activityId = params.id as string
      const activity = db.activity.findFirst({
        where: { id: { equals: activityId } },
      })

      if (!activity) {
        return errorResponse(404, 'Activity not found')
      }

      // Check authorization (user owns it or is admin)
      if (activity.user !== user.id && user.role !== 'admin') {
        return errorResponse(403, 'You do not have permission to update this activity')
      }

      const updates = (await request.json()) as Partial<Omit<Activity, 'id' | 'user'>>
      const updatedActivity = db.activity.update({
        where: { id: { equals: activityId } },
        data: {
          ...updates,
          updated_at: new Date().toISOString(),
        },
      })

      return HttpResponse.json(updatedActivity)
    }),

    // Delete activity
    http.delete('/api/activities/:id/', ({ request, params }) => {
      const user = getUserFromSession(request)

      if (!user) {
        return errorResponse(401, 'Authentication credentials were not provided')
      }

      const activityId = params.id as string
      const activity = db.activity.findFirst({
        where: { id: { equals: activityId } },
      })

      if (!activity) {
        return errorResponse(404, 'Activity not found')
      }

      // Check authorization
      if (activity.user !== user.id && user.role !== 'admin') {
        return errorResponse(403, 'You do not have permission to delete this activity')
      }

      db.activity.delete({
        where: { id: { equals: activityId } },
      })

      return new HttpResponse(null, { status: 204 })
    }),
  ]
}
