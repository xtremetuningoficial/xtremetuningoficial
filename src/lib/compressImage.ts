const MAX_WIDTH = 1000
const QUALITY = 0.8

// Fotos de celular suelen pesar varios MB — esto las reduce a un tamaño
// razonable para la web antes de subirlas a Storage (WebP si el navegador
// sabe codificarlo, si no cae a JPEG), sin depender de un servicio de
// transformación de imágenes de pago.
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') return file

  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_WIDTH / bitmap.width)
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) return file

    ctx.drawImage(bitmap, 0, 0, width, height)

    const webpBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', QUALITY),
    )
    if (webpBlob && webpBlob.type === 'image/webp' && webpBlob.size < file.size) {
      return new File([webpBlob], file.name.replace(/\.\w+$/, '.webp'), { type: 'image/webp' })
    }

    const jpegBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', QUALITY),
    )
    if (jpegBlob && jpegBlob.size < file.size) {
      return new File([jpegBlob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' })
    }

    return file
  } catch {
    return file
  }
}
