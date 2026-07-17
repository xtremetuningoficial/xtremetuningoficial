import { useEffect, useState } from 'react'
import { fetchProductReviews } from '../lib/api/reviews'
import type { ProductReview } from '../types/review'

export function useProductReviews(productId: string | undefined) {
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    if (!productId) return
    let cancelled = false
    setStatus('loading')

    fetchProductReviews(productId)
      .then((data) => {
        if (!cancelled) {
          setReviews(data)
          setStatus('success')
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [productId])

  return { reviews, status }
}
