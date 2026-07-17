-- Xtreme Tuning — esquema inicial (Fase 2)
-- Cómo aplicarlo: pega este archivo completo en el SQL Editor de tu proyecto
-- de Supabase (https://app.supabase.com/project/_/sql) y ejecútalo una vez.
-- Es idempotente: se puede volver a correr sin duplicar nada.

create extension if not exists pgcrypto;

-- ── Tablas ──────────────────────────────────────────────────────────────

create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  sort_order  int not null default 0
);

create table if not exists products (
  id              uuid primary key default gen_random_uuid(),
  category_id     uuid references categories(id),
  name            text not null,
  slug            text not null unique,
  description     text,
  price           numeric(12, 0) not null,
  install_price   numeric(12, 0),
  stock_quantity  int not null default 0,
  is_active       boolean not null default true,
  is_featured     boolean not null default false,
  vehicle_type    text check (vehicle_type in ('carro', 'moto', 'universal')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  url         text not null,
  sort_order  int not null default 0,
  media_type  text not null default 'image' check (media_type in ('image', 'video'))
);

-- Columna agregada después del lanzamiento inicial (galería de hasta 3
-- fotos/videos por producto) — el "if not exists" hace que sea seguro
-- volver a correr este script en una base de datos que ya tenía la tabla.
alter table product_images add column if not exists media_type text not null default 'image';
alter table product_images drop constraint if exists product_images_media_type_check;
alter table product_images add constraint product_images_media_type_check check (media_type in ('image', 'video'));

create table if not exists inventory_movements (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id),
  change      int not null,
  reason      text not null check (reason in ('venta_tienda', 'ingreso_mercancia', 'ajuste', 'venta_online')),
  note        text,
  created_at  timestamptz not null default now()
);

-- ── updated_at automático en products ──────────────────────────────────

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_set_updated_at on products;
create trigger products_set_updated_at
  before update on products
  for each row execute function set_updated_at();

-- ── Row Level Security ──────────────────────────────────────────────────
-- Regla general: lectura pública de lo que un visitante debe poder ver,
-- escritura solo para usuarios autenticados (el panel admin de la Fase 5).

alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table inventory_movements enable row level security;

drop policy if exists "categories_public_read" on categories;
create policy "categories_public_read" on categories
  for select using (true);

drop policy if exists "categories_admin_all" on categories;
create policy "categories_admin_all" on categories
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "products_public_read" on products;
create policy "products_public_read" on products
  for select using (is_active = true);

drop policy if exists "products_admin_all" on products;
create policy "products_admin_all" on products
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "product_images_public_read" on product_images;
create policy "product_images_public_read" on product_images
  for select using (true);

drop policy if exists "product_images_admin_all" on product_images;
create policy "product_images_admin_all" on product_images
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- inventory_movements: sin lectura ni escritura pública, solo admin.
drop policy if exists "inventory_movements_admin_all" on inventory_movements;
create policy "inventory_movements_admin_all" on inventory_movements
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ── Storage: bucket de imágenes de producto ─────────────────────────────

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product_images_bucket_public_read" on storage.objects;
create policy "product_images_bucket_public_read" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "product_images_bucket_admin_write" on storage.objects;
create policy "product_images_bucket_admin_write" on storage.objects
  for insert with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

drop policy if exists "product_images_bucket_admin_update" on storage.objects;
create policy "product_images_bucket_admin_update" on storage.objects
  for update using (bucket_id = 'product-images' and auth.role() = 'authenticated');

drop policy if exists "product_images_bucket_admin_delete" on storage.objects;
create policy "product_images_bucket_admin_delete" on storage.objects
  for delete using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- ── Ajuste de inventario (Fase 6) ────────────────────────────────────────
-- Registra el movimiento y actualiza products.stock_quantity en una sola
-- transacción atómica: si el stock quedaría negativo, se revierte todo.

create or replace function adjust_product_stock(
  p_product_id uuid,
  p_change int,
  p_reason text,
  p_note text default null
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  new_stock int;
begin
  if auth.role() <> 'authenticated' then
    raise exception 'No autorizado';
  end if;

  insert into inventory_movements (product_id, change, reason, note)
  values (p_product_id, p_change, p_reason, p_note);

  update products
  set stock_quantity = stock_quantity + p_change
  where id = p_product_id
  returning stock_quantity into new_stock;

  if new_stock is null then
    raise exception 'Producto no encontrado';
  end if;

  if new_stock < 0 then
    raise exception 'El stock no puede quedar negativo';
  end if;

  return new_stock;
end;
$$;

revoke execute on function adjust_product_stock(uuid, int, text, text) from anon;
grant execute on function adjust_product_stock(uuid, int, text, text) to authenticated;

-- ── Calificaciones y reseñas ─────────────────────────────────────────────
-- target_type='site' cubre la experiencia general (tienda + servicio);
-- target_type='product' califica un producto puntual del catálogo.
-- Toda reseña nueva entra con is_approved=false y solo se ve públicamente
-- una vez que el admin la aprueba desde el panel.

create table if not exists reviews (
  id            uuid primary key default gen_random_uuid(),
  target_type   text not null check (target_type in ('site', 'product')),
  product_id    uuid references products(id) on delete cascade,
  rating        int not null check (rating between 1 and 5),
  author_name   text not null,
  comment       text,
  is_approved   boolean not null default false,
  created_at    timestamptz not null default now(),
  constraint reviews_product_id_matches_target check (
    (target_type = 'product' and product_id is not null) or
    (target_type = 'site' and product_id is null)
  )
);

alter table reviews enable row level security;

drop policy if exists "reviews_public_read_approved" on reviews;
create policy "reviews_public_read_approved" on reviews
  for select using (is_approved = true);

drop policy if exists "reviews_public_insert" on reviews;
create policy "reviews_public_insert" on reviews
  for insert with check (is_approved = false);

drop policy if exists "reviews_admin_all" on reviews;
create policy "reviews_admin_all" on reviews
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
