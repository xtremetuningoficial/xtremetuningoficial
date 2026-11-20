import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  deleteProduct,
  fetchAdminProductById,
  ProductMediaSaveError,
  productToFormValues,
  saveProduct,
  type MediaDraft,
  type SavedProduct,
} from '../../lib/api/adminProducts'
import { fetchAdminCategories } from '../../lib/api/categories'
import { getErrorMessage } from '../../lib/errors'
import { DELETE_PRODUCT_WARNING, deleteProductErrorMessage } from '../../lib/adminMessages'
import { formatCOP } from '../../lib/format'
import { MAX_DISCOUNT_PERCENT } from '../../lib/pricing'
import { vehicleLabels } from '../../data/vehicleLabels'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAdminFeedback } from '../../components/admin/AdminFeedback'
import { DiscountFields } from '../../components/admin/DiscountFields'
import { FormField } from '../../components/admin/FormField'
import { EmptyState, ErrorState } from '../../components/admin/LoadStates'
import { MediaSlotsEditor, type MediaSlot } from '../../components/admin/MediaSlotsEditor'
import { StockAdjuster } from '../../components/admin/StockAdjuster'
import { Switch } from '../../components/admin/Switch'
import { buttonDangerGhost, buttonPrimary, buttonSecondary, card } from '../../components/admin/ui'
import { ChevronLeftIcon, TrashIcon } from '../../components/icons'
import type { AdminProduct, ProductFormValues } from '../../types/admin'
import type { VehicleType } from '../../types/product'

const EMPTY_FORM: ProductFormValues = {
  name: '',
  categoryId: '',
  vehicleType: 'carro',
  price: 0,
  installPrice: 0,
  discountPercent: 0,
  discountEndsOn: '',
  stockQuantity: 0,
  isFeatured: false,
  isActive: true,
  description: '',
}

type FieldName = 'name' | 'categoryId' | 'price' | 'installPrice' | 'stockQuantity' | 'discountPercent'
type FieldErrors = Partial<Record<FieldName, string>>

function validate(form: ProductFormValues, isEditing: boolean): FieldErrors {
  const errors: FieldErrors = {}
  if (!form.name.trim()) errors.name = 'Escribe el nombre del producto.'
  if (!form.categoryId) errors.categoryId = 'Elige una categoría.'
  if (!Number.isFinite(form.price) || form.price <= 0) errors.price = 'El precio debe ser mayor que $0.'
  if (!Number.isFinite(form.installPrice) || form.installPrice < 0) {
    errors.installPrice = 'La instalación no puede ser negativa. Usa 0 si no aplica.'
  }
  if (!isEditing && (!Number.isInteger(form.stockQuantity) || form.stockQuantity < 0)) {
    errors.stockQuantity = 'El stock debe ser un número entero, 0 o más.'
  }
  if (form.discountPercent < 0 || form.discountPercent > MAX_DISCOUNT_PERCENT) {
    errors.discountPercent = `El descuento debe estar entre 0 % y ${MAX_DISCOUNT_PERCENT} %.`
  }
  return errors
}

function submitLabel({ submitting, isEditing }: { submitting: boolean; isEditing: boolean }): string {
  if (submitting) return 'Guardando…'
  return isEditing ? 'Guardar cambios' : 'Crear producto'
}

function slotsFromProduct(product: AdminProduct): MediaSlot[] {
  return product.media.map((item, index) => ({
    key: `existing-${index}-${item.url}`,
    status: 'existing',
    url: item.url,
    mediaType: item.mediaType,
  }))
}

function slotToDraft(slot: MediaSlot): MediaDraft {
  return slot.status === 'new' && slot.file
    ? { kind: 'new', file: slot.file }
    : { kind: 'existing', media: { url: slot.url, mediaType: slot.mediaType } }
}

