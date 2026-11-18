import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const TOPIC_CATEGORIES = [
  "disease",
  "nutrition",
  "hygiene",
  "vaccination",
  "govt-programme",
] as const;

const HealthTopicSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, enum: TOPIC_CATEGORIES, required: true, index: true },
    icon: { type: String, default: "heart-pulse" },
    summary: { type: String, required: true },
    /** Short label above the title, e.g. "Mosquito-borne". */
    kind: { type: String, default: "" },
    /** "At a glance" rows, e.g. { label: "Spread by", value: "Aedes mosquito" }. */
    glance: {
      type: [new Schema({ label: String, value: String }, { _id: false })],
      default: [],
    },
    overview: { type: String, default: "" },
    symptoms: { type: [String], default: [] },
    causes: { type: [String], default: [] },
    prevention: { type: [String], default: [] },
    whenToSeekHelp: { type: [String], default: [] },
    mythsVsFacts: {
      type: [new Schema({ myth: String, fact: String }, { _id: false })],
      default: [],
    },
    sourceRefs: {
      type: [new Schema({ sourceName: String, sourceUrl: String }, { _id: false })],
      default: [],
    },
    language: { type: String, default: "en" },
    viewCount: { type: Number, default: 0 },
    trending: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type HealthTopicDoc = InferSchemaType<typeof HealthTopicSchema>;
export const HealthTopic: Model<HealthTopicDoc> =
  (mongoose.models.HealthTopic as Model<HealthTopicDoc>) ||
  mongoose.model<HealthTopicDoc>("HealthTopic", HealthTopicSchema);
