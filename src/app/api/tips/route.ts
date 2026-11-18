import { getTipOfTheDay, getTips } from "@/lib/content";

export async function GET(request: Request) {
  const language = new URL(request.url).searchParams.get("language") ?? "en";
  const [today, recent] = await Promise.all([getTipOfTheDay(language), getTips({ language })]);
  if (!today.ok || !recent.ok) {
    return Response.json({ success: false, error: "Content is temporarily unavailable." }, { status: 503 });
  }
  return Response.json({ success: true, data: { today: today.data, tips: recent.data } });
}
