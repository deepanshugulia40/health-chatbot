import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { LOCALES } from "@/lib/i18n/config";

const bodySchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(80, "Name is too long"),
    preferredLanguage: z.enum(LOCALES),
  })
  .partial()
  .refine((v) => v.name !== undefined || v.preferredLanguage !== undefined, "Nothing to update");

const fail = (error: string, status: number) => Response.json({ success: false, error }, { status });

/** GET: the signed-in user's profile. */
export async function GET() {
  const session = await getSessionUser();
  if (!session) return fail("Unauthorized", 401);
  try {
    await connectDB();
    const user = await User.findById(session.id).select("name email preferredLanguage role").lean();
    if (!user) return fail("Account not found", 404);
    return Response.json({
      success: true,
      data: { name: user.name, email: user.email, preferredLanguage: user.preferredLanguage ?? "en" },
    });
  } catch (err) {
    console.error("[profile] load failed:", err instanceof Error ? err.message : err);
    return fail("Could not load your profile.", 500);
  }
}

/** PATCH: update name and/or preferred language. Email and role are not editable here. */
export async function PATCH(request: Request) {
  const session = await getSessionUser();
  if (!session) return fail("Unauthorized", 401);

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid request", 400);

  try {
    await connectDB();
    const user = await User.findByIdAndUpdate(session.id, { $set: parsed.data }, { new: true })
      .select("name email preferredLanguage")
      .lean();
    if (!user) return fail("Account not found", 404);
    return Response.json({
      success: true,
      data: { name: user.name, email: user.email, preferredLanguage: user.preferredLanguage ?? "en" },
    });
  } catch (err) {
    console.error("[profile] update failed:", err instanceof Error ? err.message : err);
    return fail("Could not update your profile.", 500);
  }
}
