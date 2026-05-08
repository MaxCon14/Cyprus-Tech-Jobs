import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await prisma.job.updateMany({
    where: { status: "ACTIVE", expiresAt: { lt: new Date() } },
    data:  { status: "EXPIRED" },
  });

  return NextResponse.json({ expired: result.count });
}
