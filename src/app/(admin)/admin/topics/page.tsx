import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { TopicsManager } from "@/components/admin/TopicsManager";
import { ContentUnavailable } from "@/components/ContentUnavailable";
import { listTopics, type AdminTopic } from "@/lib/admin/data";
import { TOPIC_CATEGORIES } from "@/lib/db/models/HealthTopic";

export const metadata: Metadata = { title: "Topics" };
export const dynamic = "force-dynamic";

export default async function TopicsPage() {
  let topics: AdminTopic[] | null = null;
  try {
    topics = await listTopics();
  } catch (err) {
    console.error("[admin] topics failed:", err instanceof Error ? err.message : err);
  }

  return (
    <>
      <PageHeader title="Topics" description="The disease and health pages shown on the site. Changes appear immediately." />
      {topics === null ? <ContentUnavailable message="Could not load topics." /> : <TopicsManager topics={topics} categories={TOPIC_CATEGORIES} />}
    </>
  );
}
