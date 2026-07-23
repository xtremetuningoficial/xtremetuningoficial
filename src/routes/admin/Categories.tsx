import { useEffect, useState, type FormEvent } from 'react'
import {
  createCategory,
  deleteCategory,
  fetchAdminCategories,
  swapCategoryOrder,
  updateCategory,
} from '../../lib/api/categories'
import { slugify } from '../../lib/slugify'
import { getErrorMessage } from '../../lib/errors'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { categoryIcons, DEFAULT_CATEGORY_ICON } from '../../data/categoryIcons'
import { Tooltip } from '../../components/ui/Tooltip'
import { StatTile } from '../../components/admin/StatTile'
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
} from '../../components/icons'
import type { AdminCategory } from '../../types/admin'

export default function AdminCategories() {
  useDocumentTitle('Categorías')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [categories, setCategories] = useState<AdminCategory[]>([])

  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [newSlugTouched, setNewSlugTouched] = useState(false)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [editError, setEditError] = useState<string | null>(null)

  const [busyId, setBusyId] = useState<string | null>(null)

  async function load() {
    setStatus('loading')
    try {
      const data = await fetchAdminCategories()
      setCategories(data)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleAdd(event: FormEvent) {
    event.preventDefault()
    setAddError(null)
    const name = newName.trim()
    const slug = newSlug.trim()
    if (!name || !slug) {
      setAddError('El nombre y el slug son obligatorios.')
      return
    }

    setAdding(true)
    try {
      await createCategory({ name, slug })
      setNewName('')
      setNewSlug('')
      setNewSlugTouched(false)
      await load()
    } catch (error) {
      const message = getErrorMessage(error)
      setAddError(
        message.includes('duplicate key')
          ? 'Ya existe una categoría con ese slug.'
          : `No pudimos crear la categoría: ${message}`,
      )
    } finally {
      setAdding(false)
    }
  }

  function startEdit(category: AdminCategory) {
    setEditingId(category.id)
    setEditName(category.name)
    setEditSlug(category.slug)
    setEditError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditError(null)
  }

  async function handleSaveEdit(id: string) {
    const name = editName.trim()
    const slug = editSlug.trim()
    if (!name || !slug) {
      setEditError('El nombre y el slug son obligatorios.')
      return
    }

    setBusyId(id)
    try {
      await updateCategory(id, { name, slug })
      setEditingId(null)
      await load()
    } catch (error) {
      const message = getErrorMessage(error)
      setEditError(
        message.includes('duplicate key')
          ? 'Ya existe una categoría con ese slug.'
          : `No pudimos guardar los cambios: ${message}`,
      )
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(category: AdminCategory) {
    const warning =
      category.productCount > 0
        ? `"${category.name}" tiene ${category.productCount} producto${category.productCount === 1 ? '' : 's'} asociado${category.productCount === 1 ? '' : 's'}. Reasígnalos antes de poder eliminarla.`
        : `¿Eliminar la categoría "${category.name}"? Esta acción no se puede deshacer.`

    if (category.productCount > 0) {
      window.alert(warning)
      return
    }
    if (!window.confirm(warning)) return

    setBusyId(category.id)
    try {
      await deleteCategory(category.id)
      await load()
    } catch (error) {
      window.alert(`No pudimos eliminar la categoría: ${getErrorMessage(error)}`)
    } finally {
      setBusyId(null)
    }
  }

  async function handleMove(category: AdminCategory, direction: -1 | 1) {
    const index = categories.findIndex((c) => c.id === category.id)
    const neighbor = categories[index + direction]
    if (!neighbor) return

    setBusyId(category.id)
    try {
      await swapCategoryOrder(
        { id: category.id, sortOrder: category.sortOrder },
        { id: neighbor.id, sortOrder: neighbor.sortOrder },
      )
      await load()
    } finally {
      setBusyId(null)
    }
  }

  const totalProducts = categories.reduce((sum, c) => sum + c.productCount, 0)

  return (
    <div>
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl uppercase text-white sm:text-3xl">Categorías</h1>
        <p className="text-sm text-white/50">
          Organiza cómo se agrupan los productos en la tienda y en el catálogo.
        </p>
      </div>

      {status === 'success' && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:max-w-md">
          <StatTile label="Categorías" value={String(categories.length)} icon={LayersIcon} accent="electric" />
          <StatTile label="Productos" value={String(totalProducts)} icon={PackageIcon} accent="white" />
        </div>
      )}

      <form
        onSubmit={handleAdd}
        className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-ink-800 p-4 sm:flex-row sm:items-end sm:p-5"
      >
        <label className="flex-1">
          <span className="mb-1 block text-xs font-semibold text-white/60">Nombre</span>
          <input
            type="text"
            value={newName}
            onChange={(e) => {
              const value = e.target.value
              setNewName(value)
              if (!newSlugTouched) setNewSlug(slugify(value))
            }}
            placeholder="Ej. Cámaras de reversa"
            className="input"
          />
        </label>
        <label className="flex-1">
          <span className="mb-1 block text-xs font-semibold text-white/60">Slug (URL)</span>
          <input
            type="text"
            value={newSlug}
            onChange={(e) => {
              setNewSlugTouched(true)
              setNewSlug(e.target.value)
            }}
            placeholder="camaras-de-reversa"
            className="input font-mono-price"
          />
        </label>
        <Tooltip label="Crear esta categoría">
          <button
            type="submit"
            disabled={adding}
            className="flex items-center justify-center gap-1.5 rounded-full bg-electric-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-electric-400 disabled:opacity-60"
          >
            <PlusIcon className="h-4 w-4" />
            {adding ? 'Creando...' : 'Nueva categoría'}
          </button>
        </Tooltip>
      </form>
      {addError && <p className="mt-2 text-xs text-ember-400">{addError}</p>}

      {status === 'loading' && (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-ink-800" />
          ))}
        </div>
      )}

      {status === 'error' && (
        <p className="mt-6 rounded-xl bg-ember-500/10 px-4 py-6 text-center text-ember-400">
          No pudimos cargar las categorías. Intenta recargar la página.
        </p>
      )}

      {status === 'success' && (
        <div className="mt-6 space-y-2.5">
          {categories.map((category, index) => {
            const isEditing = editingId === category.id
            const isBusy = busyId === category.id
            const Icon = categoryIcons[category.slug] ?? DEFAULT_CATEGORY_ICON

            return (
              <div
                key={category.id}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-800 p-3 transition hover:border-white/15 sm:p-4"
              >
                <div className="flex shrink-0 flex-col">
                  <Tooltip label="Subir">
                    <button
                      type="button"
                      disabled={index === 0 || isBusy}
                      onClick={() => handleMove(category, -1)}
                      aria-label={`Subir ${category.name}`}
                      className="flex h-5 w-6 items-center justify-center rounded text-white/40 transition hover:bg-white/5 hover:text-white disabled:opacity-20"
                    >
                      <ChevronUpIcon className="h-3.5 w-3.5" />
                    </button>
                  </Tooltip>
                  <Tooltip label="Bajar">
                    <button
                      type="button"
                      disabled={index === categories.length - 1 || isBusy}
                      onClick={() => handleMove(category, 1)}
                      aria-label={`Bajar ${category.name}`}
                      className="flex h-5 w-6 items-center justify-center rounded text-white/40 transition hover:bg-white/5 hover:text-white disabled:opacity-20"
                    >
                      <ChevronDownIcon className="h-3.5 w-3.5" />
                    </button>
                  </Tooltip>
                </div>

                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-cyan-400">
                  <Icon className="h-5 w-5" />
                </span>

                {isEditing ? (
                  <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input"
                      autoFocus
                    />
                    <input
                      type="text"
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                      className="input font-mono-price"
                    />
                  </div>
                ) : (
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 font-semibold leading-snug text-white">{category.name}</p>
                    <p className="truncate font-mono-price text-xs text-white/40">{category.slug}</p>
                  </div>
                )}

                <span className="hidden shrink-0 rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/70 sm:inline-block">
                  {category.productCount} producto{category.productCount === 1 ? '' : 's'}
                </span>

                <div className="flex shrink-0 items-center gap-1">
                  {isEditing ? (
                    <>
                      <Tooltip label="Guardar cambios">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleSaveEdit(category.id)}
                          aria-label={`Guardar ${category.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/5 hover:text-electric-400 disabled:opacity-50"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                      </Tooltip>
                      <Tooltip label="Cancelar">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={cancelEdit}
                          aria-label="Cancelar edición"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                        >
                          <CloseIcon className="h-4 w-4" />
                        </button>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <Tooltip label="Editar categoría">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => startEdit(category)}
                          aria-label={`Editar ${category.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/5 hover:text-electric-400 disabled:opacity-50"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </Tooltip>
                      <Tooltip
                        label={
                          category.productCount > 0
                            ? 'No se puede eliminar: tiene productos'
                            : 'Eliminar categoría'
                        }
                      >
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleDelete(category)}
                          aria-label={`Eliminar ${category.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:bg-ember-500/10 hover:text-ember-400 disabled:opacity-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </Tooltip>
                    </>
                  )}
                </div>
              </div>
            )
          })}

          {editError && <p className="px-1 text-xs text-ember-400">{editError}</p>}

          {categories.length === 0 && (
            <p className="rounded-2xl border border-white/10 bg-ink-800 px-4 py-10 text-center text-sm text-white/50">
              Todavía no hay categorías. Crea la primera arriba.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
