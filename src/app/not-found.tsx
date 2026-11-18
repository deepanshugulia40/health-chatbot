import Link from "next/link";
import { SiteShell } from "@/components/layout/SiteShell";
import { buttonVariants } from "@/components/ui/button";
import { getT } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getT();
  return (
    <SiteShell>
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <p className="eyebrow">404</p>
        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{t("status.notFoundTitle")}</h1>
        <p className="mt-4 leading-7 text-muted-foreground">{t("status.notFoundText")}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className={buttonVariants({ size: "lg" })}>
            {t("status.home")}
          </Link>
          <Link href="/chat" className={buttonVariants({ variant: "outline", size: "lg" })}>
            {t("status.chat")}
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
