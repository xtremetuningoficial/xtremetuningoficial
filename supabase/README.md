# Supabase — puesta en marcha

Este proyecto todavía no tiene un proyecto de Supabase creado. Cuando lo tengas,
sigue estos pasos en orden:

## 1. Crear el proyecto

En [supabase.com](https://supabase.com) crea un proyecto nuevo (plan gratuito alcanza
para este negocio). Guarda dos datos del panel **Project Settings → API**:

- `Project URL`
- `anon public key`
- `service_role key` (⚠️ secreta, nunca la compartas ni la subas a git)

## 2. Aplicar el esquema

Abre **SQL Editor** en el dashboard de tu proyecto, pega el contenido completo de
[`schema.sql`](./schema.sql) y ejecútalo. Crea las 4 tablas (`categories`, `products`,
`product_images`, `inventory_movements`), las políticas de Row Level Security y el
bucket público `product-images` en Storage. El script es idempotente — se puede
volver a correr sin duplicar nada.

## 3. Configurar las variables de entorno

Copia `.env.example` a `.env` en la raíz del proyecto y completa los tres valores con
los datos del paso 1:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

`.env` ya está en `.gitignore` — nunca se sube al repositorio.

## 4. Sembrar el catálogo (categorías, productos e imágenes)

Con el `.env` completo, corre:

```
npm run db:seed
```

Esto toma los datos de `src/data/products.ts` y `src/data/categories.ts` (la misma
fuente que usa hoy la web estática), crea las categorías y productos en la base de
datos, sube cada foto de `public/` al bucket `product-images` de Storage, y enlaza
cada producto con su imagen ya alojada en Supabase. Se puede volver a correr cuando
quieras — actualiza en vez de duplicar.

## 5. Conectar el frontend (Fase 3)

El cliente de Supabase para el navegador ya está listo en `src/lib/supabase.ts`. La
Fase 3 reemplaza las lecturas de `src/data/products.ts` por consultas reales a estas
tablas — hasta entonces, la web sigue funcionando con los datos de ejemplo sin
depender de que este proyecto exista.
