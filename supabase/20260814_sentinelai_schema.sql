-- SentinelAI persistence schema.
-- These tables are intentionally namespaced with sentinel_ and do not alter AImoney tables.

create table public.sentinel_customers (
  id uuid primary key default gen_random_uuid(),
  legacy_customer_id text unique,
  demo_identifier text unique,
  display_name text not null,
  risk_history_flag boolean not null default false,
  source_system text not null default 'sentinelai',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.sentinel_customer_history (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null unique references public.sentinel_customers(id) on delete cascade,
  avg_transfer_amount numeric(18,2),
  transaction_count integer not null default 0,
  previous_countries jsonb not null default '[]'::jsonb,
  previous_beneficiary_ids jsonb not null default '[]'::jsonb,
  usual_transfer_time_window text,
  past_risk_flags jsonb not null default '[]'::jsonb,
  past_alert_ids jsonb not null default '[]'::jsonb,
  home_city text,
  source_system text not null default 'sentinelai',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.sentinel_beneficiaries (
  id uuid primary key default gen_random_uuid(),
  legacy_beneficiary_id text unique,
  display_name text not null,
  account_ref text,
  country text,
  is_known_to_customer boolean not null default false,
  trust_score numeric(5,2),
  first_seen_at timestamptz,
  source_system text not null default 'sentinelai',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.sentinel_websites (
  id uuid primary key default gen_random_uuid(),
  legacy_website_id text unique,
  domain text not null unique,
  reputation_score numeric(5,2),
  phishing_flag boolean not null default false,
  ssl_valid boolean,
  domain_age_days integer,
  similarity_to_known_brand numeric(5,2),
  legitimacy_verdict text,
  reasoning_text text,
  sources jsonb not null default '[]'::jsonb,
  source_system text not null default 'sentinelai',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.sentinel_transactions (
  id uuid primary key default gen_random_uuid(),
  legacy_transaction_id text unique,
  customer_id uuid not null references public.sentinel_customers(id) on delete restrict,
  beneficiary_id uuid references public.sentinel_beneficiaries(id) on delete set null,
  website_id uuid references public.sentinel_websites(id) on delete set null,
  amount numeric(18,2) not null check (amount >= 0),
  currency text not null,
  destination_country text,
  transaction_type text,
  status text,
  submitted_at timestamptz,
  source_system text not null default 'sentinelai',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index sentinel_transactions_customer_submitted_idx
  on public.sentinel_transactions(customer_id, submitted_at desc);

create index if not exists sentinel_transactions_beneficiary_idx
  on public.sentinel_transactions(beneficiary_id)
  where beneficiary_id is not null;

create index if not exists sentinel_transactions_website_idx
  on public.sentinel_transactions(website_id)
  where website_id is not null;

create table public.sentinel_analysis_runs (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.sentinel_transactions(id) on delete cascade,
  engine_version text not null default 'sentinel-v1',
  score integer not null check (score between 0 and 100),
  risk_level text not null,
  decision text not null,
  risk_factors jsonb not null default '[]'::jsonb,
  stage_trace jsonb not null default '[]'::jsonb,
  ml_advisory jsonb,
  decision_snapshot jsonb not null,
  analyzed_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create index sentinel_analysis_runs_transaction_created_idx
  on public.sentinel_analysis_runs(transaction_id, created_at desc);

create table public.sentinel_cases (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null unique references public.sentinel_transactions(id) on delete cascade,
  status text not null default 'open',
  assigned_to text,
  notes text,
  opened_at timestamptz not null default timezone('utc', now()),
  closed_at timestamptz
);

create table public.sentinel_alerts (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.sentinel_transactions(id) on delete cascade,
  analysis_run_id uuid references public.sentinel_analysis_runs(id) on delete set null,
  severity text not null,
  alert_type text not null,
  status text not null default 'open',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  resolved_at timestamptz
);

create table public.sentinel_ai_reports (
  id uuid primary key default gen_random_uuid(),
  analysis_run_id uuid not null unique references public.sentinel_analysis_runs(id) on delete cascade,
  model_source text not null,
  status text not null,
  report_payload jsonb not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.sentinel_ai_messages (
  id uuid primary key default gen_random_uuid(),
  analysis_run_id uuid not null references public.sentinel_analysis_runs(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  model_source text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index sentinel_ai_messages_run_created_idx
  on public.sentinel_ai_messages(analysis_run_id, created_at asc);

create index if not exists sentinel_alerts_transaction_idx
  on public.sentinel_alerts(transaction_id);

create index if not exists sentinel_alerts_analysis_run_idx
  on public.sentinel_alerts(analysis_run_id)
  where analysis_run_id is not null;

alter table public.sentinel_customers enable row level security;
alter table public.sentinel_customer_history enable row level security;
alter table public.sentinel_beneficiaries enable row level security;
alter table public.sentinel_websites enable row level security;
alter table public.sentinel_transactions enable row level security;
alter table public.sentinel_analysis_runs enable row level security;
alter table public.sentinel_cases enable row level security;
alter table public.sentinel_alerts enable row level security;
alter table public.sentinel_ai_reports enable row level security;
alter table public.sentinel_ai_messages enable row level security;
