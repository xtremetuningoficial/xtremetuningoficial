import { useEffect, useRef, useState, type DragEvent, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  createProduct,
  deleteProduct,
  fetchAdminProductById,
  replaceProductImage,
  updateProduct,
  uploadProductImage,
} from '../../lib/api/adminProducts'
import { fetchAdminCategories } from '../../lib/api/categories'
import { slugify } from '../../lib/slugify'
import { getErrorMessage } from '../../lib/errors'
import { StockAdjuster } from '../../components/admin/StockAdjuster'
import { Switch } from '../../components/admin/Switch'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { TrashIcon, UploadIcon } from '../../components/icons'
import type { AdminCategory, ProductFormValues } from '../../types/admin'
import type { VehicleType } from '../../types/product'

const EMPTY_FORM: ProductFormValues = {
  name: '',
  slug: '',
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
  const [slugTouched, setSlugTouched] = useState(false)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const [newImageFile, setNewImageFile] = useState<File | null>(null)
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
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
          slug: product.slug,
          categoryId: product.categoryId ?? '',
          vehicleType: product.vehicleType,
          price: product.price,
          installPrice: product.installPrice,
          stockQuantity: product.stockQuantity,
          isFeatured: product.isFeatured,
          isActive: product.isActive,
          description: product.description,
        })
        setExistingImageUrl(product.imageUrl)
        setSlugTouched(true)
      })
      .catch(() => setLoadError('No pudimos cargar este producto.'))
      .finally(() => setLoading(false))
  }, [id])

  function handleNameChange(name: string) {
    setForm((current) => ({
      ...current,
      name,
      slug: slugTouched ? current.slug : slugify(name),
    }))
  }

  function handleImageChange(file: File | null) {
    if (file && !file.type.startsWith('image/')) return
    setNewImageFile(file)
    setNewImagePreview(file ? URL.createObjectURL(file) : null)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragOver(false)
    handleImageChange(event.dataTransfer.files?.[0] ?? null)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitError(null)

    if (!form.name.trim() || !form.slug.trim() || !form.categoryId) {
      setSubmitError('Nombre, slug y categoría son obligatorios.')
      return
    }

    setSubmitting(true)
    try {
      let productId = id
      let productSlug = form.slug

      if (isEditing && id) {
        await updateProduct(id, form)
      } else {
        const created = await createProduct(form)
        productId = created.id
        productSlug = created.slug
      }

      if (newImageFile && productId) {
        const url = await uploadProductImage(productSlug, newImageFile)
        await replaceProductImage(productId, url)
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
          {isEditing && <p className="mt-1 font-mono-price text-xs text-white/50">{form.slug}</p>}
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

            <Field label="Slug (URL)">
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  setForm((current) => ({ ...current, slug: e.target.value }))
                }}
                className="input font-mono-price"
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
            <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Foto</p>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`mt-3 cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition ${
                dragOver ? 'border-electric-400 bg-electric-500/10' : 'border-white/15 hover:border-white/25'
              }`}
            >
              {newImagePreview || existingImageUrl ? (
                <div className="relative aspect-square">
                  <img
                    src={newImagePreview ?? existingImageUrl ?? ''}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-ink-900/0 opacity-0 transition hover:bg-ink-900/60 hover:opacity-100">
                    <span className="flex items-center gap-2 rounded-full bg-ink-900/80 px-3 py-1.5 text-xs font-bold text-white">
                      <UploadIcon className="h-3.5 w-3.5" />
                      Cambiar foto
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex aspect-square flex-col items-center justify-center gap-2 px-4 text-center">
                  <UploadIcon className="h-7 w-7 text-white/40" />
                  <p className="text-xs font-semibold text-white/60">Arrastra una foto aquí</p>
                  <p className="text-xs text-white/40">o haz clic para elegirla</p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
              className="hidden"
            />

            {(newImagePreview || existingImageUrl) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleImageChange(null)
                  setExistingImageUrl(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-white/50 transition hover:text-ember-400"
              >
                <TrashIcon className="h-3.5 w-3.5" />
                Quitar foto
              </button>
            )}
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
