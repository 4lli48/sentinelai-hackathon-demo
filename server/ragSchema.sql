-- SentinelAI RAG schema. This is intentionally isolated from operational
-- Sentinel tables: retrieval explains a frozen case but never influences it.
create extension if not exists vector with schema extensions;

create table if not exists public.sentinel_rag_documents (
  id text primary key,
  authority text not null,
  title_ar text not null,
  title_en text not null,
  official_url text not null,
  source_version text not null,
  source_hash text not null unique,
  language text not null check (language in ('ar', 'en', 'bilingual')),
  scope text not null default 'reference_context',
  status text not null default 'approved' check (status in ('draft', 'approved', 'retired')),
  fetched_at timestamptz not null,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.sentinel_rag_chunks (
  id text primary key,
  document_id text not null references public.sentinel_rag_documents(id) on delete restrict,
  chunk_index integer not null check (chunk_index >= 0),
  language text not null check (language in ('ar', 'en')),
  section_title text not null,
  content text not null,
  content_hash text not null,
  embedding extensions.vector(768) not null,
  embedding_model text not null,
  created_at timestamptz not null default now(),
  unique(document_id, chunk_index),
  unique(document_id, content_hash)
);

create table if not exists public.sentinel_rag_retrievals (
  id text primary key,
  transaction_id text not null references public.sentinel_transactions(legacy_transaction_id) on delete restrict,
  snapshot_id text not null,
  query_kind text not null check (query_kind in ('report', 'chat')),
  query_hash text not null,
  chunk_ids jsonb not null,
  scores jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.sentinel_rag_citations (
  id text primary key,
  retrieval_id text not null references public.sentinel_rag_retrievals(id) on delete cascade,
  transaction_id text not null references public.sentinel_transactions(legacy_transaction_id) on delete restrict,
  snapshot_id text not null,
  response_kind text not null check (response_kind in ('report', 'chat')),
  chunk_id text not null references public.sentinel_rag_chunks(id) on delete restrict,
  claim_label text not null,
  created_at timestamptz not null default now()
);

create index if not exists sentinel_rag_chunks_document_idx on public.sentinel_rag_chunks(document_id, chunk_index);
create index if not exists sentinel_rag_retrievals_case_idx on public.sentinel_rag_retrievals(transaction_id, snapshot_id, created_at desc);
create index if not exists sentinel_rag_citations_case_idx on public.sentinel_rag_citations(transaction_id, snapshot_id, created_at desc);

alter table public.sentinel_rag_documents enable row level security;
alter table public.sentinel_rag_chunks enable row level security;
alter table public.sentinel_rag_retrievals enable row level security;
alter table public.sentinel_rag_citations enable row level security;

create or replace function public.sentinel_rag_match_chunks(
  query_embedding extensions.vector(768),
  match_count integer default 3,
  match_threshold double precision default 0.50,
  requested_language text default null
)
returns table (
  chunk_id text,
  document_id text,
  authority text,
  title_ar text,
  title_en text,
  official_url text,
  language text,
  section_title text,
  content text,
  similarity double precision
)
language sql
stable
set search_path = public, extensions
as $$
  select
    chunk.id,
    document.id,
    document.authority,
    document.title_ar,
    document.title_en,
    document.official_url,
    chunk.language,
    chunk.section_title,
    chunk.content,
    1 - (chunk.embedding <=> query_embedding) as similarity
  from public.sentinel_rag_chunks as chunk
  join public.sentinel_rag_documents as document on document.id = chunk.document_id
  where document.status = 'approved'
    and (requested_language is null or chunk.language = requested_language or document.language = 'bilingual')
    and 1 - (chunk.embedding <=> query_embedding) >= match_threshold
  order by chunk.embedding <=> query_embedding
  limit least(greatest(match_count, 1), 3);
$$;
