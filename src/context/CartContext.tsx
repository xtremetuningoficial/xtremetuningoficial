import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'xtreme-tuning-cart'

export interface CartLine {
  slug: string
  quantity: number
}

interface CartContextValue {
  lines: CartLine[]
  count: number
  addItem: (slug: string, quantity?: number) => void
  removeItem: (slug: string) => void
  setQuantity: (slug: string, quantity: number) => void
  clear: () => void
  quantityOf: (slug: string) => number
}

const CartContext = createContext<CartContextValue | null>(null)

function readStoredLines(): CartLine[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (line): line is CartLine =>
        typeof line?.slug === 'string' && typeof line?.quantity === 'number' && line.quantity > 0,
    )
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(readStoredLines)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  }, [lines])

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((total, line) => total + line.quantity, 0),
      addItem: (slug, quantity = 1) => {
        setLines((current) => {
          const existing = current.find((line) => line.slug === slug)
          if (existing) {
            return current.map((line) =>
              line.slug === slug ? { ...line, quantity: line.quantity + quantity } : line,
            )
          }
          return [...current, { slug, quantity }]
        })
      },
      removeItem: (slug) => {
        setLines((current) => current.filter((line) => line.slug !== slug))
      },
      setQuantity: (slug, quantity) => {
        setLines((current) => {
          if (quantity <= 0) return current.filter((line) => line.slug !== slug)
          return current.map((line) => (line.slug === slug ? { ...line, quantity } : line))
        })
      },
      clear: () => setLines([]),
      quantityOf: (slug) => lines.find((line) => line.slug === slug)?.quantity ?? 0,
    }),
    [lines],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return context
}
