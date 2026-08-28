-- SentinelAI-only indexes discovered during the consistency audit.
-- These improve lookup paths without altering AImoney tables or source data.

create index if not exists sentinel_transactions_beneficiary_idx
  on public.sentinel_transactions(beneficiary_id)
  where beneficiary_id is not null;

create index if not exists sentinel_transactions_website_idx
  on public.sentinel_transactions(website_id)
  where website_id is not null;

create index if not exists sentinel_alerts_transaction_idx
  on public.sentinel_alerts(transaction_id);

create index if not exists sentinel_alerts_analysis_run_idx
  on public.sentinel_alerts(analysis_run_id)
  where analysis_run_id is not null;
