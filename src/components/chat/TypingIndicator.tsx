"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n/I18nProvider";

export function TypingIndicator() {
  const { t } = useTranslation();
  return (
    <div role="status" aria-label={t("chat.typing")} className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-2 rounded-full bg-muted-foreground/60"
          animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}
