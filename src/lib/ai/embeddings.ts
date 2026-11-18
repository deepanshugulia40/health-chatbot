import "server-only";
import { EMBEDDING_MODEL, getOpenAI } from "./openai";

export const EMBEDDING_DIMENSIONS = 1536; // text-embedding-3-small
const BATCH_SIZE = 64;

/** Embeds many texts, batching requests. Output order matches input order. */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const client = getOpenAI();
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const res = await client.embeddings.create({ model: EMBEDDING_MODEL(),
      input: batch,
      // Keep vectors at the size the Atlas index expects, whichever provider is used.
      dimensions: EMBEDDING_DIMENSIONS,
    });
    const sorted = [...res.data].sort((a, b) => a.index - b.index);
    if (sorted.length !== batch.length) throw new Error("Embedding response size mismatch");
    for (const d of sorted) {
      if (d.embedding.length !== EMBEDDING_DIMENSIONS) {
        throw new Error(`Unexpected embedding size ${d.embedding.length} (expected ${EMBEDDING_DIMENSIONS})`);
      }
      out.push(d.embedding);
    }
  }
  return out;
}

export async function embedQuery(query: string): Promise<number[]> {
  const [vector] = await embedTexts([query]);
  return vector;
}
