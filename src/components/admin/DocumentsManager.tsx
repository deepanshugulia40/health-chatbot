"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ExternalLink, Loader2, ShieldCheck, ShieldOff, Trash2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminDocument } from "@/lib/admin/data";
import { APPROVED_SOURCE_DOMAINS } from "@/lib/rag/sources";
import { Field, NoticeLine, Panel, adminRequest, formatDate, type Notice } from "./shared";

function StatusBadge({ doc }: { doc: AdminDocument }) {
  if (doc.status === "pending")
    return (
      <Badge variant="secondary">
        <Loader2 className="animate-spin" aria-hidden /> Processing
      </Badge>
    );
  if (doc.status === "failed") return <Badge variant="destructive">Failed</Badge>;
  return doc.verified ? <Badge>Searchable</Badge> : <Badge variant="outline">Needs verification</Badge>;
}

export function DocumentsManager({ documents }: { documents: AdminDocument[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  // Ingestion runs after the upload response, so poll while anything is pending.
  const anyPending = documents.some((d) => d.status === "pending");
  useEffect(() => {
    if (!anyPending) return;
    const timer = setInterval(() => router.refresh(), 4000);
    return () => clearInterval(timer);
  }, [anyPending, router]);

  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotice(null);
    setUploading(true);
    try {
      const res = await fetch("/api/admin/documents", { method: "POST", body: new FormData(e.currentTarget) });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setNotice({ kind: "error", text: json?.error ?? "Upload failed. Please try again." });
        return;
      }
      formRef.current?.reset();
      setNotice({ kind: "ok", text: "Uploaded. It is being processed now, then you can verify it." });
      router.refresh();
    } catch {
      setNotice({ kind: "error", text: "Network error. Please try again." });
    } finally {
      setUploading(false);
    }
  }

  async function setVerified(doc: AdminDocument, verified: boolean) {
    setBusyId(doc.id);
    setNotice(null);
    const r = await adminRequest(`/api/admin/documents/${doc.id}/verify`, "POST", { verified });
    setBusyId(null);
    if (!r.ok) return setNotice({ kind: "error", text: r.error ?? "Could not update document." });
    setNotice({ kind: "ok", text: verified ? `"${doc.title}" is now searchable by the chatbot.` : `"${doc.title}" was removed from search.` });
    router.refresh();
  }

  async function remove(doc: AdminDocument) {
    if (!window.confirm(`Delete "${doc.title}" and all of its ${doc.chunkCount} chunks? This cannot be undone.`)) return;
    setBusyId(doc.id);
    setNotice(null);
    const r = await adminRequest(`/api/admin/documents/${doc.id}`, "DELETE");
    setBusyId(null);
    if (!r.ok) return setNotice({ kind: "error", text: r.error ?? "Could not delete document." });
    setNotice({ kind: "ok", text: "Document deleted." });
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <Panel aria-labelledby="upload-title">
        <h2 id="upload-title" className="text-lg font-semibold">
          Upload a document
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          PDF or .txt. New uploads are staged and are not used in answers until you verify them.
        </p>
        <form ref={formRef} onSubmit={upload} className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field id="title" label="Title">
            <Input id="title" name="title" required minLength={3} maxLength={200} placeholder="Dengue and severe dengue" />
          </Field>
          <Field id="sourceName" label="Publisher">
            <Input id="sourceName" name="sourceName" required minLength={2} maxLength={100} placeholder="WHO" />
          </Field>
          <Field id="sourceUrl" label="Source URL" hint={`Must be on: ${APPROVED_SOURCE_DOMAINS.join(", ")}`}>
            <Input id="sourceUrl" name="sourceUrl" type="url" required maxLength={500} placeholder="https://www.who.int/..." />
          </Field>
          <Field id="topicTags" label="Topic tags" hint="Comma separated, e.g. dengue, mosquito-borne">
            <Input id="topicTags" name="topicTags" maxLength={300} placeholder="dengue, mosquito-borne" />
          </Field>
          <Field id="publishedDate" label="Published date (optional)">
            <Input id="publishedDate" name="publishedDate" type="date" />
          </Field>
          <Field id="file" label="File">
            <Input id="file" name="file" type="file" required accept=".pdf,.txt,application/pdf,text/plain" className="h-9 py-1" />
          </Field>
          <div className="space-y-3 sm:col-span-2">
            <NoticeLine notice={notice} />
            <Button type="submit" size="lg" className="h-10" disabled={uploading}>
              {uploading ? <Loader2 className="animate-spin" aria-hidden /> : <Upload aria-hidden />}
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </form>
      </Panel>

      <Panel aria-labelledby="docs-title">
        <h2 id="docs-title" className="text-lg font-semibold">
          Documents ({documents.length})
        </h2>
        {documents.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No documents yet. Upload your first WHO or MoHFW document above.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-176 text-left text-sm">
              <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3 font-medium">Document</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Chunks</th>
                  <th className="px-3 py-2 font-medium">Added</th>
                  <th className="py-2 pl-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {documents.map((d) => (
                  <tr key={d.id} className="align-top">
                    <td className="py-3 pr-3">
                      <p className="font-medium">{d.title}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                        <a href={d.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                          {d.sourceName} <ExternalLink className="size-3" aria-hidden />
                        </a>
                        {d.topicTags.length > 0 && <span>{d.topicTags.join(", ")}</span>}
                      </p>
                      {d.status === "failed" && d.errorMessage && <p className="mt-1 text-xs text-destructive">{d.errorMessage}</p>}
                      {d.verified && d.needsReview && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <AlertTriangle className="size-3" aria-hidden /> Older than 12 months. Re-check the source.
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge doc={d} />
                    </td>
                    <td className="px-3 py-3 tabular-nums">{d.chunkCount}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">{formatDate(d.createdAt)}</td>
                    <td className="py-3 pl-3">
                      <div className="flex justify-end gap-2">
                        {d.status === "processed" &&
                          (d.verified ? (
                            <Button size="sm" variant="outline" disabled={busyId === d.id} onClick={() => setVerified(d, false)}>
                              <ShieldOff aria-hidden /> Unverify
                            </Button>
                          ) : (
                            <Button size="sm" disabled={busyId === d.id} onClick={() => setVerified(d, true)}>
                              <ShieldCheck aria-hidden /> Verify
                            </Button>
                          ))}
                        <Button size="sm" variant="destructive" disabled={busyId === d.id} onClick={() => remove(d)} aria-label={`Delete ${d.title}`}>
                          <Trash2 aria-hidden /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
