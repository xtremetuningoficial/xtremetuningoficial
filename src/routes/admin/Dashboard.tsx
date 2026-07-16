import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteProduct, fetchAdminProducts, setProductActive } from '../../lib/api/adminProducts'
import { formatCOP } from '../../lib/format'
import { useLowStockThreshold } from '../../hooks/useLowStockThreshold'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { LowStockBell } from '../../components/admin/LowStockBell'
import { StatTile } from '../../components/admin/StatTile'
import { Switch } from '../../components/admin/Switch'
import { Tooltip } from '../../components/ui/Tooltip'
import { SearchIcon, PackageIcon, LayersIcon, AlertTriangleIcon, CoinIcon, PencilIcon, TrashIcon } from '../../components/icons'
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
  const activeCount = products.filter((p) => p.isActive).length
  const catalogValue = products.filter((p) => p.isActive).reduce((sum, p) => sum + p.price, 0)

  return (
    <div>
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl uppercase text-white sm:text-3xl">Productos</h1>
        <p className="text-sm text-white/50">Gestiona el catálogo, precios, fotos e inventario.</p>
      </div>

      {status === 'success' && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatTile label="Total productos" value={String(products.length)} icon={PackageIcon} accent="white" />
          <StatTile label="Activos" value={String(activeCount)} icon={LayersIcon} accent="electric" />
          <StatTile
            label="Stock bajo"
            value={String(lowStockProducts.length)}
            icon={AlertTriangleIcon}
            accent={lowStockProducts.length > 0 ? 'hazard' : 'white'}
          />
          <StatTile label="Valor del catálogo" value={formatCOP(catalogValue)} icon={CoinIcon} accent="ember" />
        </div>
      )}

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-white/40">
            <SearchIcon className="h-4 w-4" />
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="input pl-9"
          />
        </div>

        <div className="flex items-center gap-3">
          {status === 'success' && (
            <LowStockBell
              lowStockProducts={lowStockProducts}
              threshold={threshold}
              onThresholdChange={setThreshold}
            />
          )}
          <Tooltip label="Crear un producto nuevo">
            <Link
              to="/admin/productos/nuevo"
              className="rounded-full bg-electric-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-electric-400"
            >
              + Nuevo producto
            </Link>
          </Tooltip>
        </div>
      </div>

      {status === 'loading' && (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-ink-800" />
          ))}
        </div>
      )}

      {status === 'error' && (
        <p className="mt-6 rounded-xl bg-ember-500/10 px-4 py-6 text-center text-ember-400">
          No pudimos cargar los productos. Intenta recargar la página.
        </p>
      )}

      {status === 'success' && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-ink-800">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/50">
                  <th className="px-4 py-3 font-semibold">Producto</th>
                  <th className="px-4 py-3 font-semibold">Categoría</th>
                  <th className="px-4 py-3 font-semibold">Precio</th>
                  <th className="px-4 py-3 font-semibold">Instalación</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Activo</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-b border-white/5 transition last:border-0 hover:bg-white/[0.03]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-ink-900 ring-1 ring-white/10">
                          {product.imageUrl && (
                            <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                          )}
                        </div>
                        <span className="font-semibold text-white">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/70">
                        {product.categoryName ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono-price text-white">{formatCOP(product.price)}</td>
                    <td className="px-4 py-3 font-mono-price text-ember-400">
                      {formatCOP(product.installPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono-price text-white">{product.stockQuantity}</span>
                      {product.isActive && product.stockQuantity <= threshold && (
                        <span className="ml-2 rounded-full bg-hazard-400/15 px-2 py-0.5 text-[10px] font-bold uppercase text-hazard-400">
                          Bajo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Tooltip
                        label={product.isActive ? 'Clic para marcar como agotado' : 'Clic para marcar como activo'}
                      >
                        <Switch
                          checked={product.isActive}
                          disabled={busySlug === product.slug}
                          onChange={() => handleToggleActive(product)}
                          label={product.isActive ? 'Marcar como agotado' : 'Marcar como activo'}
                        />
                      </Tooltip>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip label="Editar producto">
                          <Link
                            to={`/admin/productos/${product.id}`}
                            aria-label={`Editar ${product.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/5 hover:text-electric-400"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                        </Tooltip>
                        <Tooltip label="Eliminar producto">
                          <button
                            type="button"
                            disabled={busySlug === product.slug}
                            onClick={() => handleDelete(product)}
                            aria-label={`Eliminar ${product.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:bg-ember-500/10 hover:text-ember-400 disabled:opacity-50"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-white/50">
              No hay productos que coincidan con "{search}".
            </p>
          )}
        </div>
      )}
    </div>
  )
}
