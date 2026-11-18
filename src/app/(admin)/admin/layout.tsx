import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { Logo } from "@/components/layout/Logo";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Second gate behind proxy.ts: never trust the optimistic redirect alone.
  await requireAdmin();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 md:flex-row md:gap-10 md:py-10">
      <aside className="min-w-0 rounded-xl bg-muted p-3 md:sticky md:self-start md:top-6 md:w-56 md:shrink-0">
        <div className="mb-3 flex items-baseline gap-2 px-3 pt-1">
          <Logo className="text-xl" />
          <span className="eyebrow">Admin</span>
        </div>
        <AdminNav />
      </aside>
      <main id="main" className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
}
