-- AlterTable
ALTER TABLE "employers" ADD COLUMN "loginToken" TEXT,
ADD COLUMN "loginTokenExpiry" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "employers_loginToken_key" ON "employers"("loginToken");
