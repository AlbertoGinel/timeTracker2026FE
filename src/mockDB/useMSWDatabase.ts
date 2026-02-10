import { factory, primaryKey } from '@mswjs/data'
import type { Session } from '@/type/mainTypes'
import { seedStamps } from './useSeedStamps'

// Create the database, Define database schema
export const db = factory({
  user: {
    id: primaryKey(String),
    username: String,
    password: String,
    nickname: String,
    role: String,
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

// Initialize database with mock data
export const initializeDatabase = () => {
  // Check if already initialized
  if (db.user.count() > 0) {
    console.log('MSW database already initialized')
    return
  }

  console.log('Initializing MSW database...')

  // Create users
  const user1 = db.user.create({
    id: crypto.randomUUID(),
    username: 'john_doe',
    password: 'password123',
    nickname: 'John',
    role: 'admin',
  })

  const user2 = db.user.create({
    id: crypto.randomUUID(),
    username: 'jane_smith',
    password: 'password456',
    nickname: 'Jane',
    role: 'regular',
  })

  const user3 = db.user.create({
    id: crypto.randomUUID(),
    username: 'bob_wilson',
    password: 'password789',
    nickname: 'Bob',
    role: 'regular',
  })

  // Create activities for each user
  const now = new Date().toISOString()

  // John's activities
  db.activity.create({
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

  db.activity.create({
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

  db.activity.create({
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
  db.activity.create({
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

  db.activity.create({
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

  db.activity.create({
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
  db.activity.create({
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

  db.activity.create({
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

  db.activity.create({
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

  seedStamps(db, { monthsBack: 6 })

  // Cleanup expired sessions
  sessionStorage.cleanup()

  console.log(
    'MSW database initialized with',
    db.user.count(),
    'users,',
    db.activity.count(),
    'activities, and',
    db.stamp.count(),
    'stamps',
  )
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
