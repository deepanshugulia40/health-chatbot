import "server-only";
import { connectDB } from "@/lib/db/connect";
import { AwarenessCampaign } from "@/lib/db/models/AwarenessCampaign";
import { Conversation } from "@/lib/db/models/Conversation";
import { DocumentChunk } from "@/lib/db/models/DocumentChunk";
import { Feedback } from "@/lib/db/models/Feedback";
import { HealthDocument } from "@/lib/db/models/HealthDocument";
import { HealthTip } from "@/lib/db/models/HealthTip";
import { HealthTopic } from "@/lib/db/models/HealthTopic";
import { Message } from "@/lib/db/models/Message";
import { User } from "@/lib/db/models/User";

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
const iso = (d: Date | undefined | null) => (d ? new Date(d).toISOString() : null);

/* ------------------------------ Stats ------------------------------ */

export type AdminStats = {
  users: number;
  conversations: number;
  userQuestions: number;
  emergencyFlags: number;
  documents: { total: number; verified: number; awaitingVerification: number; pending: number; failed: number; stale: number };
  searchableChunks: number;
  content: { topics: number; tips: number; activeCampaigns: number };
  feedback: { up: number; down: number };
  attention: { id: string; title: string; reason: string }[];
};

export async function getAdminStats(): Promise<AdminStats> {
  await connectDB();
  const now = new Date();
  const staleBefore = new Date(now.getTime() - ONE_YEAR_MS);

  const [
    users,
    conversations,
    userQuestions,
    emergencyFlags,
    docTotal,
    docVerified,
    docAwaiting,
    docPending,
    docFailed,
    searchableChunks,
    topics,
    tips,
    activeCampaigns,
    up,
    down,
    docs,
  ] = await Promise.all([
    User.countDocuments(),
    Conversation.countDocuments(),
    Message.countDocuments({ role: "user" }),
    Message.countDocuments({ flaggedEmergency: true }),
    HealthDocument.countDocuments(),
    HealthDocument.countDocuments({ verified: true }),
    HealthDocument.countDocuments({ status: "processed", verified: false }),
    HealthDocument.countDocuments({ status: "pending" }),
    HealthDocument.countDocuments({ status: "failed" }),
    DocumentChunk.countDocuments({ verified: true }),
    HealthTopic.countDocuments(),
    HealthTip.countDocuments(),
    AwarenessCampaign.countDocuments({ active: true, endDate: { $gte: now } }),
    Feedback.countDocuments({ rating: "up" }),
    Feedback.countDocuments({ rating: "down" }),
    HealthDocument.find({
      $or: [{ status: "failed" }, { status: "processed", verified: false }, { verified: true }],
    })
      .select("title status verified publishedDate createdAt errorMessage")
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const attention: AdminStats["attention"] = [];
  let stale = 0;
  for (const d of docs) {
    const id = String(d._id);
    if (d.status === "failed") {
      attention.push({ id, title: d.title, reason: d.errorMessage ? `Processing failed: ${d.errorMessage}` : "Processing failed" });
    } else if (d.status === "processed" && !d.verified) {
      attention.push({ id, title: d.title, reason: "Processed and waiting for your verification" });
    } else if (d.verified && new Date(d.publishedDate ?? d.createdAt) < staleBefore) {
      stale += 1;
      attention.push({ id, title: d.title, reason: "Older than 12 months, consider re-checking the source" });
    }
  }

  return {
    users,
    conversations,
    userQuestions,
    emergencyFlags,
    documents: { total: docTotal, verified: docVerified, awaitingVerification: docAwaiting, pending: docPending, failed: docFailed, stale },
    searchableChunks,
    content: { topics, tips, activeCampaigns },
    feedback: { up, down },
    attention: attention.slice(0, 8),
  };
}

/* ---------------------------- Documents ---------------------------- */

export type AdminDocument = {
  id: string;
  title: string;
  sourceName: string;
  sourceUrl: string;
  topicTags: string[];
  status: "pending" | "processed" | "failed";
  verified: boolean;
  chunkCount: number;
  errorMessage: string | null;
  createdAt: string;
  needsReview: boolean;
};

export async function listDocuments(): Promise<AdminDocument[]> {
  await connectDB();
  const docs = await HealthDocument.find().sort({ createdAt: -1 }).lean();
  const now = Date.now();
  return docs.map((d) => ({
    id: String(d._id),
    title: d.title,
    sourceName: d.sourceName,
    sourceUrl: d.sourceUrl,
    topicTags: d.topicTags ?? [],
    status: d.status,
    verified: d.verified,
    chunkCount: d.chunkCount ?? 0,
    errorMessage: d.errorMessage ?? null,
    createdAt: iso(d.createdAt) ?? "",
    needsReview: now - new Date(d.publishedDate ?? d.createdAt).getTime() > ONE_YEAR_MS,
  }));
}

/* ------------------------------ Topics ----------------------------- */

export type AdminTopic = {
  id: string;
  name: string;
  slug: string;
  category: string;
  icon: string;
  summary: string;
  kind: string;
  glance: { label: string; value: string }[];
  overview: string;
  symptoms: string[];
  causes: string[];
  prevention: string[];
  whenToSeekHelp: string[];
  mythsVsFacts: { myth: string; fact: string }[];
  sourceRefs: { sourceName: string; sourceUrl: string }[];
  language: string;
  trending: boolean;
};

export async function listTopics(): Promise<AdminTopic[]> {
  await connectDB();
  const docs = await HealthTopic.find().sort({ name: 1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    name: d.name,
    slug: d.slug,
    category: d.category,
    icon: d.icon ?? "heart-pulse",
    summary: d.summary,
    kind: d.kind ?? "",
    glance: (d.glance ?? []).map((g) => ({ label: g.label ?? "", value: g.value ?? "" })),
    overview: d.overview ?? "",
    symptoms: d.symptoms ?? [],
    causes: d.causes ?? [],
    prevention: d.prevention ?? [],
    whenToSeekHelp: d.whenToSeekHelp ?? [],
    mythsVsFacts: (d.mythsVsFacts ?? []).map((m) => ({ myth: m.myth ?? "", fact: m.fact ?? "" })),
    sourceRefs: (d.sourceRefs ?? []).map((s) => ({ sourceName: s.sourceName ?? "", sourceUrl: s.sourceUrl ?? "" })),
    language: d.language ?? "en",
    trending: d.trending ?? false,
  }));
}

/* ------------------------------- Tips ------------------------------ */

export type AdminTip = { id: string; text: string; category: string; language: string };

export async function listTips(): Promise<AdminTip[]> {
  await connectDB();
  const docs = await HealthTip.find().sort({ category: 1, _id: 1 }).lean();
  return docs.map((d) => ({ id: String(d._id), text: d.text, category: d.category, language: d.language ?? "en" }));
}

/* ----------------------------- Campaigns --------------------------- */

export type AdminCampaign = {
  id: string;
  title: string;
  description: string;
  topicTags: string[];
  startDate: string;
  endDate: string;
  active: boolean;
  bannerImageUrl: string;
};

export async function listCampaigns(): Promise<AdminCampaign[]> {
  await connectDB();
  const docs = await AwarenessCampaign.find().sort({ startDate: -1 }).lean();
  return docs.map((d) => ({
    id: String(d._id),
    title: d.title,
    description: d.description,
    topicTags: d.topicTags ?? [],
    startDate: iso(d.startDate) ?? "",
    endDate: iso(d.endDate) ?? "",
    active: d.active ?? true,
    bannerImageUrl: d.bannerImageUrl ?? "",
  }));
}

/* ----------------------------- Feedback ---------------------------- */

export type AdminFeedback = {
  id: string;
  rating: "up" | "down";
  comment: string | null;
  createdAt: string;
  question: string | null;
  answer: string | null;
  sources: string[];
};

const FEEDBACK_LIMIT = 100;

/**
 * Recent feedback with the rated answer and the question that led to it.
 * Deliberately shows no user identity: admins review answer quality, not people.
 */
export async function listFeedback(rating?: "up" | "down"): Promise<AdminFeedback[]> {
  await connectDB();
  const rows = await Feedback.find(rating ? { rating } : {})
    .sort({ createdAt: -1 })
    .limit(FEEDBACK_LIMIT)
    .lean();
  if (rows.length === 0) return [];

  const answers = await Message.find({ _id: { $in: rows.map((r) => r.messageId) } }).lean();
  const answerById = new Map(answers.map((m) => [String(m._id), m]));

  const userMsgs = await Message.find({
    conversationId: { $in: [...new Set(answers.map((m) => String(m.conversationId)))] },
    role: "user",
  })
    .select("conversationId content createdAt")
    .sort({ createdAt: 1 })
    .lean();
  const questionsByConvo = new Map<string, { content: string; createdAt: Date }[]>();
  for (const m of userMsgs) {
    const key = String(m.conversationId);
    const list = questionsByConvo.get(key) ?? [];
    list.push({ content: m.content, createdAt: m.createdAt });
    questionsByConvo.set(key, list);
  }

  return rows.map((r) => {
    const answer = answerById.get(String(r.messageId));
    let question: string | null = null;
    if (answer) {
      const earlier = (questionsByConvo.get(String(answer.conversationId)) ?? []).filter(
        (q) => q.createdAt <= answer.createdAt
      );
      question = earlier.at(-1)?.content ?? null;
    }
    return {
      id: String(r._id),
      rating: r.rating,
      comment: r.comment ?? null,
      createdAt: iso(r.createdAt) ?? "",
      question,
      answer: answer?.content ?? null,
      sources: (answer?.citedSources ?? []).map((s) => s.sourceName ?? "").filter(Boolean),
    };
  });
}
