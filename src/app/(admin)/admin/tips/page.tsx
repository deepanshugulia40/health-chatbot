import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { TipsManager } from "@/components/admin/TipsManager";
import { ContentUnavailable } from "@/components/ContentUnavailable";
import { listTips, type AdminTip } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Tips" };
export const dynamic = "force-dynamic";

export default async function TipsPage() {
  let tips: AdminTip[] | null = null;
  try {
    tips = await listTips();
  } catch (err) {
    console.error("[admin] tips failed:", err instanceof Error ? err.message : err);
  }

  return (
    <>
      <PageHeader title="Health tips" description="Short daily tips. The site shows one per day, chosen from the tips in the visitor's language." />
      {tips === null ? <ContentUnavailable message="Could not load tips." /> : <TipsManager tips={tips} />}
    </>
  );
}
