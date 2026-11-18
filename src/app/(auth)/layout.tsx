import { SiteShell } from "@/components/layout/SiteShell";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteShell>
      <div className="flex min-h-[calc(100vh-16rem)] items-start justify-center px-4 py-12 sm:py-20">
        {children}
      </div>
    </SiteShell>
  );
}
