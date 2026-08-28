export type RagCitation = {
  chunkId: string;
  documentId: string;
  authority: "SAMA" | "FATF" | "SDAIA";
  titleAr: string;
  titleEn: string;
  officialUrl: string;
  sectionTitle: string;
  excerpt: string;
  similarity: number;
};

export type RagGrounding = {
  status: "grounded" | "not_found" | "unavailable";
  queryKind: "report" | "chat";
  citations: RagCitation[];
  retrievedAt: string;
};
