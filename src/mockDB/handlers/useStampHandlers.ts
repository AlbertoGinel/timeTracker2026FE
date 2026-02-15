import { http, HttpResponse } from 'msw'
import { db } from '../useMSWDatabase'
import type { Stamp } from '@/type/mainTypes'
import { getUserFromSession, errorResponse } from './useSession'
import { serializeStamp } from '../serializers/stampSerializer'
import { autoPersist } from '../useAutoPersist'

export const useStampHandlers = () => {
  // Activity lookup helper
  const getActivity = (activityId: string) => {
    const activity = db.activity.findFirst({
      where: { id: { equals: activityId } },
    })
    if (!activity) return null
    return {
      id: activity.id,
      color: activity.color,
      name: activity.name,
      icon: activity.icon,
    }
  }

  return [
    // Get user's stamps
    http.get('/api/stamps/', ({ request }) => {
      console.log('[StampHandlers] GET /api/stamps/ - Request received')
      const user = getUserFromSession(request)

      if (!user) {
        console.log('[StampHandlers] No user found in session')
        return errorResponse(401, 'Authentication credentials were not provided')
      }

      console.log('[StampHandlers] User found:', user.id)
      const stamps = db.stamp.findMany({
        where: { user: { equals: user.id } },
      }) as Stamp[]

      const expandedStamps = stamps
        .map((stamp) => serializeStamp(stamp, getActivity))
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      console.log('[StampHandlers] Stamps found:', expandedStamps.length, expandedStamps)
      return HttpResponse.json(expandedStamps)
    }),

    // Create stamp
    http.post('/api/stamps/', async ({ request }) => {
      const user = getUserFromSession(request)

      if (!user) {
        return errorResponse(401, 'Authentication credentials were not provided')
      }

      const body = (await request.json()) as Omit<Stamp, 'id' | 'user'>

      const stamp = db.stamp.create({
        id: crypto.randomUUID(),
        timestamp: body.timestamp,
        type: body.type,
        activity_id: body.activity_id ?? undefined,
        user: user.id,
      }) as Stamp

      autoPersist()
      return HttpResponse.json(serializeStamp(stamp, getActivity), { status: 201 })
    }),

    // Update stamp
    http.patch('/api/stamps/:id/', async ({ request, params }) => {
      const user = getUserFromSession(request)

      if (!user) {
        return errorResponse(401, 'Authentication credentials were not provided')
      }

      const stampId = params.id as string
      const stamp = db.stamp.findFirst({
        where: { id: { equals: stampId } },
      })

      if (!stamp) {
        return errorResponse(404, 'Stamp not found')
      }

      // Check authorization (user owns it or is admin)
      if (stamp.user !== user.id && user.role !== 'admin') {
        return errorResponse(403, 'You do not have permission to update this stamp')
      }

      const updates = (await request.json()) as Partial<Omit<Stamp, 'id' | 'user'>>
      const updatedStamp = db.stamp.update({
        where: { id: { equals: stampId } },
        data: {
          ...updates,
          activity_id: updates.activity_id === null ? undefined : updates.activity_id,
        },
      }) as Stamp

      autoPersist()
      return HttpResponse.json(serializeStamp(updatedStamp, getActivity))
    }),

    // Delete stamp
    http.delete('/api/stamps/:id/', ({ request, params }) => {
      const user = getUserFromSession(request)

      if (!user) {
        return errorResponse(401, 'Authentication credentials were not provided')
      }

      const stampId = params.id as string
      const stamp = db.stamp.findFirst({
        where: { id: { equals: stampId } },
      })

      if (!stamp) {
        return errorResponse(404, 'Stamp not found')
      }

      // Check authorization
      if (stamp.user !== user.id && user.role !== 'admin') {
        return errorResponse(403, 'You do not have permission to delete this stamp')
      }

      db.stamp.delete({
        where: { id: { equals: stampId } },
      })

      autoPersist()
      return new HttpResponse(null, { status: 204 })
    }),
  ]
}
