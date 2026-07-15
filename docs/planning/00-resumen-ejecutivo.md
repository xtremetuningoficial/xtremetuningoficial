# Xtreme Tuning — E-commerce con Inventariado — Resumen Ejecutivo

## El negocio

**Xtreme Tuning — Lujos y Accesorios** es un local físico de accesorios y electricidad
automotriz (alarmas, radios, bloqueos centrales, polarizados, vidrios eléctricos, sonido,
luces LED, botón star-stop, servicio de escáner). Atiende carros y motos, con instalación
profesional incluida en cada producto.

**Misión:** brindar soluciones integrales en accesorios y electricidad automotriz, con
productos de calidad, instalación profesional y servicio honesto y personalizado.

Contacto actual (tomado del aviso físico): WhatsApp 3508277999 y 3118664441, pagos por
Nequi, Daviplata, Mastercard/Visa.

## Qué vamos a construir

Una tienda en línea (catálogo + carrito + pedido por WhatsApp) con un **panel de
administración** para que el dueño del negocio pueda, sin tocar código:

- Crear, editar y eliminar productos (nombre, descripción, categoría, imágenes).
- Gestionar precio del producto y precio de instalación por separado (patrón repetido
  en todo el catálogo actual).
- Gestionar inventario: existencias, estado (disponible / agotado / bajo stock).
- Subir y reemplazar fotos de producto.

## Decisiones de arquitectura ya tomadas

| Decisión | Elegido | Por qué |
|---|---|---|
| Frontend | **React + TypeScript + Vite** | El proyecto ya usa Vite/TS; se añade React porque el panel admin y el carrito necesitan manejo de estado y componentes reutilizables que en vanilla TS se vuelven inmantenibles rápido. |
| Backend / datos | **Supabase** (Postgres + Auth + Storage) | Cubre base de datos, autenticación del panel admin y almacenamiento de imágenes sin operar un servidor propio. Plan gratuito alcanza para un negocio de este tamaño. |
| Checkout fase 1 | **Carrito → pedido pre-armado por WhatsApp** | Así opera el negocio hoy (pagos se coordinan por Nequi/Daviplata/tarjeta en tienda o contra-entrega). Permite lanzar rápido sin integrar pasarela de pagos. Pagos en línea reales quedan como fase futura. |
| Estilo visual | Basado en el **logo** (auto azul/cian estilo racing sobre fondo blanco) y el **aviso físico** (amarillo, azul, naranja, negro, alto contraste, letras grandes) | Ver `05-sistema-diseno.md`. |

## Alcance por fases (resumen)

1. **Fase 0** ✅ — Planeación (este documento y los siguientes).
2. **Fase 1** ✅ — Sistema de diseño + Home/catálogo con datos de ejemplo (sin backend aún).
3. **Fase 2** ✅ — Modelado de datos y Supabase (productos, categorías, inventario, imágenes) — proyecto real creado y catálogo sembrado.
4. **Fase 3** ✅ — Catálogo dinámico conectado a Supabase (listado, filtros, búsqueda, ficha de producto).
5. **Fase 4** ✅ — Carrito de compra + checkout por WhatsApp.
6. **Fase 5** — Panel de administración (login + CRUD de productos e inventario).
7. **Fase 6** — Gestión de inventario avanzada (alertas de stock bajo, historial de movimientos).
8. **Fase 7** — Pulido, SEO, performance, QA responsive y despliegue a producción.
9. **Fase 8 (futuro)** — Pagos en línea, cuentas de cliente, historial de pedidos, reportes.

Ver el detalle de cada fase, sus entregables y criterios de "hecho" en
[`01-plan-fases.md`](./01-plan-fases.md).

## Catálogo inicial

El negocio ya proporcionó 13 productos (alarmas para carro y moto, bloqueos centrales,
radios) con precio de producto y precio de instalación por separado. Este set inicial se
usa como datos de siembra (seed data) del catálogo — ver
[`04-modelo-datos.md`](./04-modelo-datos.md).
