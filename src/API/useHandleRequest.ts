/**
 * Shared HTTP request handler for all API calls
 * Handles fetch with credentials, JSON parsing, and error handling
 */
export const useHandleRequest = () => {
  const handleRequest = async <T>(url: string, options?: RequestInit): Promise<T> => {
    // Get session token from localStorage for MSW
    const sessionToken = localStorage.getItem('msw_session_token')

    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Important for cookies/sessions
      headers: {
        'Content-Type': 'application/json',
        ...(sessionToken && { 'X-Session-Token': sessionToken }), // Add custom header for MSW
        ...options?.headers,
      },
    })

    // Handle empty responses (like 204 No Content)
    if (response.status === 204) {
      return undefined as T
    }

    const data = await response.json()

    // Check for Django-style error response
    if (!response.ok) {
      throw new Error(data.detail || `HTTP error ${response.status}`)
    }

    return data
  }

  return { handleRequest }
}
