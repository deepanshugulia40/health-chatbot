import Link from "next/link";
import { cn } from "@/lib/utils";

/** "Swasth." wordmark: serif, with a terracotta full stop. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Swasth, home"
      className={cn("inline-block font-heading text-2xl leading-none font-semibold tracking-tight text-primary", className)}
    >
      Swasth<span className="text-terracotta">.</span>
    </Link>
  );
}
