import { useRef, useState } from 'react'
import { detectMediaType, MAX_MEDIA_PER_PRODUCT, validateMediaFile } from '../../lib/api/adminProducts'
import type { MediaType } from '../../types/product'
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, TrashIcon, UploadIcon } from '../icons'
import { card } from './ui'

export interface MediaSlot {
  key: string
  status: 'existing' | 'new'
  url: string
  mediaType: MediaType
  file?: File
}

interface MediaSlotsEditorProps {
  slots: MediaSlot[]
  onChange: (update: (current: MediaSlot[]) => MediaSlot[]) => void
  disabled?: boolean
}

// Fotos y videos del producto. Se toca una casilla para elegirla y las acciones
// aparecen debajo con botones grandes: en el celular no existe el "pasar el mouse".
export function MediaSlotsEditor({ slots, onChange, disabled }: MediaSlotsEditorProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // Casilla que va a recibir el archivo que se elija en el selector.
  const targetIndexRef = useRef(0)

  function openPicker(index: number) {
    targetIndexRef.current = index
    inputRef.current?.click()
  }

  function setSlotFile(index: number, file: File | null) {
    if (!file) return
    const validationError = validateMediaFile(file)
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    onChange((current) => {
      const next = [...current]
      const previous = next[index]
      if (previous?.status === 'new') URL.revokeObjectURL(previous.url)
      next[Math.min(index, next.length)] = {
        key: `new-${Date.now()}-${index}`,
        status: 'new',
        url: URL.createObjectURL(file),
        mediaType: detectMediaType(file) ?? 'image',
        file,
      }
      return next
    })
    setSelected(Math.min(index, slots.length))
  }

  function removeSlot(index: number) {
    onChange((current) => {
      const removed = current[index]
      if (removed?.status === 'new') URL.revokeObjectURL(removed.url)
      return current.filter((_, i) => i !== index)
    })
    setSelected(null)
  }

  function moveSlot(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= slots.length) return
    onChange((current) => {
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
    setSelected(target)
  }

  const selectedSlot = selected !== null ? slots[selected] : undefined

  return (
    <div className={`${card} p-5`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">Fotos y videos</h2>
        <span className="font-mono-price text-xs text-white/60">
          {slots.length}/{MAX_MEDIA_PER_PRODUCT}
        </span>
      </div>
      <p className="mt-1 text-xs text-white/60">
        Hasta {MAX_MEDIA_PER_PRODUCT}. La primera es la foto principal del catálogo. Toca una para moverla,
        cambiarla o quitarla.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {Array.from({ length: MAX_MEDIA_PER_PRODUCT }).map((_, index) => {
          const slot = slots[index]
          const isNextOpen = index === slots.length

          if (!slot && !isNextOpen) {
            return (
              <div
                key={index}
                aria-hidden="true"
                className="aspect-square rounded-xl border border-dashed border-white/10"
              />
            )
          }

          if (!slot) {
            return (
              <button
                key={index}
                type="button"
                disabled={disabled}
                onClick={() => openPicker(index)}
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
                className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed transition disabled:opacity-50 ${
                  dragOverIndex === index
                    ? 'border-electric-400 bg-electric-500/10'
                    : 'border-white/20 hover:border-white/35 hover:bg-white/[0.03]'
                }`}
              >
                <UploadIcon className="h-5 w-5 text-white/60" />
                <span className="text-xs font-semibold text-white/70">Agregar</span>
              </button>
            )
          }

          const isSelected = selected === index
          return (
            <button
              key={slot.key}
              type="button"
              disabled={disabled}
              aria-pressed={isSelected}
              aria-label={`${slot.mediaType === 'video' ? 'Video' : 'Foto'} ${index + 1}${index === 0 ? ', principal' : ''}`}
              onClick={() => setSelected(isSelected ? null : index)}
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
              className={`relative aspect-square overflow-hidden rounded-xl bg-ink-900 transition ${
                isSelected || dragOverIndex === index
                  ? 'ring-2 ring-electric-400'
                  : 'ring-1 ring-white/10 hover:ring-white/30'
              }`}
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
                <span className="absolute left-1 top-1 rounded bg-ink-900/85 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                  Principal
                </span>
              )}
              {slot.status === 'new' && (
                <span className="absolute bottom-1 left-1 rounded bg-electric-500 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                  Nueva
                </span>
              )}
            </button>
          )
        })}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          setSlotFile(targetIndexRef.current, e.target.files?.[0] ?? null)
          e.target.value = ''
        }}
        className="hidden"
      />

      {selectedSlot && selected !== null && (
        <div className="mt-3 grid grid-cols-2 gap-2" role="group" aria-label={`Acciones del recurso ${selected + 1}`}>
          <button
            type="button"
            disabled={disabled || selected === 0}
            onClick={() => moveSlot(selected, -1)}
            className={toolbarButton}
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Antes
          </button>
          <button
            type="button"
            disabled={disabled || selected === slots.length - 1}
            onClick={() => moveSlot(selected, 1)}
            className={toolbarButton}
          >
            Después
            <ChevronRightIcon className="h-4 w-4" />
          </button>
          <button type="button" disabled={disabled} onClick={() => openPicker(selected)} className={toolbarButton}>
            <UploadIcon className="h-4 w-4" />
            Cambiar
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => removeSlot(selected)}
            className={`${toolbarButton} text-ember-400 hover:border-ember-400/60 hover:text-ember-400`}
          >
            <TrashIcon className="h-4 w-4" />
            Quitar
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 text-xs font-semibold text-ember-400">
          {error}
        </p>
      )}
    </div>
  )
}

const toolbarButton =
  'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-white/15 px-3 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40'
