alter table public.sentinel_customers
  add column if not exists demo_identifier text;

create unique index if not exists sentinel_customers_demo_identifier_unique_idx
  on public.sentinel_customers(demo_identifier)
  where demo_identifier is not null;
