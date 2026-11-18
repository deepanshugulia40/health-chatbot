"use client";

import { LOCALES, LOCALE_LABELS, LOCALE_SHORT } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

/** Compact "EN | हि" switch. Scales to more languages by adding them to LOCALES. */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useTranslation();
  return (
    <div
      role="group"
      aria-label={t("nav.language")}
      className={cn(
        "inline-flex h-8 items-center divide-x divide-border overflow-hidden rounded-md border bg-card text-xs font-medium",
        className
      )}
    >
      {LOCALES.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            lang={l}
            title={LOCALE_LABELS[l]}
            aria-pressed={active}
            onClick={() => setLocale(l)}
            className={cn(
              "h-full cursor-pointer px-2.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
              active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {LOCALE_SHORT[l]}
          </button>
        );
      })}
    </div>
  );
}
