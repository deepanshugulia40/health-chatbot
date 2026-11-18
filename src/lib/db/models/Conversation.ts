import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const ConversationSchema = new Schema(
  {
    // Null for guests (guest chats are not persisted anyway).
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    title: { type: String, trim: true, maxlength: 120 },
    language: { type: String, default: "en" },
  },
  { timestamps: true }
);
ConversationSchema.index({ userId: 1, updatedAt: -1 });

export type ConversationDoc = InferSchemaType<typeof ConversationSchema>;
export const Conversation: Model<ConversationDoc> =
  (mongoose.models.Conversation as Model<ConversationDoc>) ||
  mongoose.model<ConversationDoc>("Conversation", ConversationSchema);
