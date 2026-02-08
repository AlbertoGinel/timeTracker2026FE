import { http, HttpResponse } from 'msw'
import { db } from '../useMSWDatabase'
import type { User } from '@/type/mainTypes'
import { getUserFromSession, errorResponse } from './useSession'

const requireAdmin = (request: Request) => {
  const user = getUserFromSession(request)

  if (!user) {
    return errorResponse(401, 'Authentication credentials were not provided')
  }

  if (user.role !== 'admin') {
    return errorResponse(403, 'Admin access required')
  }

  return null // No error, user is admin
}

export const useAdminHandlers = () => {
  return [
    // Get all users
    http.get('/api/admin/users/', ({ request }) => {
      const error = requireAdmin(request)
      if (error) return error

      const users = db.user.getAll()
      const usersWithoutPasswords = users.map(({ ...user }) => user)

      return HttpResponse.json(usersWithoutPasswords)
    }),

    // Get user by ID
    http.get('/api/admin/users/:id/', ({ request, params }) => {
      const error = requireAdmin(request)
      if (error) return error

      const userId = params.id as string
      const user = db.user.findFirst({
        where: { id: { equals: userId } },
      })

      if (!user) {
        return errorResponse(404, 'User not found')
      }

      const { ...userWithoutPassword } = user
      return HttpResponse.json(userWithoutPassword)
    }),

    // Update user
    http.patch('/api/admin/users/:id/', async ({ request, params }) => {
      const error = requireAdmin(request)
      if (error) return error

      const userId = params.id as string
      const user = db.user.findFirst({
        where: { id: { equals: userId } },
      })

      if (!user) {
        return errorResponse(404, 'User not found')
      }

      const updates = (await request.json()) as Partial<Omit<User, 'id' | 'username' | 'role'>>

      const updatedUser = db.user.update({
        where: { id: { equals: userId } },
        data: updates,
      })

      if (!updatedUser) {
        return errorResponse(404, 'User not found')
      }

      const { ...userWithoutPassword } = updatedUser
      return HttpResponse.json(userWithoutPassword)
    }),

    // Delete user
    http.delete('/api/admin/users/:id/', ({ request, params }) => {
      const error = requireAdmin(request)
      if (error) return error

      const userId = params.id as string
      const user = db.user.findFirst({
        where: { id: { equals: userId } },
      })

      if (!user) {
        return errorResponse(404, 'User not found')
      }

      // Delete user's activities first
      db.activity.deleteMany({
        where: { user: { equals: userId } },
      })

      // Delete user
      db.user.delete({
        where: { id: { equals: userId } },
      })

      return new HttpResponse(null, { status: 204 })
    }),

    // Get activities for a specific user
    http.get('/api/admin/users/:id/activities/', ({ request, params }) => {
      const error = requireAdmin(request)
      if (error) return error

      const userId = params.id as string
      const activities = db.activity.findMany({
        where: { user: { equals: userId } },
      })

      return HttpResponse.json(activities)
    }),
  ]
}
