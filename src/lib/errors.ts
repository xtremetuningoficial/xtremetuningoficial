export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message)
  }
  return 'Ocurrió un error inesperado.'
}

/** Código de Postgres para "ya existe un registro con ese valor único". */
const UNIQUE_VIOLATION = '23505'

/** Detecta un valor repetido por el código de Postgres, no por el texto (que puede cambiar). */
export function isUniqueViolation(error: unknown): boolean {
  return (
    Boolean(error) &&
    typeof error === 'object' &&
    'code' in (error as object) &&
    (error as { code: unknown }).code === UNIQUE_VIOLATION
  )
}

/** Código de Postgres para "otro registro depende de este" (llave foránea). */
const FOREIGN_KEY_VIOLATION = '23503'

/** El registro no se puede borrar porque otra tabla lo usa (por ejemplo, el historial de inventario). */
export function isForeignKeyViolation(error: unknown): boolean {
  return (
    Boolean(error) &&
    typeof error === 'object' &&
    'code' in (error as object) &&
    (error as { code: unknown }).code === FOREIGN_KEY_VIOLATION
  )
}
