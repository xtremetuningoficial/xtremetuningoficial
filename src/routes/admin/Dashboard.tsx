import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteProduct, fetchAdminProducts, setProductActive } from '../../lib/api/adminProducts'
import { formatCOP } from '../../lib/format'
import { useLowStockThreshold } from '../../hooks/useLowStockThreshold'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import type { AdminProduct } from '../../types/admin'

export default function AdminDashboard() {
  useDocumentTitle('Panel de administración')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [search, setSearch] = useState('')
  const [busySlug, setBusySlug] = useState<string | null>(null)
  const [threshold, setThreshold] = useLowStockThreshold()

  async function load() {
    setStatus('loading')
    try {
      const data = await fetchAdminProducts()
      setProducts(data)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleToggleActive(product: AdminProduct) {
    setBusySlug(product.slug)
    try {
      await setProductActive(product.id, !product.isActive)
      setProducts((current) =>
        current.map((p) => (p.id === product.id ? { ...p, isActive: !p.isActive } : p)),
      )
    } finally {
      setBusySlug(null)
    }
  }

  async function handleDelete(product: AdminProduct) {
    if (!window.confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return
    setBusySlug(product.slug)
    try {
      await deleteProduct(product.id)
      setProducts((current) => current.filter((p) => p.id !== product.id))
    } finally {
      setBusySlug(null)
    }
  }

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()))
  const lowStockProducts = products.filter((p) => p.isActive && p.stockQuantity <= threshold)

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl uppercase text-ink-900">Productos</h1>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-ink-900/60">
            Umbral de stock bajo
            <input
              type="number"
              min={0}
              value={threshold}
              onChange={(e) => setThreshold(Math.max(0, Number(e.target.value)))}
              className="w-16 rounded-full border border-ink-900/15 bg-white px-3 py-1.5 text-center text-sm text-ink-900 focus:border-electric-500"
            />
          </label>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="rounded-full border border-ink-900/15 bg-white px-4 py-2 text-sm focus:border-electric-500"
          />
          <Link
            to="/admin/productos/nuevo"
            className="rounded-full bg-electric-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-electric-400"
          >
            + Nuevo producto
          </Link>
        </div>
      </div>

      {status === 'success' && lowStockProducts.length > 0 && (
        <p className="mt-4 rounded-lg bg-hazard-400/15 px-3 py-2 text-sm font-semibold text-ink-900">
          ⚠ {lowStockProducts.length} producto{lowStockProducts.length === 1 ? '' : 's'} con stock bajo
          (≤ {threshold}): {lowStockProducts.map((p) => p.name).join(', ')}
        </p>
      )}

      {status === 'loading' && (
        <div className="mt-8 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-white" />
          ))}
        </div>
      )}

      {status === 'error' && (
        <p className="mt-8 rounded-xl bg-ember-500/10 px-4 py-6 text-center text-ember-500">
          No pudimos cargar los productos. Intenta recargar la página.
        </p>
      )}

      {status === 'success' && (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-900/10 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-900/10 text-xs uppercase tracking-wide text-ink-900/60">
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Instalación</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b border-ink-900/5 last:border-0">
                  <td className="flex items-center gap-3 px-4 py-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-paper-100">
                      {product.imageUrl && (
                        <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <span className="font-semibold text-ink-900">{product.name}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-900/60">{product.categoryName ?? '—'}</td>
                  <td className="px-4 py-3 font-mono-price">{formatCOP(product.price)}</td>
                  <td className="px-4 py-3 font-mono-price text-ember-500">
                    {formatCOP(product.installPrice)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono-price">{product.stockQuantity}</span>
                    {product.isActive && product.stockQuantity <= threshold && (
                      <span className="ml-2 rounded-full bg-hazard-400/20 px-2 py-0.5 text-[10px] font-bold uppercase text-ember-500">
                        Stock bajo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={busySlug === product.slug}
                      onClick={() => handleToggleActive(product)}
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        product.isActive
                          ? 'bg-electric-500/10 text-electric-500'
                          : 'bg-ink-900/10 text-ink-900/60'
                      }`}
                    >
                      {product.isActive ? 'Activo' : 'Agotado'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        to={`/admin/productos/${product.id}`}
                        className="text-xs font-semibold text-electric-500 hover:underline"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        disabled={busySlug === product.slug}
                        onClick={() => handleDelete(product)}
                        className="text-xs font-semibold text-ember-500 hover:underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-ink-900/60">
              No hay productos que coincidan con "{search}".
            </p>
          )}
        </div>
      )}
    </div>
  )
}
