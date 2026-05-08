/*
  Warnings:

  - A unique constraint covering the columns `[originalUrl]` on the table `UrlEntry` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UrlEntry_originalUrl_key" ON "UrlEntry"("originalUrl");
