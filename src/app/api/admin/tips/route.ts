import { adminCrud } from "@/lib/admin/crud";
import { tipSchema } from "@/lib/admin/schemas";
import { HealthTip } from "@/lib/db/models/HealthTip";

const crud = adminCrud({
  label: "tip",
  schema: tipSchema,
  model: HealthTip,
  onCreate: (userId) => ({ createdBy: userId }),
});

/** POST: create a health tip. */
export const POST = crud.create;
