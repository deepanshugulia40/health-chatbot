"use client";

import { useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

type Rating = "up" | "down";

/** Thumbs up/down (+ optional comment) for one persisted assistant message. */
export function FeedbackButtons({ messageId, initial }: { messageId: string; initial?: Rating }) {
  const { t } = useTranslation();
  const [rating, setRating] = useState<Rating | null>(initial ?? null);
  const [askComment, setAskComment] = useState(false);
  const [comment, setComment] = useState("");
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  async function send(next: Rating | null, withComment?: string) {
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, rating: next, ...(withComment ? { comment: withComment } : {}) }),
      });
      if (!res.ok) throw new Error();
      setRating(next);
      return true;
    } catch {
      setNotice({ text: t("feedback.failed"), error: true });
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function choose(value: Rating) {
    if (rating === value) {
      // Clicking the active thumb withdraws the rating.
      if (await send(null)) setAskComment(false);
      return;
    }
    if (await send(value)) setAskComment(value === "down");
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim() || rating !== "down") return;
    if (await send("down", comment.trim())) {
      setAskComment(false);
      setComment("");
      setNotice({ text: t("feedback.thanks"), error: false });
    }
  }

  const thumb = (value: Rating, Icon: typeof ThumbsUp, label: string) => (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      disabled={busy}
      aria-pressed={rating === value}
      aria-label={label}
      title={label}
      onClick={() => choose(value)}
      className={cn(rating === value && "bg-primary/10 text-primary")}
    >
      <Icon aria-hidden />
    </Button>
  );

  return (
    <div className="mt-3">
      <div className="flex items-center gap-1">
        <span className="mr-1 text-xs text-muted-foreground">{t("feedback.label")}</span>
        {thumb("up", ThumbsUp, t("feedback.up"))}
        {thumb("down", ThumbsDown, t("feedback.down"))}
      </div>

      {askComment && (
        <form onSubmit={submitComment} className="mt-2 space-y-2">
          <label htmlFor={`fb-${messageId}`} className="text-xs font-medium">
            {t("feedback.commentLabel")}
          </label>
          <textarea
            id={`fb-${messageId}`}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            rows={2}
            placeholder={t("feedback.commentPlaceholder")}
            className="w-full resize-none rounded-lg border bg-background px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Button type="submit" size="sm" disabled={busy || !comment.trim()}>
            {t("feedback.submit")}
          </Button>
        </form>
      )}

      {notice && (
        <p role={notice.error ? "alert" : "status"} className={cn("mt-1.5 text-xs", notice.error ? "text-destructive" : "text-muted-foreground")}>
          {notice.text}
        </p>
      )}
    </div>
  );
}
