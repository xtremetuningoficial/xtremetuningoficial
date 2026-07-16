# Plan de desarrollo por fases

Convención: cada fase tiene **objetivo**, **entregables** y **criterio de "hecho"**
(cómo sabemos que se puede pasar a la siguiente). Las fases están pensadas para
entregar valor visible cuanto antes: desde la Fase 1 ya hay una web enseñable, aunque
el inventario todavía no sea dinámico.

---

## Fase 0 — Planeación ✅ (en curso)

**Objetivo:** dejar por escrito el alcance, la arquitectura y el modelo de datos antes
de escribir código de producto.

**Entregables:**
- `00-resumen-ejecutivo.md`, `01-plan-fases.md`, `02-arquitectura-frontend.md`,
  `03-arquitectura-backend.md`, `04-modelo-datos.md`, `05-sistema-diseno.md`.

**Hecho cuando:** el dueño del negocio está de acuerdo con el alcance y el orden de fases.

---

## Fase 1 — Sistema de diseño + Home/Catálogo estático

**Objetivo:** tener una página vistosa y navegable, con el catálogo real (13 productos
del negocio) como datos de ejemplo embebidos en el código (sin backend todavía). Esto
permite validar la dirección visual con el dueño antes de invertir en backend.

**Entregables:**
- Migración del proyecto de Vite/TS vanilla a **Vite + React + TypeScript**.
- Tailwind CSS configurado con los tokens de marca (`05-sistema-diseno.md`).
- Componentes: Header con logo y navegación, Hero, franja de categorías, grid de
  productos (ProductCard), footer con datos de contacto (WhatsApp, medios de pago,
  dirección si aplica).
- Datos de los 13 productos actuales como módulo TypeScript tipado
  (`src/data/products.ts`), con las imágenes ya provistas en `public/`.
- Diseño responsive (móvil, tablet, escritorio) — la mayoría del tráfico de este tipo
  de negocio es móvil.

**Hecho cuando:** la página se ve bien en móvil y escritorio, muestra los 13 productos
con foto/precio/precio de instalación, y el dueño la aprueba visualmente.

---

## Fase 2 — Modelado de datos y Supabase ✅

**Objetivo:** reemplazar los datos hardcodeados por una base de datos real para que el
inventario se pueda gestionar sin tocar código.

**Estado:**
- ✅ Proyecto real de Supabase creado (`gmrqnivtfiyuihvlysxk`), credenciales en `.env`.
- ✅ Esquema aplicado en producción: tablas, RLS y bucket `product-images` (ver
  `supabase/schema.sql`).
- ✅ Catálogo sembrado: 4 categorías, 13 productos y sus 13 fotos subidas a Storage vía
  `npm run db:seed` (`scripts/seed-products.ts`), verificado accesible por la API
  pública con la `anon key`.
- ✅ Cliente de Supabase para el frontend en `src/lib/supabase.ts` (aún no conectado a
  la UI — eso es la Fase 3).

**Entregables:**
- Proyecto Supabase creado (Postgres + Auth + Storage).
- Tablas: `categories`, `products`, `product_images`, `inventory_movements` (ver
  `04-modelo-datos.md`).
- Políticas de Row Level Security: lectura pública de catálogo, escritura solo para
  usuarios autenticados (admin).
- Bucket de Storage para imágenes de producto.
- Script de siembra (seed) que carga los 13 productos actuales a la base de datos.
- Variables de entorno (`.env`) para las credenciales de Supabase, excluidas de git.

**Hecho cuando:** los 13 productos existen como filas reales en Supabase y las imágenes
están servidas desde Storage, no desde `public/`.

---

## Fase 3 — Catálogo dinámico ✅

**Objetivo:** el sitio deja de usar datos hardcodeados y consulta Supabase en vivo.

**Estado:** completa.
- ✅ `src/lib/api/{categories,products}.ts` consultan Supabase (con RLS) y mapean las
  filas al tipo `Product`/`Category` que ya usaba la UI.
- ✅ `useCategories`, `useProducts`, `useProduct` — hooks con estados `loading` /
  `success` / `error` (y `not-found` para producto individual).
