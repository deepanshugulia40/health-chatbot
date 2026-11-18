"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/lib/i18n/I18nProvider";

export type ConversationItem = {
  id: string;
  title: string;
  /** Formatted on the server so server and client output always match. */
  updatedLabel: string;
  messageCount: number;
};

export function ConversationList({ items }: { items: ConversationItem[] }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [target, setTarget] = useState<ConversationItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmDelete() {
    if (!target) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/conversations/${target.id}`, { method: "DELETE" });
      // 404 means it is already gone, which is the outcome the user wanted.
      if (!res.ok && res.status !== 404) throw new Error();
      setTarget(null);
      router.refresh();
    } catch {
      setError(t("history.deleteFailed"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <ul className="space-y-3">
        {items.map((c) => (
          <li key={c.id} className="flex items-center gap-2 rounded-xl bg-card p-2 ring-1 ring-border">
            <Link
              href={`/chat?c=${c.id}`}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                <MessageSquare className="size-5" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium">{c.title}</span>
                <span className="block text-xs text-muted-foreground">
                  {c.updatedLabel} · {t("history.messages", { count: c.messageCount })}
                </span>
              </span>
              <span className="sr-only">{t("history.open")}</span>
            </Link>
            <Button
              variant="ghost"
              size="icon-lg"
              aria-label={t("history.deleteLabel", { title: c.title })}
              onClick={() => {
                setError(null);
                setTarget(c);
              }}
            >
              <Trash2 aria-hidden />
            </Button>
          </li>
        ))}
      </ul>

      <Dialog open={target !== null} onOpenChange={(open) => !open && !deleting && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("history.deleteTitle")}</DialogTitle>
            <DialogDescription>{t("history.deleteBody")}</DialogDescription>
          </DialogHeader>
          {target && <p className="truncate rounded-lg bg-muted px-3 py-2 text-sm font-medium">{target.title}</p>}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)} disabled={deleting}>
              {t("history.cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting && <Loader2 className="animate-spin" aria-hidden />}
              {deleting ? t("history.deleting") : t("history.confirmDelete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
