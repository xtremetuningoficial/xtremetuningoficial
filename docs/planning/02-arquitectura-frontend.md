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

## Estructura de carpetas (actualizada a Fase 6)

```
src/
  main.tsx
  App.tsx                # AuthProvider + CartProvider + BrowserRouter + Routes
  context/
    CartContext.tsx        # líneas {slug, quantity} + persistencia en localStorage
    AuthContext.tsx          # sesión de Supabase Auth (signIn/signOut)
  routes/
    Layout.tsx            # Header + <Outlet context={categorías}/> + Footer + WhatsApp flotante
    Home.tsx               # Hero, categorías, catálogo filtrable, misión
    ProductDetail.tsx       # Ficha de producto (/producto/:slug)
    Cart.tsx                 # /carrito
    admin/
      RequireAuth.tsx          # protege /admin/* (redirige a /admin/login)
      AdminLayout.tsx            # topbar + <Outlet/>, sin Header/Footer públicos
      Login.tsx                   # /admin/login
      Dashboard.tsx                 # /admin — listado, búsqueda, umbral de stock bajo, toggle, eliminar
      ProductForm.tsx                 # /admin/productos/nuevo y /admin/productos/:id
  components/
    admin/
      StockAdjuster.tsx        # entrada/salida de stock con motivo + historial (solo al editar)
    layout/
      Header.tsx            # incluye ícono de carrito con contador
      Footer.tsx
      HazardDivider.tsx
      WhatsAppFloatButton.tsx
    home/
      Hero.tsx
      TrustBar.tsx
      CategorySection.tsx
      MissionBand.tsx
    catalog/
      ProductCard.tsx        # "Agregar al carrito" o stepper si ya está en el carrito
      ProductCardSkeleton.tsx
      CatalogSection.tsx
      SearchBar.tsx
    cart/
      CartItem.tsx
      CartSummary.tsx          # totales + botón "Enviar pedido por WhatsApp"
      QuantityStepper.tsx        # reutilizado en card, ficha de producto, carrito y admin
  hooks/
    useCategories.ts        # fetch + estado loading/success/error
    useProducts.ts
    useProduct.ts
    useLowStockThreshold.ts   # umbral configurable, persistido en localStorage
  lib/
    supabase.ts             # cliente Supabase
    slugify.ts                # nombre → slug (usado en el formulario de producto)
    errors.ts                  # getErrorMessage() — los errores de Supabase no son instancias de Error
    api/
      categories.ts          # fetchCategories(), fetchAdminCategories() (con id)
      products.ts             # fetchProducts(), fetchProductBySlug() + mapeo de fila DB → Product
      adminProducts.ts          # CRUD admin: create/update/delete/setActive + upload de imagen
      inventory.ts               # fetchMovements(), adjustStock() (rpc adjust_product_stock)
    whatsapp.ts              # helpers para mensajes de WhatsApp (individual y carrito)
    format.ts                 # formatCOP(), formatDateTime()
  data/
    products.ts              # datos de siembra (solo los usa scripts/seed-products.ts)
    categories.ts
    categoryIcons.ts
    vehicleLabels.ts
  types/
    product.ts
    admin.ts                  # AdminProduct, AdminCategory, ProductFormValues, InventoryMovement
  assets/

scripts/
  seed-products.ts          # siembra inicial de categorías/productos/imágenes
  create-admin-user.ts        # crea o resetea el usuario del panel (Admin API + service_role key)
```

## Páginas / rutas

| Ruta | Descripción | Fase |
|---|---|---|
| `/` | Home: hero, categorías destacadas, catálogo completo | 1 (mock) → 3 (real) |
| `/categoria/:categorySlug` | Mismo Home, filtrado por categoría (deep-linkable, compartible) | 3 |
| `/producto/:slug` | Ficha de producto con galería, descripción, precio + instalación | 3 |
| `/carrito` | Carrito y botón de pedido por WhatsApp | 4 |
| `/admin/login` | Login del panel | 5 |
| `/admin` | Dashboard: listado de productos, alertas de stock | 5, 6 |
| `/admin/productos/nuevo`, `/admin/productos/:id` | Formulario de alta/edición | 5 |

La categoría se identifica por `slug` (no por id numérico) para que las URLs sean
legibles y compartibles (`/categoria/alarmas-moto`), igual que el producto usa `slug`
en vez de su `uuid` interno.

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
