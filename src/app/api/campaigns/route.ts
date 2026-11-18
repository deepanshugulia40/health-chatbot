import { getCampaigns } from "@/lib/content";

export async function GET() {
  const result = await getCampaigns();
  if (!result.ok) {
    return Response.json({ success: false, error: result.error }, { status: 503 });
  }
  return Response.json({ success: true, data: result.data });
}
