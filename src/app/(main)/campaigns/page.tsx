import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { ContentUnavailable } from "@/components/ContentUnavailable";
import { Badge } from "@/components/ui/badge";
import { getCampaigns } from "@/lib/content";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Awareness Campaigns" };
export const dynamic = "force-dynamic";

const fmt = (iso: string, locale: string) =>
  new Date(iso).toLocaleDateString(locale === "hi" ? "hi-IN" : "en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

export default async function CampaignsPage() {
  const { t, locale } = await getT();
  const result = await getCampaigns();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <header className="mb-10 max-w-2xl">
        <p className="eyebrow">{t("campaigns.eyebrow")}</p>
        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{t("campaigns.title")}</h1>
        <p className="mt-4 leading-7 text-muted-foreground">{t("campaigns.intro")}</p>
      </header>

      {!result.ok ? (
        <ContentUnavailable message={t("content.unavailable")} />
      ) : result.data.length === 0 ? (
        <ContentUnavailable message={t("campaigns.empty")} />
      ) : (
        <ul className="space-y-4">
          {result.data.map((c) => (
            <li key={c.id}>
              <article className="overflow-hidden rounded-xl border-l-4 border-l-terracotta bg-card ring-1 ring-border">
                <div className="space-y-3 p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={c.status === "ongoing" ? "default" : "secondary"}>
                      {c.status === "ongoing" ? t("campaigns.ongoing") : t("campaigns.upcoming")}
                    </Badge>
                    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CalendarDays className="size-4" aria-hidden />
                      {fmt(c.startDate, locale)} – {fmt(c.endDate, locale)}
                    </span>
                  </div>
                  <h2 className="text-2xl font-semibold">{c.title}</h2>
                  <p className="text-muted-foreground">{c.description}</p>
                  {c.topicTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {c.topicTags.map((tag) => (
                        <Link key={tag} href={`/diseases/${tag}`} className="rounded-md bg-secondary px-2.5 py-1 text-xs text-secondary-foreground hover:bg-secondary/70">
                          {tag.replace(/-/g, " ")}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
