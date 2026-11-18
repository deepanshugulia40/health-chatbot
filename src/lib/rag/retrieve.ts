import "server-only";
import { connectDB } from "@/lib/db/connect";
import { DocumentChunk } from "@/lib/db/models/DocumentChunk";
import { HealthDocument } from "@/lib/db/models/HealthDocument";
import { embedQuery } from "@/lib/ai/embeddings";
import { VECTOR_INDEX_NAME } from "./vectorIndex";

export type RetrievedChunk = {
  chunkId: string;
  documentId: string;
  text: string;
  score: number;
  sourceName: string;
  sourceUrl: string;
};

export type RetrieveOptions = {
  topK?: number;
  /** Cosine similarity floor (0-1). Weak matches are dropped. */
  minScore?: number;
};

/**
 * RETRIEVAL_MODE=atlas (default): MongoDB Atlas Vector Search. Use in production.
 * RETRIEVAL_MODE=local: brute-force cosine similarity in Node. Works on any
 * MongoDB, meant for local development and small knowledge bases only.
 */
const retrievalMode = () => (process.env.RETRIEVAL_MODE === "local" ? "local" : "atlas");

const LOCAL_MAX_CHUNKS = 5000;

export async function retrieveChunks(query: string, opts: RetrieveOptions = {}): Promise<RetrievedChunk[]> {
  const { topK = 5, minScore = 0.3 } = opts;
  const queryVector = await embedQuery(query);
  await connectDB();

  const rows =
    retrievalMode() === "local"
      ? await searchLocal(queryVector, topK)
      : await searchAtlas(queryVector, topK);

  return rows.filter((r) => r.score >= minScore);
}

type Row = RetrievedChunk;

async function searchAtlas(queryVector: number[], topK: number): Promise<Row[]> {
  const rows = await DocumentChunk.aggregate<{
    _id: unknown;
    documentId: unknown;
    text: string;
    score: number;
    sourceName: string;
    sourceUrl: string;
  }>([
    {
      $vectorSearch: {
        index: VECTOR_INDEX_NAME,
        path: "embedding",
        queryVector,
        numCandidates: Math.max(100, topK * 20),
        limit: topK,
        filter: { verified: true },
      },
    },
    { $project: { text: 1, documentId: 1, score: { $meta: "vectorSearchScore" } } },
    { $lookup: { from: HealthDocument.collection.name, localField: "documentId", foreignField: "_id", as: "doc" } },
    { $unwind: "$doc" },
    // Second check against the source of truth in case chunk flags drifted.
    { $match: { "doc.verified": true } },
    {
      $project: {
        text: 1,
        documentId: 1,
        score: 1,
        sourceName: "$doc.sourceName",
        sourceUrl: "$doc.sourceUrl",
      },
    },
  ]);

  return rows.map((r) => ({
    chunkId: String(r._id),
    documentId: String(r.documentId),
    text: r.text,
    score: r.score,
    sourceName: r.sourceName,
    sourceUrl: r.sourceUrl,
  }));
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

async function searchLocal(queryVector: number[], topK: number): Promise<Row[]> {
  const chunks = await DocumentChunk.find({ verified: true })
    .select("+embedding text documentId")
    .limit(LOCAL_MAX_CHUNKS)
    .lean();

  const top = chunks
    .map((c) => ({ c, score: cosine(queryVector, c.embedding) }))
    .sort((x, y) => y.score - x.score)
    .slice(0, topK);
  if (top.length === 0) return [];

  // Same source-of-truth check as the Atlas path: the document must be verified.
  const docs = await HealthDocument.find({
    _id: { $in: [...new Set(top.map((t) => t.c.documentId))] },
    verified: true,
  })
    .select("sourceName sourceUrl")
    .lean();
  const byId = new Map(docs.map((d) => [String(d._id), d]));

  return top.flatMap(({ c, score }) => {
    const doc = byId.get(String(c.documentId));
    return doc
      ? [{ chunkId: String(c._id), documentId: String(c.documentId), text: c.text, score, sourceName: doc.sourceName, sourceUrl: doc.sourceUrl }]
      : [];
  });
}
