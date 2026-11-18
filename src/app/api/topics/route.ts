import { getTopics } from "@/lib/content";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const language = searchParams.get("language") ?? "en";

  const result = await getTopics({ category, language });
  if (!result.ok) {
    return Response.json({ success: false, error: result.error }, { status: 503 });
  }
  return Response.json({ success: true, data: result.data });
}
