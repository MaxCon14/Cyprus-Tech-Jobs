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
