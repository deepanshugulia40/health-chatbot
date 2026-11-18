"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type Notice = { kind: "ok" | "error"; text: string } | null;

/**
 * Create / edit / delete state for a content list. `basePath` is the collection
 * API (e.g. /api/admin/tips); items are PATCHed/DELETEd at `${basePath}/${id}`.
 */
export function useCrud<T extends { id: string }>(basePath: string, label: string) {
  const router = useRouter();
  const [editing, setEditing] = useState<T | "new" | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  async function save(body: unknown) {
    setNotice(null);
    setBusy(true);
    const isNew = editing === "new";
    const r = isNew
      ? await adminRequest(basePath, "POST", body)
      : await adminRequest(`${basePath}/${(editing as T).id}`, "PATCH", body);
    setBusy(false);
    if (!r.ok) {
      setNotice({ kind: "error", text: r.error ?? "Could not save." });
      return false;
    }
    setEditing(null);
    setNotice({ kind: "ok", text: isNew ? `${label} created.` : `${label} saved.` });
    router.refresh();
    return true;
  }

  async function remove(item: T, name: string) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setNotice(null);
    setBusy(true);
    const r = await adminRequest(`${basePath}/${item.id}`, "DELETE");
    setBusy(false);
    if (!r.ok) return setNotice({ kind: "error", text: r.error ?? "Could not delete." });
    setEditing((cur) => (cur !== "new" && cur?.id === item.id ? null : cur));
    setNotice({ kind: "ok", text: `${label} deleted.` });
    router.refresh();
  }

  return { editing, setEditing, busy, notice, setNotice, save, remove };
}

/** JSON request to an admin API. Never throws: returns { ok, error }. */
export async function adminRequest(url: string, method: "POST" | "PATCH" | "DELETE", body?: unknown) {
  try {
    const res = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const json = await res.json().catch(() => null);
    return { ok: res.ok, error: res.ok ? null : ((json?.error as string | undefined) ?? "Something went wrong. Please try again.") };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

export function NoticeLine({ notice }: { notice: Notice }) {
  if (!notice) return null;
  return notice.kind === "ok" ? (
    <p role="status" className="flex items-center gap-1.5 text-sm text-primary">
      <CheckCircle2 className="size-4" aria-hidden /> {notice.text}
    </p>
  ) : (
    <p role="alert" className="rounded-lg bg-warn px-3 py-2 text-sm text-warn-foreground">
      {notice.text}
    </p>
  );
}

export function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

const controlBase =
  "w-full rounded-lg border border-input bg-card px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30";

export function TextArea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(controlBase, "min-h-20 py-2", className)} {...props} />;
}

export function Select({ className, ...props }: React.ComponentProps<"select">) {
  return <select className={cn(controlBase, "h-10", className)} {...props} />;
}

/** One entry per line, blanks dropped. */
export const toLines = (v: string) =>
  v
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

export const fromLines = (v: string[]) => v.join("\n");

/** "left | right" per line. Lines without a separator get an empty right side. */
export function toPairs(v: string): [string, string][] {
  return toLines(v).map((line) => {
    const i = line.indexOf("|");
    return i === -1 ? [line, ""] : [line.slice(0, i).trim(), line.slice(i + 1).trim()];
  });
}

export const toTags = (v: string) =>
  v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export const formatDate = (iso: string) =>
  iso
    ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(new Date(iso))
    : "";

/** Panel wrapper used for forms and tables so every admin screen looks alike. */
export function Panel({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("rounded-xl bg-card p-5 ring-1 ring-border sm:p-6", className)} {...props} />;
}
