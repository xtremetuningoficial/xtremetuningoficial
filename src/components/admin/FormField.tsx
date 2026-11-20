import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from 'react'

interface FieldControlProps {
  id?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

interface FormFieldProps {
  label: string
  /** Un solo control (input, select o textarea); recibe id y atributos de error. */
  children: ReactElement<FieldControlProps>
  hint?: ReactNode
  error?: string | null
  className?: string
}

/** Etiqueta + control + ayuda + error junto al campo, enlazados para lectores de pantalla. */
export function FormField({ label, children, hint, error, className = '' }: FormFieldProps) {
  const baseId = useId()
  const controlId = `${baseId}-control`
  const hintId = hint ? `${baseId}-hint` : undefined
  const errorId = error ? `${baseId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  const control = isValidElement(children)
    ? cloneElement(children, {
        id: controlId,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
      })
    : children

  return (
    <div className={className}>
      <label htmlFor={controlId} className="mb-1 block text-xs font-semibold text-white/70">
        {label}
      </label>
      {control}
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-white/55">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-xs font-semibold text-ember-400">
          {error}
        </p>
      )}
    </div>
  )
}
