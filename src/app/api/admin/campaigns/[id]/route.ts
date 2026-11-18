import { adminCrud } from "@/lib/admin/crud";
import { campaignSchema } from "@/lib/admin/schemas";
import { AwarenessCampaign } from "@/lib/db/models/AwarenessCampaign";

const crud = adminCrud({ label: "campaign", schema: campaignSchema, model: AwarenessCampaign });

/** PATCH: edit a campaign. */
export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/campaigns/[id]">) {
  return crud.update(request, (await ctx.params).id);
}

/** DELETE: remove a campaign. */
export async function DELETE(_req: Request, ctx: RouteContext<"/api/admin/campaigns/[id]">) {
  return crud.remove((await ctx.params).id);
}
