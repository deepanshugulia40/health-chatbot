import type { Metadata } from "next";
import Link from "next/link";
import { ContentUnavailable } from "@/components/ContentUnavailable";
import { ConversationList, type ConversationItem } from "@/components/history/ConversationList";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { listConversations } from "@/lib/conversations";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Chat History" };
export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const user = await requireUser("/history");
  const { t, locale } = await getT();

  let items: ConversationItem[] | null = null;
  try {
    const fmt = new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });
    items = (await listConversations(user.id)).map((c) => ({
      id: c.id,
      title: c.title === "Untitled conversation" ? t("history.untitled") : c.title,
      updatedLabel: fmt.format(new Date(c.updatedAt)),
      messageCount: c.messageCount,
    }));
  } catch (err) {
    console.error("[history] load failed:", err instanceof Error ? err.message : err);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">{t("history.eyebrow")}</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{t("history.title")}</h1>
          <p className="mt-4 text-muted-foreground">{t("history.intro")}</p>
        </div>
        <Link href="/chat" className={buttonVariants({ size: "lg" })}>
          {t("history.startChat")}
        </Link>
      </header>

      {items === null ? (
        <ContentUnavailable message={t("history.loadFailed")} />
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card p-10 text-center">
          <p className="font-medium">{t("history.empty")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("history.emptyHint")}</p>
        </div>
      ) : (
        <ConversationList items={items} />
      )}
    </div>
  );
}
