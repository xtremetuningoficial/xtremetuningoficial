import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useProducts } from '../hooks/useProducts'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { CartItem } from '../components/cart/CartItem'
import { CartSummary } from '../components/cart/CartSummary'

export default function Cart() {
  const { lines, clear } = useCart()
  const { status, data: products } = useProducts()
  useDocumentTitle('Tu carrito')

  if (lines.length === 0) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <p className="text-4xl">🛒</p>
        <p className="mt-4 font-display text-xl uppercase text-ink-900">Tu carrito está vacío</p>
        <p className="mt-2 text-sm text-ink-900/60">
          Agrega productos del catálogo para armar tu pedido.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-electric-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-electric-400"
        >
          Ver catálogo
        </Link>
      </section>
    )
  }

  if (status === 'loading') {
    return (
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="h-8 w-48 animate-pulse rounded bg-paper-100" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: lines.length }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-paper-100" />
          ))}
        </div>
      </section>
    )
  }

  const items = lines
    .map((line) => {
      const product = products.find((p) => p.slug === line.slug)
      return product ? { product, quantity: line.quantity } : null
    })
    .filter((item): item is { product: (typeof products)[number]; quantity: number } => item !== null)

  const missingCount = lines.length - items.length

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <p className="font-display text-xl uppercase text-ink-900">
          Estos productos ya no están disponibles
        </p>
        <p className="mt-2 text-sm text-ink-900/60">Vacía el carrito y sigue explorando el catálogo.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={clear}
            className="rounded-full border border-ink-900/15 px-6 py-2.5 text-sm font-bold text-ink-900/70 transition hover:border-ember-500 hover:text-ember-500"
          >
            Vaciar carrito
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-electric-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-electric-400"
          >
            Ver catálogo
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-2xl uppercase text-ink-900 sm:text-3xl">Tu carrito</h1>

      {missingCount > 0 && (
        <p className="mt-3 rounded-lg bg-ember-500/10 px-3 py-2 text-sm text-ember-500">
          {missingCount} producto{missingCount === 1 ? '' : 's'} de tu carrito ya no está
          {missingCount === 1 ? '' : 'n'} disponible{missingCount === 1 ? '' : 's'} y se quitó
          {missingCount === 1 ? '' : 'ron'} automáticamente.
        </p>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-ink-900/10 bg-white px-5 sm:px-6">
          {items.map((item) => (
            <CartItem key={item.product.slug} product={item.product} quantity={item.quantity} />
          ))}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <CartSummary items={items} onClear={clear} />
          <Link
            to="/"
            className="mt-4 block text-center text-sm font-semibold text-ink-900/60 transition hover:text-electric-500"
          >
            ← Seguir comprando
          </Link>
        </div>
      </div>
    </section>
  )
}
