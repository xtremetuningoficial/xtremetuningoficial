import { useEffect, useState } from 'react'
import { fetchProductRatingSummaries } from '../lib/api/reviews'
import type { RatingSummary } from '../types/review'

export function useProductRatings() {
  const [ratings, setRatings] = useState<Record<string, RatingSummary>>({})

  useEffect(() => {
    let cancelled = false
    fetchProductRatingSummaries()
      .then((data) => {
        if (!cancelled) setRatings(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return ratings
}
