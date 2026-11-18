import { getSessionUser } from "@/lib/auth/session";
import { listConversations } from "@/lib/conversations";

/** GET: the signed-in user's conversations. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    return Response.json({ success: true, data: await listConversations(user.id) });
  } catch (err) {
    console.error("[conversations] list failed:", err instanceof Error ? err.message : err);
    return Response.json({ success: false, error: "Could not load conversations." }, { status: 500 });
  }
}
