import { after } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { HealthDocument } from "@/lib/db/models/HealthDocument";
import { detectKind } from "@/lib/rag/extract";
import { ingestDocument } from "@/lib/rag/ingest";
import { APPROVED_SOURCE_DOMAINS, isApprovedSourceUrl } from "@/lib/rag/sources";
import { isOpenAIConfigured } from "@/lib/ai/openai";

export const runtime = "nodejs";
export const maxDuration = 300;

// Note: Vercel serverless functions cap request bodies at ~4.5 MB.
const MAX_BYTES = (Number(process.env.MAX_UPLOAD_MB) || 10) * 1024 * 1024;

const fieldsSchema = z.object({
  title: z.string().trim().min(3, "Title is required").max(200),
  sourceName: z.string().trim().min(2, "Source name is required").max(100),
  sourceUrl: z
    .string()
    .trim()
    .max(500)
    .refine(isApprovedSourceUrl, `Source URL must be on an approved site: ${APPROVED_SOURCE_DOMAINS.join(", ")}`),
  topicTags: z
    .string()
    .optional()
    .transform((v) =>
      (v ?? "")
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
    )
    .pipe(z.array(z.string().regex(/^[a-z0-9-]{1,40}$/, "Tags may only use letters, numbers and hyphens")).max(10)),
  publishedDate: z
    .string()
    .optional()
    .transform((v) => (v ? new Date(v) : undefined))
    .refine((d) => !d || !Number.isNaN(d.getTime()), "Invalid published date"),
});

const fail = (error: string, status: number) => Response.json({ success: false, error }, { status });

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/** GET: all documents with status and chunk counts. */
export async function GET() {
  const gate = await requireAdminApi();
  if ("error" in gate) return gate.error;

  try {
    await connectDB();
    const docs = await HealthDocument.find().sort({ createdAt: -1 }).lean();
    const now = Date.now();
    return Response.json({
      success: true,
      data: docs.map((d) => ({
        id: String(d._id),
        title: d.title,
        sourceName: d.sourceName,
        sourceUrl: d.sourceUrl,
        topicTags: d.topicTags ?? [],
        status: d.status,
        verified: d.verified,
        chunkCount: d.chunkCount ?? 0,
        errorMessage: d.errorMessage,
        publishedDate: d.publishedDate,
        createdAt: d.createdAt,
        // Policy: documents older than 12 months need re-verification.
        needsReview: now - new Date(d.publishedDate ?? d.createdAt).getTime() > ONE_YEAR_MS,
      })),
    });
  } catch (err) {
    console.error("[admin/documents] list failed:", err instanceof Error ? err.message : err);
    return fail("Could not load documents.", 500);
  }
}

/** POST: multipart upload (file + metadata). Ingestion runs after the response. */
export async function POST(request: Request) {
  const gate = await requireAdminApi();
  if ("error" in gate) return gate.error;

  try {
    if (!isOpenAIConfigured()) {
      return fail("OPENAI_API_KEY is not set, so documents cannot be embedded yet.", 503);
    }

    const form = await request.formData().catch(() => null);
    if (!form) return fail("Expected multipart form data", 400);

    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) return fail("A file is required", 400);
    if (file.size > MAX_BYTES) return fail(`File is too large (max ${Math.round(MAX_BYTES / 1024 / 1024)} MB)`, 413);

    const parsed = fieldsSchema.safeParse({
      title: form.get("title"),
      sourceName: form.get("sourceName"),
      sourceUrl: form.get("sourceUrl"),
      topicTags: form.get("topicTags") ?? undefined,
      publishedDate: form.get("publishedDate") || undefined,
    });
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input", 400);

    const buffer = Buffer.from(await file.arrayBuffer());
    const kind = detectKind(buffer, file.name);
    if (!kind) return fail("Unsupported file. Upload a text-based PDF or a .txt file.", 415);

    await connectDB();
    const doc = await HealthDocument.create({
      ...parsed.data,
      fileName: file.name.slice(0, 200),
      status: "pending",
      verified: false, // always staged; an admin must verify before it is searchable
      uploadedBy: gate.user.id,
    });
    const documentId = String(doc._id);

    after(() => ingestDocument(documentId, buffer, kind));

    return Response.json({ success: true, data: { documentId, status: "pending" } }, { status: 202 });
  } catch (err) {
    console.error("[admin/documents] upload failed:", err instanceof Error ? err.message : err);
    return fail("Upload failed. Please try again.", 500);
  }
}
