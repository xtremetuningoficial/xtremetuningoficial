# Arquitectura Frontend

## Stack

- **Vite** (ya presente en el proyecto) como bundler/dev server.
- **React 18 + TypeScript** para componentes y estado.
- **React Router** para las rutas (Home, Categoría, Producto, Carrito, Admin).
- **Tailwind CSS** para estilos, con tokens de marca personalizados (ver
  `05-sistema-diseno.md`) en vez del set de colores por defecto.
- **Supabase JS client** para leer/escribir productos, auth e imágenes (desde la Fase 2).
- Estado del carrito: React Context + `localStorage` (no hace falta Redux/Zustand para
  este alcance).

## Estructura de carpetas propuesta

```
src/
  main.tsx
  App.tsx
  routes/
    Home.tsx
    Categoria.tsx
    Producto.tsx
    Carrito.tsx
    admin/
      Login.tsx
      Dashboard.tsx
      ProductoForm.tsx
  components/
    layout/
      Header.tsx
      Footer.tsx
      WhatsAppFloatButton.tsx
    catalog/
      ProductCard.tsx
      ProductGrid.tsx
      CategoryPill.tsx
      SearchBar.tsx
    cart/
      CartItem.tsx
      CartSummary.tsx
    ui/            # botones, badges, inputs reutilizables
  context/
    CartContext.tsx
    AuthContext.tsx
  data/
    products.ts     # datos de siembra (Fase 1), luego reemplazados por Supabase
    categories.ts
  lib/
    supabase.ts      # cliente Supabase (Fase 2+)
    whatsapp.ts       # helper para armar el mensaje de pedido
  types/
    product.ts
  assets/
```

## Páginas / rutas

| Ruta | Descripción | Fase |
|---|---|---|
| `/` | Home: hero, categorías destacadas, productos destacados | 1 |
| `/categoria/:slug` | Listado filtrado por categoría (alarmas carro, alarmas moto, bloqueo central, radios) | 1 (mock) → 3 (real) |
| `/producto/:id` | Ficha de producto con galería, descripción, precio + instalación | 3 |
| `/carrito` | Carrito y botón de pedido por WhatsApp | 4 |
| `/admin/login` | Login del panel | 5 |
| `/admin` | Dashboard: listado de productos, alertas de stock | 5, 6 |
| `/admin/productos/nuevo`, `/admin/productos/:id` | Formulario de alta/edición | 5 |

## Componentes clave

- **ProductCard**: imagen, nombre, badges (categoría, "agotado" si aplica), precio de
  producto y precio de instalación mostrados por separado (como en el catálogo actual),
  botón "Agregar al carrito".
- **Header**: logo, navegación por categoría, buscador, ícono de carrito con contador,
  botón de WhatsApp visible.
- **WhatsAppFloatButton**: botón flotante persistente (patrón muy usado en e-commerce
  latinoamericano) para contacto directo, además del flujo de carrito.

## Responsive

Mobile-first. El negocio vende a clientes que llegan mayormente desde el celular
(tráfico de redes sociales/WhatsApp). Breakpoints Tailwind estándar (`sm`, `md`, `lg`,
`xl`), grid de productos: 1 columna en móvil, 2 en tablet, 3–4 en escritorio.

## Manejo de imágenes

- Fase 1: imágenes servidas desde `public/` (las que ya existen: `logo.png`,
  `banner.jpeg`, y una foto por producto).
- Fase 2+: imágenes migran a Supabase Storage; el frontend consume URLs públicas del
  bucket. Se usa `loading="lazy"` y tamaños responsive (`srcset`) para no penalizar
  performance en conexiones móviles.