- ✅ React Router: `/`, `/categoria/:categorySlug`, `/producto/:slug`, layout compartido
  (`src/routes/Layout.tsx`) con Header/Footer/botón de WhatsApp.
- ✅ Filtro por categoría (pills + tarjetas, deep-linkable por URL) y buscador por
  nombre (`SearchBar`), combinables.
- ✅ Página de detalle de producto: breadcrumb, galería (preparada para múltiples
  imágenes por producto), descripción, precio + instalación, CTA de WhatsApp.
- ✅ Estados de carga (skeletons), error de red (con CTA de WhatsApp como respaldo) y
  "producto no encontrado".

**Entregables:**
- Cliente de Supabase configurado en el frontend.
- Listado de productos por categoría, con filtro y buscador por nombre.
- Página de detalle de producto (ficha con galería de imágenes, descripción, precio,
  precio de instalación, disponibilidad).
- Manejo de estados de carga y error (skeleton/loading, mensaje si no hay resultados).

**Hecho cuando:** un producto editado en Supabase se refleja en la web sin tocar código,
y la navegación por categoría/búsqueda funciona. Verificado: filtrar por categoría,
buscar por nombre y abrir una ficha de producto funcionan con los datos reales de
Supabase, sin errores de consola.

---

## Fase 4 — Carrito y checkout por WhatsApp ✅

**Objetivo:** permitir que el visitante arme un pedido y lo envíe por WhatsApp
pre-formateado, replicando cómo el negocio ya vende hoy.

**Estado:** completa.
- ✅ `CartContext` (`src/context/CartContext.tsx`): líneas `{slug, quantity}`
  persistidas en `localStorage`, resueltas contra el catálogo en vivo (si un producto
  se desactiva, se avisa y se puede vaciar en vez de romper la página).
- ✅ `ProductCard` y la ficha de producto muestran "Agregar al carrito" o un stepper de
  cantidad si el producto ya está en el carrito.
- ✅ Ícono de carrito con contador en el header (persiste entre recargas, verificado).
- ✅ `/carrito`: líneas editables, resumen con productos/instalación/total, "Vaciar
  carrito", estado vacío.
- ✅ `buildCartInquiryLink` arma un mensaje de WhatsApp legible con cada línea, cantidad,
  subtotal y los tres totales — verificado con Playwright end-to-end.

**Entregables:**
- Estado de carrito en frontend (persistido en `localStorage`).
- Vista de carrito: productos, cantidad, precio, precio de instalación, subtotal.
- Botón "Enviar pedido por WhatsApp" que arma un mensaje con el detalle del pedido y
  abre `wa.me` con el número del negocio.
- Confirmación visual de que el pedido se armó correctamente.

**Hecho cuando:** se puede armar un carrito con varios productos y el mensaje de
WhatsApp generado es correcto y legible.

---

## Fase 5 — Panel de administración ✅

**Objetivo:** el dueño del negocio puede gestionar el catálogo sin ayuda técnica.

**Estado:** completa.
- ✅ `AuthContext` + `RequireAuth`: sesión de Supabase Auth, rutas `/admin/*`
  protegidas (redirigen a `/admin/login` conservando el destino).
- ✅ `scripts/create-admin-user.ts` (`npm run admin:create -- correo@ejemplo.com`):
  crea o resetea el usuario admin vía Admin API con una contraseña temporal generada,
  sin exponer la `service_role key` en el frontend.
- ✅ Dashboard (`/admin`): listado completo (incluye inactivos), búsqueda por nombre,
  toggle rápido activo/agotado, editar, eliminar (con confirmación).
- ✅ Formulario de producto (`/admin/productos/nuevo` y `/admin/productos/:id`):
  nombre, slug auto-generado (editable), categoría, tipo de vehículo, descripción por
  viñetas, precio y precio de instalación como campos independientes, stock,
  destacado, visible en tienda, subida de imagen a Supabase Storage con reemplazo.
- ✅ Verificado end-to-end con Playwright: login/logout, crear producto con imagen,
  editar, alternar activo/agotado (confirmado que se oculta/reaparece en la tienda
  pública en tiempo real), eliminar — sin errores de consola.

