import type { Metadata } from "next";
import { CampaignsManager } from "@/components/admin/CampaignsManager";
import { PageHeader } from "@/components/admin/PageHeader";
import { ContentUnavailable } from "@/components/ContentUnavailable";
import { listCampaigns, type AdminCampaign } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Campaigns" };
export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  let campaigns: AdminCampaign[] | null = null;
  try {
    campaigns = await listCampaigns();
  } catch (err) {
    console.error("[admin] campaigns failed:", err instanceof Error ? err.message : err);
  }

  return (
    <>
      <PageHeader title="Awareness campaigns" description="Campaigns appear on the public site while they are active and between their start and end dates." />
      {campaigns === null ? <ContentUnavailable message="Could not load campaigns." /> : <CampaignsManager campaigns={campaigns} />}
    </>
  );
}
