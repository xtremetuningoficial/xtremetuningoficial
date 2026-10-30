-- Correr UNA vez en Supabase → SQL Editor ANTES de publicar la versión con descuentos.
-- Es idempotente: se puede volver a correr sin problema.

alter table products add column if not exists discount_percent smallint not null default 0;
alter table products drop constraint if exists products_discount_percent_check;
alter table products add constraint products_discount_percent_check
  check (discount_percent between 0 and 90);
alter table products add column if not exists discount_ends_at timestamptz;
