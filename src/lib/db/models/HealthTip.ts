import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const HealthTipSchema = new Schema(
  {
    text: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    language: { type: String, default: "en" },
    activeDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export type HealthTipDoc = InferSchemaType<typeof HealthTipSchema>;
export const HealthTip: Model<HealthTipDoc> =
  (mongoose.models.HealthTip as Model<HealthTipDoc>) ||
  mongoose.model<HealthTipDoc>("HealthTip", HealthTipSchema);
