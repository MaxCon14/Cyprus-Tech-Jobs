import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user?.email) {
      const email = user.email;

      // Mark employer verified (Prisma — existing system)
      await prisma.employer.updateMany({
        where: { email, emailVerified: false },
        data: { emailVerified: true },
      });

      // Mark candidate verified (Supabase — new system)
      await supabaseAdmin
        .from("candidates")
        .update({ emailVerified: true })
        .eq("email", email)
        .eq("emailVerified", false);

      if (next) return NextResponse.redirect(`${origin}${next}`);

      // Auto-detect which dashboard to send to
      const [employer, { data: candidate }] = await Promise.all([
        prisma.employer.findUnique({ where: { email }, select: { id: true } }),
        supabaseAdmin.from("candidates").select("id").eq("email", email).single(),
      ]);

      const destination = candidate ? "/candidates/dashboard" : "/employers/dashboard";
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/employers/login?error=auth_failed`);
}
