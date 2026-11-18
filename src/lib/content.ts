import "server-only";
import { connectDB } from "@/lib/db/connect";
import { HealthTopic } from "@/lib/db/models/HealthTopic";
import { HealthTip } from "@/lib/db/models/HealthTip";
import { AwarenessCampaign } from "@/lib/db/models/AwarenessCampaign";

export type TopicSummary = {
  slug: string;
  name: string;
  category: string;
  icon: string;
  summary: string;
};

export type TopicDetail = TopicSummary & {
  kind: string;
  glance: { label: string; value: string }[];
  overview: string;
  symptoms: string[];
  causes: string[];
  prevention: string[];
  whenToSeekHelp: string[];
  mythsVsFacts: { myth: string; fact: string }[];
  sourceRefs: { sourceName: string; sourceUrl: string }[];
};

export type Tip = { id: string; text: string; category: string };

export type Campaign = {
  id: string;
  title: string;
  description: string;
  topicTags: string[];
  startDate: string;
  endDate: string;
  status: "ongoing" | "upcoming";
};

/** Result wrapper so pages can show a friendly message if the DB is down. */
export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

async function safe<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    await connectDB();
    return { ok: true, data: await fn() };
  } catch (err) {
    console.error("[content] query failed:", err instanceof Error ? err.message : err);
    return { ok: false, error: "Content is temporarily unavailable." };
  }
}

export function getTopics(opts: { category?: string; language?: string } = {}) {
  return safe<TopicSummary[]>(async () => {
    const filter: Record<string, string> = { language: opts.language ?? "en" };
    if (opts.category) filter.category = opts.category;
    const docs = await HealthTopic.find(filter)
      .select("slug name category icon summary")
      .sort({ name: 1 })
      .lean();
    return docs.map((d) => ({
      slug: d.slug,
      name: d.name,
      category: d.category,
      icon: d.icon ?? "heart-pulse",
      summary: d.summary,
    }));
  });
}

export function getTopicBySlug(slug: string) {
  return safe<TopicDetail | null>(async () => {
    const d = await HealthTopic.findOne({ slug: slug.toLowerCase() }).lean();
    if (!d) return null;
    return {
      slug: d.slug,
      name: d.name,
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
      mythsVsFacts: (d.mythsVsFacts ?? []).map((m) => ({
        myth: m.myth ?? "",
        fact: m.fact ?? "",
      })),
      sourceRefs: (d.sourceRefs ?? []).map((s) => ({
        sourceName: s.sourceName ?? "",
        sourceUrl: s.sourceUrl ?? "",
      })),
    };
  });
}

/** Days since the Unix epoch in UTC. Same for everyone on a given date. */
function dayNumber(date = new Date()) {
  return Math.floor(date.getTime() / 86_400_000);
}

/** One tip per day, chosen deterministically so refreshes show the same tip. */
export function getTipOfTheDay(language = "en") {
  return safe<Tip | null>(async () => {
    const tips = await HealthTip.find({ language }).sort({ _id: 1 }).lean();
    if (tips.length === 0) return null;
    const t = tips[dayNumber() % tips.length];
    return { id: String(t._id), text: t.text, category: t.category };
  });
}

export function getTips(opts: { category?: string; language?: string } = {}) {
  return safe<Tip[]>(async () => {
    const filter: Record<string, string> = { language: opts.language ?? "en" };
    if (opts.category) filter.category = opts.category;
    const tips = await HealthTip.find(filter)
      .sort({ _id: 1 })
      .lean();
    return tips.map((t) => ({ id: String(t._id), text: t.text, category: t.category }));
  });
}

export function getTipCategories(language = "en") {
  return safe<string[]>(async () => {
    const cats = await HealthTip.distinct("category", { language });
    return (cats as string[]).sort();
  });
}

/** Campaigns that are running now or start in the future. */
export function getCampaigns() {
  return safe<Campaign[]>(async () => {
    const now = new Date();
    const docs = await AwarenessCampaign.find({ active: true, endDate: { $gte: now } })
      .sort({ startDate: 1 })
      .lean();
    return docs.map((c) => ({
      id: String(c._id),
      title: c.title,
      description: c.description,
      topicTags: c.topicTags ?? [],
      startDate: c.startDate.toISOString(),
      endDate: c.endDate.toISOString(),
      status: c.startDate <= now ? ("ongoing" as const) : ("upcoming" as const),
    }));
  });
}
