/**
 * Bulk-adds source documents to the knowledge base through the same pipeline
 * as the admin upload (extract -> clean -> chunk -> embed -> store).
 *
 * Run:  npm run ingest:bulk -- path/to/manifest.json
 *
 * The manifest is a JSON array of:
 *   { "file": "abs/or/relative/path.txt" | ".pdf", "title": "...", "sourceName": "WHO",
 *     "sourceUrl": "https://www.who.int/...", "topicTags": ["..."], "publishedDate": "2025-04-14" }
 *
 * Documents are created UNVERIFIED, exactly like an admin upload: review them on
 * /admin/knowledge-base and mark them verified before they can be used in chat.
 * Safe to re-run: a document whose sourceUrl already exists is skipped.
 */
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db/connect";
import { HealthDocument } from "../src/lib/db/models/HealthDocument";
import { User } from "../src/lib/db/models/User";
import { ingestDocument } from "../src/lib/rag/ingest";
import { isApprovedSourceUrl } from "../src/lib/rag/sources";

type Entry = {
  file: string;
  title: string;
  sourceName: string;
  sourceUrl: string;
  topicTags?: string[];
  publishedDate?: string;
};

async function main() {
  const manifestPath = process.argv[2];
  if (!manifestPath) throw new Error("Usage: npm run ingest:bulk -- path/to/manifest.json");
  const baseDir = path.dirname(path.resolve(manifestPath));
  const entries = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as Entry[];

  await connectDB();
  const admin = await User.findOne({ role: "admin" }).select("_id").lean();
  if (!admin) throw new Error("No admin user found. Create one first (npm run seed).");

  let added = 0;
  for (const e of entries) {
    const label = e.title.padEnd(48);
    if (!isApprovedSourceUrl(e.sourceUrl)) {
      console.log(`${label} SKIPPED: source URL is not on an approved domain`);
      continue;
    }
    const file = path.resolve(baseDir, e.file);
    const kind = file.toLowerCase().endsWith(".pdf") ? "pdf" : "txt";
    const existing = await HealthDocument.findOne({ sourceUrl: e.sourceUrl }).select("status").lean();
    if (existing && existing.status !== "failed") {
      console.log(`${label} skipped: already in the knowledge base`);
      continue;
    }
    if (existing) {
      // An earlier attempt failed (e.g. a provider rate limit): retry it in place.
      await ingestDocument(String(existing._id), fs.readFileSync(file), kind);
      const retried = await HealthDocument.findById(existing._id).select("status chunkCount").lean();
      console.log(`${label} retried: ${retried?.status} (${retried?.chunkCount ?? 0} chunks)`);
      if (retried?.status === "processed") added++;
      continue;
    }
    const doc = await HealthDocument.create({
      title: e.title,
      sourceName: e.sourceName,
      sourceUrl: e.sourceUrl,
      topicTags: e.topicTags ?? [],
      publishedDate: e.publishedDate ? new Date(e.publishedDate) : undefined,
      fileName: path.basename(file),
      uploadedBy: admin._id,
      status: "pending",
      verified: false,
    });
    await ingestDocument(String(doc._id), fs.readFileSync(file), kind);
    const after = await HealthDocument.findById(doc._id).select("status chunkCount errorMessage").lean();
    console.log(`${label} ${after?.status} (${after?.chunkCount ?? 0} chunks)${after?.errorMessage ? " - " + after.errorMessage : ""}`);
    if (after?.status === "processed") added++;
  }

  console.log(`\nDone: ${added} of ${entries.length} documents processed. Verify them on /admin/knowledge-base.`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err instanceof Error ? err.message : err);
  await mongoose.disconnect();
  process.exit(1);
});
