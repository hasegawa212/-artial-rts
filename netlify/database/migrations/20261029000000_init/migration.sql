-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('member', 'manager', 'admin');

-- CreateEnum
CREATE TYPE "UrlStatus" AS ENUM ('verified', 'documented', 'unknown');

-- CreateTable
CREATE TABLE "App" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kana" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "keywords" TEXT[],
    "repo" TEXT NOT NULL,
    "path" TEXT,
    "url" TEXT,
    "urlStatus" "UrlStatus" NOT NULL DEFAULT 'unknown',
    "urlSource" TEXT,
    "auth" TEXT NOT NULL,
    "authNote" TEXT NOT NULL DEFAULT '',
    "owner" TEXT NOT NULL DEFAULT '未確認',
    "lifecycle" TEXT NOT NULL,
    "visibility" "Role" NOT NULL DEFAULT 'member',
    "confidential" BOOLEAN NOT NULL DEFAULT false,
    "icon" TEXT NOT NULL DEFAULT 'app',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "App_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "sub" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("sub")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "userSub" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("userSub","appId")
);

-- CreateTable
CREATE TABLE "RecentUse" (
    "userSub" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecentUse_pkey" PRIMARY KEY ("userSub","appId")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" BIGSERIAL NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT,
    "detail" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "RecentUse_userSub_usedAt_idx" ON "RecentUse"("userSub", "usedAt");

-- CreateIndex
CREATE INDEX "AuditLog_at_idx" ON "AuditLog"("at");

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userSub_fkey" FOREIGN KEY ("userSub") REFERENCES "User"("sub") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentUse" ADD CONSTRAINT "RecentUse_userSub_fkey" FOREIGN KEY ("userSub") REFERENCES "User"("sub") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentUse" ADD CONSTRAINT "RecentUse_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

