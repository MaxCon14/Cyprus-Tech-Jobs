import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend, FROM_EMAIL, FROM_NAME, buildAlertEmail } from "@/lib/resend";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const DAILY_THRESHOLD  = 23 * 60 * 60 * 1000;  // 23 h in ms
const WEEKLY_THRESHOLD = 6  * 24 * 60 * 60 * 1000; // 6 d in ms

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now       = new Date();
  const dailyCut  = new Date(now.getTime() - DAILY_THRESHOLD);
  const weeklyCut = new Date(now.getTime() - WEEKLY_THRESHOLD);

  const alerts = await prisma.jobAlert.findMany({
    where: {
      confirmed: true,
      OR: [
        { alertFrequency: "DAILY",  OR: [{ lastSentAt: null }, { lastSentAt: { lt: dailyCut  } }] },
        { alertFrequency: "WEEKLY", OR: [{ lastSentAt: null }, { lastSentAt: { lt: weeklyCut } }] },
      ],
    },
  });

  let sent  = 0;
  let skipped = 0;

  for (const alert of alerts) {
    const sinceDate = alert.lastSentAt ?? new Date(0);

    const where: Prisma.JobWhereInput = {
      status:    "ACTIVE",
      createdAt: { gt: sinceDate },
    };

    if (alert.categoryId) {
      where.category = { slug: alert.categoryId };
    }
    if (alert.remoteType) {
      where.remoteType = alert.remoteType;
    }
    if (alert.city) {
      where.city = alert.city;
    }
    if (alert.experienceLevel) {
      where.experienceLevel = alert.experienceLevel;
    }
    if (alert.salaryMin) {
      where.salaryMin = { gte: alert.salaryMin };
    }

    const jobs = await prisma.job.findMany({
      where,
      select: {
        title:          true,
        slug:           true,
        city:           true,
        remoteType:     true,
        salaryMin:      true,
        salaryMax:      true,
        salaryCurrency: true,
        company: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    if (jobs.length === 0) {
      skipped++;
      continue;
    }

    const emailHtml = buildAlertEmail(
      jobs.map(j => ({
        title:          j.title,
        slug:           j.slug,
        companyName:    j.company.name,
        city:           j.city,
        remoteType:     j.remoteType,
        salaryMin:      j.salaryMin,
        salaryMax:      j.salaryMax,
        salaryCurrency: j.salaryCurrency,
      })),
      alert.firstName,
    ).replace("{{TOKEN}}", alert.token);

    try {
      await resend.emails.send({
        from:    `${FROM_NAME} <${FROM_EMAIL}>`,
        to:      alert.email,
        subject: `${jobs.length} new tech job${jobs.length !== 1 ? "s" : ""} in Cyprus — CyprusTech.Jobs`,
        html:    emailHtml,
      });

      await prisma.jobAlert.update({
        where: { id: alert.id },
        data:  { lastSentAt: now },
      });

      sent++;
    } catch (err) {
      console.error("[send-alerts] failed for", alert.email, err);
    }
  }

  return NextResponse.json({ sent, skipped, total: alerts.length });
}
