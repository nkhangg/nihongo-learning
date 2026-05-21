-- CreateEnum
CREATE TYPE "JlptLevel" AS ENUM ('N5', 'N4', 'N3', 'N2', 'N1');

-- CreateEnum
CREATE TYPE "KanjiStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "KanjiProgressStatus" AS ENUM ('UNSEEN', 'LEARNING', 'KNOWN');

-- CreateEnum
CREATE TYPE "KanjiQuizMode" AS ENUM ('RECOGNITION', 'MEANING_TO_KANJI', 'WRITING', 'MIXED');

-- CreateEnum
CREATE TYPE "KanjiQuizSessionStatus" AS ENUM ('IN_PROGRESS', 'FINISHED', 'ABANDONED');

-- CreateTable
CREATE TABLE "kanjis" (
    "id" TEXT NOT NULL,
    "char" TEXT NOT NULL,
    "jlptLevel" "JlptLevel" NOT NULL,
    "strokes" INTEGER NOT NULL,
    "radicalId" TEXT,
    "frequency" INTEGER,
    "joyoOrder" INTEGER,
    "unicode" TEXT NOT NULL,
    "onReadings" TEXT[],
    "kunReadings" TEXT[],
    "meaningVi" TEXT NOT NULL,
    "meaningEn" TEXT NOT NULL,
    "strokeOrderSvg" TEXT[],
    "mnemonicVi" TEXT,
    "status" "KanjiStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kanjis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kanji_radicals" (
    "id" TEXT NOT NULL,
    "char" TEXT NOT NULL,
    "meaningVi" TEXT NOT NULL,
    "strokes" INTEGER NOT NULL,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "kanji_radicals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kanji_meanings" (
    "id" TEXT NOT NULL,
    "kanjiId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "pos" TEXT NOT NULL,
    "textVi" TEXT NOT NULL,
    "jpExample" TEXT,

    CONSTRAINT "kanji_meanings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kanji_examples" (
    "id" TEXT NOT NULL,
    "kanjiId" TEXT NOT NULL,
    "jpHtml" TEXT NOT NULL,
    "vi" TEXT NOT NULL,
    "source" TEXT,

    CONSTRAINT "kanji_examples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kanji_compounds" (
    "id" TEXT NOT NULL,
    "kanjiId" TEXT NOT NULL,
    "jp" TEXT NOT NULL,
    "reading" TEXT NOT NULL,
    "meaningVi" TEXT NOT NULL,

    CONSTRAINT "kanji_compounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kanji_similars" (
    "id" TEXT NOT NULL,
    "kanjiId" TEXT NOT NULL,
    "similarKanjiId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "kanji_similars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kanji_user_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kanjiId" TEXT NOT NULL,
    "status" "KanjiProgressStatus" NOT NULL DEFAULT 'UNSEEN',
    "mastery" INTEGER NOT NULL DEFAULT 0,
    "lastReviewedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kanji_user_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kanji_writing_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kanjiId" TEXT NOT NULL,
    "scoreOverall" INTEGER NOT NULL,
    "scoreOrder" INTEGER NOT NULL,
    "scoreSize" INTEGER NOT NULL,
    "scoreDirection" INTEGER NOT NULL,
    "scorePosition" INTEGER NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kanji_writing_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kanji_quiz_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jlptLevel" "JlptLevel" NOT NULL,
    "mode" "KanjiQuizMode" NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "livesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "status" "KanjiQuizSessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "kanji_quiz_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kanji_quiz_answers" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "kanjiId" TEXT NOT NULL,
    "mode" "KanjiQuizMode" NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "selectedOptionId" TEXT,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kanji_quiz_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kanjis_char_key" ON "kanjis"("char");

-- CreateIndex
CREATE INDEX "kanjis_jlptLevel_status_idx" ON "kanjis"("jlptLevel", "status");

-- CreateIndex
CREATE INDEX "kanjis_radicalId_idx" ON "kanjis"("radicalId");

-- CreateIndex
CREATE UNIQUE INDEX "kanji_radicals_char_key" ON "kanji_radicals"("char");

-- CreateIndex
CREATE UNIQUE INDEX "kanji_meanings_kanjiId_index_key" ON "kanji_meanings"("kanjiId", "index");

-- CreateIndex
CREATE INDEX "kanji_examples_kanjiId_idx" ON "kanji_examples"("kanjiId");

-- CreateIndex
CREATE INDEX "kanji_compounds_kanjiId_idx" ON "kanji_compounds"("kanjiId");

-- CreateIndex
CREATE UNIQUE INDEX "kanji_similars_kanjiId_similarKanjiId_key" ON "kanji_similars"("kanjiId", "similarKanjiId");

-- CreateIndex
CREATE INDEX "kanji_user_progress_userId_status_idx" ON "kanji_user_progress"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "kanji_user_progress_userId_kanjiId_key" ON "kanji_user_progress"("userId", "kanjiId");

-- CreateIndex
CREATE INDEX "kanji_writing_attempts_userId_kanjiId_createdAt_idx" ON "kanji_writing_attempts"("userId", "kanjiId", "createdAt");

-- CreateIndex
CREATE INDEX "kanji_quiz_sessions_userId_status_idx" ON "kanji_quiz_sessions"("userId", "status");

-- CreateIndex
CREATE INDEX "kanji_quiz_answers_sessionId_idx" ON "kanji_quiz_answers"("sessionId");

-- AddForeignKey
ALTER TABLE "kanjis" ADD CONSTRAINT "kanjis_radicalId_fkey" FOREIGN KEY ("radicalId") REFERENCES "kanji_radicals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanji_meanings" ADD CONSTRAINT "kanji_meanings_kanjiId_fkey" FOREIGN KEY ("kanjiId") REFERENCES "kanjis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanji_examples" ADD CONSTRAINT "kanji_examples_kanjiId_fkey" FOREIGN KEY ("kanjiId") REFERENCES "kanjis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanji_compounds" ADD CONSTRAINT "kanji_compounds_kanjiId_fkey" FOREIGN KEY ("kanjiId") REFERENCES "kanjis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanji_similars" ADD CONSTRAINT "kanji_similars_kanjiId_fkey" FOREIGN KEY ("kanjiId") REFERENCES "kanjis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanji_similars" ADD CONSTRAINT "kanji_similars_similarKanjiId_fkey" FOREIGN KEY ("similarKanjiId") REFERENCES "kanjis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanji_user_progress" ADD CONSTRAINT "kanji_user_progress_kanjiId_fkey" FOREIGN KEY ("kanjiId") REFERENCES "kanjis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanji_writing_attempts" ADD CONSTRAINT "kanji_writing_attempts_kanjiId_fkey" FOREIGN KEY ("kanjiId") REFERENCES "kanjis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanji_quiz_answers" ADD CONSTRAINT "kanji_quiz_answers_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "kanji_quiz_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanji_quiz_answers" ADD CONSTRAINT "kanji_quiz_answers_kanjiId_fkey" FOREIGN KEY ("kanjiId") REFERENCES "kanjis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
