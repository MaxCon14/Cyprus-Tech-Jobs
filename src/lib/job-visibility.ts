import type { Prisma } from "@prisma/client";

/** Keep expiry inside AND so keyword OR filters remain independent. */
export function activeJobWhere(now = new Date()): Prisma.JobWhereInput {
  return { status: "ACTIVE", AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }] };
}

export function isActiveJob(job: { status: string; expiresAt: Date | null }, now = new Date()) {
  return job.status === "ACTIVE" && (!job.expiresAt || job.expiresAt > now);
}

export function isPublicJob(job: { status: string }) {
  return ["ACTIVE", "PAUSED", "EXPIRED", "CLOSED"].includes(job.status);
}
