import type { Metadata } from "next";
import Link from "next/link";
import { Info } from "lucide-react";
import { ContentUnavailable } from "@/components/ContentUnavailable";
import { TipCard, formatCategory } from "@/components/dashboard/TipCard";
import { getTipCategories, getTipOfTheDay, getTips } from "@/lib/content";
import { getT } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Health Tips" };
export const dynamic = "force-dynamic";

export default async function TipsPage({ searchParams }: PageProps<"/tips">) {
  const { t, td, locale } = await getT();
  const sp = await searchParams;
  const raw = Array.isArray(sp.category) ? sp.category[0] : sp.category;
  const category = raw && /^[a-z-]{1,40}$/.test(raw) ? raw : undefined;

  // Tips are stored per language; fall back to English if none exist yet.
  const [today, tips, cats] = await Promise.all([
    getTipOfTheDay(locale),
    getTips({ category, language: locale }),
    getTipCategories(locale),
  ]);
  const useEnglish = tips.ok && tips.data.length === 0 && !category && locale !== "en";
  const [todayFinal, tipsFinal, catsFinal] = useEnglish
    ? await Promise.all([getTipOfTheDay("en"), getTips({ language: "en" }), getTipCategories("en")])
    : [today, tips, cats];

  const label = (c: string) => td(`tips.cat.${c}`, formatCategory(c));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-10 max-w-2xl">
        <p className="eyebrow">{t("tips.eyebrow")}</p>
        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{t("tips.title")}</h1>
        <p className="mt-4 leading-7 text-muted-foreground">{t("tips.intro")}</p>
        {useEnglish && (
          <p className="mt-3 flex items-start gap-1.5 text-sm text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            {t("diseases.englishOnly")}
          </p>
        )}
      </header>

      {!tipsFinal.ok ? (
        <ContentUnavailable message={t("content.unavailable")} />
      ) : (
        <>
          {todayFinal.ok && todayFinal.data && (
            <section aria-labelledby="tod" className="mb-10">
              <h2 id="tod" className="eyebrow mb-3 font-sans">
                {t("tips.today")}
              </h2>
              <div className="max-w-2xl">
                <TipCard tip={todayFinal.data} categoryLabel={label(todayFinal.data.category)} featured />
              </div>
            </section>
          )}

          {catsFinal.ok && catsFinal.data.length > 0 && (
            <nav aria-label={t("tips.filter")} className="mb-6 flex flex-wrap gap-2">
              {[undefined, ...catsFinal.data].map((c) => {
                const active = c === category;
                return (
                  <Link
                    key={c ?? "all"}
                    href={c ? `/tips?category=${c}` : "/tips"}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-sm transition-colors",
                      active ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {c ? label(c) : t("tips.all")}
                  </Link>
                );
              })}
            </nav>
          )}

          {tipsFinal.data.length === 0 ? (
            <ContentUnavailable message={t("tips.empty")} />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tipsFinal.data.map((tip) => (
                <li key={tip.id}>
                  <TipCard tip={tip} categoryLabel={label(tip.category)} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
