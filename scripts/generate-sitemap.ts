// Genera public/sitemap.xml y public/robots.txt a partir del catálogo real en
// Supabase. Corre esto después de cada despliegue si cambia el dominio, o cuando
// quieras refrescar el sitemap con los productos/categorías actuales.
//
// Uso: npm run seo:sitemap -- https://tu-dominio.vercel.app

import 'dotenv/config'
import { writeFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import WebSocket from 'ws'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
const siteUrl = process.argv[2]?.replace(/\/$/, '')

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Faltan VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY en tu .env.')
  process.exit(1)
}

if (!siteUrl) {
  console.error('Uso: npm run seo:sitemap -- https://tu-dominio.vercel.app')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: { transport: WebSocket as never },
})

function urlEntry(loc: string, priority: string) {
  return `  <url>\n    <loc>${loc}</loc>\n    <priority>${priority}</priority>\n  </url>`
}

async function main() {
  const { data: categories, error: catError } = await supabase.from('categories').select('slug')
  if (catError) throw catError

  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('slug')
    .eq('is_active', true)
  if (prodError) throw prodError

  const urls = [
    urlEntry(siteUrl!, '1.0'),
    ...categories.map((c) => urlEntry(`${siteUrl}/categoria/${c.slug}`, '0.7')),
    ...products.map((p) => urlEntry(`${siteUrl}/producto/${p.slug}`, '0.8')),
  ]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`

  writeFileSync('public/sitemap.xml', sitemap)
  console.log(`public/sitemap.xml generado con ${1 + categories.length + products.length} URLs.`)

  const robots = `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${siteUrl}/sitemap.xml\n`
  writeFileSync('public/robots.txt', robots)
  console.log('public/robots.txt actualizado.')
}

main().catch((error) => {
  console.error('Error generando el sitemap:', error.message)
  process.exit(1)
})
