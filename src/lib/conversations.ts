import "server-only";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Conversation } from "@/lib/db/models/Conversation";
import { Feedback } from "@/lib/db/models/Feedback";
import { Message } from "@/lib/db/models/Message";
import type { ChatMessage } from "@/types/chat";

export type ConversationSummary = {
  id: string;
  title: string;
  language: string;
  updatedAt: string;
  messageCount: number;
};

const MAX_CONVERSATIONS = 100;

/** The signed-in user's conversations, newest first. */
export async function listConversations(userId: string): Promise<ConversationSummary[]> {
  await connectDB();
  const convos = await Conversation.find({ userId })
    .sort({ updatedAt: -1 })
    .limit(MAX_CONVERSATIONS)
    .lean();
  if (convos.length === 0) return [];

  const counts = await Message.aggregate<{ _id: mongoose.Types.ObjectId; n: number }>([
    { $match: { conversationId: { $in: convos.map((c) => c._id) } } },
    { $group: { _id: "$conversationId", n: { $sum: 1 } } },
  ]);
  const byId = new Map(counts.map((c) => [String(c._id), c.n]));

  return convos.map((c) => ({
    id: String(c._id),
    title: c.title || "Untitled conversation",
    language: c.language ?? "en",
    updatedAt: c.updatedAt.toISOString(),
    messageCount: byId.get(String(c._id)) ?? 0,
  }));
}

/**
 * A conversation and its messages, only if it belongs to `userId`.
 * Returns null for unknown ids AND for other people's conversations, so
 * callers cannot tell the two apart.
 */
export async function getConversation(userId: string, id: string) {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();

  const convo = await Conversation.findOne({ _id: id, userId }).lean();
  if (!convo) return null;

  const rows = await Message.find({ conversationId: id, role: { $ne: "system" } })
    .sort({ createdAt: 1 })
    .lean();
  const ratings = await Feedback.find({ userId, messageId: { $in: rows.map((m) => m._id) } })
    .select("messageId rating")
    .lean();
  const ratingByMessage = new Map(ratings.map((f) => [String(f.messageId), f.rating]));

  const messages: ChatMessage[] = rows.map((m) => ({
    id: String(m._id),
    serverId: String(m._id),
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content,
    status: "done",
    flaggedEmergency: m.flaggedEmergency || undefined,
    citedSources: m.citedSources?.map((s) => ({
      documentId: s.documentId ? String(s.documentId) : undefined,
      sourceName: s.sourceName ?? "",
      sourceUrl: s.sourceUrl ?? "",
      chunkText: s.chunkText ?? undefined,
    })),
    feedback: ratingByMessage.get(String(m._id)),
  }));

  return {
    conversation: {
      id: String(convo._id),
      title: convo.title || "Untitled conversation",
      language: convo.language ?? "en",
      updatedAt: convo.updatedAt.toISOString(),
    },
    messages,
  };
}

/** Deletes a conversation with its messages and their feedback. */
export async function deleteConversation(userId: string, id: string): Promise<boolean> {
  if (!mongoose.isValidObjectId(id)) return false;
  await connectDB();

  const convo = await Conversation.findOne({ _id: id, userId }).select("_id").lean();
  if (!convo) return false;

  const messageIds = (await Message.find({ conversationId: id }).select("_id").lean()).map((m) => m._id);
  await Feedback.deleteMany({ messageId: { $in: messageIds } });
  await Message.deleteMany({ conversationId: id });
  await Conversation.deleteOne({ _id: id });
  return true;
}
