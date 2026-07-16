import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
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

  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [form, setForm] = useState<ProductFormValues>(EMPTY_FORM)
  const [slugTouched, setSlugTouched] = useState(false)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const [newImageFile, setNewImageFile] = useState<File | null>(null)
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null)
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
    setNewImageFile(file)
    setNewImagePreview(file ? URL.createObjectURL(file) : null)
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
      const message = error instanceof Error ? error.message : 'Error desconocido'
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
      setSubmitError(error instanceof Error ? error.message : 'No pudimos eliminar el producto.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-white" />
  }

  if (loadError) {
    return (
      <div className="rounded-2xl bg-ember-500/10 px-4 py-8 text-center text-ember-500">
        {loadError}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl uppercase text-ink-900">
          {isEditing ? 'Editar producto' : 'Nuevo producto'}
        </h1>
        <Link to="/admin" className="text-sm font-semibold text-ink-900/50 hover:text-electric-500">
          ← Volver
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5 rounded-2xl border border-ink-900/10 bg-white p-5 sm:p-6">
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
            <Field label="Stock">
              <input
                type="number"
                min={0}
                value={form.stockQuantity}
                onChange={(e) =>
                  setForm((current) => ({ ...current, stockQuantity: Number(e.target.value) }))
                }
                className="input"
              />
            </Field>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-ink-900/70">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm((current) => ({ ...current, isFeatured: e.target.checked }))}
                className="h-4 w-4 accent-electric-500"
              />
              Destacado ("Más pedido")
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-900/70">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((current) => ({ ...current, isActive: e.target.checked }))}
                className="h-4 w-4 accent-electric-500"
              />
              Visible en la tienda
            </label>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-ink-900/10 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/40">Foto</p>
            <div className="mt-3 aspect-square overflow-hidden rounded-xl bg-paper-100">
              {newImagePreview || existingImageUrl ? (
                <img
                  src={newImagePreview ?? existingImageUrl ?? ''}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-ink-900/30">
                  Sin imagen
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
              className="mt-3 block w-full text-xs text-ink-900/60 file:mr-3 file:rounded-full file:border-0 file:bg-electric-500/10 file:px-3 file:py-2 file:text-xs file:font-bold file:text-electric-500"
            />
          </div>

          {submitError && (
            <p className="rounded-lg bg-ember-500/10 px-3 py-2 text-sm text-ember-500">{submitError}</p>
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
              className="block w-full text-center text-sm font-semibold text-ember-500 hover:underline"
            >
              Eliminar producto
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-ink-900/50">{label}</span>
      {children}
    </label>
  )
}
