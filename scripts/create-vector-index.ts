/**
 * Creates the Atlas Vector Search index on DocumentChunks.
 * Run once against your Atlas cluster:  npm run vector:index
 * (Atlas Search indexes are not supported on local/community MongoDB.)
 */
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db/connect";
import { DocumentChunk } from "../src/lib/db/models/DocumentChunk";
import { VECTOR_INDEX_DEFINITION, VECTOR_INDEX_NAME } from "../src/lib/rag/vectorIndex";

async function main() {
  await connectDB();
  // Make sure the collection exists before creating a search index on it.
  await DocumentChunk.createCollection().catch(() => {});

  const existing = await DocumentChunk.collection.listSearchIndexes(VECTOR_INDEX_NAME).toArray();
  if (existing.length > 0) {
    const status = (existing[0] as { status?: string }).status ?? "unknown";
    console.log(`Index "${VECTOR_INDEX_NAME}" already exists (status: ${status}).`);
  } else {
    await DocumentChunk.collection.createSearchIndex({
      name: VECTOR_INDEX_NAME,
      type: "vectorSearch",
      definition: VECTOR_INDEX_DEFINITION as unknown as Record<string, unknown>,
    });
    console.log(`Index "${VECTOR_INDEX_NAME}" requested. Atlas builds it in the background (about a minute).`);
  }
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("Failed to create index:", err instanceof Error ? err.message : err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
