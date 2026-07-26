import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Sends an admin sign-in code — but only ever to ADMIN_EMAIL.
 *
 * The login page used to call signInWithOtp straight from the browser, which
 * meant anyone who found /admin/login could make us email a code to any
 * address they liked, creating a Supabase auth user each time. Nobody could
 * reach /admin with it (src/proxy.ts still checks the session email), but it
 * was an open send-mail trigger, and it matters more now that ADMIN_EMAIL is a
 * mailbox whose contents a Resend API key can read.
 *
 * A non-matching address gets the same 200 as a matching one. The response
 * must not reveal which address is the admin's.
 */
export async function POST(req: NextRequest) {
  let email = "";
  try {
    const body = await req.json();
    email = typeof body?.email === "string" ? body.email : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const normalised = email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalised)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 422 });
  }

  /* Compared lowercased because Supabase stores addresses lowercased, and
     proxy.ts does an exact !== against this same variable — a capitalised
     ADMIN_EMAIL would otherwise send a code that can never grant access. */
  const admin = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();

  // Unset ADMIN_EMAIL fails closed rather than emailing everyone.
  if (!admin || normalised !== admin) {
    return NextResponse.json({ ok: true });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: normalised,
    // First sign-in has no auth user yet; only ADMIN_EMAIL reaches this line.
    options: { shouldCreateUser: true },
  });

  if (error) {
    console.error("[admin/request-code] send failed:", error.message);
    return NextResponse.json({ error: "Couldn't send the code." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
