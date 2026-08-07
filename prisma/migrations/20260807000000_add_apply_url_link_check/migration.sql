-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "applyUrlBroken" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "applyUrlCheckedAt" TIMESTAMP(3);
