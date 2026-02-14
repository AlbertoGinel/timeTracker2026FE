import { http, HttpResponse } from 'msw'
import { db } from '../useMSWDatabase'
import type { Stamp } from '@/type/mainTypes'
import { getUserFromSession, errorResponse } from './useSession'
import { computeIntervalsFromStamps } from '../services/intervalService'

export const useIntervalHandlers = () => {
  return [
    // Get user's intervals (computed from stamps)
    http.get('/api/intervals/', ({ request }) => {
      console.log('[IntervalHandlers] GET /api/intervals/ - Request received')
      const user = getUserFromSession(request)

      if (!user) {
        console.log('[IntervalHandlers] No user found in session')
        return errorResponse(401, 'Authentication credentials were not provided')
      }

      console.log('[IntervalHandlers] User found:', user.id)

      // Get all stamps for user
      const stamps = db.stamp.findMany({
        where: { user: { equals: user.id } },
      }) as Stamp[]

      // Activity lookup function
      const getActivity = (activityId: string) => {
        const activity = db.activity.findFirst({
          where: { id: { equals: activityId } },
        })
        if (!activity) return null
        return {
          id: activity.id,
          name: activity.name,
          color: activity.color,
          icon: activity.icon,
          points_per_hour: activity.points_per_hour,
          seconds_free: activity.seconds_free,
        }
      }

      // Compute intervals using service
      const intervals = computeIntervalsFromStamps(stamps, getActivity)

      console.log('[IntervalHandlers] Intervals computed:', intervals.length, intervals)
      return HttpResponse.json(intervals)
    }),
  ]
}
