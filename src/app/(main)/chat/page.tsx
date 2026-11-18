import type { Metadata } from "next";
import { ChatWindow } from "@/components/chat/ChatWindow";
import type { SidebarConversation, SidebarGroup } from "@/components/chat/ConversationSidebar";
import { getSessionUser } from "@/lib/auth/session";
import type { InitialConversation } from "@/hooks/useChat";
import { getConversation, listConversations } from "@/lib/conversations";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Chat" };
export const dynamic = "force-dynamic";

const IST_DAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" });

/** Today / within the last week / older, by calendar day in India. */
function groupFor(updatedAt: string, now: Date): SidebarGroup {
  const days = Math.round((Date.parse(IST_DAY.format(now)) - Date.parse(IST_DAY.format(new Date(updatedAt)))) / 86_400_000);
  return days <= 0 ? "today" : days < 7 ? "week" : "older";
}

export default async function ChatPage({ searchParams }: PageProps<"/chat">) {
  const sp = await searchParams;
  const id = typeof sp.c === "string" ? sp.c : undefined;
  const { t } = await getT();
  const user = await getSessionUser();

  // /chat?c=<id> resumes a saved conversation. Only its owner can load it;
  // anything else (guest, wrong user, bad id) silently starts a fresh chat.
  let initial: InitialConversation | undefined;
  if (id && user) {
    try {
      const found = await getConversation(user.id, id);
      if (found) initial = { id: found.conversation.id, messages: found.messages };
    } catch (err) {
      console.error("[chat] resume failed:", err instanceof Error ? err.message : err);
    }
  }

  let conversations: SidebarConversation[] = [];
  if (user) {
    try {
      const now = new Date();
      conversations = (await listConversations(user.id)).map((c) => ({
        id: c.id,
        title: c.title === "Untitled conversation" ? t("history.untitled") : c.title,
        messageCount: c.messageCount,
        group: groupFor(c.updatedAt, now),
      }));
    } catch (err) {
      console.error("[chat] sidebar load failed:", err instanceof Error ? err.message : err);
    }
  }

  return (
    <ChatWindow
      key={initial?.id ?? "new"}
      initialConversation={initial}
      conversations={conversations}
      signedIn={Boolean(user)}
    />
  );
}
