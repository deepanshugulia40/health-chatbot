/**
 * Seeds health topics, tips, campaigns and (optionally) an admin user.
 * Run:  npm run seed
 * Safe to re-run: topics are upserted by slug, tips/campaigns are replaced.
 */
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db/connect";
import { HealthTopic } from "../src/lib/db/models/HealthTopic";
import { HealthTip } from "../src/lib/db/models/HealthTip";
import { AwarenessCampaign } from "../src/lib/db/models/AwarenessCampaign";
import { User } from "../src/lib/db/models/User";
import { campaignTemplates, tips, topics } from "./seed-data";

function resolveWindow(start: number[], end: number[], today = new Date()) {
  const year = today.getUTCFullYear();
  const build = (y: number) => {
    const s = new Date(Date.UTC(y, start[0] - 1, start[1]));
    const eYear = end[0] < start[0] ? y + 1 : y;
    const e = new Date(Date.UTC(eYear, end[0] - 1, end[1], 23, 59, 59));
    return { s, e };
  };
  let w = build(year);
  // Winter windows that began last year may still be running.
  const prev = build(year - 1);
  if (prev.e >= today) w = prev;
  else if (w.e < today) w = build(year + 1);
  return { startDate: w.s, endDate: w.e };
}

async function main() {
  await connectDB();

  for (const t of topics) {
    await HealthTopic.updateOne({ slug: t.slug }, { $set: { ...t, language: "en" } }, { upsert: true });
  }
  console.log(`Topics upserted: ${topics.length}`);

  await HealthTip.deleteMany({ language: "en" });
  await HealthTip.insertMany(tips.map((t) => ({ ...t, language: "en" })));
  console.log(`Tips inserted: ${tips.length}`);

  await AwarenessCampaign.deleteMany({});
  await AwarenessCampaign.insertMany(
    campaignTemplates.map((c) => ({
      title: c.title,
      description: c.description,
      topicTags: c.topicTags,
      active: true,
      ...resolveWindow(c.start, c.end),
    }))
  );
  console.log(`Campaigns inserted: ${campaignTemplates.length}`);

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    if (password.length < 8) throw new Error("ADMIN_PASSWORD must be at least 8 characters");
    const passwordHash = await bcrypt.hash(password, 12);
    await User.updateOne(
      { email },
      { $set: { role: "admin", passwordHash }, $setOnInsert: { name: process.env.ADMIN_NAME || "Admin" } },
      { upsert: true }
    );
    console.log(`Admin user ready: ${email}`);
  } else {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD not set: skipped admin user.");
  }

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("Seed failed:", err instanceof Error ? err.message : err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
