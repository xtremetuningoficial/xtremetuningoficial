import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  createProduct,
  deleteProduct,
  detectMediaType,
  fetchAdminProductById,
  MAX_MEDIA_PER_PRODUCT,
  replaceProductMedia,
  updateProduct,
  uploadProductMedia,
  validateMediaFile,
} from '../../lib/api/adminProducts'
import { fetchAdminCategories } from '../../lib/api/categories'
import { getErrorMessage } from '../../lib/errors'
import { StockAdjuster } from '../../components/admin/StockAdjuster'
import { Switch } from '../../components/admin/Switch'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  PlayIcon,
  TrashIcon,
  UploadIcon,
} from '../../components/icons'
import type { AdminCategory, AdminProductMedia, ProductFormValues } from '../../types/admin'
import type { MediaType, VehicleType } from '../../types/product'

interface MediaSlot {
  key: string
  status: 'existing' | 'new'
  url: string
  mediaType: MediaType
  file?: File
}

const EMPTY_FORM: ProductFormValues = {
  name: '',
  categoryId: '',
  vehicleType: 'carro',
  price: 0,
  installPrice: 0,
  stockQuantity: 0,
  isFeatured: false,
  isActive: true,
  description: '',
}

export default function AdminProductForm() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  useDocumentTitle(isEditing ? 'Editar producto' : 'Nuevo producto')

  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [form, setForm] = useState<ProductFormValues>(EMPTY_FORM)
  const [existingSlug, setExistingSlug] = useState<string | null>(null)
  const [slots, setSlots] = useState<MediaSlot[]>([])
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const slotInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]
  const [loading, setLoading] = useState(isEditing)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAdminCategories()
      .then((data) => {
        setCategories(data)
        setForm((current) => (current.categoryId ? current : { ...current, categoryId: data[0]?.id ?? '' }))
      })
      .catch(() => setLoadError('No pudimos cargar las categorías.'))
      .finally(() => setCategoriesLoading(false))
  }, [])

  useEffect(() => {
    if (!id) return
    fetchAdminProductById(id)
      .then((product) => {
        if (!product) {
          setLoadError('Producto no encontrado.')
          return
        }
        setForm({
          name: product.name,
          categoryId: product.categoryId ?? '',
          vehicleType: product.vehicleType,
          price: product.price,
          installPrice: product.installPrice,
          stockQuantity: product.stockQuantity,
          isFeatured: product.isFeatured,
          isActive: product.isActive,
          description: product.description,
        })
        setExistingSlug(product.slug)
        setSlots(
          product.media.map((item, index) => ({
            key: `existing-${index}-${item.url}`,
            status: 'existing',
            url: item.url,
            mediaType: item.mediaType,
          })),
        )
      })
      .catch(() => setLoadError('No pudimos cargar este producto.'))
      .finally(() => setLoading(false))
  }, [id])

  function handleNameChange(name: string) {
    setForm((current) => ({ ...current, name }))
  }

  function setSlotFile(index: number, file: File | null) {
    if (!file) return
    const validationError = validateMediaFile(file)
    if (validationError) {
      setMediaError(validationError)
      return
    }
    setMediaError(null)
    setSlots((current) => {
      const next = [...current]
      next[index] = {
        key: `new-${Date.now()}-${index}`,
        status: 'new',
        url: URL.createObjectURL(file),
        mediaType: detectMediaType(file) ?? 'image',
        file,
      }
      return next
    })
  }

  function removeSlot(index: number) {
    setSlots((current) => current.filter((_, i) => i !== index))
  }

  function moveSlot(index: number, direction: -1 | 1) {
    setSlots((current) => {
      const target = index + direction
      if (target < 0 || target >= current.length) return current
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitError(null)

    if (!form.name.trim() || !form.categoryId) {
      setSubmitError('Nombre y categoría son obligatorios.')
      return
    }

    setSubmitting(true)
    try {
      let productId = id
      let productSlug = existingSlug ?? ''

      if (isEditing && id) {
        await updateProduct(id, form)
      } else {
        const created = await createProduct(form)
        productId = created.id
        productSlug = created.slug
      }

      if (productId) {
        const resolvedMedia: AdminProductMedia[] = []
        for (const slot of slots) {
          if (slot.status === 'existing') {
            resolvedMedia.push({ url: slot.url, mediaType: slot.mediaType })
          } else if (slot.file) {
            resolvedMedia.push(await uploadProductMedia(productSlug, slot.file))
          }
        }
        await replaceProductMedia(productId, resolvedMedia)
      }

      navigate('/admin')
    } catch (error) {
      const message = getErrorMessage(error)
      setSubmitError(
        message.includes('duplicate key')
          ? 'Ya existe un producto con ese slug. Cámbialo e intenta de nuevo.'
          : `No pudimos guardar el producto: ${message}`,
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!id) return
    if (!window.confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return
    setSubmitting(true)
    try {
      await deleteProduct(id)
      navigate('/admin')
    } catch (error) {
      setSubmitError(getErrorMessage(error))
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-ink-800" />
        <div className="h-96 animate-pulse rounded-2xl bg-ink-800" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="rounded-2xl bg-ember-500/10 px-4 py-8 text-center text-ember-400">
        {loadError}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl uppercase text-white sm:text-3xl">
            {isEditing ? 'Editar producto' : 'Nuevo producto'}
          </h1>
          {isEditing && existingSlug && (
            <p className="mt-1 font-mono-price text-xs text-white/50">{existingSlug}</p>
          )}
        </div>
        <Link to="/admin" className="text-sm font-semibold text-white/60 transition hover:text-cyan-400">
          ← Volver
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6 rounded-2xl border border-white/10 bg-ink-800 p-5 sm:p-6">
          <Section title="Información general">
            <Field label="Nombre">
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="input"
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Categoría">
                <select
                  required
                  value={form.categoryId}
                  onChange={(e) => setForm((current) => ({ ...current, categoryId: e.target.value }))}
                  className="input"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Tipo de vehículo">
                <select
                  value={form.vehicleType}
                  onChange={(e) =>
                    setForm((current) => ({ ...current, vehicleType: e.target.value as VehicleType }))
                  }
                  className="input"
                >
                  <option value="carro">Carro</option>
                  <option value="moto">Moto</option>
                  <option value="universal">Universal</option>
                </select>
              </Field>
            </div>

            <Field label="Descripción (una característica por línea)">
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
                className="input"
                placeholder={'Protección con código variable Anti-Scan\nBloqueo de motor y función Anti-Hijack'}
              />
            </Field>
          </Section>

          <Section title="Precio e inventario">
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Precio (COP)">
                <input
                  type="number"
                  min={0}
                  required
                  value={form.price}
                  onChange={(e) => setForm((current) => ({ ...current, price: Number(e.target.value) }))}
                  className="input"
                />
              </Field>
              <Field label="Instalación (COP)">
                <input
                  type="number"
                  min={0}
                  value={form.installPrice}
                  onChange={(e) =>
                    setForm((current) => ({ ...current, installPrice: Number(e.target.value) }))
                  }
                  className="input"
                />
              </Field>
              <Field label={isEditing ? 'Stock (ajústalo →)' : 'Stock inicial'}>
                <input
                  type="number"
                  min={0}
                  disabled={isEditing}
                  value={form.stockQuantity}
                  onChange={(e) =>
                    setForm((current) => ({ ...current, stockQuantity: Number(e.target.value) }))
                  }
                  className="input"
                />
              </Field>
            </div>
          </Section>

          <Section title="Visibilidad">
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
              <label className="flex items-center gap-3 text-sm text-white/80">
                <Switch
                  checked={form.isFeatured}
                  onChange={(checked) => setForm((current) => ({ ...current, isFeatured: checked }))}
                  label="Destacado"
                />
                Destacado ("Más pedido")
              </label>
              <label className="flex items-center gap-3 text-sm text-white/80">
                <Switch
                  checked={form.isActive}
                  onChange={(checked) => setForm((current) => ({ ...current, isActive: checked }))}
                  label="Visible en la tienda"
                />
                Visible en la tienda
              </label>
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-ink-800 p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Fotos y videos</p>
              <span className="font-mono-price text-xs text-white/40">
                {slots.length}/{MAX_MEDIA_PER_PRODUCT}
              </span>
            </div>
            <p className="mt-1 text-xs text-white/40">
              Hasta {MAX_MEDIA_PER_PRODUCT} recursos. El primero es la foto principal del catálogo.
            </p>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {Array.from({ length: MAX_MEDIA_PER_PRODUCT }).map((_, index) => {
                const slot = slots[index]
                const isNextOpen = index === slots.length

                if (!slot && !isNextOpen) {
                  return (
                    <div key={index} className="aspect-square rounded-xl border border-dashed border-white/10" />
                  )
                }

                if (!slot) {
                  return (
                    <div key={index}>
                      <div
                        onClick={() => slotInputRefs[index].current?.click()}
                        onDragOver={(e) => {
                          e.preventDefault()
                          setDragOverIndex(index)
                        }}
                        onDragLeave={() => setDragOverIndex((current) => (current === index ? null : current))}
                        onDrop={(e) => {
                          e.preventDefault()
                          setDragOverIndex(null)
                          setSlotFile(index, e.dataTransfer.files?.[0] ?? null)
                        }}
                        className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed transition ${
                          dragOverIndex === index
                            ? 'border-electric-400 bg-electric-500/10'
                            : 'border-white/15 hover:border-white/25'
                        }`}
                      >
                        <UploadIcon className="h-5 w-5 text-white/40" />
                        <span className="text-center text-[10px] font-semibold leading-tight text-white/50">
                          Agregar
                        </span>
                      </div>
                      <input
                        ref={slotInputRefs[index]}
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => {
                          setSlotFile(index, e.target.files?.[0] ?? null)
                          e.target.value = ''
                        }}
                        className="hidden"
                      />
                    </div>
                  )
                }

                return (
                  <div
                    key={slot.key}
                    className="group relative aspect-square overflow-hidden rounded-xl bg-ink-900 ring-1 ring-white/10"
                  >
                    {slot.mediaType === 'video' ? (
                      <video src={slot.url} className="h-full w-full object-cover" muted playsInline />
                    ) : (
                      <img src={slot.url} alt="" className="h-full w-full object-cover" />
                    )}

                    {slot.mediaType === 'video' && (
                      <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink-900/20">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-900/70 text-white">
                          <PlayIcon className="h-3.5 w-3.5" />
                        </span>
                      </span>
                    )}

                    {index === 0 && (
                      <span className="absolute left-1 top-1 rounded bg-ink-900/80 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white/80">
                        Principal
                      </span>
                    )}

                    <div
                      onClick={() => slotInputRefs[index].current?.click()}
                      className="absolute inset-0 flex cursor-pointer items-center justify-center bg-ink-900/0 opacity-0 transition group-hover:bg-ink-900/60 group-hover:opacity-100"
                    >
                      <UploadIcon className="h-4 w-4 text-white" />
                    </div>
                    <input
                      ref={slotInputRefs[index]}
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => {
                        setSlotFile(index, e.target.files?.[0] ?? null)
                        e.target.value = ''
                      }}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeSlot(index)
                      }}
                      aria-label="Quitar recurso"
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink-900/80 text-white/80 transition hover:bg-ember-500 hover:text-white"
                    >
                      <CloseIcon className="h-3 w-3" />
                    </button>

                    <div className="absolute bottom-1 left-1 flex gap-0.5">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={(e) => {
                          e.stopPropagation()
                          moveSlot(index, -1)
                        }}
                        aria-label="Mover a la izquierda"
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-ink-900/80 text-white/80 transition hover:text-electric-400 disabled:opacity-30"
                      >
                        <ChevronLeftIcon className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        disabled={index === slots.length - 1}
                        onClick={(e) => {
                          e.stopPropagation()
                          moveSlot(index, 1)
                        }}
                        aria-label="Mover a la derecha"
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-ink-900/80 text-white/80 transition hover:text-electric-400 disabled:opacity-30"
                      >
                        <ChevronRightIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {mediaError && <p className="mt-2 text-xs text-ember-400">{mediaError}</p>}
          </div>

          {isEditing && id && (
            <StockAdjuster
              productId={id}
              stock={form.stockQuantity}
              onStockChange={(newStock) =>
                setForm((current) => ({ ...current, stockQuantity: newStock }))
              }
            />
          )}

          {submitError && (
            <p className="rounded-lg bg-ember-500/10 px-3 py-2 text-sm text-ember-400">{submitError}</p>
          )}

          <button
            type="submit"
            disabled={submitting || categoriesLoading}
            className="flex w-full items-center justify-center rounded-full bg-electric-500 py-3 text-sm font-bold text-white transition hover:bg-electric-400 disabled:opacity-60"
          >
            {submitting
              ? 'Guardando...'
              : categoriesLoading
                ? 'Cargando categorías...'
                : isEditing
                  ? 'Guardar cambios'
                  : 'Crear producto'}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-1.5 text-center text-sm font-semibold text-ember-400 hover:underline"
            >
              <TrashIcon className="h-3.5 w-3.5" />
              Eliminar producto
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-5 border-t border-white/10 pt-5 first:border-0 first:pt-0">
      <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">{title}</p>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-white/60">{label}</span>
      {children}
    </label>
  )
}
