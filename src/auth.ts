import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/employers/login" },
  providers: [
    Credentials({
      credentials: { token: { type: "text" } },
      async authorize(credentials) {
        const token = credentials?.token as string | undefined;
        if (!token) return null;

        const employer = await prisma.employer.findUnique({
          where: { loginToken: token },
          include: { company: { select: { slug: true } } },
        });

        if (!employer || !employer.emailVerified) return null;
        if (!employer.loginTokenExpiry || employer.loginTokenExpiry < new Date()) return null;

        await prisma.employer.update({
          where: { id: employer.id },
          data: { loginToken: null, loginTokenExpiry: null },
        });

        return {
          id: employer.id,
          email: employer.email,
          name: employer.name,
          companySlug: employer.company?.slug ?? null,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.employerId = user.id;
        token.companySlug = (user as { companySlug?: string | null }).companySlug ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (token.employerId) session.user.id = token.employerId as string;
      (session.user as { companySlug?: string | null }).companySlug =
        (token.companySlug as string | null) ?? null;
      return session;
    },
  },
});
