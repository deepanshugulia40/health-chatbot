import bcrypt from "bcryptjs";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";

const bodySchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password").max(128),
  newPassword: z.string().min(8, "New password must be at least 8 characters").max(128, "Password is too long"),
});

const fail = (error: string, status: number) => Response.json({ success: false, error }, { status });

/** POST: change password. Requires the current password. */
export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) return fail("Unauthorized", 401);

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid request", 400);
  const { currentPassword, newPassword } = parsed.data;
  if (currentPassword === newPassword) return fail("New password must be different from the current one", 400);

  try {
    await connectDB();
    const user = await User.findById(session.id).select("+passwordHash");
    if (!user) return fail("Account not found", 404);

    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      return fail("Current password is incorrect", 403);
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();
    return Response.json({ success: true, data: { changed: true } });
  } catch (err) {
    console.error("[profile] password change failed:", err instanceof Error ? err.message : err);
    return fail("Could not change your password.", 500);
  }
}
