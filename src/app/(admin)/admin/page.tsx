import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { ContentUnavailable } from "@/components/ContentUnavailable";
import { getAdminStats, type AdminStats } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Overview" };
export const dynamic = "force-dynamic";

function Stat({ label, value, hint, href }: { label: string; value: number | string; hint?: string; href?: string }) {
  const body = (
    <>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={`mt-1 font-heading font-semibold tabular-nums ${/^[\d\s/%]+$/.test(String(value)) ? "text-3xl" : "text-xl leading-snug"}`}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </>
  );
  const cls = "rounded-xl bg-card p-5 ring-1 ring-border";
  return href ? (
    <Link href={href} className={`${cls} transition-colors hover:bg-muted`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export default async function AdminOverviewPage() {
  let stats: AdminStats | null = null;
  try {
    stats = await getAdminStats();
  } catch (err) {
    console.error("[admin] stats failed:", err instanceof Error ? err.message : err);
  }
  if (!stats) return <ContentUnavailable message="Could not load the dashboard." />;

  const { documents: d, content: c, feedback: f } = stats;
  const totalRated = f.up + f.down;

  return (
    <>
      <PageHeader title="Overview" description="How the chatbot, the knowledge base and the site content are doing." />

      <h2 className="eyebrow mb-3 font-sans !text-muted-foreground">Usage</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Registered users" value={stats.users} />
        <Stat label="Conversations" value={stats.conversations} hint="Saved for signed-in users" />
        <Stat label="Questions asked" value={stats.userQuestions} hint="Signed-in users only" />
        <Stat label="Emergency flags" value={stats.emergencyFlags} hint="Messages routed to emergency guidance" />
      </div>

      <h2 className="eyebrow mb-3 mt-8 font-sans !text-muted-foreground">Knowledge base</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Documents" value={d.total} hint={`${d.verified} verified`} href="/admin/knowledge-base" />
        <Stat label="Searchable chunks" value={stats.searchableChunks} hint="Used to answer questions" href="/admin/knowledge-base" />
        <Stat label="Awaiting verification" value={d.awaitingVerification} href="/admin/knowledge-base" />
        <Stat label="Failed or processing" value={`${d.failed} / ${d.pending}`} hint="failed / processing" href="/admin/knowledge-base" />
      </div>

      <h2 className="eyebrow mb-3 mt-8 font-sans !text-muted-foreground">Content and quality</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Topics" value={c.topics} href="/admin/topics" />
        <Stat label="Tips" value={c.tips} href="/admin/tips" />
        <Stat label="Live campaigns" value={c.activeCampaigns} href="/admin/campaigns" />
        <Stat
          label="Helpful answers"
          value={totalRated === 0 ? "No ratings yet" : `${Math.round((f.up / totalRated) * 100)}%`}
          hint={`${f.up} up, ${f.down} down`}
          href="/admin/feedback"
        />
      </div>

      <h2 className="eyebrow mb-3 mt-8 font-sans !text-muted-foreground">Needs attention</h2>
      {stats.attention.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-card p-6 text-sm text-muted-foreground">Nothing needs your attention right now.</p>
      ) : (
        <ul className="divide-y rounded-xl bg-card ring-1 ring-border">
          {stats.attention.map((a) => (
            <li key={a.id} className="flex items-start gap-3 p-4">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.reason}</p>
              </div>
              <Link href="/admin/knowledge-base" className="flex shrink-0 items-center gap-1 text-sm text-primary hover:underline">
                Review <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
