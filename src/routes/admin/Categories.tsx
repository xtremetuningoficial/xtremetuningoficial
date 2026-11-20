import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import {
  createCategory,
  deleteCategory,
  fetchAdminCategories,
  removeCategoryIcon,
  swapCategoryOrder,
  updateCategory,
  uploadCategoryIcon,
} from '../../lib/api/categories'
import { slugify } from '../../lib/slugify'
import { getErrorMessage, isUniqueViolation } from '../../lib/errors'
import { useAsync } from '../../hooks/useAsync'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { CategoryIcon } from '../../components/CategoryIcon'
import { Tooltip } from '../../components/ui/Tooltip'
import { useAdminFeedback } from '../../components/admin/AdminFeedback'
import { FormField } from '../../components/admin/FormField'
import { EmptyState, ErrorState, SkeletonList } from '../../components/admin/LoadStates'
import { StatTile } from '../../components/admin/StatTile'
import {
  buttonPrimary,
  buttonSecondary,
  card,
  iconButton,
  iconButtonDanger,
} from '../../components/admin/ui'
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CloseIcon,
  LayersIcon,
  PackageIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UploadIcon,
} from '../../components/icons'
import type { AdminCategory } from '../../types/admin'

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

interface CategoryErrors {
  name?: string
  slug?: string
}

function validateCategory(name: string, slug: string): CategoryErrors {
  const errors: CategoryErrors = {}
  if (!name) errors.name = 'Escribe el nombre de la categoría.'
  if (!slug) errors.slug = 'Escribe la dirección (slug).'
  else if (!SLUG_PATTERN.test(slug)) errors.slug = 'Solo minúsculas, números y guiones. Ej. camaras-de-reversa'
  return errors
}

function productCountLabel(count: number) {
  return `${count} producto${count === 1 ? '' : 's'}`
}

