import { dictionaries, type Dictionary } from "./dictionaries";
import type { Locale } from "./config";

type Leaves<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];

/** Every valid dictionary key, e.g. "nav.home". Typos fail at compile time. */
export type TKey = Leaves<Dictionary>;

export type Vars = Record<string, string | number>;

function lookup(dict: unknown, key: string): string | undefined {
  let node: unknown = dict;
  for (const part of key.split(".")) {
    if (node && typeof node === "object" && part in node) node = (node as Record<string, unknown>)[part];
    else return undefined;
  }
  return typeof node === "string" ? node : undefined;
}

function interpolate(text: string, vars?: Vars) {
  return vars ? text.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m)) : text;
}

/** Looks a key up in a locale, falling back to English, then to `fallback`. */
export function translateKey(locale: Locale, key: string, fallback?: string, vars?: Vars): string {
  const text = lookup(dictionaries[locale], key) ?? lookup(dictionaries.en, key);
  return interpolate(text ?? fallback ?? key, vars);
}

export type TFunction = (key: TKey, vars?: Vars) => string;
/** For keys built at runtime (e.g. a category from the database). */
export type TDynamic = (key: string, fallback: string) => string;

export function makeTranslators(locale: Locale): { t: TFunction; td: TDynamic } {
  return {
    t: (key, vars) => translateKey(locale, key, undefined, vars),
    td: (key, fallback) => translateKey(locale, key, fallback),
  };
}
