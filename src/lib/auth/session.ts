import "server-only";
import { redirect } from "next/navigation";
import { auth } from "./auth";

/** Current session user, or null for guests. */
export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** For pages: redirect guests to login. */
export async function requireUser(callbackUrl = "/") {
  const user = await getSessionUser();
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  return user;
}

/** For admin pages: guests go to login, signed-in non-admins go home. */
export async function requireAdmin(callbackUrl = "/admin") {
  const user = await requireUser(callbackUrl);
  if (user.role !== "admin") redirect("/");
  return user;
}

/**
 * For route handlers: returns the admin user or a Response to return.
 * 401 = not signed in, 403 = signed in but not an admin.
 * Always call this inside each admin handler, not just in proxy.ts.
 */
export async function requireAdminApi() {
  const user = await getSessionUser();
  if (!user) {
    return {
      error: Response.json({ success: false, error: "Unauthorized" }, { status: 401 }),
    } as const;
  }
  if (user.role !== "admin") {
    return {
      error: Response.json({ success: false, error: "Forbidden" }, { status: 403 }),
    } as const;
  }
  return { user } as const;
}
