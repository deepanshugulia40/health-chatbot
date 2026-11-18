import mongoose from "mongoose";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { DocumentChunk } from "@/lib/db/models/DocumentChunk";
import { HealthDocument } from "@/lib/db/models/HealthDocument";

const bodySchema = z.object({ verified: z.boolean() });

/** POST: sets verified on the document and keeps its chunks' flag in sync. */
export async function POST(request: Request, ctx: RouteContext<"/api/admin/documents/[id]/verify">) {
  const gate = await requireAdminApi();
  if ("error" in gate) return gate.error;

  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) {
    return Response.json({ success: false, error: "Invalid document id" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ success: false, error: "Body must be { verified: boolean }" }, { status: 400 });
  }
  const { verified } = parsed.data;

  try {
    await connectDB();
    const doc = await HealthDocument.findById(id).select("status");
    if (!doc) return Response.json({ success: false, error: "Document not found" }, { status: 404 });
    if (verified && doc.status !== "processed") {
      return Response.json(
        { success: false, error: "Only processed documents can be verified." },
        { status: 409 }
      );
    }

    await HealthDocument.updateOne({ _id: id }, { $set: { verified, needsReview: false } });
    await DocumentChunk.updateMany({ documentId: id }, { $set: { verified } });
    return Response.json({ success: true, data: { verified } });
  } catch (err) {
    console.error("[admin/documents] verify failed:", err instanceof Error ? err.message : err);
    return Response.json({ success: false, error: "Could not update document." }, { status: 500 });
  }
}
