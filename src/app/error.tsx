"use client";

import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/I18nProvider";

/** Shown when a page throws while rendering. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useTranslation();
  return (
    <main id="main" className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <Logo />
      <h1 className="mt-10 text-4xl font-semibold">{t("status.errorTitle")}</h1>
      <p className="mt-4 leading-7 text-muted-foreground">{t("status.errorText")}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" onClick={reset}>
          {t("status.retry")}
        </Button>
        <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" })}>
          {t("status.home")}
        </Link>
      </div>
    </main>
  );
}
