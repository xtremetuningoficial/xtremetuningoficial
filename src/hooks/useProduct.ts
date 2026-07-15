import { useEffect, useState } from 'react'
import { fetchProductBySlug } from '../lib/api/products'
import type { Product } from '../types/product'

interface State {
  status: 'loading' | 'success' | 'not-found' | 'error'
  data: Product | null
  error?: string
}

export function useProduct(slug: string | undefined) {
  const [state, setState] = useState<State>({ status: 'loading', data: null })

  useEffect(() => {
    if (!slug) {
      setState({ status: 'not-found', data: null })
      return
    }

    let cancelled = false
    setState({ status: 'loading', data: null })

    fetchProductBySlug(slug)
      .then((data) => {
        if (cancelled) return
        setState(data ? { status: 'success', data } : { status: 'not-found', data: null })
      })
      .catch((error: Error) => {
        if (!cancelled) setState({ status: 'error', data: null, error: error.message })
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  return state
}
