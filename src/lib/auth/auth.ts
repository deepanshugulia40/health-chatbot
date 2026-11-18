import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { authConfig } from "./auth.config";

const credentialsSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt(params) {
      const token = (await authConfig.callbacks.jwt(params)) ?? params.token;
      // After a profile change the client calls session.update(); reload the
      // values from the database rather than trusting anything the client sends.
      if (params.trigger === "update" && token.id) {
        await connectDB();
        const fresh = await User.findById(token.id).select("name role preferredLanguage").lean();
        if (fresh) {
          token.name = fresh.name;
          token.role = fresh.role;
          token.preferredLanguage = fresh.preferredLanguage ?? "en";
        }
      }
      return token;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        await connectDB();
        const user = await User.findOne({
          email: parsed.data.email.toLowerCase(),
        }).select("+passwordHash");
        if (!user) return null;

        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;

        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
          preferredLanguage: user.preferredLanguage ?? "en",
        };
      },
    }),
  ],
});
