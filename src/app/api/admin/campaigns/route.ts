import { adminCrud } from "@/lib/admin/crud";
import { campaignSchema } from "@/lib/admin/schemas";
import { AwarenessCampaign } from "@/lib/db/models/AwarenessCampaign";

const crud = adminCrud({ label: "campaign", schema: campaignSchema, model: AwarenessCampaign });

/** POST: create an awareness campaign. */
export const POST = crud.create;
