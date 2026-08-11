-- CreateTable
CREATE TABLE "job_slug_history" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_slug_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_slug_history_slug_key" ON "job_slug_history"("slug");

-- CreateIndex
CREATE INDEX "job_slug_history_jobId_idx" ON "job_slug_history"("jobId");

-- AddForeignKey
ALTER TABLE "job_slug_history" ADD CONSTRAINT "job_slug_history_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Supabase exposes every table in `public` through PostgREST, and the anon key
-- ships in the browser bundle. Without RLS this table was readable AND writable
-- by anyone: they could mint unlimited slugs redirecting to real listings, or
-- delete the rows and 404 every previously indexed job URL.
--
-- No policies on purpose. The table is only ever touched by the server through
-- Prisma, which connects as the owner and bypasses RLS, so enabling it with
-- zero policies denies anon and authenticated outright — the same shape as
-- apply_clicks, job_alerts and rate_limits.
ALTER TABLE "job_slug_history" ENABLE ROW LEVEL SECURITY;
