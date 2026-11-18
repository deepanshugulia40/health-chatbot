import { connectDB } from "@/lib/db/connect";
import { DocumentChunk } from "@/lib/db/models/DocumentChunk";
import { HealthDocument } from "@/lib/db/models/HealthDocument";
import { embedTexts } from "@/lib/ai/embeddings";
import { chunkText, cleanText, estimateTokens } from "./chunk";
import { extractPages, type FileKind } from "./extract";

const MIN_TEXT_CHARS = 200;

/** Errors we choose to show admins verbatim. Everything else gets a generic message. */
class IngestError extends Error {}

/**
 * extract -> clean -> chunk -> embed -> store, then mark the document processed.
 * Never throws: failures are recorded on the HealthDocument as status "failed".
 */
export async function ingestDocument(documentId: string, buffer: Buffer, kind: FileKind): Promise<void> {
  try {
    await connectDB();
    const doc = await HealthDocument.findById(documentId).select("verified").lean();
    if (!doc) return;

    const text = cleanText(await extractPages(buffer, kind));
    if (text.length < MIN_TEXT_CHARS) {
      throw new IngestError("No readable text found. Scanned PDFs need OCR before upload.");
    }

    const chunks = chunkText(text);
    const embeddings = await embedTexts(chunks);

    // Replace any earlier chunks (re-ingestion) in one go.
    await DocumentChunk.deleteMany({ documentId });
    await DocumentChunk.insertMany(
      chunks.map((t, i) => ({
        documentId,
        chunkIndex: i,
        text: t,
        embedding: embeddings[i],
        tokenCount: estimateTokens(t),
        verified: doc.verified,
      }))
    );

    await HealthDocument.updateOne(
      { _id: documentId },
      { $set: { status: "processed", chunkCount: chunks.length }, $unset: { errorMessage: "" } }
    );
  } catch (err) {
    console.error("[ingest] failed:", documentId, err instanceof Error ? err.message : err);
    const message = err instanceof IngestError ? err.message : "Processing failed. Check the server logs and try again.";
    try {
      await DocumentChunk.deleteMany({ documentId });
      await HealthDocument.updateOne(
        { _id: documentId },
        { $set: { status: "failed", chunkCount: 0, errorMessage: message } }
      );
    } catch {
      /* DB unavailable: nothing more we can do */
    }
  }
}
