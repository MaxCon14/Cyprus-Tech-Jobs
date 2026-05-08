import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  let body: { email?: unknown };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : null;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required." }, { status: 422 });
  }

  const [employer, { data: candidate }] = await Promise.all([
    prisma.employer.findUnique({ where: { email }, select: { id: true } }),
    supabaseAdmin.from("candidates").select("id").eq("email", email).single(),
  ]);

  const role = employer ? "employer" : candidate ? "candidate" : null;
  return NextResponse.json({ role });
}
