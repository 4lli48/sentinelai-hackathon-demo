-- Retrieves a broader candidate pool before application-level authority diversification.
-- The interface still renders at most three citations, each required to meet its relevance threshold.
CREATE OR REPLACE FUNCTION public.sentinel_rag_match_chunks(
  query_embedding vector,
  match_count integer DEFAULT 3,
  match_threshold double precision DEFAULT 0.50,
  requested_language text DEFAULT NULL
)
RETURNS TABLE(
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
LANGUAGE sql
STABLE
SET search_path TO 'public', 'extensions'
AS $$
  SELECT
    chunk.id,
    document.id,
    document.authority,
    document.title_ar,
    document.title_en,
    document.official_url,
    chunk.language,
    chunk.section_title,
    chunk.content,
    1 - (chunk.embedding <=> query_embedding) AS similarity
  FROM public.sentinel_rag_chunks AS chunk
  JOIN public.sentinel_rag_documents AS document ON document.id = chunk.document_id
  WHERE document.status = 'approved'
    AND (requested_language IS NULL OR chunk.language = requested_language OR document.language = 'bilingual')
    AND 1 - (chunk.embedding <=> query_embedding) >= match_threshold
  ORDER BY chunk.embedding <=> query_embedding
  LIMIT LEAST(GREATEST(match_count, 1), 8);
$$;
