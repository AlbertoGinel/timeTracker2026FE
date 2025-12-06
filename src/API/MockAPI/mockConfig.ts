export const MOCK_CONFIG = {
  errorRate: 0.1, // 10% chance of error
  minDelay: 200, // ms
  maxDelay: 2000, // ms
  // Within errors: 33% 500, 33% 408 with response, 33% 408 timeout (no response)
}

export const MOCK_SESSION_EXPIRY = 14 * 24 * 60 * 60 * 1000 // 14 days in ms
