-- CreateTable
CREATE TABLE "UrlEntry" (
    "id" TEXT NOT NULL,
    "originalUrl" VARCHAR(2048) NOT NULL,
    "shortCode" VARCHAR(6) NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastClickedAt" TIMESTAMP(3),

    CONSTRAINT "UrlEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UrlEntry_shortCode_key" ON "UrlEntry"("shortCode");
