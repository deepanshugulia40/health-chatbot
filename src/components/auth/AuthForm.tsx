"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isLocale } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

type Mode = "login" | "register";

/** Only allow same-site relative redirects (prevents open redirects). */
function safeCallback(url: string | null) {
  return url && url.startsWith("/") && !url.startsWith("//") ? url : "/chat";
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { t, setLocale } = useTranslation();
  const params = useSearchParams();
  const callbackUrl = safeCallback(params.get("callbackUrl"));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isRegister = mode === "register";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "");
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    try {
      if (isRegister) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok) {
          setError(json?.error ?? t("auth.generic"));
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (!result || result.error) {
        setError(
          isRegister ? t("auth.signInAfterRegister") : t("auth.invalidCredentials")
        );
        return;
      }
      // Apply the language saved on the account (best effort, never blocks login).
      try {
        const me = await fetch("/api/profile").then((r) => (r.ok ? r.json() : null));
        const saved = me?.data?.preferredLanguage;
        if (isLocale(saved)) setLocale(saved);
      } catch {
        /* keep the current language */
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError(t("auth.generic"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border sm:p-8">
      <h1 className="text-3xl font-semibold">
        {isRegister ? t("auth.registerTitle") : t("auth.loginTitle")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {isRegister ? t("auth.registerSubtitle") : t("auth.loginSubtitle")}
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        {isRegister && (
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium">{t("auth.name")}</label>
            <Input id="name" name="name" autoComplete="name" required minLength={2} maxLength={80} />
          </div>
        )}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">{t("auth.email")}</label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">{t("auth.password")}</label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            required
            minLength={isRegister ? 8 : 1}
            maxLength={128}
          />
          {isRegister && (
            <p className="text-xs text-muted-foreground">{t("auth.passwordHint")}</p>
          )}
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-warn px-3 py-2 text-sm text-warn-foreground">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="animate-spin" aria-hidden />}
          {isRegister ? t("auth.registerButton") : t("auth.loginButton")}
        </Button>
      </form>

      <div className="mt-6 space-y-3 text-center text-sm">
        <p className="text-muted-foreground">
          {isRegister ? t("auth.haveAccount") : t("auth.newHere")}{" "}
          <Link
            href={isRegister ? "/login" : "/register"}
            className="font-medium text-primary hover:underline"
          >
            {isRegister ? t("auth.loginButton") : t("auth.createAccountLink")}
          </Link>
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> {t("auth.or")} <span className="h-px flex-1 bg-border" />
        </div>
        <Link
          href="/chat"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
        >
          {t("auth.guest")}
        </Link>
        <p className="text-xs text-muted-foreground">{t("auth.guestNote")}</p>
      </div>
    </div>
  );
}
