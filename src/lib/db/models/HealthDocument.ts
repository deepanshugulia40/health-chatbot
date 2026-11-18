import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const HealthDocumentSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    sourceName: { type: String, required: true, trim: true }, // e.g. "WHO"
    sourceUrl: { type: String, required: true, trim: true },
    fileUrl: { type: String },
    topicTags: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["pending", "processed", "failed"],
      default: "pending",
      required: true,
    },
    // Chunks are only searchable once an admin verifies the document.
    verified: { type: Boolean, default: false, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    publishedDate: { type: Date },
    needsReview: { type: Boolean, default: false },
    fileName: { type: String },
    chunkCount: { type: Number, default: 0 },
    errorMessage: { type: String },
  },
  { timestamps: true }
);
HealthDocumentSchema.index({ verified: 1, status: 1 });

export type HealthDocumentDoc = InferSchemaType<typeof HealthDocumentSchema>;
export const HealthDocument: Model<HealthDocumentDoc> =
  (mongoose.models.HealthDocument as Model<HealthDocumentDoc>) ||
  mongoose.model<HealthDocumentDoc>("HealthDocument", HealthDocumentSchema);