**Entregables:**
- Login con Supabase Auth (ruta `/admin`, protegida).
- CRUD de productos: crear, editar, eliminar, cambiar categoría.
- Gestión de precio de producto y precio de instalación como campos independientes.
- Subida/reemplazo de imágenes a Supabase Storage.
- Toggle de disponibilidad (activo / agotado) por producto.
- Listado con búsqueda y edición rápida de precio/stock.

**Hecho cuando:** el dueño puede añadir un producto nuevo completo (foto, precio,
instalación, categoría) desde el navegador y verlo aparecer en la tienda pública.
Verificado.

---

## Fase 6 — Gestión de inventario avanzada ✅

**Objetivo:** llevar control de existencias reales, no solo disponible/agotado.

**Estado:** completa.
- ✅ Función `adjust_product_stock` (Postgres, `security definer`): inserta el
  movimiento y actualiza `products.stock_quantity` en una sola transacción atómica;
  bloquea que el stock quede negativo (revierte todo si pasa) y solo la puede llamar
  un usuario autenticado (`revoke`/`grant` explícitos, verificado con una llamada
  anónima real que devuelve "No autorizado").
- ✅ `StockAdjuster` en el formulario de edición: stock actual, entrada/salida con
  motivo (venta en tienda, ingreso de mercancía, ajuste, venta en línea) y nota
  opcional, historial de los últimos 20 movimientos con fecha.
- ✅ El campo "Stock" pasa a ser de solo lectura al editar (se ajusta desde
  `StockAdjuster`, con auditoría); al crear un producto se define el stock inicial
  directamente.
- ✅ Umbral de stock bajo configurable en el Dashboard (persistido en `localStorage`
  del admin), con banner de alerta y badge "Stock bajo" por fila cuando un producto
  activo cae en o por debajo del umbral.
- ✅ Verificado end-to-end: +5/−3 mueven el stock correctamente y quedan en el
  historial con su motivo y nota; un intento de dejar el stock negativo se bloquea y
  no se aplica; el mensaje de error específico de la base de datos se muestra tal
  cual (se corrigió un bug real encontrado en la prueba: los errores de Supabase no
  son instancias de `Error`, así que `error instanceof Error` los ignoraba — afectaba
  también a los mensajes de error del formulario de producto desde la Fase 5, ahora
  centralizado en `lib/errors.ts`).

**Entregables:**
- Campo de cantidad en stock por producto.
- Registro de movimientos de inventario (entradas/salidas) — tabla
  `inventory_movements`.
- Alertas visuales en el panel cuando el stock baja de un umbral configurable.
- Ajuste manual de stock desde el panel (con motivo: venta en tienda, ingreso de
  mercancía, ajuste).

**Hecho cuando:** el stock se puede ajustar desde el panel y el histórico de
movimientos queda registrado y consultable. Verificado.

---

## Fase 7 — Pulido, SEO y despliegue

**Objetivo:** dejar el sitio listo para producción y visible en buscadores.

**Entregables:**
- SEO on-page: títulos, meta descripciones, Open Graph (para que se vea bien al
  compartir en WhatsApp/redes), sitemap.
- Optimización de imágenes (formatos modernos, tamaños responsive, carga diferida).
- Auditoría de accesibilidad y performance (Lighthouse).
- Dominio propio conectado (ej. `xtremetuning.com.co`) + hosting (Vercel/Netlify para
  el frontend).
- Analítica básica (Google Analytics o Plausible) para saber qué productos se ven más.

**Hecho cuando:** el sitio está publicado en el dominio final, pasa una auditoría
Lighthouse razonable (>85 en las categorías principales) y comparte bien en redes.

---

## Fase 8 — Futuro (fuera del alcance inicial)

Ideas para iterar después de validar el negocio en línea:

- Pagos en línea reales (Wompi / PayU / ePayco) con Nequi y tarjetas.
- Cuentas de cliente e historial de pedidos.
- Cupones y descuentos.
- Reportes de ventas y productos más vendidos.
- Reseñas de clientes por producto.
- Integración con WhatsApp Business API para automatizar respuestas.
