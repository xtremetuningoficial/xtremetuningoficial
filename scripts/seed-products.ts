// Siembra categorías y productos en Supabase, y sube cada foto de public/ al
// bucket de Storage. Requiere SUPABASE_SERVICE_ROLE_KEY (bypassa RLS a propósito:
// este script corre solo en tu máquina, nunca en el navegador).
//
// Uso: npm run db:seed  (después de completar .env, ver supabase/README.md)

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'
import WebSocket from 'ws'
import { categories } from '../src/data/categories.ts'
import { products } from '../src/data/products.ts'

const MAX_WIDTH = 1000
const WEBP_QUALITY = 80

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET = 'product-images'

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    'Faltan VITE_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en tu .env.\n' +
      'Revisa supabase/README.md para crear el proyecto y completar las credenciales.',
  )
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  realtime: { transport: WebSocket as never },
})

async function seedCategories(): Promise<Map<string, string>> {
  console.log(`Sembrando ${categories.length} categorías...`)
  const idBySlug = new Map<string, string>()

  for (const [index, category] of categories.entries()) {
    const { data, error } = await supabase
      .from('categories')
      .upsert(
        { slug: category.slug, name: category.name, sort_order: index },
        { onConflict: 'slug' },
      )
      .select('id, slug')
      .single()

    if (error) throw new Error(`Categoría "${category.name}": ${error.message}`)
    idBySlug.set(data.slug, data.id)
  }

  return idBySlug
}

async function seedProducts(categoryIdBySlug: Map<string, string>) {
  console.log(`Sembrando ${products.length} productos e imágenes...`)

  for (const product of products) {
    const categoryId = categoryIdBySlug.get(product.categorySlug)
    if (!categoryId) {
      throw new Error(`El producto "${product.name}" referencia una categoría desconocida: ${product.categorySlug}`)
    }

    const { data: productRow, error: productError } = await supabase
      .from('products')
      .upsert(
        {
          slug: product.slug,
          name: product.name,
          category_id: categoryId,
          description: product.description.join('\n'),
          price: product.price,
          install_price: product.installPrice,
          vehicle_type: product.vehicleType,
          is_featured: Boolean(product.featured),
          is_active: true,
        },
        { onConflict: 'slug' },
      )
      .select('id, slug')
      .single()

    if (productError) throw new Error(`Producto "${product.name}": ${productError.message}`)

    const localImagePath = resolve('public', product.image.replace(/^\//, ''))
    const optimized = await sharp(readFileSync(localImagePath))
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer()
    const storagePath = `${product.slug}.webp`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, optimized, { upsert: true, contentType: 'image/webp' })

    if (uploadError) throw new Error(`Imagen de "${product.name}": ${uploadError.message}`)

    const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)

    // Reemplaza las imágenes existentes del producto en vez de acumularlas.
    const { error: deleteError } = await supabase
      .from('product_images')
      .delete()
      .eq('product_id', productRow.id)

    if (deleteError) throw new Error(`Limpiando imágenes de "${product.name}": ${deleteError.message}`)

    const { error: imageError } = await supabase
      .from('product_images')
      .insert({ product_id: productRow.id, url: publicUrlData.publicUrl, sort_order: 0 })

    if (imageError) throw new Error(`Guardando imagen de "${product.name}": ${imageError.message}`)

    console.log(`  ✓ ${product.name}`)
  }
}

async function main() {
  const categoryIdBySlug = await seedCategories()
  await seedProducts(categoryIdBySlug)
  console.log('\nListo — catálogo sembrado en Supabase.')
}

main().catch((error) => {
  console.error('\nError sembrando el catálogo:', error.message)
  process.exit(1)
})
