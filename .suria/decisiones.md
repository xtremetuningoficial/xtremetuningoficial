# Decisiones · Xtreme Tuning

## 2026-10-29 · Descuentos por producto y retoques

- **Descuento en porcentaje (0–90 %) con fecha de fin opcional**, no precio rebajado a mano: es como piensa el dueño ("le pongo 20 %") y evita precios inconsistentes. El precio final se redondea a la centena.
- **La instalación nunca se descuenta**: el margen del servicio es del taller.
- **Se calcula al leer** (`src/lib/pricing.ts`): un descuento vencido deja de aplicarse solo, sin tareas programadas. `Product.price` ya es el precio con descuento, así carrito y WhatsApp lo usan sin cambios; `regularPrice` guarda el de antes.
- **Tienda:** etiqueta −X % sobre la foto, precio de antes tachado, "Ahorras…" y fecha en la ficha, línea "Descuentos" en el carrito, filtro "Ofertas (n)" que solo aparece si hay ofertas, y el WhatsApp del pedido lista el ahorro.
- **Admin:** atajos de 10/15/20/30 %, vista previa del precio final y aviso si el descuento ya venció.
- **Retoques:** controles nativos oscuros en el admin (Safari los pintaba blancos) y tooltip que desbordaba la pantalla en celular (`align="end"`).
- **Migración** `supabase/migrations/2026-10-29_descuentos.sql`: se corre en el SQL Editor del Supabase del cliente ANTES de desplegar; si no, el catálogo no carga.
- **Pendiente:** Rolo0317 tiene la invitación al repo sin aceptar; por eso el push quedó local.
