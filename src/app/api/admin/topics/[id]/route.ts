import { adminCrud } from "@/lib/admin/crud";
import { topicSchema } from "@/lib/admin/schemas";
import { HealthTopic } from "@/lib/db/models/HealthTopic";

const crud = adminCrud({ label: "topic", schema: topicSchema, model: HealthTopic });

/** PATCH: replace the editable fields of a topic. */
export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/topics/[id]">) {
  return crud.update(request, (await ctx.params).id);
}

/** DELETE: remove a topic. */
export async function DELETE(_req: Request, ctx: RouteContext<"/api/admin/topics/[id]">) {
  return crud.remove((await ctx.params).id);
}
