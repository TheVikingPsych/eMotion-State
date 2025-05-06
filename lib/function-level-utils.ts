/**
 * Returns a descriptive label for a given function level
 */
export function getFunctionLevelDescriptor(level: number): string {
  if (level === -10) return "Suicidal"
  if (level <= -8) return "Severe crisis"
  if (level <= -6) return "In despair"
  if (level <= -4) return "Struggling significantly"
  if (level <= -2) return "Feeling down"
  if (level === 0) return "Neutral"
  if (level <= 2) return "Okay"
  if (level <= 4) return "Good"
  if (level <= 6) return "Very good"
  if (level <= 8) return "Excellent"
  return "Thriving"
}

/**
 * Returns a color class for a given function level
 */
export function getFunctionLevelColorClass(level: number): string {
  if (level <= -8) return "text-red-600 dark:text-red-500"
  if (level <= -4) return "text-amber-600 dark:text-amber-500"
  if (level <= -1) return "text-amber-500 dark:text-amber-400"
  if (level === 0) return "text-gray-600 dark:text-gray-400"
  if (level <= 4) return "text-green-500"
  if (level <= 7) return "text-green-600"
  return "text-green-700 dark:text-green-500"
}

/**
 * Returns a background color class for a given function level
 */
export function getFunctionLevelBgClass(level: number): string {
  if (level <= -8) return "bg-red-600"
  if (level <= -4) return "bg-amber-600"
  if (level <= -1) return "bg-amber-500"
  if (level === 0) return "bg-gray-500"
  if (level <= 4) return "bg-green-500"
  if (level <= 7) return "bg-green-600"
  return "bg-green-700"
}
