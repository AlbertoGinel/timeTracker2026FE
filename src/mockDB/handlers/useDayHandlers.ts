import { http, HttpResponse } from 'msw'
import { db } from '../useMSWDatabase'
import type { Stamp } from '@/type/mainTypes'
import { getUserFromSession, errorResponse } from './useSession'
import { computeDaysFromStamps } from '../services/dayService'

export const useDayHandlers = () => {
  // Activity lookup helper
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

  return [
    // Get user's days in date range (only materialized days with stamps)
    http.get('/api/days/', ({ request }) => {
      const user = getUserFromSession(request)

      if (!user) {
        return errorResponse(401, 'Authentication credentials were not provided')
      }

      // Get query params
      const url = new URL(request.url)
      const fromDate = url.searchParams.get('from')
      const toDate = url.searchParams.get('to')

      if (!fromDate || !toDate) {
        return errorResponse(400, 'from and to query parameters are required (YYYY-MM-DD format)')
      }

      // Get all stamps for user
      const stamps = db.stamp.findMany({
        where: { user: { equals: user.id } },
      }) as Stamp[]

      // Compute days from stamps (only returns days with data)
      const days = computeDaysFromStamps(
        stamps,
        fromDate,
        toDate,
        user.id,
        user.timezone,
        getActivity,
      )

      return HttpResponse.json(days)
    }),
  ]
}
