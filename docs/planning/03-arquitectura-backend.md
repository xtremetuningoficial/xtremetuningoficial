# Arquitectura Backend

## Por qué Supabase y no un backend propio

Un backend propio (Node/Express + base de datos administrada por nosotros) implica
mantener servidor, migraciones, autenticación, subida de archivos y backups a mano.
Para el tamaño de este negocio (catálogo de decenas de productos, un solo
administrador), **Supabase** da lo mismo con mucho menos esfuerzo operativo:

- **Postgres** gestionado, con SQL completo si más adelante se necesitan reportes.
- **Auth** integrada para el login del panel (`/admin`), sin construir manejo de
  contraseñas ni sesiones a mano.
- **Storage** para las imágenes de producto, con CDN y URLs públicas.
- **Row Level Security (RLS)** para separar "cualquiera puede leer el catálogo" de
  "solo el admin autenticado puede escribir".
- API auto-generada (REST + cliente JS tipado) — no hay que escribir endpoints CRUD a
  mano para cada tabla.
- Plan gratuito soporta este volumen sin costo mientras el negocio valida el canal
  online.

No se descarta un backend propio a futuro si aparecen necesidades muy específicas
(lógica de negocio compleja, integraciones de pago con webhooks, etc.), pero no se
justifica desde el día uno.

## Autenticación

- Un único rol relevante por ahora: **admin** (el dueño / quien gestione el
  inventario). Se crea con `npm run admin:create -- correo@ejemplo.com`
  (`scripts/create-admin-user.ts`, usa la Admin API con la `service_role key`, genera
  una contraseña temporal) o manualmente desde el dashboard de Supabase; no hay
  registro público de administradores.
- El catálogo público (`/`, `/categoria/:slug`, `/producto/:id`) **no requiere login**.
- Las rutas `/admin/*` verifican sesión de Supabase Auth en el cliente y además están
  protegidas por RLS en la base de datos (nunca confiar solo en el frontend).

## Seguridad de datos (RLS, resumen)

| Tabla | Lectura pública | Escritura |
|---|---|---|
| `categories` | Sí | Solo admin autenticado |
| `products` | Sí (solo activos) | Solo admin autenticado |
| `product_images` | Sí | Solo admin autenticado |
| `inventory_movements` | No | Solo admin autenticado (lectura y escritura) |

## Almacenamiento de imágenes

- Bucket público `product-images` en Supabase Storage.
- Convención de nombres: `{product-slug}/{timestamp}-{filename}` para evitar
  colisiones al reemplazar fotos.
- El panel admin sube directo al bucket desde el navegador (sin pasar por un servidor
  intermedio), usando las credenciales del cliente Supabase con RLS de Storage
  restringido a usuarios autenticados para escritura.

## Variables de entorno

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

La `anon key` es segura de exponer en el frontend porque el acceso real está
controlado por las políticas RLS, no por mantener la key en secreto. Se excluyen de
git vía `.env` + `.gitignore` (el proyecto ya ignora `*.local`; se añadirá `.env` y
`.env.local` explícitamente al llegar a la Fase 2).

## Notas para el checkout por WhatsApp (Fase 4)

No requiere backend: el mensaje se arma en el frontend con los datos del carrito y se
abre `https://wa.me/<numero>?text=<mensaje-codificado>`. No hay procesamiento de pagos
en esta fase, así que no hay superficie de backend adicional que asegurar.
