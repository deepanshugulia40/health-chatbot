import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const AwarenessCampaignSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    topicTags: { type: [String], default: [] },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    active: { type: Boolean, default: true },
    bannerImageUrl: { type: String },
  },
  { timestamps: true }
);
AwarenessCampaignSchema.index({ active: 1, startDate: 1, endDate: 1 });

export type AwarenessCampaignDoc = InferSchemaType<typeof AwarenessCampaignSchema>;
export const AwarenessCampaign: Model<AwarenessCampaignDoc> =
  (mongoose.models.AwarenessCampaign as Model<AwarenessCampaignDoc>) ||
  mongoose.model<AwarenessCampaignDoc>("AwarenessCampaign", AwarenessCampaignSchema);
