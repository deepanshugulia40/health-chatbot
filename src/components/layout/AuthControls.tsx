"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

/** "Sign in" for guests; history, profile and sign-out for signed-in users. */
export function AuthControls({ stacked = false }: { stacked?: boolean }) {
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const wrap = cn("flex items-center gap-2", stacked && "flex-col items-stretch");

  if (status === "loading") {
    return <Skeleton className="h-9 w-24" />;
  }

  if (!session?.user) {
    return (
      <div className={wrap}>
        <Link href="/login" className={buttonVariants({ variant: "outline" })}>
          {t("nav.login")}
        </Link>
        {stacked && (
          <Link href="/register" className={buttonVariants({ variant: "ghost" })}>
            {t("nav.signup")}
          </Link>
        )}
      </div>
    );
  }

  const link = buttonVariants({ variant: stacked ? "outline" : "ghost" });
  return (
    <div className={wrap}>
      {session.user.role === "admin" && (
        <Link href="/admin" className={buttonVariants({ variant: "outline" })}>
          {t("nav.admin")}
        </Link>
      )}
      <Link href="/history" className={link}>
        {t("nav.history")}
      </Link>
      <Link href="/profile" className={link}>
        <span className="max-w-28 truncate">{session.user.name ?? t("nav.profile")}</span>
      </Link>
      {stacked ? (
        <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut aria-hidden />
          {t("nav.logout")}
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("nav.logout")}
          title={t("nav.logout")}
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut aria-hidden />
        </Button>
      )}
    </div>
  );
}
