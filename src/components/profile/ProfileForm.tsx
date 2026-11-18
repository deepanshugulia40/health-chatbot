"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LOCALES, LOCALE_LABELS, isLocale, type Locale } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/I18nProvider";

type Status = { kind: "ok" | "error"; text: string } | null;

function StatusLine({ status }: { status: Status }) {
  if (!status) return null;
  return status.kind === "ok" ? (
    <p role="status" className="flex items-center gap-1.5 text-sm text-primary">
      <CheckCircle2 className="size-4" aria-hidden /> {status.text}
    </p>
  ) : (
    <p role="alert" className="rounded-lg bg-warn px-3 py-2 text-sm text-warn-foreground">
      {status.text}
    </p>
  );
}

async function api(url: string, method: string, body: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  return { ok: res.ok, error: (json?.error as string | undefined) ?? null };
}

export function ProfileForm({
  initial,
}: {
  initial: { name: string; email: string; preferredLanguage: Locale };
}) {
  const { t, setLocale } = useTranslation();
  const { update } = useSession();

  const [profileStatus, setProfileStatus] = useState<Status>(null);
  const [profileBusy, setProfileBusy] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<Status>(null);
  const [passwordBusy, setPasswordBusy] = useState(false);

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileStatus(null);
    setProfileBusy(true);
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "");
    const lang = String(form.get("preferredLanguage") ?? "");
    try {
      const r = await api("/api/profile", "PATCH", { name, preferredLanguage: lang });
      if (!r.ok) {
        setProfileStatus({ kind: "error", text: r.error ?? t("profile.generic") });
        return;
      }
      await update(); // refresh the session so the navbar shows the new name
      if (isLocale(lang)) setLocale(lang); // apply the language right away
      setProfileStatus({ kind: "ok", text: t("profile.saved") });
    } catch {
      setProfileStatus({ kind: "error", text: t("profile.generic") });
    } finally {
      setProfileBusy(false);
    }
  }

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordStatus(null);
    setPasswordBusy(true);
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    try {
      const r = await api("/api/profile/password", "POST", {
        currentPassword: String(form.get("currentPassword") ?? ""),
        newPassword: String(form.get("newPassword") ?? ""),
      });
      if (!r.ok) {
        setPasswordStatus({ kind: "error", text: r.error ?? t("profile.generic") });
        return;
      }
      formEl.reset();
      setPasswordStatus({ kind: "ok", text: t("profile.passwordChanged") });
    } catch {
      setPasswordStatus({ kind: "error", text: t("profile.generic") });
    } finally {
      setPasswordBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={saveProfile} className="space-y-4 rounded-xl bg-card p-5 ring-1 ring-border sm:p-6">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">{t("profile.email")}</label>
          <Input id="email" value={initial.email} readOnly disabled aria-describedby="email-note" />
          <p id="email-note" className="text-xs text-muted-foreground">{t("profile.emailNote")}</p>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">{t("profile.name")}</label>
          <Input id="name" name="name" defaultValue={initial.name} required minLength={2} maxLength={80} autoComplete="name" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="preferredLanguage" className="text-sm font-medium">{t("profile.language")}</label>
          <select
            id="preferredLanguage"
            name="preferredLanguage"
            defaultValue={initial.preferredLanguage}
            className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {LOCALES.map((l) => (
              <option key={l} value={l}>{LOCALE_LABELS[l]}</option>
            ))}
          </select>
        </div>
        <StatusLine status={profileStatus} />
        <Button type="submit" size="lg" disabled={profileBusy}>
          {profileBusy && <Loader2 className="animate-spin" aria-hidden />}
          {profileBusy ? t("profile.saving") : t("profile.save")}
        </Button>
      </form>

      <form onSubmit={changePassword} className="space-y-4 rounded-xl bg-card p-5 ring-1 ring-border sm:p-6">
        <h2 className="text-xl font-semibold">{t("profile.passwordTitle")}</h2>
        <div className="space-y-1.5">
          <label htmlFor="currentPassword" className="text-sm font-medium">{t("profile.currentPassword")}</label>
          <Input id="currentPassword" name="currentPassword" type="password" required maxLength={128} autoComplete="current-password" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="newPassword" className="text-sm font-medium">{t("profile.newPassword")}</label>
          <Input id="newPassword" name="newPassword" type="password" required minLength={8} maxLength={128} autoComplete="new-password" />
          <p className="text-xs text-muted-foreground">{t("profile.newPasswordHint")}</p>
        </div>
        <StatusLine status={passwordStatus} />
        <Button type="submit" size="lg" variant="outline" disabled={passwordBusy}>
          {passwordBusy && <Loader2 className="animate-spin" aria-hidden />}
          {t("profile.changePassword")}
        </Button>
      </form>
    </div>
  );
}
