import { activeJobWhere } from "@/lib/job-visibility";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authoriseCron } from "@/lib/cron-auth";
import { getResend, FROM_EMAIL, FROM_NAME, buildAlertEmail } from "@/lib/resend";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const DAILY_THRESHOLD  = 23 * 60 * 60 * 1000;
const WEEKLY_THRESHOLD = 7  * 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const denied = authoriseCron(req);
  if (denied) return denied;

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

  // Resolve company names for company-specific alerts
  const companyIds = [...new Set(alerts.map(a => a.companyId).filter(Boolean) as string[])];
  const companies  = companyIds.length
    ? await prisma.company.findMany({ where: { id: { in: companyIds } }, select: { id: true, name: true } })
    : [];
  const companyMap = Object.fromEntries(companies.map(c => [c.id, c.name]));

  let sent    = 0;
  let skipped = 0;

  for (const alert of alerts) {
    const sinceDate  = alert.lastSentAt ?? alert.createdAt;
    const companyName = alert.companyId ? (companyMap[alert.companyId] ?? null) : null;

    const where: Prisma.JobWhereInput = {
      ...activeJobWhere(now),
      postedAt: { gt: sinceDate, lte: now },
    };

    if (alert.categoryId)      where.category      = { OR: [{ slug: alert.categoryId }, { parent: { slug: alert.categoryId } }] };
    if (alert.remoteType)      where.remoteType     = alert.remoteType;
    if (alert.city)            where.city           = { contains: alert.city, mode: "insensitive" };
    if (alert.experienceLevel) where.experienceLevel = alert.experienceLevel;
    if (alert.salaryMin)       where.salaryMin       = { gte: alert.salaryMin };
    if (alert.companyId)       where.companyId       = alert.companyId;

    const jobs = await prisma.job.findMany({
      where,
      select: {
        title:              true,
        slug:               true,
        city:               true,
        remoteType:         true,
        salaryMin:          true,
        salaryMax:          true,
        salaryCurrency:     true,
        salaryDisclosed:    true,
        curatedCompanyName: true,
        company: { select: { name: true } },
      },
      orderBy: { postedAt: "desc" },
    });

    if (jobs.length === 0) { skipped++; continue; }

    const subject = companyName
      ? `${jobs.length} new role${jobs.length !== 1 ? "s" : ""} at ${companyName} — CyprusTech.Careers`
      : `${jobs.length} new tech job${jobs.length !== 1 ? "s" : ""} in Cyprus — CyprusTech.Careers`;

    const emailHtml = buildAlertEmail({
      jobs: jobs.map(j => ({
        title:          j.title,
        slug:           j.slug,
        companyName:    j.company?.name ?? j.curatedCompanyName ?? "",
        city:           j.city,
        remoteType:     j.remoteType,
        salaryMin:      j.salaryDisclosed ? j.salaryMin : null,
        salaryMax:      j.salaryDisclosed ? j.salaryMax : null,
        salaryCurrency: j.salaryCurrency ?? "EUR",
      })),
      firstName:   alert.firstName,
      token:       alert.token,
      companyName,
    });

    try {
      const { error } = await getResend().emails.send({
        from:    `${FROM_NAME} <${FROM_EMAIL}>`,
        to:      alert.email,
        subject,
        html:    emailHtml,
      }, { idempotencyKey: `job-alert/${alert.id}/${sinceDate.toISOString()}` });
      if (error) throw new Error(error.message);

      await prisma.jobAlert.update({
        where: { id: alert.id },
        data:  { lastSentAt: now },
      });

      sent++;
    } catch (err) {
      console.error("[send-alerts] delivery failed", { alertId: alert.id, message: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  return NextResponse.json({ sent, skipped, total: alerts.length });
}
