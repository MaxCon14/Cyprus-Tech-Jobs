import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  let body: { email?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : null;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 422 });
  }

  const [{ data: candidate }, employer] = await Promise.all([
    supabaseAdmin.from("candidates").select("id").eq("email", email).maybeSingle(),
    prisma.employer.findUnique({ where: { email }, select: { id: true } }),
  ]);

  return NextResponse.json({ exists: !!(candidate || employer) });
}
