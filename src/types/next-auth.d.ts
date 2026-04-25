import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      companySlug: string | null;
    };
  }
  interface User {
    companySlug?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    employerId?: string;
    companySlug?: string | null;
  }
}
