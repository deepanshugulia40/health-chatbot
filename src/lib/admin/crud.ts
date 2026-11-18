import "server-only";
import mongoose, { type Model } from "mongoose";
import type { z } from "zod";
import { requireAdminApi } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { firstIssue } from "./schemas";

const fail = (error: string, status: number) => Response.json({ success: false, error }, { status });

type Opts<S extends z.ZodType> = {
  label: string;
  schema: S;
  // Eslint-friendly loose model type: these models are all plain Mongoose models.
  model: Model<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Extra fields added only when creating (e.g. createdBy). */
  onCreate?: (userId: string) => Record<string, unknown>;
  /** Maps the validated body to what should be stored. */
  toDoc?: (data: z.output<S>) => Record<string, unknown>;
};

function duplicateMessage(err: unknown, label: string): string | null {
  const code = (err as { code?: number } | null)?.code;
  return code === 11000 ? `A ${label} with that value already exists.` : null;
}

/**
 * Builds create / update / delete handlers for a simple admin-managed collection.
 * Every handler re-checks the admin session itself (proxy.ts is only the first gate).
 */
export function adminCrud<S extends z.ZodType>({ label, schema, model, onCreate, toDoc }: Opts<S>) {
  const store = (data: z.output<S>) => (toDoc ? toDoc(data) : (data as Record<string, unknown>));

  async function create(request: Request) {
    const gate = await requireAdminApi();
    if ("error" in gate) return gate.error;

    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return fail(firstIssue(parsed.error), 400);

    try {
      await connectDB();
      const doc = await model.create({ ...store(parsed.data), ...(onCreate?.(gate.user.id) ?? {}) });
      return Response.json({ success: true, data: { id: String(doc._id) } }, { status: 201 });
    } catch (err) {
      const dup = duplicateMessage(err, label);
      if (dup) return fail(dup, 409);
      console.error(`[admin/${label}] create failed:`, err instanceof Error ? err.message : err);
      return fail(`Could not create ${label}.`, 500);
    }
  }

  async function update(request: Request, id: string) {
    const gate = await requireAdminApi();
    if ("error" in gate) return gate.error;
    if (!mongoose.isValidObjectId(id)) return fail(`Invalid ${label} id`, 400);

    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return fail(firstIssue(parsed.error), 400);

    try {
      await connectDB();
      const doc = await model.findByIdAndUpdate(id, { $set: store(parsed.data) }, { runValidators: true });
      if (!doc) return fail(`${label} not found`, 404);
      return Response.json({ success: true, data: { id } });
    } catch (err) {
      const dup = duplicateMessage(err, label);
      if (dup) return fail(dup, 409);
      console.error(`[admin/${label}] update failed:`, err instanceof Error ? err.message : err);
      return fail(`Could not update ${label}.`, 500);
    }
  }

  async function remove(id: string) {
    const gate = await requireAdminApi();
    if ("error" in gate) return gate.error;
    if (!mongoose.isValidObjectId(id)) return fail(`Invalid ${label} id`, 400);

    try {
      await connectDB();
      const doc = await model.findByIdAndDelete(id);
      if (!doc) return fail(`${label} not found`, 404);
      return Response.json({ success: true, data: { id } });
    } catch (err) {
      console.error(`[admin/${label}] delete failed:`, err instanceof Error ? err.message : err);
      return fail(`Could not delete ${label}.`, 500);
    }
  }

  return { create, update, remove };
}