export default function AdminCategories() {
  useDocumentTitle('Categorías')
  const { confirm, notify } = useAdminFeedback()
  const load = useAsync(fetchAdminCategories, [])
  const categories = load.data ?? []

  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [newSlugTouched, setNewSlugTouched] = useState(false)
  const [adding, setAdding] = useState(false)
  const [addErrors, setAddErrors] = useState<CategoryErrors>({})
  const [addError, setAddError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [editErrors, setEditErrors] = useState<CategoryErrors>({})
  const [editError, setEditError] = useState<string | null>(null)

  const [busyId, setBusyId] = useState<string | null>(null)
  const busyRef = useRef(false)
  const iconInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  /** Corre una acción sobre una categoría, sin dejar que se dispare dos veces. */
  async function runBusy(id: string, action: () => Promise<void>) {
    if (busyRef.current) return
    busyRef.current = true
    setBusyId(id)
    try {
      await action()
    } finally {
      busyRef.current = false
      setBusyId(null)
    }
  }

  async function handleAdd(event: FormEvent) {
    event.preventDefault()
    if (adding) return
    setAddError(null)
    const name = newName.trim()
    const slug = newSlug.trim()
    const errors = validateCategory(name, slug)
    setAddErrors(errors)
    if (Object.keys(errors).length > 0) return

    setAdding(true)
    try {
      await createCategory({ name, slug })
      setNewName('')
      setNewSlug('')
      setNewSlugTouched(false)
      notify(`Creamos la categoría "${name}".`)
      load.reload()
    } catch (error) {
      if (isUniqueViolation(error)) setAddErrors({ slug: 'Ya existe una categoría con esa dirección. Usa otra.' })
      else setAddError(`No pudimos crear la categoría: ${getErrorMessage(error)}`)
    } finally {
      setAdding(false)
    }
  }

  function startEdit(category: AdminCategory) {
    setEditingId(category.id)
    setEditName(category.name)
    setEditSlug(category.slug)
    setEditErrors({})
    setEditError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditErrors({})
    setEditError(null)
  }

  async function handleSaveEdit(id: string) {
    const name = editName.trim()
    const slug = editSlug.trim()
    const errors = validateCategory(name, slug)
    setEditErrors(errors)
    setEditError(null)
    if (Object.keys(errors).length > 0) return

    await runBusy(id, async () => {
      try {
        await updateCategory(id, { name, slug })
        setEditingId(null)
        notify(`Guardamos "${name}".`)
        load.reload()
      } catch (error) {
        if (isUniqueViolation(error)) setEditErrors({ slug: 'Ya existe una categoría con esa dirección. Usa otra.' })
        else setEditError(`No pudimos guardar los cambios: ${getErrorMessage(error)}`)
      }
    })
  }

  function handleEditKeyDown(event: KeyboardEvent<HTMLInputElement>, id: string) {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSaveEdit(id)
    } else if (event.key === 'Escape') {
      cancelEdit()
    }
  }

  async function handleDelete(category: AdminCategory) {
    if (category.productCount > 0) {
      await confirm({
        title: 'Esta categoría tiene productos',
        message: `"${category.name}" tiene ${productCountLabel(category.productCount)}. Pásalos a otra categoría desde cada producto y luego podrás eliminarla.`,
        confirmLabel: 'Entendido',
        tone: 'info',
        acknowledgeOnly: true,
      })
      return
    }
    const accepted = await confirm({
      title: '¿Eliminar esta categoría?',
      message: `"${category.name}" desaparece del menú de la tienda. No se puede deshacer.`,
      confirmLabel: 'Sí, eliminar',
    })
    if (!accepted) return

    await runBusy(category.id, async () => {
      try {
        await deleteCategory(category.id)
        notify(`Eliminamos la categoría "${category.name}".`)
        load.reload()
      } catch (error) {
        notify(`No pudimos eliminar la categoría: ${getErrorMessage(error)}`, 'error')
      }
    })
  }

  async function handleMove(category: AdminCategory, direction: -1 | 1) {
    const index = categories.findIndex((c) => c.id === category.id)
    const neighbor = categories[index + direction]
    if (!neighbor) return

    await runBusy(category.id, async () => {
      try {
        await swapCategoryOrder(
          { id: category.id, sortOrder: category.sortOrder },
          { id: neighbor.id, sortOrder: neighbor.sortOrder },
        )
        // Se reordena en memoria para que la lista no parpadee con el esqueleto.
        load.setData((current) => {
          if (!current) return current
          const next = current.map((c) =>
            c.id === category.id
              ? { ...c, sortOrder: neighbor.sortOrder }
              : c.id === neighbor.id
                ? { ...c, sortOrder: category.sortOrder }
                : c,
          )
          return next.sort((a, b) => a.sortOrder - b.sortOrder)
        })
      } catch (error) {
        notify(`No pudimos cambiar el orden: ${getErrorMessage(error)}`, 'error')
        load.reload()
      }
    })
  }

  async function handleIconUpload(category: AdminCategory, file: File | null) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      notify('El ícono debe ser una imagen (PNG, JPG, WebP o SVG).', 'error')
      return
    }

    await runBusy(category.id, async () => {
      try {
        const iconUrl = await uploadCategoryIcon(category.id, category.slug, file)
        load.setData((current) => (current ?? []).map((c) => (c.id === category.id ? { ...c, iconUrl } : c)))
        notify(`Cambiamos el ícono de "${category.name}".`)
      } catch (error) {
        notify(`No pudimos subir el ícono: ${getErrorMessage(error)}`, 'error')
      }
    })
  }

  async function handleRemoveIcon(category: AdminCategory) {
    await runBusy(category.id, async () => {
      try {
        await removeCategoryIcon(category.id)
        load.setData((current) =>
          (current ?? []).map((c) => (c.id === category.id ? { ...c, iconUrl: null } : c)),
        )
        notify(`"${category.name}" vuelve a usar el ícono de la tienda.`)
      } catch (error) {
        notify(`No pudimos quitar el ícono: ${getErrorMessage(error)}`, 'error')
      }
    })
  }

  const totalProducts = categories.reduce((sum, c) => sum + c.productCount, 0)

  return (
    <div>
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl uppercase text-white sm:text-3xl">Categorías</h1>
        <p className="text-sm text-white/60">Organiza cómo se agrupan los productos en la tienda y en el catálogo.</p>
      </div>

      {load.status === 'success' && categories.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:max-w-md">
          <StatTile label="Categorías" value={String(categories.length)} icon={LayersIcon} accent="electric" />
          <StatTile label="Productos" value={String(totalProducts)} icon={PackageIcon} accent="white" />
        </div>
      )}

      <form
        onSubmit={handleAdd}
        noValidate
        className={`${card} mt-6 grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-start sm:p-5`}
      >
        <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 sm:col-span-3">Nueva categoría</h2>
        <FormField label="Nombre" error={addErrors.name}>
          <input
            type="text"
            autoComplete="off"
            disabled={adding}
            value={newName}
            onChange={(e) => {
              const value = e.target.value
              setNewName(value)
              if (!newSlugTouched) setNewSlug(slugify(value))
              setAddErrors((current) => (current.name || (!newSlugTouched && current.slug) ? {} : current))
            }}
            placeholder="Ej. Cámaras de reversa"
            className="input"
          />
        </FormField>
        <FormField label="Dirección (slug)" error={addErrors.slug} hint="Se arma sola con el nombre.">
          <input
            type="text"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            disabled={adding}
            value={newSlug}
            onChange={(e) => {
              setNewSlugTouched(true)
              setNewSlug(e.target.value)
              setAddErrors((current) => ({ ...current, slug: undefined }))
            }}
            placeholder="camaras-de-reversa"
            className="input font-mono-price"
          />
        </FormField>
        <button type="submit" disabled={adding} className={`${buttonPrimary} sm:mt-5`}>
          <PlusIcon className="h-4 w-4" />
          {adding ? 'Creando…' : 'Crear categoría'}
        </button>
        {addError && (
          <p role="alert" className="text-xs font-semibold text-ember-400 sm:col-span-3">
            {addError}
          </p>
        )}
      </form>

      {load.status === 'loading' && <SkeletonList rows={4} rowClassName="h-28 sm:h-16" />}

      {load.status === 'error' && (
        <ErrorState title="No pudimos cargar las categorías." detail={load.error} onRetry={load.reload} />
      )}

      {load.status === 'success' && categories.length === 0 && (
        <EmptyState
          title="Todavía no hay categorías."
          description="Crea la primera arriba (por ejemplo, Alarmas para carro). Después podrás agregar productos dentro."
        />
      )}

      {load.status === 'success' && categories.length > 0 && (
        <ul className="mt-6 space-y-2.5">
          {categories.map((category, index) => {
            const isEditing = editingId === category.id
            const isBusy = busyId === category.id

            return (
              <li
                key={category.id}
                aria-busy={isBusy}
                className={`${card} flex flex-wrap items-center gap-x-3 gap-y-2 p-3 transition sm:flex-nowrap sm:p-4 ${
                  isBusy ? 'opacity-70' : ''
                }`}
              >
                {/* Ícono: tocarlo abre el selector de imagen. */}
                <Tooltip label={category.iconUrl ? 'Cambiar ícono' : 'Subir ícono'} className="order-1 shrink-0">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => iconInputRefs.current[category.id]?.click()}
                    aria-label={`${category.iconUrl ? 'Cambiar' : 'Subir'} ícono de ${category.name}`}
                    className="group/icon relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white/5 text-cyan-400 transition hover:bg-white/10 disabled:opacity-50"
                  >
                    <CategoryIcon category={category} className="h-5 w-5" />
                    <span className="absolute inset-0 flex items-center justify-center bg-ink-900/70 opacity-0 transition group-hover/icon:opacity-100">
                      <UploadIcon className="h-4 w-4 text-white" />
                    </span>
                  </button>
                </Tooltip>
                <input
                  ref={(el) => {
                    iconInputRefs.current[category.id] = el
                  }}
                  type="file"
                  accept="image/*"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="hidden"
                  onChange={(e) => {
                    handleIconUpload(category, e.target.files?.[0] ?? null)
                    e.target.value = ''
                  }}
                />

                {isEditing ? (
                  <div className="order-2 grid min-w-0 flex-1 basis-[calc(100%-3.5rem)] gap-3 sm:basis-auto sm:grid-cols-2">
                    <FormField label="Nombre" error={editErrors.name}>
                      <input
                        type="text"
                        value={editName}
                        disabled={isBusy}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => handleEditKeyDown(e, category.id)}
                        className="input"
                        autoFocus
                      />
                    </FormField>
                    <FormField
                      label="Dirección (slug)"
                      error={editErrors.slug}
                      hint="Cambiarla cambia el enlace de la categoría en la tienda."
                    >
                      <input
                        type="text"
                        value={editSlug}
                        disabled={isBusy}
                        autoCapitalize="none"
                        spellCheck={false}
                        onChange={(e) => setEditSlug(e.target.value)}
                        onKeyDown={(e) => handleEditKeyDown(e, category.id)}
                        className="input font-mono-price"
                      />
                    </FormField>
                    {category.iconUrl && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleRemoveIcon(category)}
                        className="inline-flex min-h-11 items-center gap-1.5 justify-self-start rounded-lg px-2 text-sm font-semibold text-white/75 transition hover:text-ember-400 sm:col-span-2"
                      >
                        <CloseIcon className="h-4 w-4" />
                        Quitar ícono propio (volver al de la tienda)
                      </button>
                    )}
                    {editError && (
                      <p role="alert" className="text-xs font-semibold text-ember-400 sm:col-span-2">
                        {editError}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="order-2 min-w-0 flex-1 basis-[calc(100%-3.5rem)] sm:basis-auto">
                    <p className="line-clamp-2 font-semibold leading-snug text-white">{category.name}</p>
                    <p className="truncate font-mono-price text-xs text-white/60">
                      {category.slug}
                      <span className="sm:hidden"> · {productCountLabel(category.productCount)}</span>
                    </p>
                  </div>
                )}

                {!isEditing && (
                  <span className="order-3 hidden shrink-0 rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/75 sm:inline-block">
                    {productCountLabel(category.productCount)}
                  </span>
                )}

                {/* En el celular, orden y acciones bajan a una segunda fila con botones de 44 px. */}
                <div className="order-4 flex shrink-0 items-center sm:order-first">
                  <Tooltip label="Subir en el orden">
                    <button
                      type="button"
                      disabled={index === 0 || isBusy || isEditing}
                      onClick={() => handleMove(category, -1)}
                      aria-label={`Subir ${category.name} en el orden`}
                      className={iconButton}
                    >
                      <ChevronUpIcon className="h-4 w-4" />
                    </button>
                  </Tooltip>
                  <Tooltip label="Bajar en el orden">
                    <button
                      type="button"
                      disabled={index === categories.length - 1 || isBusy || isEditing}
                      onClick={() => handleMove(category, 1)}
                      aria-label={`Bajar ${category.name} en el orden`}
                      className={iconButton}
                    >
                      <ChevronDownIcon className="h-4 w-4" />
                    </button>
                  </Tooltip>
                </div>

                <div className="order-5 ml-auto flex shrink-0 items-center gap-1">
                  {isEditing ? (
                    <>
                      <button type="button" disabled={isBusy} onClick={cancelEdit} className={buttonSecondary}>
                        Cancelar
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleSaveEdit(category.id)}
                        className={buttonPrimary}
                      >
                        <CheckIcon className="h-4 w-4" />
                        {isBusy ? 'Guardando…' : 'Guardar'}
                      </button>
                    </>
                  ) : (
                    <>
                      <Tooltip label="Editar categoría">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => startEdit(category)}
                          aria-label={`Editar ${category.name}`}
                          className={iconButton}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </Tooltip>
                      <Tooltip
                        label={category.productCount > 0 ? 'Tiene productos: no se puede eliminar' : 'Eliminar categoría'}
                        align="end"
                      >
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleDelete(category)}
                          aria-label={`Eliminar ${category.name}`}
                          className={iconButtonDanger}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </Tooltip>
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
