import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const CitedSourceSchema = new Schema(
  {
    documentId: { type: Schema.Types.ObjectId, ref: "HealthDocument" },
    sourceName: String,
    sourceUrl: String,
    chunkText: String,
  },
  { _id: false }
);

const MessageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
    citedSources: { type: [CitedSourceSchema], default: undefined },
    flaggedEmergency: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
MessageSchema.index({ conversationId: 1, createdAt: 1 });

export type MessageDoc = InferSchemaType<typeof MessageSchema>;
export const Message: Model<MessageDoc> =
  (mongoose.models.Message as Model<MessageDoc>) ||
  mongoose.model<MessageDoc>("Message", MessageSchema);
