-- Adds referential integrity for RAG evidence using Sentinel's stable external transaction identifier.
alter table public.sentinel_rag_retrievals
  add constraint sentinel_rag_retrievals_transaction_legacy_fkey
  foreign key (transaction_id) references public.sentinel_transactions(legacy_transaction_id) on delete restrict;

alter table public.sentinel_rag_citations
  add constraint sentinel_rag_citations_transaction_legacy_fkey
  foreign key (transaction_id) references public.sentinel_transactions(legacy_transaction_id) on delete restrict;
