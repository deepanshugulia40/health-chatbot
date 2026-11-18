"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, BookOpen, Library, Lightbulb, LayoutDashboard, Megaphone, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/knowledge-base", label: "Knowledge base", icon: Library },
  { href: "/admin/topics", label: "Topics", icon: BookOpen },
  { href: "/admin/tips", label: "Tips", icon: Lightbulb },
  { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/admin/feedback", label: "Feedback", icon: MessageSquareText },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {LINKS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-card/70 hover:text-foreground",
              active && "bg-card font-medium text-foreground ring-1 ring-border"
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        );
      })}
      <Link
        href="/"
        className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground md:mt-4 md:border-t md:pt-4"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to site
      </Link>
    </nav>
  );
}
