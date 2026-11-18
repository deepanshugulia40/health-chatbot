"use client";

import { Flame, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TOPIC_ICON_KEYS } from "@/components/disease/TopicIcon";
import type { AdminTopic } from "@/lib/admin/data";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n/config";
import { Field, NoticeLine, Panel, Select, TextArea, fromLines, toLines, toPairs, useCrud } from "./shared";

const slugify = (v: string) =>
  v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const pairsToText = (rows: Record<string, string>[], a: string, b: string) =>
  rows.map((r) => `${r[a]} | ${r[b]}`).join("\n");

export function TopicsManager({ topics, categories }: { topics: AdminTopic[]; categories: readonly string[] }) {
  const { editing, setEditing, busy, notice, setNotice, save, remove } = useCrud<AdminTopic>("/api/admin/topics", "Topic");
  const current = editing && editing !== "new" ? editing : null;

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const s = (k: string) => String(f.get(k) ?? "");
    void save({
      name: s("name"),
      slug: s("slug") || slugify(s("name")),
      category: s("category"),
      icon: s("icon") || "heart-pulse",
      summary: s("summary"),
      kind: s("kind"),
      glance: toPairs(s("glance")).map(([label, value]) => ({ label, value })),
      overview: s("overview"),
      symptoms: toLines(s("symptoms")),
      causes: toLines(s("causes")),
      prevention: toLines(s("prevention")),
      whenToSeekHelp: toLines(s("whenToSeekHelp")),
      mythsVsFacts: toPairs(s("mythsVsFacts")).map(([myth, fact]) => ({ myth, fact })),
      sourceRefs: toPairs(s("sourceRefs")).map(([sourceName, sourceUrl]) => ({ sourceName, sourceUrl })),
      language: s("language") || "en",
      trending: f.get("trending") === "on",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <NoticeLine notice={editing ? null : notice} />
        <Button size="lg" className="ml-auto h-10" onClick={() => { setNotice(null); setEditing("new"); }}>
          <Plus aria-hidden /> New topic
        </Button>
      </div>

      {editing && (
        <Panel aria-label={current ? "Edit topic" : "New topic"}>
          <h2 className="text-lg font-semibold">{current ? `Edit ${current.name}` : "New topic"}</h2>
          <form key={current?.id ?? "new"} onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field id="name" label="Name">
              <Input id="name" name="name" required minLength={2} maxLength={120} defaultValue={current?.name ?? ""} />
            </Field>
            <Field id="slug" label="URL slug" hint="Used in /diseases/<slug>. Leave blank to generate from the name.">
              <Input id="slug" name="slug" maxLength={60} pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={current?.slug ?? ""} />
            </Field>
            <Field id="category" label="Category">
              <Select id="category" name="category" defaultValue={current?.category ?? categories[0]}>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
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
            <Field id="icon" label="Icon">
              <Select id="icon" name="icon" defaultValue={current?.icon ?? "heart-pulse"}>
                {TOPIC_ICON_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </Select>
            </Field>
            <label className="flex items-center gap-2 self-end pb-2 text-sm">
              <input type="checkbox" name="trending" defaultChecked={current?.trending ?? false} className="size-4 accent-primary" />
              Mark as trending
            </label>
            <div className="sm:col-span-2">
              <Field id="summary" label="Summary" hint="Shown on the topic card (10 to 500 characters).">
                <TextArea id="summary" name="summary" required minLength={10} maxLength={500} defaultValue={current?.summary ?? ""} />
              </Field>
            </div>
            <Field id="kind" label="Kind label" hint='Small label above the title, e.g. "Mosquito-borne".'>
              <Input id="kind" name="kind" maxLength={60} defaultValue={current?.kind ?? ""} />
            </Field>
            <Field id="glance" label="At a glance" hint="One per line, as: label | value (up to 8)">
              <TextArea
                id="glance"
                name="glance"
                rows={4}
                placeholder="Spread by | Aedes mosquito"
                defaultValue={pairsToText(current?.glance ?? [], "label", "value")}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field id="overview" label="Overview">
                <TextArea id="overview" name="overview" rows={5} maxLength={5000} defaultValue={current?.overview ?? ""} />
              </Field>
            </div>
            <Field id="symptoms" label="Symptoms" hint="One per line.">
              <TextArea id="symptoms" name="symptoms" rows={5} defaultValue={fromLines(current?.symptoms ?? [])} />
            </Field>
            <Field id="causes" label="Causes" hint="One per line.">
              <TextArea id="causes" name="causes" rows={5} defaultValue={fromLines(current?.causes ?? [])} />
            </Field>
            <Field id="prevention" label="Prevention" hint="One per line.">
              <TextArea id="prevention" name="prevention" rows={5} defaultValue={fromLines(current?.prevention ?? [])} />
            </Field>
            <Field id="whenToSeekHelp" label="When to seek help" hint="One per line.">
              <TextArea id="whenToSeekHelp" name="whenToSeekHelp" rows={5} defaultValue={fromLines(current?.whenToSeekHelp ?? [])} />
            </Field>
            <Field id="mythsVsFacts" label="Myths and facts" hint="One per line, as: myth | fact">
              <TextArea
                id="mythsVsFacts"
                name="mythsVsFacts"
                rows={5}
                defaultValue={pairsToText(current?.mythsVsFacts ?? [], "myth", "fact")}
              />
            </Field>
            <Field id="sourceRefs" label="Sources" hint="One per line, as: name | https://url">
              <TextArea
                id="sourceRefs"
                name="sourceRefs"
                rows={5}
                defaultValue={pairsToText(current?.sourceRefs ?? [], "sourceName", "sourceUrl")}
              />
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

      <Panel aria-label="Topics">
        {topics.length === 0 ? (
          <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No topics yet. Run the seed script or add one above.
          </p>
        ) : (
          <ul className="divide-y">
            {topics.map((t) => (
              <li key={t.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    {t.name}
                    <Badge variant="secondary">{t.category}</Badge>
                    <Badge variant="outline">{LOCALE_LABELS[t.language as keyof typeof LOCALE_LABELS] ?? t.language}</Badge>
                    {t.trending && (
                      <Badge>
                        <Flame aria-hidden /> Trending
                      </Badge>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">/diseases/{t.slug}</p>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{t.summary}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => { setNotice(null); setEditing(t); }}>
                    <Pencil aria-hidden /> Edit
                  </Button>
                  <Button size="sm" variant="destructive" disabled={busy} onClick={() => remove(t, t.name)} aria-label={`Delete ${t.name}`}>
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
