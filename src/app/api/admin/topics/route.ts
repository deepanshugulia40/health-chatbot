import { adminCrud } from "@/lib/admin/crud";
import { topicSchema } from "@/lib/admin/schemas";
import { HealthTopic } from "@/lib/db/models/HealthTopic";

const crud = adminCrud({ label: "topic", schema: topicSchema, model: HealthTopic });

/** POST: create a health topic. */
export const POST = crud.create;
