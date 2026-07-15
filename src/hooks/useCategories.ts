import { useEffect, useState } from 'react'
import { fetchCategories } from '../lib/api/categories'
import type { Category } from '../types/product'

interface State {
  status: 'loading' | 'success' | 'error'
  data: Category[]
  error?: string
}

export function useCategories() {
  const [state, setState] = useState<State>({ status: 'loading', data: [] })

  useEffect(() => {
    let cancelled = false

    fetchCategories()
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
