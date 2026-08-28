import { ensureRagCorpus } from "./sentinelRag";

async function main() {
  await ensureRagCorpus();
  console.log("Sentinel RAG corpus is ready.");
}

void main();
