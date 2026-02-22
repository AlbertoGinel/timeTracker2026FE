import { http, HttpResponse } from 'msw'
import { db } from '../useMSWDatabase'
import type { Stamp } from '@/type/mainTypes'
import type { DayDB } from '../DBTypes'
import { getUserFromSession, errorResponse } from './useSession'
import { computeDaysFromStamps, mergeMaterializedAndComputedDays } from '../services/dayService'

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

  // Regime lookup helper
  const getRegime = (regimeId: string) => {
    const regime = db.regime.findFirst({
      where: { id: { equals: regimeId } },
    })
    if (!regime) return null
    return {
      id: regime.id,
      icon: regime.icon,
      name: regime.name,
      isHoliday: regime.isHoliday,
      totalPoints: regime.totalPoints,
      totalDurationMs: regime.totalDurationMs,
    }
  }

  return [
    // Get user's days in date range (materialized and computed)
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

      // Compute days from stamps
      const computedDays = computeDaysFromStamps(
        stamps,
        fromDate,
        toDate,
        user.id,
        user.timezone,
        getActivity,
      )

      // Get materialized days from DB
      const materializedDaysDB = db.day.findMany({
        where: {
          user: { equals: user.id },
          dateKey: { gte: fromDate, lte: toDate },
        },
      }) as DayDB[]

      // Merge materialized and computed days
      const days = mergeMaterializedAndComputedDays(
        materializedDaysDB,
        computedDays,
        getActivity,
        getRegime,
        user.scale,
      )

      // Sort by dateKey descending
      days.sort((a, b) => b.dateKey.localeCompare(a.dateKey))

      return HttpResponse.json(days)
    }),
  ]
}
