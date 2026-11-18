import type { Metadata } from "next";
import { ContentUnavailable } from "@/components/ContentUnavailable";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { requireUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireUser("/profile");
  const { t } = await getT();

  let profile: { name: string; email: string; preferredLanguage: Locale } | null = null;
  try {
    await connectDB();
    const user = await User.findById(session.id).select("name email preferredLanguage").lean();
    if (user) {
      profile = {
        name: user.name,
        email: user.email,
        preferredLanguage: isLocale(user.preferredLanguage) ? user.preferredLanguage : "en",
      };
    }
  } catch (err) {
    console.error("[profile] load failed:", err instanceof Error ? err.message : err);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <p className="eyebrow">{t("profile.eyebrow")}</p>
        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{t("profile.title")}</h1>
        <p className="mt-4 leading-7 text-muted-foreground">{t("profile.intro")}</p>
      </header>
      {profile ? <ProfileForm initial={profile} /> : <ContentUnavailable message={t("profile.loadFailed")} />}
    </div>
  );
}
