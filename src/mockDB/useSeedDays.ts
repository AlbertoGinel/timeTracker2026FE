import { DateTime } from 'luxon'
import type { DayDB } from './DBTypes'

type DbType = typeof import('./useMSWDatabase').db

const DAYS_BEFORE_TODAY = 20
const DAYS_AFTER_TODAY = 20
const SHELVING_THRESHOLD_DAYS = 5 // Days older than this are shelved
const CHANCE_OF_REGIME = 0.8 // 80% chance to assign a regime

/**
 * Seed days for all users
 * - Creates days from -20 to +20 days from today
 * - 80% of days get a regime assigned (materialized in DB)
 * - 20% stay unmaterialized (not in DB, computed on demand)
 * - Days older than 5 days are marked as shelved
 * - Only stores DB-only fields: id, regime, isShelved, createdAt, updatedAt
 * - Intervals and totals are computed fresh from stamps on query
 */
export const seedDays = (db: DbType) => {
  const now = DateTime.now()
  const users = db.user.findMany({})

  users.forEach((user) => {
    // Get user's regimes (including holidays)
    const allRegimes = db.regime.findMany({
      where: { user: { equals: user.id } },
    })

    if (allRegimes.length === 0) {
      console.log(`⚠️ User ${user.nickname} has no regimes, skipping day seeding`)
      return
    }

    console.log(`📅 Seeding days for ${user.nickname} (${user.timezone})...`)

    // Generate days from -20 to +20
    for (let dayOffset = -DAYS_BEFORE_TODAY; dayOffset <= DAYS_AFTER_TODAY; dayOffset++) {
      const targetDate = now.plus({ days: dayOffset })
      const dateKey = targetDate.toFormat('yyyy-MM-dd')

      // 80% chance to materialize this day
      const shouldMaterialize = Math.random() < CHANCE_OF_REGIME

      if (!shouldMaterialize) {
        // Skip - day stays unmaterialized (not in DB, will be computed on demand)
        continue
      }

      // Pick a random regime from user's regimes (including holidays)
      const randomRegime = allRegimes[Math.floor(Math.random() * allRegimes.length)]!

      // Determine if day should be shelved (5+ days old in UTC)
      const daysOld = now.startOf('day').diff(targetDate.startOf('day'), 'days').days
      const isShelved = daysOld >= SHELVING_THRESHOLD_DAYS

      // Create materialized day in DB with minimal data
      // Intervals and totals will be computed fresh from stamps when queried
      const dayDB: DayDB = {
        id: `${user.id}:${dateKey}`,
        user: user.id,
        timezone: user.timezone,
        dateKey,
        regimeId: randomRegime.id,
        intervals: [], // Computed fresh on query
        activityTotals: [], // Computed fresh on query
        totalDurationMs: 0, // Computed fresh on query
        totalPoints: 0, // Computed fresh on query
        percentageAchieved: null, // Computed fresh on query
        achievedLevel: null, // Computed fresh on query
        isShelved,
        createdAt: now.toISO()!,
        updatedAt: now.toISO()!,
      }

      db.day.create(dayDB)
    }

    const materializedCount = db.day.findMany({
      where: { user: { equals: user.id } },
    }).length

    console.log(
      `  ✅ Created ${materializedCount} materialized days (~${Math.round((materializedCount / (DAYS_BEFORE_TODAY + DAYS_AFTER_TODAY + 1)) * 100)}%)`,
    )
  })
}
