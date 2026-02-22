import type { ScaleLevelDB } from '../DBTypes'

const STANDARD_DAY_MS = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export type AchievementResult = {
  percentageAchieved: number | null
  achievedLevel: ScaleLevelDB | null
}

/**
 * Calculate achievement for a day with regime
 * This calculates a corrected percentage that accounts for day length variations (DST)
 *
 * @param earnedPoints - The points earned by the user during the day
 * @param regimePoints - The total points available from the regime (24h reference)
 * @param dayLengthMs - The actual length of the day in milliseconds (may be 23h, 24h, or 25h due to DST)
 * @param scale - The user's scale configuration
 * @returns Object with percentageAchieved and achievedLevel (both null if no regime)
 */
export const calculateDayAchievement = (
  earnedPoints: number,
  regimePoints: number | null | undefined,
  dayLengthMs: number,
  scale: ScaleLevelDB[],
): AchievementResult => {
  // If no regime or regime has no points, return null
  if (!regimePoints || regimePoints === 0) {
    return {
      percentageAchieved: null,
      achievedLevel: null,
    }
  }

  // Calculate raw percentage
  let percentageAchieved = (earnedPoints / regimePoints) * 100

  // Correct for day length variations (DST)
  // If day is longer than 24h, you had more time, so we adjust the expected points up
  // If day is shorter than 24h, you had less time, so we adjust the expected points down
  const dayLengthRatio = dayLengthMs / STANDARD_DAY_MS
  const adjustedRegimePoints = regimePoints * dayLengthRatio
  percentageAchieved = (earnedPoints / adjustedRegimePoints) * 100

  // Sort scale by percent descending (highest first)
  const sortedScale = [...scale].sort((a, b) => b.percent - a.percent)

  // Find the first level where the percentage meets or exceeds the threshold
  let achievedLevel: ScaleLevelDB | null = null
  for (const level of sortedScale) {
    if (percentageAchieved >= level.percent) {
      achievedLevel = level
      break
    }
  }

  // If no level matches, use the lowest level (or null if scale is empty)
  if (!achievedLevel && sortedScale.length > 0) {
    achievedLevel = sortedScale[sortedScale.length - 1]!
  }

  return {
    percentageAchieved: Math.round(percentageAchieved * 100) / 100, // Round to 2 decimals
    achievedLevel,
  }
}

/**
 * Calculate which level was achieved based on points and regime points
 * @deprecated Use calculateDayAchievement instead for better accuracy with DST
 */
export const calculateAchievedLevel = (
  earnedPoints: number,
  regimePoints: number | null | undefined,
  scale: ScaleLevelDB[],
): ScaleLevelDB | null => {
  // If no regime or regime has no points, return null
  if (!regimePoints || regimePoints === 0) {
    return null
  }

  // Calculate percentage
  const percentage = (earnedPoints / regimePoints) * 100

  // Sort scale by percent descending (highest first)
  const sortedScale = [...scale].sort((a, b) => b.percent - a.percent)

  // Find the first level where the percentage meets or exceeds the threshold
  for (const level of sortedScale) {
    if (percentage >= level.percent) {
      return level
    }
  }

  // If no level matches, return the lowest level (or null if scale is empty)
  return sortedScale.length > 0 ? sortedScale[sortedScale.length - 1]! : null
}
