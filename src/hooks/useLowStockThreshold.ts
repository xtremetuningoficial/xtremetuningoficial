import { useEffect, useState } from 'react'

const STORAGE_KEY = 'xtreme-tuning-low-stock-threshold'
const DEFAULT_THRESHOLD = 3

export function useLowStockThreshold() {
  const [threshold, setThreshold] = useState<number>(() => {
    if (typeof window === 'undefined') return DEFAULT_THRESHOLD
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored ? Number(stored) : DEFAULT_THRESHOLD
  })

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(threshold))
  }, [threshold])

  return [threshold, setThreshold] as const
}
