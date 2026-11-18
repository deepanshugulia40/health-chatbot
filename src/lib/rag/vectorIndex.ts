export const VECTOR_INDEX_NAME = "chunk_vector_index";

/** Atlas Vector Search index definition for DocumentChunks (PLAN.md 7.5). */
export const VECTOR_INDEX_DEFINITION = {
  fields: [
    { type: "vector", path: "embedding", numDimensions: 1536, similarity: "cosine" },
    { type: "filter", path: "documentId" },
    { type: "filter", path: "verified" },
  ],
} as const;