async function loadFormData(productId: string | undefined) {
  const [categories, product] = await Promise.all([
    fetchAdminCategories(),
    productId ? fetchAdminProductById(productId) : Promise.resolve(null),
  ])
  return { categories, product }
}

export default function AdminProductForm() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const location = useLocation()
  const { confirm, notify } = useAdminFeedback()
  useDocumentTitle(isEditing ? 'Editar producto' : 'Nuevo producto')

  // Si la creación quedó a medias, la URL pasa a /productos/:id sin volver a cargar
  // el formulario: así no se pierden las fotos elegidas que faltó subir.
  const keepFormForId = useRef<string | null>(null)
  const [loadId, setLoadId] = useState(id)
  if (id !== loadId && keepFormForId.current !== id) setLoadId(id)

  const load = useAsync(() => loadFormData(loadId), [loadId])
  const [form, setForm] = useState<ProductFormValues>(EMPTY_FORM)
  const [saved, setSaved] = useState<SavedProduct | null>(null)
  const [slots, setSlots] = useState<MediaSlot[]>([])
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(
    () => (location.state as { saveError?: string } | null)?.saveError ?? null,
  )
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)
  const featuredLabelId = useId()
  const activeLabelId = useId()

  useEffect(() => {
    if (!load.data) return
    const { categories, product } = load.data
    if (product) {
      setForm(productToFormValues(product))
      setSaved({ id: product.id, slug: product.slug })
      setSlots(slotsFromProduct(product))
    } else {
      setForm({ ...EMPTY_FORM, categoryId: categories[0]?.id ?? '' })
      setSaved(null)
      setSlots([])
    }
    setFieldErrors({})
  }, [load.data])

  function patchForm(patch: Partial<ProductFormValues>) {
    setForm((current) => ({ ...current, ...patch }))
    // Al corregir un campo, su error desaparece.
    const touched = Object.keys(patch) as FieldName[]
    setFieldErrors((current) => {
      if (!touched.some((key) => key in current)) return current
      const next = { ...current }
      for (const key of touched) delete next[key]
      return next
    })
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submittingRef.current) return

    const errors = validate(form, Boolean(saved))
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      setSubmitError('Revisa los campos marcados en naranja.')
      requestAnimationFrame(() => {
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      })
      return
    }

    submittingRef.current = true
    setSubmitting(true)
    setSubmitError(null)
    try {
      await saveProduct({ existing: saved, values: form, media: slots.map(slotToDraft) })
      notify(saved ? `Guardamos los cambios de "${form.name.trim()}".` : `Creamos "${form.name.trim()}".`)
      navigate('/admin')
    } catch (error) {
      if (error instanceof ProductMediaSaveError) {
        const message = `El producto quedó guardado, pero no pudimos subir las fotos (${error.message}). Revisa la conexión y toca "Guardar cambios" para reintentar: no se va a duplicar.`
        setSaved(error.product)
        setSlots((current) =>
          current.map((slot, index) => {
            const uploaded = error.resolved[index]
            if (slot.status !== 'new' || !uploaded) return slot
            URL.revokeObjectURL(slot.url)
            return { ...slot, status: 'existing', url: uploaded.url, file: undefined }
          }),
        )
        setSubmitError(message)
        if (!id) {
          keepFormForId.current = error.product.id
          navigate(`/admin/productos/${error.product.id}`, { replace: true, state: { saveError: message } })
        }
      } else {
        setSubmitError(`No pudimos guardar el producto: ${getErrorMessage(error)}`)
      }
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!saved || submittingRef.current) return
    const accepted = await confirm({
      title: '¿Eliminar este producto?',
      message: `"${form.name}". ${DELETE_PRODUCT_WARNING}`,
      confirmLabel: 'Sí, eliminar',
    })
    if (!accepted) return
    submittingRef.current = true
    setSubmitting(true)
    try {
      await deleteProduct(saved.id)
      notify(`Eliminamos "${form.name}".`)
      navigate('/admin')
    } catch (error) {
      setSubmitError(deleteProductErrorMessage(form.name, error))
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  const title = isEditing ? 'Editar producto' : 'Nuevo producto'
  const header = (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-2xl uppercase text-white sm:text-3xl">{title}</h1>
        {saved && <p className="mt-1 truncate font-mono-price text-xs text-white/60">{saved.slug}</p>}
      </div>
      <Link
        to="/admin"
        className="-ml-2 inline-flex min-h-11 items-center gap-1 self-start rounded-lg px-2 text-sm font-semibold text-white/70 transition hover:text-cyan-400"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Volver a productos
      </Link>
    </div>
  )

  if (load.status === 'loading' && !keepFormForId.current) {
    return (
      <div aria-busy="true">
        {header}
        <span className="sr-only">Cargando el formulario…</span>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]" aria-hidden="true">
          <div className="h-[36rem] animate-pulse rounded-2xl bg-ink-800" />
          <div className="space-y-6">
            <div className="h-64 animate-pulse rounded-2xl bg-ink-800" />
            <div className="h-72 animate-pulse rounded-2xl bg-ink-800" />
          </div>
        </div>
      </div>
    )
  }

  if (load.status === 'error') {
    return (
      <div>
        {header}
        <ErrorState
          title={isEditing ? 'No pudimos cargar este producto.' : 'No pudimos cargar las categorías.'}
          detail={load.error}
          onRetry={load.reload}
        />
      </div>
    )
  }

  if (loadId && load.data && !load.data.product) {
    return (
      <div>
        {header}
        <EmptyState
          title="No encontramos este producto."
          description="Puede que lo hayan eliminado. Vuelve a la lista para ver los que hay."
          action={
            <Link to="/admin" className={buttonPrimary}>
              Ver productos
            </Link>
          }
        />
      </div>
    )
  }

  const categories = load.data?.categories ?? []

  if (categories.length === 0) {
    return (
      <div>
        {header}
        <EmptyState
          title="Primero crea una categoría."
          description="Cada producto va dentro de una categoría (por ejemplo, Alarmas para carro)."
          action={
            <Link to="/admin/categorias" className={buttonPrimary}>
              Ir a categorías
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div>
      {header}

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="mt-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className={`${card} min-w-0 space-y-6 p-5 sm:p-6`}>
            <Section title="Información general">
              <FormField label="Nombre" error={fieldErrors.name}>
                <input
                  type="text"
                  autoComplete="off"
                  disabled={submitting}
                  value={form.name}
                  onChange={(e) => patchForm({ name: e.target.value })}
                  className="input"
                />
              </FormField>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Categoría" error={fieldErrors.categoryId}>
                  <select
                    disabled={submitting}
                    value={form.categoryId}
                    onChange={(e) => patchForm({ categoryId: e.target.value })}
                    className="input"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Tipo de vehículo">
                  <select
                    disabled={submitting}
                    value={form.vehicleType}
                    onChange={(e) => patchForm({ vehicleType: e.target.value as VehicleType })}
                    className="input"
                  >
                    {(Object.keys(vehicleLabels) as VehicleType[]).map((type) => (
                      <option key={type} value={type}>
                        {vehicleLabels[type].label}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              <FormField label="Descripción" hint="Una característica por línea; en la tienda sale como lista.">
                <textarea
                  rows={5}
                  disabled={submitting}
                  value={form.description}
                  onChange={(e) => patchForm({ description: e.target.value })}
                  className="input"
                  placeholder={'Protección con código variable Anti-Scan\nBloqueo de motor y función Anti-Hijack'}
                />
              </FormField>
            </Section>

            <Section title="Precio e inventario">
              <div className="grid gap-5 sm:grid-cols-3">
                <FormField
                  label="Precio (COP)"
                  error={fieldErrors.price}
                  hint={form.price > 0 ? `Se verá como ${formatCOP(form.price)}` : undefined}
                >
                  <input
                    type="number"
                    min={0}
                    step={100}
                    inputMode="numeric"
                    disabled={submitting}
                    value={form.price}
                    onChange={(e) => patchForm({ price: Number(e.target.value) })}
                    className="input font-mono-price"
                  />
                </FormField>
                <FormField
                  label="Instalación (COP)"
                  error={fieldErrors.installPrice}
                  hint={form.installPrice > 0 ? formatCOP(form.installPrice) : 'Usa 0 si no aplica.'}
                >
                  <input
                    type="number"
                    min={0}
                    step={100}
                    inputMode="numeric"
                    disabled={submitting}
                    value={form.installPrice}
                    onChange={(e) => patchForm({ installPrice: Number(e.target.value) })}
                    className="input font-mono-price"
                  />
                </FormField>
                <FormField
                  label={saved ? 'Stock actual' : 'Stock inicial'}
                  error={fieldErrors.stockQuantity}
                  hint={saved ? 'Se cambia con entradas y salidas en Inventario.' : undefined}
                >
                  <input
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    disabled={Boolean(saved) || submitting}
                    value={form.stockQuantity}
                    onChange={(e) => patchForm({ stockQuantity: Number(e.target.value) })}
                    className="input font-mono-price"
                  />
                </FormField>
              </div>
            </Section>

            <Section title="Descuento">
              <DiscountFields
                price={form.price}
                percent={form.discountPercent}
                endsOn={form.discountEndsOn}
                disabled={submitting}
                onChange={patchForm}
              />
              {fieldErrors.discountPercent && (
                <p className="text-xs font-semibold text-ember-400">{fieldErrors.discountPercent}</p>
              )}
            </Section>

            <Section title="Visibilidad">
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-8">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.isActive}
                    disabled={submitting}
                    onChange={(checked) => patchForm({ isActive: checked })}
                    labelledBy={activeLabelId}
                  />
                  <span id={activeLabelId} className="text-sm text-white/85">
                    Visible en la tienda
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.isFeatured}
                    disabled={submitting}
                    onChange={(checked) => patchForm({ isFeatured: checked })}
                    labelledBy={featuredLabelId}
                  />
                  <span id={featuredLabelId} className="text-sm text-white/85">
                    Destacado (“Más pedido”)
                  </span>
                </div>
              </div>
            </Section>
          </div>

          <div className="min-w-0 space-y-6">
            <MediaSlotsEditor slots={slots} onChange={setSlots} disabled={submitting} />

            {saved && (
              <StockAdjuster
                productId={saved.id}
                stock={form.stockQuantity}
                onStockChange={(newStock) => setForm((current) => ({ ...current, stockQuantity: newStock }))}
              />
            )}
          </div>
        </div>

        {/* Barra de acciones pegada abajo: en el celular el botón de guardar queda siempre a mano. */}
        <div className="sticky bottom-0 z-40 -mx-4 mt-6 border-t border-white/10 bg-ink-900/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          {submitError && (
            <p role="alert" className="mb-3 rounded-lg bg-ember-500/10 px-3 py-2 text-sm text-ember-400">
              {submitError}
            </p>
          )}
          <div className="flex items-center gap-2">
            {saved && (
              <button type="button" onClick={handleDelete} disabled={submitting} className={buttonDangerGhost}>
                <TrashIcon className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only">Eliminar producto</span>
              </button>
            )}
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden sm:block">
                <Link to="/admin" className={buttonSecondary}>
                  Cancelar
                </Link>
              </span>
              <button type="submit" disabled={submitting} aria-busy={submitting} className={`${buttonPrimary} min-w-40`}>
                {submitLabel({ submitting, isEditing: Boolean(saved) })}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-5 border-t border-white/10 pt-5 first:border-0 first:pt-0">
      <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">{title}</h2>
      {children}
    </section>
  )
}
