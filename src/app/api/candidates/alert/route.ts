import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { allowRequest, clientIp, tooManyRequests } from "@/lib/rate-limit";
import { getResend, FROM_EMAIL, FROM_NAME } from "@/lib/resend";
import type { RemoteType } from "@prisma/client";

const BASE = "https://cyprustech.careers";
const rule = { name: "job-alert-subscribe", limit: 5, windowSeconds: 3600 };

async function sessionEmail() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email?.toLowerCase() ?? null;
}

export async function GET(req: NextRequest) {
  const email = await sessionEmail();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const params = req.nextUrl.searchParams;
  if (params.get("email")?.toLowerCase() !== email) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const alert = await prisma.jobAlert.findFirst({
    where: { email, companyId: params.get("companyId") || null, confirmed: true },
    select: { alertFrequency: true },
  });
  return NextResponse.json({ subscribed: !!alert, alertFrequency: alert?.alertFrequency ?? null });
}

export async function POST(req: NextRequest) {
  if (!await allowRequest(clientIp(req), rule)) return tooManyRequests(rule, "Please try again later.");
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || body.consent !== true) {
    return NextResponse.json({ error: "Enter a valid email and agree to receive job alerts." }, { status: 422 });
  }
  const categoryId = typeof body.categoryId === "string" && body.categoryId ? body.categoryId : null;
  const companyId = typeof body.companyId === "string" && body.companyId ? body.companyId : null;
  const city = typeof body.city === "string" && body.city ? body.city : null;
  const remoteType = typeof body.remoteType === "string" && body.remoteType ? body.remoteType as RemoteType : null;
  if ((remoteType && !["REMOTE", "HYBRID", "ON_SITE"].includes(remoteType)) ||
      (city && !["Limassol", "Nicosia", "Larnaca", "Paphos", "Famagusta"].includes(city)) ||
      !["DAILY", "WEEKLY"].includes(String(body.alertFrequency))) {
    return NextResponse.json({ error: "Choose valid alert preferences." }, { status: 422 });
  }
  const owner = await sessionEmail();
  const confirmed = owner === email;
  try {
    if (categoryId && !await prisma.category.findUnique({ where: { slug: categoryId }, select: { id: true } })) {
      return NextResponse.json({ error: "Choose a valid category." }, { status: 422 });
    }
    if (companyId && !await prisma.company.findUnique({ where: { id: companyId }, select: { id: true } })) {
      return NextResponse.json({ error: "Company unavailable." }, { status: 422 });
    }
    const alert = await prisma.$transaction(async tx => {
      // Serialize nullable-key subscriptions, for which SQL UNIQUE permits duplicates.
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${email}))::text`;
      const existing = await tx.jobAlert.findFirst({ where: { email, categoryId, companyId, remoteType, city } });
      if (existing) {
        // Only an authenticated owner may change an existing subscription.
        if (!confirmed) {
          if (!existing.confirmed && Date.now() - existing.createdAt.getTime() > 7 * 86400000) {
            return tx.jobAlert.update({ where: { id: existing.id }, data: { token: randomUUID(), createdAt: new Date() } });
          }
          return existing;
        }
        return tx.jobAlert.update({ where: { id: existing.id }, data: { alertFrequency: String(body.alertFrequency), confirmed: true } });
      }
      return tx.jobAlert.create({ data: {
        email, categoryId, companyId, city, remoteType,
        alertFrequency: String(body.alertFrequency), confirmed,
      } });
    });
    if (!confirmed && !alert.confirmed) {
      const link = `${BASE}/alerts/confirm?token=${encodeURIComponent(alert.token)}`;
      const { error } = await getResend().emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: email,
        subject: "Confirm your Cyprus tech job alerts",
        text: `You requested job alerts from CyprusTech.Careers. Confirm your subscription: ${link}\nIf you did not request this, ignore this email. No job alerts will be sent until you confirm.`,
      }, { idempotencyKey: `confirm-alert/${alert.id}/${Math.floor(Date.now() / 3600000)}` });
      if (error) throw new Error("Confirmation delivery failed");
    }
    return NextResponse.json({ requiresConfirmation: !confirmed }, { status: 201 });
  } catch {
    console.error("[job-alert] subscription could not be completed");
    return NextResponse.json({ error: "We could not complete your request. Please try again." }, { status: 503 });
  }
}

export async function DELETE(req: NextRequest) {
  const email = await sessionEmail();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof body.alertId === "string" && body.alertId) {
    await prisma.jobAlert.deleteMany({ where: { id: body.alertId, email } });
  } else {
    if (body.email !== email) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await prisma.jobAlert.deleteMany({ where: { email, companyId: typeof body.companyId === "string" ? body.companyId : null } });
  }
  return NextResponse.json({ ok: true });
}
