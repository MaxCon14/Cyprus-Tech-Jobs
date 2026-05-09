import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token")?.trim() ?? "";

  if (!token) {
    return NextResponse.redirect(new URL("/candidates/unsubscribed?error=1", req.url));
  }

  try {
    await prisma.jobAlert.delete({ where: { token } });
  } catch {
    // Alert already deleted or token invalid — still redirect to success so link is idempotent
  }

  return NextResponse.redirect(new URL("/candidates/unsubscribed", req.url));
}
