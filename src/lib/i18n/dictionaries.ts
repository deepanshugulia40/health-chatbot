import en from "./en.json";
import hi from "./hi.json";
import type { Locale } from "./config";

/** English is the reference shape: every other dictionary must match it. */
export type Dictionary = typeof en;

export const dictionaries: Record<Locale, Dictionary> = { en, hi };
