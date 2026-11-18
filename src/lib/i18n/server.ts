import "server-only";
import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, localeFromAcceptLanguage, type Locale } from "./config";
import { makeTranslators } from "./translate";

/** Chosen language: cookie first, then the browser's Accept-Language, then English. */
export async function getLocale(): Promise<Locale> {
  const fromCookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;
  const fromHeader = localeFromAcceptLanguage((await headers()).get("accept-language"));
  return fromHeader ?? DEFAULT_LOCALE;
}

/** Translators for Server Components. */
export async function getT() {
  const locale = await getLocale();
  return { locale, ...makeTranslators(locale) };
}
