import { getTopicBySlug } from "@/lib/content";

export async function GET(_req: Request, ctx: RouteContext<"/api/topics/[slug]">) {
  const { slug } = await ctx.params;
  const result = await getTopicBySlug(slug);
  if (!result.ok) {
    return Response.json({ success: false, error: result.error }, { status: 503 });
  }
  if (!result.data) {
    return Response.json({ success: false, error: "Topic not found" }, { status: 404 });
  }
  return Response.json({ success: true, data: result.data });
}
