alter table public.sentinel_analysis_runs
  add column if not exists result_payload jsonb;
