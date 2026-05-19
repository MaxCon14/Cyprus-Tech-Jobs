import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code  = searchParams.get("code");
  const next  = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  // Collect cookies written by exchangeCodeForSession so we can attach them
  // to the redirect response (the next/headers cookie store doesn't propagate
  // to a manually-created NextResponse).
  const collectedCookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            collectedCookies.push({ name, value, options: options ?? {} });
          });
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !user?.email) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  const email = user.email;

  // Mark verified in both systems (non-blocking)
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

  // Determine destination
  let destination: string;
  if (next) {
    destination = next;
  } else if (email === process.env.ADMIN_EMAIL) {
    destination = "/admin/dashboard";
  } else {
    const [employer, { data: candidateRows }] = await Promise.all([
      prisma.employer.findUnique({ where: { email }, select: { id: true } }),
      supabaseAdmin.from("candidates").select("id").eq("email", email).limit(1),
    ]);
    // Employer takes priority — a user could have both records (e.g. tested as a candidate first)
    destination = employer
      ? "/employers/dashboard"
      : candidateRows && candidateRows.length > 0
        ? "/candidates/dashboard"
        : "/employers/dashboard";
  }

  // Always redirect to the configured production domain so magic-link emails
  // pointing at the Vercel preview URL still land on the right domain.
  const appOrigin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || origin;
  const response = NextResponse.redirect(`${appOrigin}${destination}`);

  // Attach session cookies to the redirect so the browser keeps the session
  collectedCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
  });

  return response;
}
