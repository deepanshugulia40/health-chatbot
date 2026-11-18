"use client";

import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminCampaign } from "@/lib/admin/data";
import { Field, NoticeLine, Panel, TextArea, formatDate, toTags, useCrud } from "./shared";

const dateInput = (iso: string) => iso.slice(0, 10);

function statusOf(c: AdminCampaign): { label: string; variant: "default" | "secondary" | "outline" } {
  const now = Date.now();
  if (!c.active) return { label: "Hidden", variant: "outline" };
  if (new Date(c.endDate).getTime() < now) return { label: "Ended", variant: "outline" };
  if (new Date(c.startDate).getTime() > now) return { label: "Upcoming", variant: "secondary" };
  return { label: "Live", variant: "default" };
}

export function CampaignsManager({ campaigns }: { campaigns: AdminCampaign[] }) {
  const { editing, setEditing, busy, notice, setNotice, save, remove } = useCrud<AdminCampaign>(
    "/api/admin/campaigns",
    "Campaign"
  );
  const current = editing && editing !== "new" ? editing : null;

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    void save({
      title: String(f.get("title") ?? ""),
      description: String(f.get("description") ?? ""),
      topicTags: toTags(String(f.get("topicTags") ?? "")),
      startDate: String(f.get("startDate") ?? ""),
      endDate: String(f.get("endDate") ?? ""),
      active: f.get("active") === "on",
      bannerImageUrl: String(f.get("bannerImageUrl") ?? "").trim(),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <NoticeLine notice={editing ? null : notice} />
        <Button size="lg" className="ml-auto h-10" onClick={() => { setNotice(null); setEditing("new"); }}>
          <Plus aria-hidden /> New campaign
        </Button>
      </div>

      {editing && (
        <Panel aria-label={current ? "Edit campaign" : "New campaign"}>
          <h2 className="text-lg font-semibold">{current ? "Edit campaign" : "New campaign"}</h2>
          <form key={current?.id ?? "new"} onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field id="title" label="Title">
                <Input id="title" name="title" required minLength={3} maxLength={150} defaultValue={current?.title ?? ""} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field id="description" label="Description">
                <TextArea id="description" name="description" required minLength={10} maxLength={2000} defaultValue={current?.description ?? ""} />
              </Field>
            </div>
            <Field id="startDate" label="Start date">
              <Input id="startDate" name="startDate" type="date" required defaultValue={current ? dateInput(current.startDate) : ""} />
            </Field>
            <Field id="endDate" label="End date" hint="The campaign stays live through the end of this day.">
              <Input id="endDate" name="endDate" type="date" required defaultValue={current ? dateInput(current.endDate) : ""} />
            </Field>
            <Field id="topicTags" label="Topic tags" hint="Comma separated, e.g. dengue, monsoon">
              <Input id="topicTags" name="topicTags" maxLength={300} defaultValue={current?.topicTags.join(", ") ?? ""} />
            </Field>
            <Field id="bannerImageUrl" label="Banner image URL (optional)">
              <Input id="bannerImageUrl" name="bannerImageUrl" type="url" maxLength={500} defaultValue={current?.bannerImageUrl ?? ""} />
            </Field>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input type="checkbox" name="active" defaultChecked={current?.active ?? true} className="size-4 accent-primary" />
              Show this campaign on the site
            </label>
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

      <Panel aria-label="Campaigns">
        {campaigns.length === 0 ? (
          <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No campaigns yet.</p>
        ) : (
          <ul className="divide-y">
            {campaigns.map((c) => {
              const s = statusOf(c);
              return (
                <li key={c.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-medium">
                      {c.title} <Badge variant={s.variant}>{s.label}</Badge>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(c.startDate)} to {formatDate(c.endDate)}
                      {c.topicTags.length > 0 && ` · ${c.topicTags.join(", ")}`}
                    </p>
                    <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => { setNotice(null); setEditing(c); }}>
                      <Pencil aria-hidden /> Edit
                    </Button>
                    <Button size="sm" variant="destructive" disabled={busy} onClick={() => remove(c, c.title)} aria-label={`Delete ${c.title}`}>
                      <Trash2 aria-hidden /> Delete
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
