import { http, HttpResponse } from 'msw'
import { db } from '../useMSWDatabase'
import type { Regime } from '@/type/mainTypes'
import type { ActivityDB, IntervalDB, RegimeDB } from '../DBTypes'
import { getUserFromSession, errorResponse } from './useSession'
import { autoPersist } from '../useAutoPersist'
import { serializeRegime } from '../serializers/regimeSerializer'
import {
  calculateRegimeMetrics,
  calculateRegimeIntervalDuration,
  validateRegimeIntervals,
} from '../services/regimeService'

export const useRegimeHandlers = () => {
  return [
    // Get user's regimes
    http.get('/api/regimes/', ({ request }) => {
      const user = getUserFromSession(request)

      if (!user) {
        return errorResponse(401, 'Authentication credentials were not provided')
      }

      const regimes = db.regime.findMany({
        where: { user: { equals: user.id } },
      })

      // Serialize regimes (populate activity objects)
      const getActivity = (activityId: string) => {
        const activity = db.activity.findFirst({
          where: { id: { equals: activityId } },
        })
        return activity
          ? { id: activity.id, name: activity.name, color: activity.color, icon: activity.icon }
          : null
      }

      const serialized = regimes
        .map((regime) => serializeRegime(regime as unknown as RegimeDB, getActivity))
        .filter((r): r is Regime => r !== null)

      return HttpResponse.json(serialized)
    }),

    // Get single regime
    http.get('/api/regimes/:id/', ({ request, params }) => {
      const user = getUserFromSession(request)

      if (!user) {
        return errorResponse(401, 'Authentication credentials were not provided')
      }

      const regimeId = params.id as string
      const regime = db.regime.findFirst({
        where: { id: { equals: regimeId } },
      })

      if (!regime) {
        return errorResponse(404, 'Regime not found')
      }

      // Check authorization
      if (regime.user !== user.id && user.role !== 'admin') {
        return errorResponse(403, 'You do not have permission to view this regime')
      }

      const getActivity = (activityId: string) => {
        const activity = db.activity.findFirst({
          where: { id: { equals: activityId } },
        })
        return activity
          ? { id: activity.id, name: activity.name, color: activity.color, icon: activity.icon }
          : null
      }

      const serialized = serializeRegime(regime as unknown as RegimeDB, getActivity)
      if (!serialized) {
        return errorResponse(500, 'Error serializing regime')
      }

      return HttpResponse.json(serialized)
    }),

    // Create regime
    http.post('/api/regimes/', async ({ request }) => {
      const user = getUserFromSession(request)

      if (!user) {
        return errorResponse(401, 'Authentication credentials were not provided')
      }

      const body = (await request.json()) as Omit<
        Regime,
        'id' | 'createdAt' | 'updatedAt' | 'user' | 'totalPoints' | 'totalDurationMs'
      >

      // Validate intervals
      const validation = validateRegimeIntervals(body.intervals as IntervalDB[])
      if (!validation.valid) {
        return errorResponse(400, validation.error || 'Invalid intervals')
      }

      // Calculate duration for each interval
      const intervalsWithDuration: IntervalDB[] = body.intervals.map((interval) => ({
        intervalId: interval.intervalId || crypto.randomUUID(),
        activityId: interval.activityId,
        startTime: interval.startTime,
        endTime: interval.endTime,
        durationMs: calculateRegimeIntervalDuration(interval.startTime, interval.endTime),
      }))

      // Get activity lookup function
      const getActivity = (activityId: string) => {
        const activity = db.activity.findFirst({
          where: { id: { equals: activityId } },
        }) as ActivityDB | null
        return activity
      }

      // Calculate total points and duration
      const { totalPoints, totalDurationMs } = calculateRegimeMetrics(
        intervalsWithDuration,
        getActivity,
      )

      const now = new Date().toISOString()

      const regime = db.regime.create({
        id: crypto.randomUUID(),
        user: user.id,
        icon: body.icon,
        name: body.name,
        isHoliday: body.isHoliday,
        intervals: intervalsWithDuration,
        totalPoints,
        totalDurationMs,
        createdAt: now,
        updatedAt: now,
      })

      autoPersist()

      const getActivitySummary = (activityId: string) => {
        const activity = db.activity.findFirst({
          where: { id: { equals: activityId } },
        })
        return activity
          ? { id: activity.id, name: activity.name, color: activity.color, icon: activity.icon }
          : null
      }

      const serialized = serializeRegime(regime as unknown as RegimeDB, getActivitySummary)
      return HttpResponse.json(serialized, { status: 201 })
    }),

    // Update regime
    http.patch('/api/regimes/:id/', async ({ request, params }) => {
      const user = getUserFromSession(request)

      if (!user) {
        return errorResponse(401, 'Authentication credentials were not provided')
      }

      const regimeId = params.id as string
      const regime = db.regime.findFirst({
        where: { id: { equals: regimeId } },
      })

      if (!regime) {
        return errorResponse(404, 'Regime not found')
      }

      // Check authorization
      if (regime.user !== user.id && user.role !== 'admin') {
        return errorResponse(403, 'You do not have permission to update this regime')
      }

      const updates = (await request.json()) as Partial<
        Omit<Regime, 'id' | 'user' | 'createdAt' | 'updatedAt'>
      >

      // If intervals are being updated, recalculate metrics
      let totalPoints = regime.totalPoints
      let totalDurationMs = regime.totalDurationMs
      let intervalsWithDuration = regime.intervals as IntervalDB[]

      if (updates.intervals) {
        // Validate intervals
        const validation = validateRegimeIntervals(updates.intervals as IntervalDB[])
        if (!validation.valid) {
          return errorResponse(400, validation.error || 'Invalid intervals')
        }

        // Calculate duration for each interval
        intervalsWithDuration = updates.intervals.map((interval) => ({
          intervalId: interval.intervalId || crypto.randomUUID(),
          activityId: interval.activityId,
          startTime: interval.startTime,
          endTime: interval.endTime,
          durationMs: calculateRegimeIntervalDuration(interval.startTime, interval.endTime),
        }))

        // Get activity lookup function
        const getActivity = (activityId: string) => {
          const activity = db.activity.findFirst({
            where: { id: { equals: activityId } },
          }) as ActivityDB | null
          return activity
        }

        // Recalculate metrics
        const metrics = calculateRegimeMetrics(intervalsWithDuration, getActivity)
        totalPoints = metrics.totalPoints
        totalDurationMs = metrics.totalDurationMs
      }

      const updatedRegime = db.regime.update({
        where: { id: { equals: regimeId } },
        data: {
          ...updates,
          intervals: intervalsWithDuration,
          totalPoints,
          totalDurationMs,
          updatedAt: new Date().toISOString(),
        },
      })

      autoPersist()

      const getActivity = (activityId: string) => {
        const activity = db.activity.findFirst({
          where: { id: { equals: activityId } },
        })
        return activity
          ? { id: activity.id, name: activity.name, color: activity.color, icon: activity.icon }
          : null
      }

      const serialized = serializeRegime(updatedRegime as unknown as RegimeDB, getActivity)
      return HttpResponse.json(serialized)
    }),

    // Delete regime
    http.delete('/api/regimes/:id/', ({ request, params }) => {
      const user = getUserFromSession(request)

      if (!user) {
        return errorResponse(401, 'Authentication credentials were not provided')
      }

      const regimeId = params.id as string
      const regime = db.regime.findFirst({
        where: { id: { equals: regimeId } },
      })

      if (!regime) {
        return errorResponse(404, 'Regime not found')
      }

      // Check authorization
      if (regime.user !== user.id && user.role !== 'admin') {
        return errorResponse(403, 'You do not have permission to delete this regime')
      }

      db.regime.delete({
        where: { id: { equals: regimeId } },
      })

      autoPersist()
      return new HttpResponse(null, { status: 204 })
    }),
  ]
}
