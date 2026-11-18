"use client";

import { useTranslation } from "@/lib/i18n/I18nProvider";
import type { TKey } from "@/lib/i18n/translate";

const STARTER_KEYS: TKey[] = ["chat.q1", "chat.q2", "chat.q3", "chat.q4", "chat.q5"];

export function SuggestedQuestions({
  onSelect,
  disabled,
}: {
  onSelect: (q: string) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <ul className="flex flex-wrap justify-center gap-2" aria-label={t("chat.suggested")}>
      {STARTER_KEYS.map((key) => {
        const q = t(key);
        return (
          <li key={key}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect(q)}
              className="rounded-full border bg-card px-4 py-2 text-left text-sm transition-colors hover:border-primary/50 hover:bg-muted disabled:opacity-50"
            >
              {q}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
