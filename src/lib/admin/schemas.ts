import { z } from "zod";
import { LOCALES } from "@/lib/i18n/config";
import { TOPIC_CATEGORIES } from "@/lib/db/models/HealthTopic";

/** Validation shared by the admin content APIs (topics, tips, campaigns). */

const lines = (max: number, itemMax = 500) =>
  z.array(z.string().trim().min(1).max(itemMax)).max(max).default([]);

const httpUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => {
    try {
      const u = new URL(v);
      return u.protocol === "https:" || u.protocol === "http:";
    } catch {
      return false;
    }
  }, "Must be a valid http(s) URL");

export const topicSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug may only use lowercase letters, numbers and hyphens")
    .max(60),
  category: z.enum(TOPIC_CATEGORIES),
  icon: z.string().trim().min(1).max(40).default("heart-pulse"),
  summary: z.string().trim().min(10, "Summary must be at least 10 characters").max(500),
  kind: z.string().trim().max(60).default(""),
  glance: z
    .array(z.object({ label: z.string().trim().min(1).max(40), value: z.string().trim().min(1).max(80) }))
    .max(8)
    .default([]),
  overview: z.string().trim().max(5000).default(""),
  symptoms: lines(30),
  causes: lines(30),
  prevention: lines(30),
  whenToSeekHelp: lines(30),
  mythsVsFacts: z
    .array(z.object({ myth: z.string().trim().min(1).max(500), fact: z.string().trim().min(1).max(1000) }))
    .max(20)
    .default([]),
  sourceRefs: z
    .array(z.object({ sourceName: z.string().trim().min(1).max(100), sourceUrl: httpUrl }))
    .max(10)
    .default([]),
  language: z.enum(LOCALES).default("en"),
  trending: z.boolean().default(false),
});

export const tipSchema = z.object({
  text: z.string().trim().min(5, "Tip text is too short").max(500),
  category: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]{2,40}$/, "Category may only use lowercase letters, numbers and hyphens"),
  language: z.enum(LOCALES).default("en"),
});

const dateString = z
  .string()
  .min(1, "Date is required")
  .transform((v) => new Date(v))
  .refine((d) => !Number.isNaN(d.getTime()), "Invalid date");

// A date-only end date means "through the end of that day".
const endOfDay = z
  .string()
  .min(1, "Date is required")
  .transform((v) => new Date(/^\d{4}-\d{2}-\d{2}$/.test(v) ? `${v}T23:59:59.999Z` : v))
  .refine((d) => !Number.isNaN(d.getTime()), "Invalid date");

export const campaignSchema = z
  .object({
    title: z.string().trim().min(3, "Title is required").max(150),
    description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000),
    topicTags: z
      .array(z.string().trim().toLowerCase().regex(/^[a-z0-9-]{1,40}$/, "Tags may only use letters, numbers and hyphens"))
      .max(10)
      .default([]),
    startDate: dateString,
    endDate: endOfDay,
    active: z.boolean().default(true),
    bannerImageUrl: z.union([httpUrl, z.literal("")]).optional(),
  })
  .refine((c) => c.endDate >= c.startDate, { message: "End date must be on or after the start date", path: ["endDate"] });

export function firstIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Invalid input";
  const field = issue.path.join(".");
  return field && !issue.message.toLowerCase().includes(field.toLowerCase())
    ? `${field}: ${issue.message}`
    : issue.message;
}
