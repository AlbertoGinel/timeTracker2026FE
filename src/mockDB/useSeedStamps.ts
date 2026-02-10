import { DateTime } from 'luxon'

type DbType = typeof import('./useMSWDatabase').db

type SeedOptions = {
  monthsBack?: number
}

const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const randomChoice = <T>(items: [T, ...T[]]): T => {
  return items[randomInt(0, items.length - 1)]!
}

const weightedPick = (weights: [number, ...number[]]) => {
  const total = weights.reduce((sum, w) => sum + w, 0)
  const roll = Math.random() * total
  let acc = 0
  for (let i = 0; i < weights.length; i += 1) {
    acc += weights[i]!
    if (roll <= acc) return i
  }
  return weights.length - 1
}

const toStampTimestamp = (date: Date) => {
  // Always emit Zulu (UTC) timestamps without milliseconds
  const iso = DateTime.fromJSDate(date, { zone: 'utc' }).toISO({
    suppressMilliseconds: true,
  })
  return (iso ?? DateTime.utc().toISO({ suppressMilliseconds: true }) ?? '').replace('+00:00', 'Z')
}

const advanceCursor = (cursor: Date) => {
  const bucket = weightedPick([20, 70, 10])
  let deltaSeconds = 0

  if (bucket === 0) {
    // Short jump: 1-60 seconds
    deltaSeconds = randomInt(1, 60)
  } else if (bucket === 1) {
    // Medium jump: 1 minute to 8 hours
    deltaSeconds = randomInt(60, 8 * 60 * 60)
  } else {
    // Long jump: 8 hours to 2 days
    deltaSeconds = randomInt(8 * 60 * 60, 2 * 24 * 60 * 60)
  }

  return DateTime.fromJSDate(cursor, { zone: 'utc' }).plus({ seconds: deltaSeconds }).toJSDate()
}

export const seedStamps = (db: DbType, options: SeedOptions = {}) => {
  const monthsBack = options.monthsBack ?? 6
  const now = new Date()

  const users = db.user.findMany({})

  users.forEach((user) => {
    const activities = db.activity.findMany({
      where: { user: { equals: user.id } },
    })

    let cursor = new Date()
    cursor.setMonth(cursor.getMonth() - monthsBack)

    while (cursor < now) {
      const action = weightedPick([20, 10, 70])

      if (action === 0) {
        db.stamp.create({
          id: crypto.randomUUID(),
          timestamp: toStampTimestamp(cursor),
          user: user.id,
          type: 'stop',
          activity_id: undefined,
        })
      } else if (action === 2 && activities.length > 0) {
        const activity = randomChoice(
          activities as [(typeof activities)[number], ...(typeof activities)[number][]],
        )
        db.stamp.create({
          id: crypto.randomUUID(),
          timestamp: toStampTimestamp(cursor),
          user: user.id,
          type: 'start',
          activity_id: activity.id,
        })
      }

      cursor = advanceCursor(cursor)
    }
  })
}
