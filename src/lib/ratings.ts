import type { RatingSummary } from '../types/review'

/** Promedio y cantidad de calificaciones (0 si no hay ninguna). */
export function summarizeRatings(ratings: number[]): RatingSummary {
  if (ratings.length === 0) return { average: 0, count: 0 }
  const total = ratings.reduce((sum, value) => sum + value, 0)
  return { average: total / ratings.length, count: ratings.length }
}
