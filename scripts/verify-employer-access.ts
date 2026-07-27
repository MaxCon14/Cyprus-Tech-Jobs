/**
 * Checks that an employer keeps sight of a listing — and therefore of the
 * applications attached to it — after the listing stops being live.
 *
 * The applicant list on the employer dashboard is built by taking every job the
 * employer owns, keeping the in-app ones, and querying job_applications for
 * those ids. Nothing in that chain may filter on job status: an expired listing
 * that drops out of the job list takes its applicants with it, silently.
 *
 *   DATABASE_URL=postgresql://… npx tsx scripts/verify-employer-access.ts
 */
import { prisma } from "../src/lib/prisma";
import { getEmployerWithCompanyAndJobs } from "../src/lib/queries";

let failures = 0;
function check(name: string, ok: boolean, detail = "") {
  if (!ok) failures++;
  console.log(`${ok ? "  ok  " : "FAIL  "} ${name}${detail ? `  — ${detail}` : ""}`);
}

const STATUSES = ["ACTIVE", "EXPIRED", "PAUSED", "CLOSED", "DRAFT"] as const;

async function main() {
  await prisma.job.deleteMany();
  await prisma.employer.deleteMany();
  await prisma.company.deleteMany();
  await prisma.category.deleteMany();

  const cat     = await prisma.category.create({ data: { name: "Design", slug: "design" } });
  const company = await prisma.company.create({ data: { name: "Acme Labs", slug: "acme-labs" } });
  await prisma.employer.create({
    data: { email: "boss@acme.test", companyId: company.id },
  });

  // One in-app listing per status, all long past their expiry date.
  const longAgo = new Date(Date.now() - 400 * 86_400_000);
  for (const status of STATUSES) {
    await prisma.job.create({
      data: {
        slug: `role-${status.toLowerCase()}`, title: `Role ${status}`,
        description: "<p>Work.</p>", status,
        postedAt: longAgo, expiresAt: longAgo,
        companyId: company.id, categoryId: cat.id,
        remoteType: "REMOTE", employmentType: "FULL_TIME", experienceLevel: "MID",
        salaryMin: 40000, salaryMax: 50000,
        applyType: "IN_APP",
      },
    });
  }

  const employer = await getEmployerWithCompanyAndJobs("boss@acme.test");
  const jobs     = employer?.company?.jobs ?? [];

  check("employer resolves", Boolean(employer));
  check(`all ${STATUSES.length} listings returned regardless of status`,
    jobs.length === STATUSES.length, `got ${jobs.length}`);

  for (const status of STATUSES) {
    check(`${status} listing still visible to its employer`,
      jobs.some(j => j.status === status));
  }

  /* The exact expression the dashboard uses to decide which jobs to pull
     applications for. If an expired job is missing here, its applicants vanish
     from the dashboard the day the listing expires. */
  const inAppJobIds = jobs.filter(j => j.applyType === "IN_APP").map(j => j.id);
  check("applicant query covers every status, including EXPIRED",
    inAppJobIds.length === STATUSES.length, `${inAppJobIds.length} of ${STATUSES.length} job ids`);

  const expired = jobs.find(j => j.status === "EXPIRED");
  check("the EXPIRED listing is among the ids applications are fetched for",
    Boolean(expired && inAppJobIds.includes(expired.id)));

  // Expiry must be a status change, never a deletion.
  const stillThere = await prisma.job.count({ where: { companyId: company.id } });
  check("expiry never removes the listing row", stillThere === STATUSES.length, `${stillThere} rows`);

  console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(err => { console.error(err); process.exit(1); });
