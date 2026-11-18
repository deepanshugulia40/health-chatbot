import { adminCrud } from "@/lib/admin/crud";
import { tipSchema } from "@/lib/admin/schemas";
import { HealthTip } from "@/lib/db/models/HealthTip";

const crud = adminCrud({ label: "tip", schema: tipSchema, model: HealthTip });

/** PATCH: edit a tip. */
export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/tips/[id]">) {
  return crud.update(request, (await ctx.params).id);
}

/** DELETE: remove a tip. */
export async function DELETE(_req: Request, ctx: RouteContext<"/api/admin/tips/[id]">) {
  return crud.remove((await ctx.params).id);
}
