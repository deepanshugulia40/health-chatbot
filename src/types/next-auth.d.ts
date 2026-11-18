import type { DefaultSession } from "next-auth";

type Role = "user" | "admin";
type Lang = import("@/lib/i18n/config").Locale;

declare module "next-auth" {
  interface User {
    role?: Role;
    preferredLanguage?: Lang;
  }
  interface Session {
    user: {
      id: string;
      role: Role;
      preferredLanguage: Lang;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    preferredLanguage?: Lang;
  }
}
