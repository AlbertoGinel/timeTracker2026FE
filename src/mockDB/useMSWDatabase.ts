import { factory, primaryKey } from '@mswjs/data'
import type { Session } from '@/type/mainTypes'
import { seedStamps } from './useSeedStamps'
import {
  isIndexedDBInitialized,
  loadFromIndexedDB,
  saveToIndexedDB,
  type IndexedDBData,
} from './useIndexedDB'
import type { UserDB, ActivityDB, StampDB, DayDB, RegimeDB, IntervalDB } from './DBTypes'
import { calculateRegimeIntervalDuration, calculateRegimeMetrics } from './services/regimeService'

// Create the database, Define database schema
export const db = factory({
  user: {
    id: primaryKey(String),
    username: String,
    password: String,
    nickname: String,
    role: String,
    timezone: String,
  },
  activity: {
    id: primaryKey(String),
    color: String,
    name: String,
    icon: String,
    points_per_hour: Number,
    seconds_free: Number,
    created_at: String,
    updated_at: String,
    user: String,
  },
  stamp: {
    id: primaryKey(String),
    timestamp: String,
    user: String,
    type: String,
    activity_id: String,
  },
  day: {
    id: primaryKey(String),
    user: String,
    timezone: String,
    dateKey: String,
    regimeId: String,
    intervals: Array,
    activityTotals: Array,
    totalDurationMs: Number,
    totalPoints: Number,
    isFinalized: Boolean,
    createdAt: String,
    updatedAt: String,
  },
  regime: {
    id: primaryKey(String),
    user: String,
    name: String,
    isHoliday: Boolean,
    intervals: Array,
    totalPoints: Number,
    totalDurationMs: Number,
    createdAt: String,
    updatedAt: String,
    icon: String,
  },
})

// Session storage in localStorage
const SESSIONS_KEY = 'msw_sessions'

export const sessionStorage = {
  getAll(): Session[] {
    const data = localStorage.getItem(SESSIONS_KEY)
    return data ? JSON.parse(data) : []
  },

  save(sessions: Session[]) {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
  },

  find(token: string): Session | undefined {
    return this.getAll().find((s) => s.token === token)
  },

  add(session: Session) {
    const sessions = this.getAll()
    sessions.push(session)
    this.save(sessions)
  },

  remove(token: string) {
    const sessions = this.getAll().filter((s) => s.token !== token)
    this.save(sessions)
  },

  cleanup() {
    const now = Date.now()
    const sessions = this.getAll().filter((s) => s.expiresAt > now)
    this.save(sessions)
  },
}

