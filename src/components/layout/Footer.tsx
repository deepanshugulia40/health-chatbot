import Link from "next/link";
import { getT } from "@/lib/i18n/server";
import { NAV_LINKS, TRUSTED_SOURCES } from "@/lib/site";
import { Logo } from "./Logo";

export async function Footer() {
  const { t } = await getT();
  return (
    <footer className="mt-16 border-t bg-muted/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-sm text-sm text-muted-foreground">{t("footer.disclaimer")}</p>
          <p className="text-sm font-medium text-warn-foreground">{t("footer.emergency")}</p>
        </div>

        <nav aria-label="Footer" className="space-y-3">
          <h2 className="eyebrow font-sans">{t("footer.explore")}</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-foreground">
                  {t(l.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-3">
          <h2 className="eyebrow font-sans">{t("footer.infoSources")}</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {TRUSTED_SOURCES.map((s) => (
              <li key={s.name}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                  {s.full}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t px-4 py-4 text-center text-xs text-muted-foreground">{t("footer.affiliation")}</div>
    </footer>
  );
}
