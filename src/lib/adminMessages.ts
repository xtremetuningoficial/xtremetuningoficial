import { getErrorMessage, isForeignKeyViolation } from './errors'

/** Mensaje para la persona cuando falla borrar un producto. */
export function deleteProductErrorMessage(name: string, error: unknown): string {
  if (isForeignKeyViolation(error)) {
    return `"${name}" tiene movimientos de inventario guardados y no se puede eliminar. Si ya no lo vendes, ocúltalo de la tienda con el interruptor "Visible".`
  }
  return `No pudimos eliminar "${name}": ${getErrorMessage(error)}`
}

export const DELETE_PRODUCT_WARNING =
  'Desaparece de la tienda y del panel, con sus fotos. No se puede deshacer. Si solo se agotó, mejor ocúltalo con el interruptor "Visible".'
