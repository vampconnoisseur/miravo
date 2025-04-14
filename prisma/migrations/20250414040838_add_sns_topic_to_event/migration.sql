/*
  Warnings:

  - Added the required column `snsTopicArn` to the `AppEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AppEvent" ADD COLUMN     "snsTopicArn" TEXT NOT NULL;
