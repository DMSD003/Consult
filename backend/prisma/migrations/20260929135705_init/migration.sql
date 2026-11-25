/*
  Warnings:

  - Made the column `sessionId` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "sessionId" SET NOT NULL;
