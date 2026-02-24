import { http, HttpResponse } from 'msw'
import { db } from '../useMSWDatabase'
import type { DayDB, RegimeDB, ActivityDB, StampDB, ScaleLevelDB } from '../DBTypes'
import { getUserFromSession, errorResponse } from './useSession'
import { computeBundle } from '../services/bundleService'
import { serializeBundle } from '../serializers/bundleSerializer'

export const useBundleHandlers = () => {
  return [
    // Get complete user bundle (regimes, activities, stamps, intervals, days, time sections)
    http.get('/api/bundle/', ({ request }) => {
      const user = getUserFromSession(request)

      if (!user) {
        return errorResponse(401, 'Authentication credentials were not provided')
      }

      // Get query params
      const url = new URL(request.url)
      const fromDate = url.searchParams.get('from')
      const toDate = url.searchParams.get('to')
      const requestedUserId = url.searchParams.get('userId')

      if (!fromDate || !toDate) {
        return errorResponse(400, 'from and to query parameters are required (YYYY-MM-DD format)')
      }

      // Determine which user's data to fetch
      let targetUserId = user.id

      // If userId is specified, check if requester is admin
      if (requestedUserId) {
        if (user.role !== 'admin') {
          return errorResponse(403, 'Admin access required to view other users data')
        }
        targetUserId = requestedUserId
      }

      // Get target user (for timezone and scale)
      const targetUser = db.user.findFirst({
        where: { id: { equals: targetUserId } },
      })

      if (!targetUser) {
        return errorResponse(404, 'User not found')
      }

      // Fetch all user data from DB
      const regimes = db.regime.findMany({
        where: { user: { equals: targetUserId } },
      }) as RegimeDB[]

      const activities = db.activity.findMany({
        where: { user: { equals: targetUserId } },
      }) as ActivityDB[]

      const stamps = db.stamp.findMany({
        where: { user: { equals: targetUserId } },
      }) as StampDB[]

      const materializedDaysDB = db.day.findMany({
        where: {
          user: { equals: targetUserId },
          dateKey: { gte: fromDate, lte: toDate },
        },
      }) as DayDB[]

      // Compute the complete bundle (orchestrates all services)
      const bundle = computeBundle(
        targetUserId,
        targetUser.timezone,
        targetUser.scale as ScaleLevelDB[],
        fromDate,
        toDate,
        regimes,
        activities,
        stamps,
        materializedDaysDB,
      )

      // Serialize the bundle (populate all activity objects)
      const serializedBundle = serializeBundle(bundle)

      return HttpResponse.json(serializedBundle)
    }),
  ]
}
