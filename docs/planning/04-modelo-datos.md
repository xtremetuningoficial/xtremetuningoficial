# Modelo de datos

## Esquema (Supabase / Postgres, Fase 2+)

```sql
create table categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  sort_order  int not null default 0
);

create table products (
  id                  uuid primary key default gen_random_uuid(),
  category_id         uuid references categories(id),
  name                text not null,
  slug                text not null unique,
  description         text,             -- bullets del producto (features)
  price               numeric(12,0) not null,       -- precio del producto en COP
  install_price       numeric(12,0),                -- precio de instalación en COP, nullable
  stock_quantity      int not null default 0,
  is_active           boolean not null default true, -- visible en la tienda
  is_featured         boolean not null default false,
  vehicle_type        text check (vehicle_type in ('carro','moto','universal')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  url         text not null,
  sort_order  int not null default 0
);

create table inventory_movements (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id),
  change      int not null,             -- positivo = entrada, negativo = salida
  reason      text not null,            -- 'venta_tienda' | 'ingreso_mercancia' | 'ajuste' | 'venta_online'
  note        text,
  created_at  timestamptz not null default now()
);
```

`price` e `install_price` se modelan como columnas separadas porque **todo** el
catálogo actual del negocio sigue este patrón (precio del producto + precio de
instalación aparte), no como un solo total.

## Categorías iniciales (derivadas del catálogo proporcionado)

| slug | Nombre |
|---|---|
| `alarmas-carro` | Alarmas para carro |
| `alarmas-moto` | Alarmas para moto |
| `bloqueo-central` | Bloqueo central |
| `radios` | Radios y multimedia |

(Categorías futuras evidentes en el aviso físico pero sin productos cargados aún:
polarizados, vidrios eléctricos, parlantes/sonido, luces LED, botón star-stop, servicio
de escáner — se pueden crear vacías desde el panel cuando el negocio quiera publicarlas.)

## Catálogo de siembra (13 productos)

Precios en pesos colombianos (COP). Todas las imágenes ya están en `public/` con el
nombre de archivo indicado.

| Producto | Categoría | Vehículo | Precio | Instalación | Imagen |
|---|---|---|---|---|---|
| Alarma Quality Audio Q-A3 | alarmas-carro | carro | 200.000 | 70.000 | `alarma-quality-audio-qa3.jpg` |
| Alarma Bluetooth Quality Audio Q-ABT | alarmas-carro | carro | 250.000 | 70.000 | `alarma-bluetooth-quality-audio-qabt.jpg` |
| Alarma Kenxon Universal 12V | alarmas-carro | universal | 180.000 | 70.000 | `alarma-kenxon-universal-12v.jpg` |
| Alarma Thunder RN09 TRF | alarmas-carro | carro | 380.000 | 70.000 | `alarma-thunder-rn09-trf.jpg` |
| Alarma Ultra UT5100 | alarmas-carro | carro | 380.000 | 70.000 | `alarma-ultra-ut5100.jpg` |
| Alarma Ultra UT4200 | alarmas-carro | carro | 330.000 | 70.000 | `alarma-ultra-ut4200.jpg` |
| Alarma para moto Némesis | alarmas-moto | moto | 330.000 | 60.000 | `alarma-moto-nemesis.jpg` |
| Alarma para moto Ultra XT21C+ | alarmas-moto | moto | 350.000 | 60.000 | `alarma-moto-ultra-xt21c.jpg` |
| Sistema de bloqueo central | bloqueo-central | carro | 185.000 | 90.000 | `sistema-bloqueo-central.jpg` |
| Bloqueo central de seguros Q-B4 | bloqueo-central | carro | 155.000 | 90.000 | `bloqueo-qb4.jpg` |
| Radio Android Quality Audio | radios | universal | 550.000 | 40.000 | `radio-android-quality-audio.jpg` |
| Radio Quality Audio 7" | radios | universal | 450.000 | 40.000 | `radio-quality-audio-7.jpg` |
| Radio sencillo MP3 | radios | universal | 180.000 | 30.000 | `radio-sencillo-mp3.jpg` |

Las viñetas de cada producto (features con ✅) se guardan en `description` como texto
con saltos de línea, y se renderizan como lista en la ficha de producto.

Los dos productos con garantía/detalles especiales:
- **Ultra UT5100**: incluye garantía oficial de 1 año, control de proximidad, componentes
  completos de instalación — se refleja como parte de la descripción.

## Tipo TypeScript (Fase 1, antes de Supabase)

```ts
export type VehicleType = 'carro' | 'moto' | 'universal'

export interface Product {
  id: string
  slug: string
  name: string
  categorySlug: string
  vehicleType: VehicleType
  price: number
  installPrice: number
  description: string[]   // bullets
  image: string            // ruta en /public
  featured?: boolean
}
```

Este tipo se usa igual en la Fase 1 (datos hardcodeados en `src/data/products.ts`) y en
la Fase 3 (mapeado desde la fila de Supabase), para que migrar de mock a base de datos
real sea un cambio de una sola función (`fetchProducts()`), no de toda la UI.
