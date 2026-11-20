import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AlertTriangleIcon, CheckIcon, CloseIcon } from '../icons'
import { buttonDanger, buttonPrimary, buttonSecondary } from './ui'

// Avisos del panel: confirmación antes de acciones que no se deshacen y
// mensajes breves de éxito o fallo. Reemplaza window.confirm / window.alert,
// que en el celular salen con el texto del navegador y sin la marca.

type Tone = 'success' | 'error'

interface Toast {
  id: number
  tone: Tone
  message: string
}

export interface ConfirmOptions {
  title: string
  message: string
  confirmLabel: string
  /** 'danger' para borrar; 'info' para avisos que solo se aceptan. */
  tone?: 'danger' | 'info'
  /** Sin botón de cancelar: solo informa (por ejemplo, por qué no se puede borrar). */
  acknowledgeOnly?: boolean
}

interface AdminFeedbackValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>
  notify: (message: string, tone?: Tone) => void
}

const AdminFeedbackContext = createContext<AdminFeedbackValue | null>(null)

const TOAST_MS = 4500

export function AdminFeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [pending, setPending] = useState<ConfirmOptions | null>(null)
  const resolverRef = useRef<((value: boolean) => void) | null>(null)
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const notify = useCallback(
    (message: string, tone: Tone = 'success') => {
      const id = nextId.current++
      setToasts((current) => [...current.slice(-2), { id, tone, message }])
      window.setTimeout(() => dismiss(id), tone === 'error' ? TOAST_MS * 2 : TOAST_MS)
    },
    [dismiss],
  )

  const confirm = useCallback((options: ConfirmOptions) => {
    resolverRef.current?.(false)
    setPending(options)
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
    })
  }, [])

  function settle(value: boolean) {
    resolverRef.current?.(value)
    resolverRef.current = null
    setPending(null)
  }

  return (
    <AdminFeedbackContext.Provider value={{ confirm, notify }}>
      {children}
      {pending && <ConfirmDialog options={pending} onSettle={settle} />}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-[0_12px_32px_-8px_rgb(0_0_0/0.6)] ${
              toast.tone === 'error'
                ? 'border-ember-400/40 bg-ink-700 text-white'
                : 'border-electric-400/40 bg-ink-700 text-white'
            }`}
          >
            <span className={`mt-0.5 shrink-0 ${toast.tone === 'error' ? 'text-ember-400' : 'text-electric-400'}`}>
              {toast.tone === 'error' ? <AlertTriangleIcon className="h-4 w-4" /> : <CheckIcon className="h-4 w-4" />}
            </span>
            <p className="min-w-0 flex-1 leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Cerrar aviso"
              className="-my-2 -mr-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white/60 transition hover:text-white"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </AdminFeedbackContext.Provider>
  )
}

function ConfirmDialog({ options, onSettle }: { options: ConfirmOptions; onSettle: (value: boolean) => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const isDanger = options.tone !== 'info'

  // <dialog> nativo: atrapa el foco, cierra con Escape y devuelve el foco al botón que lo abrió.
  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
      onCancel={(event) => {
        event.preventDefault()
        onSettle(false)
      }}
      onClick={(event) => {
        // Tocar fuera del recuadro cancela.
        if (event.target === dialogRef.current) onSettle(false)
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-white/10 bg-ink-800 p-0 text-white shadow-[0_24px_64px_-12px_rgb(0_0_0/0.7)] backdrop:bg-ink-900/75"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          {isDanger && (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ember-500/15 text-ember-400">
              <AlertTriangleIcon className="h-5 w-5" />
            </span>
          )}
          <div className="min-w-0">
            <h2 id="confirm-title" className="text-base font-bold text-white">
              {options.title}
            </h2>
            <p id="confirm-message" className="mt-1.5 text-sm leading-relaxed text-white/70">
              {options.message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {!options.acknowledgeOnly && (
            <button type="button" autoFocus onClick={() => onSettle(false)} className={buttonSecondary}>
              Cancelar
            </button>
          )}
          <button
            type="button"
            autoFocus={options.acknowledgeOnly}
            onClick={() => onSettle(true)}
            className={isDanger && !options.acknowledgeOnly ? buttonDanger : buttonPrimary}
          >
            {options.confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  )
}

export function useAdminFeedback() {
  const context = useContext(AdminFeedbackContext)
  if (!context) throw new Error('useAdminFeedback debe usarse dentro de <AdminFeedbackProvider>')
  return context
}
