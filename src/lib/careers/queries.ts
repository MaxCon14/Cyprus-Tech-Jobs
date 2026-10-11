import "server-only";
import { unstable_cache } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { activeJobWhere } from "@/lib/job-visibility";
import type { Career, CareerSummary, Progress, ProgressKind } from "./types";

export const CAREER_CACHE_TAG = "career-library";
export async function withLearner<T>(userId: string, action: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
 return prisma.$transaction(async tx => {
  await tx.$executeRawUnsafe("SET LOCAL ROLE authenticated");
  await tx.$queryRaw`SELECT set_config('request.jwt.claim.sub', ${userId}, true)`;
  return action(tx);
 }, { timeout: 30000 });
}
export async function readCareers(admin = false): Promise<CareerSummary[]> {
 return prisma.$transaction(async tx => {
  if (!admin) await tx.$executeRawUnsafe("SET LOCAL ROLE anon");
  return tx.$queryRaw<CareerSummary[]>`SELECT c.slug,c.title,c.category,c.difficulty,c.duration,c.weekly_hours AS "weeklyHours",c.description,c.published,c.updated_at::text AS "updatedAt",
   COALESCE((SELECT array_agg(skill_name ORDER BY position) FROM career_library.career_skills WHERE career_slug=c.slug),'{}') AS skills,
   (SELECT count(*)::int FROM career_library.stages WHERE career_slug=c.slug) AS "stageCount",
   (SELECT count(*)::int FROM (SELECT sr.resource_id FROM career_library.stage_resources sr JOIN career_library.stages s ON s.id=sr.stage_id WHERE s.career_slug=c.slug UNION SELECT p.starter_resource_id FROM career_library.projects p WHERE p.career_slug=c.slug) used_resources) AS "resourceCount"
   FROM career_library.careers c ORDER BY c.title`;
 });
}
export const getCareers = unstable_cache(() => readCareers(), ["careers"], { tags: [CAREER_CACHE_TAG], revalidate: 3600 });
export async function readCareer(slug: string, admin = false): Promise<Career | null> {
 return prisma.$transaction(async tx => {
  if (!admin) await tx.$executeRawUnsafe("SET LOCAL ROLE anon");
  const rows = await tx.$queryRaw<{data: Career | null}[]>`SELECT career_library.career_document(${slug}) AS data`;
  return rows[0]?.data ?? null;
 });
}
export const getCareer = unstable_cache((slug: string) => readCareer(slug), ["career"], { tags: [CAREER_CACHE_TAG], revalidate: 3600 });

export async function readProgress(tx: Prisma.TransactionClient, userId: string, slug: string): Promise<Progress> {
 const [row] = await tx.$queryRaw<Progress[]>`SELECT
 EXISTS(SELECT 1 FROM career_library.saved_careers WHERE user_id=${userId}::uuid AND career_slug=${slug}) AS saved,
 COALESCE((SELECT array_agg(p.stage_id) FROM career_library.stage_progress p JOIN career_library.stages s ON s.id=p.stage_id WHERE p.user_id=${userId}::uuid AND s.career_slug=${slug}),'{}') AS stages,
 COALESCE((SELECT array_agg(p.task_id) FROM career_library.task_progress p JOIN career_library.tasks t ON t.id=p.task_id JOIN career_library.stages s ON s.id=t.stage_id WHERE p.user_id=${userId}::uuid AND s.career_slug=${slug}),'{}') AS tasks,
 COALESCE((SELECT array_agg(p.readiness_id) FROM career_library.readiness_progress p JOIN career_library.readiness r ON r.id=p.readiness_id WHERE p.user_id=${userId}::uuid AND r.career_slug=${slug}),'{}') AS readiness`;
 return row;
}
const progressTables = {saved:["saved_careers","career_slug"],stage:["stage_progress","stage_id"],task:["task_progress","task_id"],readiness:["readiness_progress","readiness_id"]} as const;
export async function setProgress(tx: Prisma.TransactionClient, userId: string, kind: ProgressKind, id: string, value: boolean) {
 const [table,column] = progressTables[kind];
 if(value) await tx.$executeRaw(Prisma.sql`INSERT INTO career_library.${Prisma.raw(table)} (user_id,${Prisma.raw(column)}) VALUES (${userId}::uuid,${id}) ON CONFLICT DO NOTHING`);
 else await tx.$executeRaw(Prisma.sql`DELETE FROM career_library.${Prisma.raw(table)} WHERE user_id=${userId}::uuid AND ${Prisma.raw(column)}=${id}`);
}
export async function getCareerJobs(career: Career) {
 return prisma.job.findMany({
  where: {...activeJobWhere(), OR: career.jobTerms.map(term => ({title:{contains:term,mode:"insensitive" as const}}))},
  include:{company:true,tags:{include:{tag:true}}},
  orderBy:[{experienceLevel:"asc"},{postedAt:"desc"}],take:6,
 });
}
