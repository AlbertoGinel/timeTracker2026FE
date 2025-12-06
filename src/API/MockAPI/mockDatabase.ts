import { v4 as uuidv4 } from 'uuid'

export type UserRole = 'admin' | 'regular'

export type User = {
  id: string
  username: string
  password: string
  nickname: string
  role: UserRole
}

export type ApiActivity = {
  id: string
  color: string
  name: string
  icon: string
  points_per_hour: number
  seconds_free: number
  created_at: string
  updated_at: string
  user: string
}

// Generate mock users first
const user1: User = {
  id: uuidv4(),
  username: 'john_doe',
  password: 'password123',
  nickname: 'John',
  role: 'admin',
}

const user2: User = {
  id: uuidv4(),
  username: 'jane_smith',
  password: 'password456',
  nickname: 'Jane',
  role: 'regular',
}

const user3: User = {
  id: uuidv4(),
  username: 'bob_wilson',
  password: 'password789',
  nickname: 'Bob',
  role: 'regular',
}

export const mockUsers: User[] = [user1, user2, user3]

// Generate mock activities using the users above
export const mockActivities: ApiActivity[] = [
  // John's activities
  {
    id: uuidv4(),
    color: '#3B82F6',
    name: 'Coding',
    icon: '💻',
    points_per_hour: 100,
    seconds_free: 3600,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user: user1.id,
  },
  {
    id: uuidv4(),
    color: '#10B981',
    name: 'Exercise',
    icon: '🏃',
    points_per_hour: 80,
    seconds_free: 1800,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user: user1.id,
  },
  {
    id: uuidv4(),
    color: '#F59E0B',
    name: 'Reading',
    icon: '📚',
    points_per_hour: 60,
    seconds_free: 2400,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user: user1.id,
  },
  // Jane's activities
  {
    id: uuidv4(),
    color: '#EC4899',
    name: 'Writing',
    icon: '✍️',
    points_per_hour: 90,
    seconds_free: 3000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user: user2.id,
  },
  {
    id: uuidv4(),
    color: '#8B5CF6',
    name: 'Meditation',
    icon: '🧘',
    points_per_hour: 70,
    seconds_free: 1200,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user: user2.id,
  },
  {
    id: uuidv4(),
    color: '#06B6D4',
    name: 'Drawing',
    icon: '🎨',
    points_per_hour: 85,
    seconds_free: 2700,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user: user2.id,
  },
  // Bob's activities
  {
    id: uuidv4(),
    color: '#EF4444',
    name: 'Gaming',
    icon: '🎮',
    points_per_hour: 50,
    seconds_free: 3600,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user: user3.id,
  },
  {
    id: uuidv4(),
    color: '#14B8A6',
    name: 'Cooking',
    icon: '🍳',
    points_per_hour: 75,
    seconds_free: 1500,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user: user3.id,
  },
  {
    id: uuidv4(),
    color: '#A855F7',
    name: 'Music',
    icon: '🎵',
    points_per_hour: 65,
    seconds_free: 2100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user: user3.id,
  },
]
