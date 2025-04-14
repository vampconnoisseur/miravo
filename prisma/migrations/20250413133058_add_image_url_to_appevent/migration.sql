/*
  Warnings:

  - Added the required column `imageUrl` to the `AppEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AppEvent" ADD COLUMN     "imageUrl" TEXT NOT NULL;
