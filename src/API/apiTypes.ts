export type ApiResponse<T> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: ApiError
    }

export type ApiError = {
  code: number
  message: string
  details?: string
}

export class ApiException extends Error {
  code: number
  details?: string

  constructor(code: number, message: string, details?: string) {
    super(message)
    this.code = code
    this.details = details
    this.name = 'ApiException'
  }
}

// HTTP Status codes
export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  REQUEST_TIMEOUT: 408,
  INTERNAL_SERVER_ERROR: 500,
} as const
