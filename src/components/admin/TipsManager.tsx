"use client";

import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminTip } from "@/lib/admin/data";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n/config";
import { Field, NoticeLine, Panel, Select, TextArea, useCrud } from "./shared";

export function TipsManager({ tips }: { tips: AdminTip[] }) {
  const { editing, setEditing, busy, notice, setNotice, save, remove } = useCrud<AdminTip>("/api/admin/tips", "Tip");
  const current = editing && editing !== "new" ? editing : null;

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    void save({
      text: String(f.get("text") ?? ""),
      category: String(f.get("category") ?? ""),
      language: String(f.get("language") ?? "en"),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <NoticeLine notice={editing ? null : notice} />
        <Button
          size="lg"
          className="ml-auto h-10"
          onClick={() => {
            setNotice(null);
            setEditing("new");
          }}
        >
          <Plus aria-hidden /> New tip
        </Button>
      </div>

      {editing && (
        <Panel aria-label={current ? "Edit tip" : "New tip"}>
          <h2 className="text-lg font-semibold">{current ? "Edit tip" : "New tip"}</h2>
          <form key={current?.id ?? "new"} onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field id="text" label="Tip" hint="One short, practical sentence (max 500 characters).">
                <TextArea id="text" name="text" required minLength={5} maxLength={500} defaultValue={current?.text ?? ""} />
              </Field>
            </div>
            <Field id="category" label="Category" hint="Lowercase, e.g. hygiene, nutrition, monsoon">
              <Input id="category" name="category" required maxLength={40} defaultValue={current?.category ?? ""} />
            </Field>
            <Field id="language" label="Language">
              <Select id="language" name="language" defaultValue={current?.language ?? "en"}>
                {LOCALES.map((l) => (
                  <option key={l} value={l}>
                    {LOCALE_LABELS[l]}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="space-y-3 sm:col-span-2">
              <NoticeLine notice={notice} />
              <div className="flex gap-2">
                <Button type="submit" size="lg" className="h-10" disabled={busy}>
                  {busy && <Loader2 className="animate-spin" aria-hidden />} Save
                </Button>
                <Button type="button" size="lg" variant="outline" className="h-10" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </Panel>
      )}

      <Panel aria-label="Tips">
        {tips.length === 0 ? (
          <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No tips yet.</p>
        ) : (
          <ul className="divide-y">
            {tips.map((t) => (
              <li key={t.id} className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm">{t.text}</p>
                  <p className="mt-1.5 flex gap-2">
                    <Badge variant="secondary">{t.category}</Badge>
                    <Badge variant="outline">{LOCALE_LABELS[t.language as keyof typeof LOCALE_LABELS] ?? t.language}</Badge>
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => { setNotice(null); setEditing(t); }}>
                    <Pencil aria-hidden /> Edit
                  </Button>
                  <Button size="sm" variant="destructive" disabled={busy} onClick={() => remove(t, t.text.slice(0, 40))} aria-label="Delete tip">
                    <Trash2 aria-hidden /> Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
