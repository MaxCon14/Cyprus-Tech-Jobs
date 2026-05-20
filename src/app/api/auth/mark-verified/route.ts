import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ ok: false });

  const email = user.email;
  await Promise.allSettled([
    prisma.employer.updateMany({
      where: { email, emailVerified: false },
      data: { emailVerified: true },
    }),
    supabaseAdmin
      .from("candidates")
      .update({ emailVerified: true })
      .eq("email", email)
      .eq("emailVerified", false),
  ]);

  return NextResponse.json({ ok: true });
}
