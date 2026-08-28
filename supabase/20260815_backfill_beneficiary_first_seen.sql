-- Backfill the immutable first observed transfer timestamp for existing SentinelAI beneficiaries.
-- Source is the earliest linked SentinelAI transaction, with created_at only as a no-transaction fallback.
update public.sentinel_beneficiaries b
set first_seen_at = coalesce(
  b.first_seen_at,
  (
    select min(t.submitted_at)
    from public.sentinel_transactions t
    where t.beneficiary_id = b.id
  ),
  b.created_at
)
where b.source_system = 'sentinelai_runtime'
  and b.first_seen_at is null;
