import { useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteProduct, fetchAdminProducts, setProductActive } from '../../lib/api/adminProducts'
import { getErrorMessage } from '../../lib/errors'
import { DELETE_PRODUCT_WARNING, deleteProductErrorMessage } from '../../lib/adminMessages'
import { formatCOP } from '../../lib/format'
import { applyDiscount, formatDiscountEnd, isDiscountActive } from '../../lib/pricing'
import { useAsync } from '../../hooks/useAsync'
import { useLowStockThreshold } from '../../hooks/useLowStockThreshold'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAdminFeedback } from '../../components/admin/AdminFeedback'
import { EmptyState, ErrorState, SkeletonList } from '../../components/admin/LoadStates'
import { LowStockBell } from '../../components/admin/LowStockBell'
import { StatTile } from '../../components/admin/StatTile'
import { Switch } from '../../components/admin/Switch'
import { buttonPrimary, buttonSecondary, card, iconButton, iconButtonDanger } from '../../components/admin/ui'
import { Tooltip } from '../../components/ui/Tooltip'
import {
  AlertTriangleIcon,
  CoinIcon,
  LayersIcon,
  PackageIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from '../../components/icons'
import type { AdminProduct } from '../../types/admin'

export default function AdminDashboard() {
  useDocumentTitle('Panel de administración')
  const { confirm, notify } = useAdminFeedback()
  const load = useAsync(fetchAdminProducts, [])
  const products = load.data ?? []
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [threshold, setThreshold] = useLowStockThreshold()

  async function handleToggleActive(product: AdminProduct) {
    setBusyId(product.id)
    try {
      await setProductActive(product.id, !product.isActive)
      load.setData((current) =>
        (current ?? []).map((p) => (p.id === product.id ? { ...p, isActive: !p.isActive } : p)),
      )
      notify(product.isActive ? `"${product.name}" ya no se ve en la tienda.` : `"${product.name}" ya se ve en la tienda.`)
    } catch (error) {
      notify(`No pudimos cambiar la visibilidad: ${getErrorMessage(error)}`, 'error')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(product: AdminProduct) {
    const accepted = await confirm({
      title: '¿Eliminar este producto?',
      message: `"${product.name}". ${DELETE_PRODUCT_WARNING}`,
      confirmLabel: 'Sí, eliminar',
    })
    if (!accepted) return
    setBusyId(product.id)
    try {
      await deleteProduct(product.id)
      load.setData((current) => (current ?? []).filter((p) => p.id !== product.id))
      notify(`Eliminamos "${product.name}".`)
    } catch (error) {
      notify(deleteProductErrorMessage(product.name, error), 'error')
    } finally {
      setBusyId(null)
    }
  }

  const query = search.trim().toLowerCase()
  const filtered = products.filter((p) => p.name.toLowerCase().includes(query))
  const lowStockProducts = products.filter((p) => p.isActive && p.stockQuantity <= threshold)
  const activeCount = products.filter((p) => p.isActive).length
  // [PENDIENTE: William] definir qué suma "Valor del catálogo" (hoy: precio sin descuento de los visibles).
  const catalogValue = products.filter((p) => p.isActive).reduce((sum, p) => sum + p.price, 0)

  const rowProps = (product: AdminProduct) => ({
    product,
    threshold,
    busy: busyId === product.id,
    onToggle: () => handleToggleActive(product),
    onDelete: () => handleDelete(product),
  })

  return (
    <div>
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl uppercase text-white sm:text-3xl">Productos</h1>
        <p className="text-sm text-white/60">Gestiona el catálogo, precios, fotos e inventario.</p>
      </div>

      {load.status === 'success' && products.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatTile label="Total productos" value={String(products.length)} icon={PackageIcon} accent="white" />
          <StatTile label="Visibles" value={String(activeCount)} icon={LayersIcon} accent="electric" />
          <StatTile
            label="Stock bajo"
            value={String(lowStockProducts.length)}
            icon={AlertTriangleIcon}
            accent={lowStockProducts.length > 0 ? 'hazard' : 'white'}
          />
          <StatTile label="Valor del catálogo" value={formatCOP(catalogValue)} icon={CoinIcon} accent="ember" />
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <label htmlFor="buscar-producto" className="sr-only">
            Buscar producto por nombre
          </label>
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-white/55">
            <SearchIcon className="h-4 w-4" />
          </span>
          <input
            id="buscar-producto"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre…"
            className="input pl-9"
          />
        </div>

        <div className="flex items-center gap-3">
          {load.status === 'success' && (
            <LowStockBell lowStockProducts={lowStockProducts} threshold={threshold} onThresholdChange={setThreshold} />
          )}
          <Link to="/admin/productos/nuevo" className={`${buttonPrimary} flex-1 sm:flex-none`}>
            <PlusIcon className="h-4 w-4" />
            Nuevo producto
          </Link>
        </div>
      </div>

      {load.status === 'loading' && <SkeletonList rows={5} rowClassName="h-20 md:h-16" />}

      {load.status === 'error' && (
        <ErrorState title="No pudimos cargar los productos." detail={load.error} onRetry={load.reload} />
      )}

      {load.status === 'success' && products.length === 0 && (
        <EmptyState
          title="Todavía no hay productos."
          description="Crea el primero: nombre, precio, foto y listo. Aparece en la tienda apenas lo guardes."
          action={
            <Link to="/admin/productos/nuevo" className={buttonPrimary}>
              <PlusIcon className="h-4 w-4" />
              Crear el primer producto
            </Link>
          }
        />
      )}

      {load.status === 'success' && products.length > 0 && filtered.length === 0 && (
        <EmptyState
          title={`Ningún producto se llama "${search.trim()}".`}
          description="Prueba con otra palabra o una parte del nombre."
          action={
            <button type="button" onClick={() => setSearch('')} className={buttonSecondary}>
              Limpiar búsqueda
            </button>
          }
        />
      )}

      {load.status === 'success' && filtered.length > 0 && (
        <>
          {/* Celular: tarjetas. Desde tableta: tabla. */}
          <ul className="mt-6 space-y-3 md:hidden">
            {filtered.map((product) => (
              <ProductCardRow key={product.id} {...rowProps(product)} />
            ))}
          </ul>

          <div className={`${card} mt-6 hidden overflow-hidden md:block`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/60">
                    <th scope="col" className="px-4 py-3 font-semibold">Producto</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Categoría</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Precio</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Instalación</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Stock</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Visible</th>
                    <th scope="col" className="sticky right-0 border-l border-white/5 bg-ink-800 px-4 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => (
                    <ProductTableRow key={product.id} {...rowProps(product)} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface RowProps {
  product: AdminProduct
  threshold: number
  busy: boolean
  onToggle: () => void
  onDelete: () => void
}

function visibilityLabel(product: AdminProduct) {
  return product.isActive ? `Ocultar ${product.name} de la tienda` : `Mostrar ${product.name} en la tienda`
}

function Thumb({ product, size }: { product: AdminProduct; size: string }) {
  return (
    <div className={`${size} shrink-0 overflow-hidden rounded-lg bg-ink-900 ring-1 ring-white/10`}>
      {product.imageUrl && <img src={product.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />}
    </div>
  )
}

function DiscountBadge({ product }: { product: AdminProduct }) {
  if (!isDiscountActive(product.discountPercent, product.discountEndsAt)) return null
  const label = `Se vende a ${formatCOP(applyDiscount(product.price, product.discountPercent))}${
    product.discountEndsAt ? ` hasta el ${formatDiscountEnd(product.discountEndsAt)}` : ''
  }`
  return (
    <Tooltip label={label}>
      <span tabIndex={0} className="ml-2 rounded-full bg-ember-400/15 px-2 py-0.5 text-[11px] font-bold text-ember-400">
        −{product.discountPercent} %<span className="sr-only">. {label}</span>
      </span>
    </Tooltip>
  )
}

function LowBadge({ product, threshold }: { product: AdminProduct; threshold: number }) {
  if (!product.isActive || product.stockQuantity > threshold) return null
  return (
    <span className="ml-2 rounded-full bg-hazard-400/15 px-2 py-0.5 text-[11px] font-bold uppercase text-hazard-400">
      Bajo
    </span>
  )
}

function ProductCardRow({ product, threshold, busy, onToggle, onDelete }: RowProps) {
  return (
    <li className={`${card} p-3`}>
      <Link to={`/admin/productos/${product.id}`} className="-m-1 flex items-start gap-3 rounded-xl p-1">
        <Thumb product={product} size="h-14 w-14" />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 font-semibold leading-snug text-white">{product.name}</p>
          <p className="mt-0.5 truncate text-xs text-white/60">{product.categoryName ?? 'Sin categoría'}</p>
        </div>
      </Link>

      <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div>
          <dt className="text-white/55">Precio</dt>
          <dd className="mt-0.5 flex flex-wrap items-center font-mono-price text-sm text-white">
            {formatCOP(product.price)}
          </dd>
        </div>
        <div>
          <dt className="text-white/55">Instalación</dt>
          <dd className="mt-0.5 font-mono-price text-sm text-ember-400">{formatCOP(product.installPrice)}</dd>
        </div>
        <div>
          <dt className="text-white/55">Stock</dt>
          <dd className="mt-0.5 flex items-center font-mono-price text-sm text-white">
            {product.stockQuantity}
            <LowBadge product={product} threshold={threshold} />
          </dd>
        </div>
      </dl>
      {isDiscountActive(product.discountPercent, product.discountEndsAt) && (
        <p className="mt-2 text-xs font-semibold text-ember-400">
          −{product.discountPercent} %: se vende a {formatCOP(applyDiscount(product.price, product.discountPercent))}
          {product.discountEndsAt ? ` hasta el ${formatDiscountEnd(product.discountEndsAt)}` : ''}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between gap-2 border-t border-white/10 pt-2">
        <div className="flex items-center gap-1">
          <Switch checked={product.isActive} disabled={busy} onChange={onToggle} label={visibilityLabel(product)} />
          <span className="text-xs font-semibold text-white/70" aria-hidden="true">
            {product.isActive ? 'Visible' : 'Oculto'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Link to={`/admin/productos/${product.id}`} aria-label={`Editar ${product.name}`} className={iconButton}>
            <PencilIcon className="h-4 w-4" />
          </Link>
          <button
            type="button"
            disabled={busy}
            onClick={onDelete}
            aria-label={`Eliminar ${product.name}`}
            className={iconButtonDanger}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </li>
  )
}

function ProductTableRow({ product, threshold, busy, onToggle, onDelete }: RowProps) {
  return (
    <tr className="group border-b border-white/5 transition last:border-0 hover:bg-white/[0.03]">
      <td className="px-4 py-2">
        <div className="flex items-center gap-3">
          <Thumb product={product} size="h-10 w-10" />
          <Link
            to={`/admin/productos/${product.id}`}
            className="inline-flex min-h-11 items-center font-semibold text-white underline-offset-4 hover:text-electric-400 hover:underline"
          >
            {product.name}
          </Link>
        </div>
      </td>
      <td className="px-4 py-2">
        <span className="inline-block whitespace-nowrap rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/75">
          {product.categoryName ?? '—'}
        </span>
      </td>
      <td className="whitespace-nowrap px-4 py-2 font-mono-price text-white">
        {formatCOP(product.price)}
        <DiscountBadge product={product} />
      </td>
      <td className="whitespace-nowrap px-4 py-2 font-mono-price text-ember-400">{formatCOP(product.installPrice)}</td>
      <td className="whitespace-nowrap px-4 py-2">
        <span className="font-mono-price text-white">{product.stockQuantity}</span>
        <LowBadge product={product} threshold={threshold} />
      </td>
      <td className="px-4 py-2">
        <Switch checked={product.isActive} disabled={busy} onChange={onToggle} label={visibilityLabel(product)} />
      </td>
      <td className="sticky right-0 border-l border-white/5 bg-ink-800 px-2 py-1 group-hover:bg-[#171e2b]">
        <div className="flex items-center justify-end">
          <Tooltip label="Editar producto">
            <Link to={`/admin/productos/${product.id}`} aria-label={`Editar ${product.name}`} className={iconButton}>
              <PencilIcon className="h-4 w-4" />
            </Link>
          </Tooltip>
          <Tooltip label="Eliminar producto" align="end">
            <button
              type="button"
              disabled={busy}
              onClick={onDelete}
              aria-label={`Eliminar ${product.name}`}
              className={iconButtonDanger}
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </Tooltip>
        </div>
      </td>
    </tr>
  )
}
