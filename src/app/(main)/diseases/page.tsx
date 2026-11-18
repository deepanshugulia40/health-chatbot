import type { Metadata } from "next";
import { Info } from "lucide-react";
import { ContentUnavailable } from "@/components/ContentUnavailable";
import { DiseaseCard } from "@/components/disease/DiseaseCard";
import { getTopics } from "@/lib/content";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Disease Awareness" };
export const dynamic = "force-dynamic";

export default async function DiseasesPage() {
  const { t, locale } = await getT();
  const result = await getTopics({ category: "disease" });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-10 max-w-2xl">
        <p className="eyebrow">{t("diseases.eyebrow")}</p>
        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{t("diseases.title")}</h1>
        <p className="mt-4 leading-7 text-muted-foreground">{t("diseases.intro")}</p>
        {locale !== "en" && (
          <p className="mt-3 flex items-start gap-1.5 text-sm text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            {t("diseases.englishOnly")}
          </p>
        )}
      </header>

      {!result.ok ? (
        <ContentUnavailable message={t("content.unavailable")} />
      ) : result.data.length === 0 ? (
        <ContentUnavailable message={t("diseases.empty")} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.data.map((topic, i) => (
            <li key={topic.slug}>
              <DiseaseCard
                topic={topic}
                learnMore={t("diseases.read")}
                accent={i % 2 === 0 ? "green" : "terracotta"}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
