import type { Metadata } from "next";
import Link from "next/link";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { formatDate } from "@/components/admin/shared";
import { ContentUnavailable } from "@/components/ContentUnavailable";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { listFeedback, type AdminFeedback } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Feedback" };
export const dynamic = "force-dynamic";

const FILTERS = [
  { value: undefined, label: "All", href: "/admin/feedback" },
  { value: "down", label: "Not helpful", href: "/admin/feedback?rating=down" },
  { value: "up", label: "Helpful", href: "/admin/feedback?rating=up" },
] as const;

export default async function FeedbackPage({ searchParams }: { searchParams: Promise<{ rating?: string }> }) {
  const { rating: raw } = await searchParams;
  const rating = raw === "up" || raw === "down" ? raw : undefined;

  let items: AdminFeedback[] | null = null;
  try {
    items = await listFeedback(rating);
  } catch (err) {
    console.error("[admin] feedback failed:", err instanceof Error ? err.message : err);
  }

  return (
    <>
      <PageHeader
        title="Feedback"
        description="Thumbs up and down on chatbot answers, newest first (latest 100). Start with the not-helpful ones to find gaps in the knowledge base. Users are not identified here."
      />

      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter feedback">
        {FILTERS.map((f) => (
          <Link
            key={f.label}
            href={f.href}
            aria-current={f.value === rating ? "true" : undefined}
            className={buttonVariants({ variant: f.value === rating ? "default" : "outline", size: "lg" })}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {items === null ? (
        <ContentUnavailable message="Could not load feedback." />
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">No feedback to show yet.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((i) => (
            <li key={i.id} className="rounded-xl bg-card p-5 ring-1 ring-border">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={i.rating === "up" ? "default" : "destructive"}>
                  {i.rating === "up" ? <ThumbsUp aria-hidden /> : <ThumbsDown aria-hidden />}
                  {i.rating === "up" ? "Helpful" : "Not helpful"}
                </Badge>
                <span className="text-xs text-muted-foreground">{formatDate(i.createdAt)}</span>
              </div>
              {i.comment && <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm">&ldquo;{i.comment}&rdquo;</p>}
              <div className="mt-3 space-y-2 text-sm">
                <p>
                  <span className="font-medium">Question: </span>
                  {i.question ?? <span className="text-muted-foreground">Not available</span>}
                </p>
                {i.answer ? (
                  <details className="group">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Show the answer</summary>
                    <p className="mt-2 whitespace-pre-wrap rounded-lg border p-3">{i.answer}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Sources: {i.sources.length > 0 ? i.sources.join(", ") : "none cited"}
                    </p>
                  </details>
                ) : (
                  <p className="text-muted-foreground">The answer was deleted.</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