// Initialize database with mock data - now with IndexedDB persistence
export const initializeDatabase = async () => {
  // Check if already initialized in memory
  if (db.user.count() > 0) {
    console.log('MSW database already initialized in memory')
    return
  }

  // Check if IndexedDB has persisted data
  const hasPersistedData = await isIndexedDBInitialized()

  if (hasPersistedData) {
    console.log('📦 Loading data from IndexedDB...')
    const data = await loadFromIndexedDB()

    // Load users into MSW db
    data.users.forEach((user) => db.user.create(user))

    // Load activities into MSW db
    data.activities.forEach((activity) => db.activity.create(activity))

    // Load stamps into MSW db
    data.stamps.forEach((stamp) => db.stamp.create(stamp))

    // Load days into MSW db
    data.days.forEach((day) => db.day.create(day))

    // Load regimes into MSW db
    data.regimes.forEach((regime) => db.regime.create(regime))

    // Restore sessions to localStorage
    sessionStorage.save(data.sessions)

    console.log(
      '✅ MSW database loaded from IndexedDB:',
      db.user.count(),
      'users,',
      db.activity.count(),
      'activities,',
      db.stamp.count(),
      'stamps,',
      db.day.count(),
      'days,',
      db.regime.count(),
      'regimes',
    )
  } else {
    console.log('📦 IndexedDB empty - seeding fresh data...')

    // Create users
    const user1 = db.user.create({
      id: crypto.randomUUID(),
      username: 'john_doe',
      password: 'password123',
      nickname: 'John',
      role: 'admin',
      timezone: 'Europe/Tallinn',
    })

    const user2 = db.user.create({
      id: crypto.randomUUID(),
      username: 'jane_smith',
      password: 'password456',
      nickname: 'Jane',
      role: 'regular',
      timezone: 'Europe/Tallinn',
    })

    const user3 = db.user.create({
      id: crypto.randomUUID(),
      username: 'bob_wilson',
      password: 'password789',
      nickname: 'Bob',
      role: 'regular',
      timezone: 'Europe/Tallinn',
    })

    // Create activities for each user
    const now = new Date().toISOString()

    // John's activities
    const johnCoding = db.activity.create({
      id: crypto.randomUUID(),
      color: '#3B82F6',
      name: 'Coding',
      icon: '💻',
      points_per_hour: 100,
      seconds_free: 3600,
      created_at: now,
      updated_at: now,
      user: user1.id,
    })

    const johnExercise = db.activity.create({
      id: crypto.randomUUID(),
      color: '#10B981',
      name: 'Exercise',
      icon: '🏃',
      points_per_hour: 80,
      seconds_free: 1800,
      created_at: now,
      updated_at: now,
      user: user1.id,
    })

    const johnReading = db.activity.create({
      id: crypto.randomUUID(),
      color: '#F59E0B',
      name: 'Reading',
      icon: '📚',
      points_per_hour: 60,
      seconds_free: 2400,
      created_at: now,
      updated_at: now,
      user: user1.id,
    })

    // Jane's activities
    const janeWriting = db.activity.create({
      id: crypto.randomUUID(),
      color: '#EC4899',
      name: 'Writing',
      icon: '✍️',
      points_per_hour: 90,
      seconds_free: 3000,
      created_at: now,
      updated_at: now,
      user: user2.id,
    })

    const janeMeditation = db.activity.create({
      id: crypto.randomUUID(),
      color: '#8B5CF6',
      name: 'Meditation',
      icon: '🧘',
      points_per_hour: 70,
      seconds_free: 1200,
      created_at: now,
      updated_at: now,
      user: user2.id,
    })

    const janeDrawing = db.activity.create({
      id: crypto.randomUUID(),
      color: '#06B6D4',
      name: 'Drawing',
      icon: '🎨',
      points_per_hour: 85,
      seconds_free: 2700,
      created_at: now,
      updated_at: now,
      user: user2.id,
    })

    // Bob's activities
    const bobGaming = db.activity.create({
      id: crypto.randomUUID(),
      color: '#EF4444',
      name: 'Gaming',
      icon: '🎮',
      points_per_hour: 50,
      seconds_free: 3600,
      created_at: now,
      updated_at: now,
      user: user3.id,
    })

    const bobCooking = db.activity.create({
      id: crypto.randomUUID(),
      color: '#14B8A6',
      name: 'Cooking',
      icon: '🍳',
      points_per_hour: 75,
      seconds_free: 1500,
      created_at: now,
      updated_at: now,
      user: user3.id,
    })

    const bobMusic = db.activity.create({
      id: crypto.randomUUID(),
      color: '#A855F7',
      name: 'Music',
      icon: '🎵',
      points_per_hour: 65,
      seconds_free: 2100,
      created_at: now,
      updated_at: now,
      user: user3.id,
    })

    // Helper function to get activity for regime calculation
    const getActivity = (activityId: string) => {
      const activity = db.activity.findFirst({
        where: { id: { equals: activityId } },
      })
      return activity
        ? {
            id: activity.id,
            name: activity.name,
            color: activity.color,
            icon: activity.icon,
            points_per_hour: activity.points_per_hour,
            seconds_free: activity.seconds_free,
          }
        : null
    }

    // Create regimes for each user
    // John's regimes
    // 1. Holiday regime
    db.regime.create({
      id: crypto.randomUUID(),
      user: user1.id,
      icon: '🏖️',
      name: 'Holiday',
      isHoliday: true,
      intervals: [],
      totalPoints: 0,
      totalDurationMs: 0,
      createdAt: now,
      updatedAt: now,
    })

    // 2. Workday regime (Coding 9-17, Exercise 18-19, Reading 21-22)
    const johnWorkdayIntervals: IntervalDB[] = [
      {
        intervalId: crypto.randomUUID(),
        activityId: johnCoding.id,
        startTime: '09:00',
        endTime: '17:00',
        durationMs: calculateRegimeIntervalDuration('09:00', '17:00'),
      },
      {
        intervalId: crypto.randomUUID(),
        activityId: johnExercise.id,
        startTime: '18:00',
        endTime: '19:00',
        durationMs: calculateRegimeIntervalDuration('18:00', '19:00'),
      },
      {
        intervalId: crypto.randomUUID(),
        activityId: johnReading.id,
        startTime: '21:00',
        endTime: '22:00',
        durationMs: calculateRegimeIntervalDuration('21:00', '22:00'),
      },
    ]
    const johnWorkdayMetrics = calculateRegimeMetrics(johnWorkdayIntervals, getActivity)
    db.regime.create({
      id: crypto.randomUUID(),
      user: user1.id,
      icon: '💼',
      name: 'Workday',
      isHoliday: false,
      intervals: johnWorkdayIntervals,
      totalPoints: johnWorkdayMetrics.totalPoints,
      totalDurationMs: johnWorkdayMetrics.totalDurationMs,
      createdAt: now,
      updatedAt: now,
    })

    // 3. Restday regime (Exercise 10-11, Reading 14-17, Exercise 18-19)
    const johnRestdayIntervals: IntervalDB[] = [
      {
        intervalId: crypto.randomUUID(),
        activityId: johnExercise.id,
        startTime: '10:00',
        endTime: '11:00',
        durationMs: calculateRegimeIntervalDuration('10:00', '11:00'),
      },
      {
        intervalId: crypto.randomUUID(),
        activityId: johnReading.id,
        startTime: '14:00',
        endTime: '17:00',
        durationMs: calculateRegimeIntervalDuration('14:00', '17:00'),
      },
      {
        intervalId: crypto.randomUUID(),
        activityId: johnExercise.id,
        startTime: '18:00',
        endTime: '19:00',
        durationMs: calculateRegimeIntervalDuration('18:00', '19:00'),
      },
    ]
    const johnRestdayMetrics = calculateRegimeMetrics(johnRestdayIntervals, getActivity)
    db.regime.create({
      id: crypto.randomUUID(),
      user: user1.id,
      icon: '🛋️',
      name: 'Restday',
      isHoliday: false,
      intervals: johnRestdayIntervals,
      totalPoints: johnRestdayMetrics.totalPoints,
      totalDurationMs: johnRestdayMetrics.totalDurationMs,
      createdAt: now,
      updatedAt: now,
    })

    // Jane's regimes
    // 1. Holiday regime
    db.regime.create({
      id: crypto.randomUUID(),
      user: user2.id,
      icon: '🏖️',
      name: 'Holiday',
      isHoliday: true,
      intervals: [],
      totalPoints: 0,
      totalDurationMs: 0,
      createdAt: now,
      updatedAt: now,
    })

    // 2. Workday regime (Writing 9-17, Drawing 19-21)
    const janeWorkdayIntervals: IntervalDB[] = [
      {
        intervalId: crypto.randomUUID(),
        activityId: janeWriting.id,
        startTime: '09:00',
        endTime: '17:00',
        durationMs: calculateRegimeIntervalDuration('09:00', '17:00'),
      },
      {
        intervalId: crypto.randomUUID(),
        activityId: janeDrawing.id,
        startTime: '19:00',
        endTime: '21:00',
        durationMs: calculateRegimeIntervalDuration('19:00', '21:00'),
      },
    ]
    const janeWorkdayMetrics = calculateRegimeMetrics(janeWorkdayIntervals, getActivity)
    db.regime.create({
      id: crypto.randomUUID(),
      user: user2.id,
      icon: '💼',
      name: 'Workday',
      isHoliday: false,
      intervals: janeWorkdayIntervals,
      totalPoints: janeWorkdayMetrics.totalPoints,
      totalDurationMs: janeWorkdayMetrics.totalDurationMs,
      createdAt: now,
      updatedAt: now,
    })

    // 3. Softday regime (Meditation 8-9, Writing 10-14, Drawing 15-18, Meditation 20-21)
    const janeSoftdayIntervals: IntervalDB[] = [
      {
        intervalId: crypto.randomUUID(),
        activityId: janeMeditation.id,
        startTime: '08:00',
        endTime: '09:00',
        durationMs: calculateRegimeIntervalDuration('08:00', '09:00'),
      },
      {
        intervalId: crypto.randomUUID(),
        activityId: janeWriting.id,
        startTime: '10:00',
        endTime: '14:00',
        durationMs: calculateRegimeIntervalDuration('10:00', '14:00'),
      },
      {
        intervalId: crypto.randomUUID(),
        activityId: janeDrawing.id,
        startTime: '15:00',
        endTime: '18:00',
        durationMs: calculateRegimeIntervalDuration('15:00', '18:00'),
      },
      {
        intervalId: crypto.randomUUID(),
        activityId: janeMeditation.id,
        startTime: '20:00',
        endTime: '21:00',
        durationMs: calculateRegimeIntervalDuration('20:00', '21:00'),
      },
    ]
    const janeSoftdayMetrics = calculateRegimeMetrics(janeSoftdayIntervals, getActivity)
    db.regime.create({
      id: crypto.randomUUID(),
      user: user2.id,
      icon: '🌸',
      name: 'Softday',
      isHoliday: false,
      intervals: janeSoftdayIntervals,
      totalPoints: janeSoftdayMetrics.totalPoints,
      totalDurationMs: janeSoftdayMetrics.totalDurationMs,
      createdAt: now,
      updatedAt: now,
    })

    // Bob's regimes
    // 1. Holiday regime
    db.regime.create({
      id: crypto.randomUUID(),
      user: user3.id,
      icon: '🏖️',
      name: 'Holiday',
      isHoliday: true,
      intervals: [],
      totalPoints: 0,
      totalDurationMs: 0,
      createdAt: now,
      updatedAt: now,
    })

    // 2. Socialday regime (Gaming 10-13, Cooking 13-14, Gaming 15-18, Music 19-22)
    const bobSocialdayIntervals: IntervalDB[] = [
      {
        intervalId: crypto.randomUUID(),
        activityId: bobGaming.id,
        startTime: '10:00',
        endTime: '13:00',
        durationMs: calculateRegimeIntervalDuration('10:00', '13:00'),
      },
      {
        intervalId: crypto.randomUUID(),
        activityId: bobCooking.id,
        startTime: '13:00',
        endTime: '14:00',
        durationMs: calculateRegimeIntervalDuration('13:00', '14:00'),
      },
      {
        intervalId: crypto.randomUUID(),
        activityId: bobGaming.id,
        startTime: '15:00',
        endTime: '18:00',
        durationMs: calculateRegimeIntervalDuration('15:00', '18:00'),
      },
      {
        intervalId: crypto.randomUUID(),
        activityId: bobMusic.id,
        startTime: '19:00',
        endTime: '22:00',
        durationMs: calculateRegimeIntervalDuration('19:00', '22:00'),
      },
    ]
    const bobSocialdayMetrics = calculateRegimeMetrics(bobSocialdayIntervals, getActivity)
    db.regime.create({
      id: crypto.randomUUID(),
      user: user3.id,
      icon: '🎮',
      name: 'Socialday',
      isHoliday: false,
      intervals: bobSocialdayIntervals,
      totalPoints: bobSocialdayMetrics.totalPoints,
      totalDurationMs: bobSocialdayMetrics.totalDurationMs,
      createdAt: now,
      updatedAt: now,
    })

    // 3. Midday regime (Cooking 9-10, Music 11-14, Cooking 19-20)
    const bobMiddayIntervals: IntervalDB[] = [
      {
        intervalId: crypto.randomUUID(),
        activityId: bobCooking.id,
        startTime: '09:00',
        endTime: '10:00',
        durationMs: calculateRegimeIntervalDuration('09:00', '10:00'),
      },
      {
        intervalId: crypto.randomUUID(),
        activityId: bobMusic.id,
        startTime: '11:00',
        endTime: '14:00',
        durationMs: calculateRegimeIntervalDuration('11:00', '14:00'),
      },
      {
        intervalId: crypto.randomUUID(),
        activityId: bobCooking.id,
        startTime: '19:00',
        endTime: '20:00',
        durationMs: calculateRegimeIntervalDuration('19:00', '20:00'),
      },
    ]
    const bobMiddayMetrics = calculateRegimeMetrics(bobMiddayIntervals, getActivity)
    db.regime.create({
      id: crypto.randomUUID(),
      user: user3.id,
      icon: '🍳',
      name: 'Midday',
      isHoliday: false,
      intervals: bobMiddayIntervals,
      totalPoints: bobMiddayMetrics.totalPoints,
      totalDurationMs: bobMiddayMetrics.totalDurationMs,
      createdAt: now,
      updatedAt: now,
    })

    seedStamps(db, { monthsBack: 6 })

    // Cleanup expired sessions
    sessionStorage.cleanup()

    console.log(
      '✅ MSW database seeded:',
      db.user.count(),
      'users,',
      db.activity.count(),
      'activities,',
      db.regime.count(),
      'regimes,',
      db.stamp.count(),
      'stamps',
    )

    // Save the seeded data to IndexedDB for persistence
    await persistToIndexedDB()
  }
}

/**
 * Persist current MSW database state to IndexedDB
 */
export const persistToIndexedDB = async () => {
  const data: IndexedDBData = {
    users: db.user.getAll() as UserDB[],
    activities: db.activity.getAll() as ActivityDB[],
    stamps: db.stamp.getAll() as StampDB[],
    days: db.day.getAll() as DayDB[],
    regimes: db.regime.getAll() as RegimeDB[],
    sessions: sessionStorage.getAll(),
  }

  await saveToIndexedDB(data)
}

// Helper to generate session token
export const generateSessionToken = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}
