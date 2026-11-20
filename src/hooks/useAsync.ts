import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react'
import { getErrorMessage } from '../lib/errors'
import type { LoadStatus } from '../types/async'

export interface AsyncState<T> {
  status: LoadStatus
  data: T | null
  /** Mensaje técnico del último fallo (para mostrarlo pequeño debajo del aviso). */
  error: string | null
  /** Vuelve a pedir los datos; muestra el estado de carga mientras tanto. */
  reload: () => void
  /** Ajusta los datos en memoria tras una acción exitosa, sin volver a pedirlos. */
  setData: (update: (current: T | null) => T | null) => void
}

/**
 * Carga datos con una función asíncrona y expone su estado.
 * Si las dependencias cambian o se llama `reload` antes de que termine,
 * la respuesta vieja se descarta para no pisar la nueva.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: DependencyList): AsyncState<T> {
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [data, setDataState] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const fnRef = useRef(fn)
  fnRef.current = fn

  useEffect(() => {
    let current = true
    setStatus('loading')
    setError(null)
    fnRef
      .current()
      .then((result) => {
        if (!current) return
        setDataState(result)
        setStatus('success')
      })
      .catch((err: unknown) => {
        if (!current) return
        setError(getErrorMessage(err))
        setStatus('error')
      })
    return () => {
      current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])
  const setData = useCallback((update: (current: T | null) => T | null) => setDataState(update), [])

  return { status, data, error, reload, setData }
}
