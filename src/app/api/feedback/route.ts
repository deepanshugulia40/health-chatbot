import mongoose from "mongoose";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { Conversation } from "@/lib/db/models/Conversation";
import { Feedback } from "@/lib/db/models/Feedback";
import { Message } from "@/lib/db/models/Message";

/** Strips control characters and anything that looks like an HTML tag. */
const cleanComment = (s: string) =>
  s
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/<[^>]*>/g, "")
    .trim();

const bodySchema = z.object({
  messageId: z.string().refine((v) => mongoose.isValidObjectId(v), "Invalid message id"),
  // null withdraws an earlier rating (clicking the same thumb again)
  rating: z.enum(["up", "down"]).nullable(),
  comment: z
    .string()
    .max(1000, "Comment is too long (max 1000 characters)")
    .optional()
    .transform((v) => (v ? cleanComment(v) : undefined)),
});

const fail = (error: string, status: number) => Response.json({ success: false, error }, { status });

/** POST: thumbs up/down (with an optional comment) on one assistant message. */
export async function POST(request: Request) {
  try {
    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid request", 400);
    const { messageId, rating, comment } = parsed.data;

    const user = await getSessionUser();
    await connectDB();

    const message = await Message.findById(messageId).select("conversationId role").lean();
    // Unknown ids and non-assistant messages are both "not found".
    if (!message || message.role !== "assistant") return fail("Message not found", 404);

    // Only the owner of a conversation may rate its messages.
    const convo = await Conversation.findById(message.conversationId).select("userId").lean();
    if (!convo) return fail("Message not found", 404);
    if (convo.userId && String(convo.userId) !== user?.id) {
      return user ? fail("Message not found", 404) : fail("Unauthorized", 401);
    }

    const filter = { messageId, userId: user?.id ?? null };
    if (rating === null) {
      await Feedback.deleteOne(filter);
      return Response.json({ success: true, data: { rating: null } });
    }

    await Feedback.findOneAndUpdate(
      filter,
      { $set: { rating, ...(comment !== undefined ? { comment } : {}) } },
      { upsert: true }
    );
    return Response.json({ success: true, data: { rating } });
  } catch (err) {
    console.error("[feedback] failed:", err instanceof Error ? err.message : err);
    return fail("Could not save feedback. Please try again.", 500);
  }
}
