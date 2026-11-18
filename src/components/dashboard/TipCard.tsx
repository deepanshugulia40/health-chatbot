import { Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Tip } from "@/lib/content";

/** Fallback label for categories without a translation. */
export function formatCategory(c: string) {
  return c.replace(/-/g, " ").replace(/^\w/, (m) => m.toUpperCase());
}

export function TipCard({
  tip,
  categoryLabel,
  featured = false,
}: {
  tip: Tip;
  categoryLabel: string;
  featured?: boolean;
}) {
  return (
    <article
      className={cn(
        "flex h-full flex-col gap-3 rounded-xl p-5",
        featured ? "bg-primary text-primary-foreground" : "bg-card ring-1 ring-border"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-lg",
            featured ? "bg-primary-foreground/15 text-primary-foreground" : "bg-secondary text-primary"
          )}
        >
          <Lightbulb className="size-4" aria-hidden />
        </span>
        <Badge variant="secondary">{categoryLabel}</Badge>
      </div>
      <p className={cn("leading-7", featured && "font-heading text-xl leading-8")}>{tip.text}</p>
    </article>
  );
}
