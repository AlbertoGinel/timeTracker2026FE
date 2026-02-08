import { HttpResponse } from 'msw'
import { db, sessionStorage } from '../useMSWDatabase'
import type { Session } from '@/type/mainTypes'

export const getSessionFromCookie = (request: Request): Session | null => {
  // First try custom header (for MSW)
  const customToken = request.headers.get('X-Session-Token')

  if (customToken) {
    const session = sessionStorage.find(customToken)

    if (session) {
      if (Date.now() > session.expiresAt) {
        sessionStorage.remove(customToken)
        return null
      }
      return session
    }
  }

  // Fallback to cookie
  const cookies = request.headers.get('cookie')

  if (!cookies) {
    return null
  }

  const sessionidMatch = cookies.match(/sessionid=([^;]+)/)
  if (!sessionidMatch) {
    return null
  }

  const token = sessionidMatch[1]

  if (!token) return null

  const session = sessionStorage.find(token)

  if (!session) return null

  if (Date.now() > session.expiresAt) {
    sessionStorage.remove(token)
    return null
  }

  return session
}

export const getUserFromSession = (request: Request) => {
  const session = getSessionFromCookie(request)
  if (!session) return null

  return db.user.findFirst({
    where: { id: { equals: session.userId } },
  })
}

export const errorResponse = (status: number, detail: string) => {
  return HttpResponse.json({ detail }, { status })
}
