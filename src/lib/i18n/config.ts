/**
 * Single source of truth for supported languages.
 * To add a language: create src/lib/i18n/<code>.json (same keys as en.json),
 * register it in dictionaries.ts, and add its code + label here.
 */
export const LOCALES = ["en", "hi"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "lang";

/** Shown in the language picker, written in the language itself. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  hi: "हिन्दी",
};

/** Compact labels for the header toggle. */
export const LOCALE_SHORT: Record<Locale, string> = {
  en: "EN",
  hi: "हि",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Picks a supported locale from an Accept-Language header, if any. */
export function localeFromAcceptLanguage(header: string | null | undefined): Locale | null {
  if (!header) return null;
  for (const part of header.split(",")) {
    const code = part.split(";")[0].trim().toLowerCase().split("-")[0];
    if (isLocale(code)) return code;
  }
  return null;
}
