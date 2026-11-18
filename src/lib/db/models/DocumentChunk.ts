import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * The Atlas Vector Search index is created in Atlas (not by Mongoose).
 * `verified` is denormalised from HealthDocument so the vector index can
 * pre-filter on it. Keep it in sync when an admin toggles verification.
 *
 * Index definition (Phase 10):
 * {
 *   "fields": [
 *     { "type": "vector", "path": "embedding", "numDimensions": 1536, "similarity": "cosine" },
 *     { "type": "filter", "path": "documentId" },
 *     { "type": "filter", "path": "verified" }
 *   ]
 * }
 */
const DocumentChunkSchema = new Schema(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "HealthDocument",
      required: true,
    },
    chunkIndex: { type: Number, required: true },
    text: { type: String, required: true },
    embedding: {
      type: [Number],
      required: true,
      validate: {
        validator: (v: number[]) => v.length === 1536,
        message: "embedding must have 1536 dimensions",
      },
      select: false,
    },
    tokenCount: { type: Number },
    verified: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
DocumentChunkSchema.index({ documentId: 1, chunkIndex: 1 });

export type DocumentChunkDoc = InferSchemaType<typeof DocumentChunkSchema>;
export const DocumentChunk: Model<DocumentChunkDoc> =
  (mongoose.models.DocumentChunk as Model<DocumentChunkDoc>) ||
  mongoose.model<DocumentChunkDoc>("DocumentChunk", DocumentChunkSchema);
