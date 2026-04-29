import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(`${origin}/candidates/login?error=auth_failed`);
  }

  // createSupabaseServerClient uses cookies() from next/headers, which
  // captures the session cookies written by onAuthStateChange automatically
  // and includes them on the redirect response — even though the write
  // happens asynchronously inside exchangeCodeForSession.
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !user?.email) {
    console.error("[auth/callback] exchangeCodeForSession failed:", error?.message);
    return NextResponse.redirect(`${origin}/candidates/login?error=auth_failed`);
  }

  const email = user.email;

  // Mark email as verified in both systems (best-effort, non-blocking)
  await Promise.allSettled([
    prisma.employer.updateMany({
      where: { email, emailVerified: false },
      data:  { emailVerified: true },
    }),
    supabaseAdmin
      .from("candidates")
      .update({ emailVerified: true })
      .eq("email", email)
      .eq("emailVerified", false),
  ]);

  // Determine where to send the user
  let destination: string;
  if (next) {
    destination = next;
  } else {
    const [employer, { data: candidate }] = await Promise.all([
      prisma.employer.findUnique({ where: { email }, select: { id: true } }),
      supabaseAdmin.from("candidates").select("id").eq("email", email).single(),
    ]);
    destination = candidate ? "/candidates/dashboard" : "/employers/dashboard";
  }

  return NextResponse.redirect(`${origin}${destination}`);
}
