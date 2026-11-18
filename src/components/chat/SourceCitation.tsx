"use client";

import { ExternalLink } from "lucide-react";
import { useTranslation } from "@/lib/i18n/I18nProvider";
import type { CitedSource } from "@/types/chat";

/** "Where this came from" chips shown under a grounded assistant answer. */
export function SourceCitation({ sources }: { sources: CitedSource[] }) {
  const { t } = useTranslation();
  if (sources.length === 0) return null;

  // One chip per distinct source URL.
  const unique = [...new Map(sources.map((s) => [s.sourceUrl, s])).values()];

  return (
    <div className="mt-4 border-t border-dashed pt-3">
      <p className="mb-2 text-xs text-muted-foreground">{t("chat.sources")}</p>
      <ul className="flex flex-wrap gap-2">
        {unique.map((s) => (
          <li key={s.sourceUrl}>
            <a
              href={s.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1 text-xs text-secondary-foreground transition-colors hover:bg-secondary/70"
            >
              {s.sourceName}
              <ExternalLink className="size-3 opacity-70" aria-hidden />
              <span className="sr-only">{t("common.opensNewTab")}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
