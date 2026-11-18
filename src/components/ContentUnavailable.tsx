import { DatabaseZap } from "lucide-react";
import { getT } from "@/lib/i18n/server";

export async function ContentUnavailable({ message }: { message: string }) {
  const { t } = await getT();
  return (
    <div role="status" className="mx-auto max-w-md rounded-xl border border-dashed bg-card p-8 text-center">
      <DatabaseZap className="mx-auto size-8 text-muted-foreground" aria-hidden />
      <p className="mt-3 font-medium">{message}</p>
      <p className="mt-1 text-sm text-muted-foreground">{t("content.tryAgain")}</p>
    </div>
  );
}
