import mongoose from "mongoose";
import { requireAdminApi } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { DocumentChunk } from "@/lib/db/models/DocumentChunk";
import { HealthDocument } from "@/lib/db/models/HealthDocument";

/** DELETE: removes the document and all of its chunks. */
export async function DELETE(_req: Request, ctx: RouteContext<"/api/admin/documents/[id]">) {
  const gate = await requireAdminApi();
  if ("error" in gate) return gate.error;

  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) {
    return Response.json({ success: false, error: "Invalid document id" }, { status: 400 });
  }

  try {
    await connectDB();
    const doc = await HealthDocument.findByIdAndDelete(id);
    if (!doc) return Response.json({ success: false, error: "Document not found" }, { status: 404 });
    const { deletedCount } = await DocumentChunk.deleteMany({ documentId: id });
    return Response.json({ success: true, data: { deletedChunks: deletedCount } });
  } catch (err) {
    console.error("[admin/documents] delete failed:", err instanceof Error ? err.message : err);
    return Response.json({ success: false, error: "Could not delete document." }, { status: 500 });
  }
}
