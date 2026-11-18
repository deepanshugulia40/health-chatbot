import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(254),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }
    const { name, email, password } = parsed.data;

    await connectDB();
    const exists = await User.exists({ email });
    if (exists) {
      return Response.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Role is always "user" here. Admins are created via the seed script only.
    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ name, email, passwordHash, role: "user" });

    return Response.json({ success: true, data: { email } }, { status: 201 });
  } catch (err) {
    console.error("[register] failed:", err instanceof Error ? err.message : err);
    return Response.json(
      { success: false, error: "Could not create account. Please try again." },
      { status: 500 }
    );
  }
}
