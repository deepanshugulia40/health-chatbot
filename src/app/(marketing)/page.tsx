import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getT } from "@/lib/i18n/server";
import { DISEASE_LINKS } from "@/lib/site";
import { cn } from "@/lib/utils";

export default async function LandingPage() {
  const { t, td } = await getT();

  const steps = [
    { title: t("landing.step1Title"), text: t("landing.step1Text") },
    { title: t("landing.step2Title"), text: t("landing.step2Text") },
    { title: t("landing.step3Title"), text: t("landing.step3Text") },
  ];

  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-12 pb-16 sm:px-6 md:grid-cols-2 md:pt-20 md:pb-24">
        <div className="space-y-6">
          <p className="eyebrow">{t("landing.eyebrow")}</p>
          <h1 className="text-4xl leading-[1.1] font-semibold text-balance sm:text-5xl lg:text-[3.5rem]">
            {t("landing.heroTitleA")} <em className="text-terracotta">{t("landing.heroTitleB")}</em>
          </h1>
          <p className="max-w-lg text-base leading-7 text-muted-foreground">{t("landing.heroText")}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/chat" className={buttonVariants({ size: "lg" })}>
              {t("landing.startChat")}
            </Link>
            <Link href="/diseases" className={buttonVariants({ variant: "outline", size: "lg" })}>
              {t("landing.browseDiseases")}
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">{t("landing.guestNote")}</p>
        </div>

        {/* Illustrative answer card */}
        <div className="relative md:pl-6" aria-hidden>
          <div className="absolute inset-0 translate-x-2 translate-y-2 rotate-[1.5deg] rounded-2xl bg-muted md:left-6" />
          <div className="relative rotate-[1.5deg] space-y-4 rounded-2xl border bg-card p-5 shadow-lg sm:p-6">
            <div className="ml-auto w-fit max-w-[90%] rounded-xl rounded-br-sm bg-muted px-4 py-2.5 text-sm">
              {t("landing.previewQuestion")}
            </div>
            <p className="text-sm leading-6">{t("landing.previewAnswer")}</p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-md bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                {t("landing.previewSource", { name: "WHO · Dengue fact sheet" })}
              </span>
              <span className="rounded-md bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                {t("landing.previewSource", { name: "NCDC" })}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{t("landing.previewDisclaimer")}</p>
          </div>
        </div>
      </section>

      {/* Conditions */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="eyebrow">{t("landing.topicsEyebrow")}</p>
        <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{t("landing.topicsTitle")}</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{t("landing.topicsSubtitle")}</p>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
          {DISEASE_LINKS.map(({ slug }, i) => {
            const featured = i === 0;
            return (
              <li
                key={slug}
                // Row 1: one wide card + two; row 2: four equal cards (12-column grid).
                className={featured ? "sm:col-span-2 lg:col-span-6" : "lg:col-span-3"}
              >
                <Link
                  href={`/diseases/${slug}`}
                  className={cn(
                    "group flex h-full min-h-36 flex-col gap-2 rounded-xl border-t-[3px] p-5 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    featured
                      ? "border-t-primary bg-primary text-primary-foreground"
                      : cn("bg-card ring-1 ring-border", i % 2 === 1 ? "border-t-terracotta" : "border-t-primary")
                  )}
                >
                  <span className="font-heading text-lg font-semibold">{td(`quick.${slug}.name`, slug)}</span>
                  <span className={cn("flex-1 text-sm", featured ? "text-primary-foreground/85" : "text-muted-foreground")}>
                    {td(`quick.${slug}.summary`, "")}
                  </span>
                  <span className={cn("text-xs", featured ? "text-primary-foreground/90" : "text-muted-foreground")}>
                    {featured ? t("landing.readGuide") : t("landing.read")}{" "}
                    <span aria-hidden className="inline-block transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="eyebrow">{t("landing.howEyebrow")}</p>
        <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{t("landing.howTitle")}</h2>
        <ol className="mt-8 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="border-l-2 border-terracotta pl-5">
              <h3 className="font-sans text-base font-semibold tracking-normal">
                {i + 1}. {s.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Closing call to action */}
      <section className="px-4 pt-8 sm:px-6">
        <div className="mx-auto max-w-6xl rounded-2xl bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12">
          <h2 className="text-3xl font-semibold">{t("landing.ctaTitle")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/85">{t("landing.ctaText")}</p>
          <Link
            href="/chat"
            className={cn(buttonVariants({ size: "lg" }), "mt-6 bg-card text-foreground hover:bg-card/90")}
          >
            {t("landing.ctaButton")}
          </Link>
        </div>
      </section>
    </>
  );
}
