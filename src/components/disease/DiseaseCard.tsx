import Link from "next/link";
import type { TopicSummary } from "@/lib/content";
import { cn } from "@/lib/utils";
import { TopicIcon } from "./TopicIcon";

export function DiseaseCard({
  topic,
  learnMore,
  accent = "green",
}: {
  topic: TopicSummary;
  learnMore: string;
  accent?: "green" | "terracotta";
}) {
  return (
    <Link
      href={`/diseases/${topic.slug}`}
      className={cn(
        "group flex h-full flex-col gap-3 rounded-xl border-t-[3px] bg-card p-5 ring-1 ring-border transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        accent === "green" ? "border-t-primary" : "border-t-terracotta"
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-primary">
        <TopicIcon name={topic.icon} className="size-5" />
      </span>
      <span className="font-heading text-lg font-semibold">{topic.name}</span>
      <span className="flex-1 text-sm text-muted-foreground">{topic.summary}</span>
      <span className="text-xs text-muted-foreground">
        {learnMore}{" "}
        <span aria-hidden className="inline-block transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </span>
    </Link>
  );
}
