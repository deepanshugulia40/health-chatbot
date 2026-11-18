import type { NextAuthConfig } from "next-auth";
import type { Locale } from "@/lib/i18n/config";

/**
 * Edge-safe Auth.js config (no database or bcrypt imports) so it can be
 * used from proxy.ts. The Credentials provider lives in ./auth.ts.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.preferredLanguage = user.preferredLanguage;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "user" | "admin") ?? "user";
        session.user.preferredLanguage =
          (token.preferredLanguage as Locale) ?? "en";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
