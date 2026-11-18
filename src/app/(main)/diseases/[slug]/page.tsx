import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Info } from "lucide-react";
import { ContentUnavailable } from "@/components/ContentUnavailable";
import { DiseaseDetailTabs } from "@/components/disease/DiseaseDetailTabs";
import { buttonVariants } from "@/components/ui/button";
import { getTopicBySlug } from "@/lib/content";
import { getT } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/diseases/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const result = await getTopicBySlug(slug);
  if (result.ok && result.data) {
    return { title: result.data.name, description: result.data.summary };
  }
  return { title: "Disease awareness" };
}

export default async function DiseaseDetailPage({ params }: PageProps<"/diseases/[slug]">) {
  const { slug } = await params;
  const { t, locale } = await getT();
  const result = await getTopicBySlug(slug);

  if (!result.ok) {
    return (
      <div className="px-4 py-16">
        <ContentUnavailable message={t("content.unavailable")} />
      </div>
    );
  }
  if (!result.data) notFound();

  const topic = result.data;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
        <Link href="/diseases" className="hover:text-foreground">
          {t("diseases.breadcrumb")}
        </Link>{" "}
        <span aria-hidden>/</span> <span className="text-foreground">{topic.name}</span>
      </nav>

      {/* Row 1: title + at a glance. Row 2: tabs + help column. */}
      <div className="grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <header className="space-y-4">
          {topic.kind && <p className="eyebrow">{topic.kind}</p>}
          <h1 className="text-5xl font-semibold sm:text-6xl">{topic.name}</h1>
          <p className="max-w-xl text-lg leading-8 text-muted-foreground">{topic.summary}</p>
          {topic.overview && topic.overview !== topic.summary && (
            <p className="max-w-xl text-sm leading-7 text-muted-foreground">{topic.overview}</p>
          )}
          {locale !== "en" && (
            <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              {t("diseases.englishOnly")}
            </p>
          )}
        </header>

        {topic.glance.length > 0 ? (
          <aside aria-labelledby="glance" className="self-start rounded-xl bg-card p-5 shadow-sm ring-1 ring-border">
            <h2 id="glance" className="font-heading text-base font-semibold">
              {t("diseases.glance")}
            </h2>
            <dl className="mt-3 divide-y text-sm">
              {topic.glance.map((g) => (
                <div key={g.label} className="flex justify-between gap-4 py-2.5">
                  <dt className="text-muted-foreground">{g.label}</dt>
                  <dd className="text-right">{g.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        ) : (
          <div className="hidden lg:block" />
        )}

        <div className="min-w-0">
          <DiseaseDetailTabs topic={topic} />
          <p className="mt-8 rounded-lg bg-muted px-4 py-3 text-xs leading-5 text-muted-foreground">
            {t("diseases.disclaimer")}
          </p>
        </div>

        <div className="space-y-6 self-start">
          <div className="rounded-xl bg-primary p-6 text-primary-foreground">
            <h2 className="font-heading text-xl font-semibold">{t("diseases.stillTitle")}</h2>
            <p className="mt-2 text-sm leading-6 text-primary-foreground/85">
              {t("diseases.stillText", { name: topic.name })}
            </p>
            <Link
              href="/chat"
              className={cn(buttonVariants({ size: "lg" }), "mt-5 w-full bg-card text-foreground hover:bg-card/90")}
            >
              {t("diseases.askButton", { name: topic.name })}
            </Link>
          </div>

          {topic.sourceRefs.length > 0 && (
            <section aria-labelledby="sources">
              <h2 id="sources" className="text-sm font-semibold font-sans tracking-normal">
                {t("common.sources")}
              </h2>
              <ul className="mt-2 divide-y border-t text-sm">
                {topic.sourceRefs.map((s) => (
                  <li key={s.sourceUrl}>
                    <a
                      href={s.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 py-2.5 text-primary hover:underline"
                    >
                      {s.sourceName}
                      <ExternalLink className="size-3.5 shrink-0" aria-hidden />
                      <span className="sr-only">{t("common.opensNewTab")}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
