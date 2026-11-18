import { getSessionUser } from "@/lib/auth/session";
import { deleteConversation, getConversation } from "@/lib/conversations";

const unauthorized = () => Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
// Other people's conversations look exactly like missing ones.
const notFound = () => Response.json({ success: false, error: "Conversation not found" }, { status: 404 });

/** GET: one conversation with its messages (ownership checked). */
export async function GET(_req: Request, ctx: RouteContext<"/api/conversations/[id]">) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;

  try {
    const result = await getConversation(user.id, id);
    return result ? Response.json({ success: true, data: result }) : notFound();
  } catch (err) {
    console.error("[conversations] get failed:", err instanceof Error ? err.message : err);
    return Response.json({ success: false, error: "Could not load the conversation." }, { status: 500 });
  }
}

/** DELETE: removes the conversation, its messages and their feedback. */
export async function DELETE(_req: Request, ctx: RouteContext<"/api/conversations/[id]">) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;

  try {
    return (await deleteConversation(user.id, id))
      ? Response.json({ success: true, data: { deleted: true } })
      : notFound();
  } catch (err) {
    console.error("[conversations] delete failed:", err instanceof Error ? err.message : err);
    return Response.json({ success: false, error: "Could not delete the conversation." }, { status: 500 });
  }
}
