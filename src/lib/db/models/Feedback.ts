import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const FeedbackSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    messageId: { type: Schema.Types.ObjectId, ref: "Message", required: true },
    rating: { type: String, enum: ["up", "down"], required: true },
    comment: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
FeedbackSchema.index({ messageId: 1 });

export type FeedbackDoc = InferSchemaType<typeof FeedbackSchema>;
export const Feedback: Model<FeedbackDoc> =
  (mongoose.models.Feedback as Model<FeedbackDoc>) ||
  mongoose.model<FeedbackDoc>("Feedback", FeedbackSchema);
