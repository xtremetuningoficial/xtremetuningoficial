import { useEffect, useState } from 'react'
import { fetchProducts } from '../lib/api/products'
import type { Product } from '../types/product'

interface State {
  status: 'loading' | 'success' | 'error'
  data: Product[]
  error?: string
}

export function useProducts() {
  const [state, setState] = useState<State>({ status: 'loading', data: [] })

  useEffect(() => {
    let cancelled = false

    fetchProducts()
      .then((data) => {
        if (!cancelled) setState({ status: 'success', data })
      })
      .catch((error: Error) => {
        if (!cancelled) setState({ status: 'error', data: [], error: error.message })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
