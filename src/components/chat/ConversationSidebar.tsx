"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/I18nProvider";
import type { TKey } from "@/lib/i18n/translate";
import { cn } from "@/lib/utils";

export type SidebarGroup = "today" | "week" | "older";

export type SidebarConversation = {
  id: string;
  title: string;
  messageCount: number;
  /** Computed on the server so server and client output always match. */
  group: SidebarGroup;
};

const GROUPS: { key: SidebarGroup; label: TKey }[] = [
  { key: "today", label: "chat.groupToday" },
  { key: "week", label: "chat.groupWeek" },
  { key: "older", label: "chat.groupOlder" },
];

/** Saved conversations (signed-in users) or a sign-in prompt (guests). */
export function ConversationSidebar({
  conversations,
  signedIn,
  activeId,
  onNew,
  onNavigate,
}: {
  conversations: SidebarConversation[];
  signedIn: boolean;
  activeId?: string;
  onNew: () => void;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-4">
      <Button
        size="lg"
        className="w-full"
        onClick={() => {
          onNew();
          onNavigate?.();
        }}
      >
        <Plus aria-hidden /> {t("chat.newConversation")}
      </Button>

      {!signedIn ? (
        <p className="px-1 text-sm leading-6 text-muted-foreground">
          {t("chat.signInHistory")}{" "}
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            {t("nav.login")}
          </Link>
        </p>
      ) : conversations.length === 0 ? (
        <p className="px-1 text-sm text-muted-foreground">{t("chat.noHistory")}</p>
      ) : (
        <nav aria-label={t("chat.historyToggle")} className="space-y-5">
          {GROUPS.map(({ key, label }) => {
            const items = conversations.filter((c) => c.group === key);
            if (items.length === 0) return null;
            return (
              <section key={key}>
                <h2 className="eyebrow mb-2 px-1 font-sans !text-muted-foreground">{t(label)}</h2>
                <ul className="space-y-1">
                  {items.map((c) => {
                    const active = c.id === activeId;
                    return (
                      <li key={c.id}>
                        <Link
                          href={`/chat?c=${c.id}`}
                          onClick={onNavigate}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "block rounded-lg px-3 py-2.5 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            active ? "bg-card ring-1 ring-border" : "hover:bg-card/60"
                          )}
                        >
                          <span className="block truncate font-medium">{c.title}</span>
                          <span className="block text-xs text-muted-foreground">
                            {t("history.messages", { count: c.messageCount })}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </nav>
      )}
    </div>
  );
}
