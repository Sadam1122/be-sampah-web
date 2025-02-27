-- AlterTable
ALTER TABLE `leaderboard` ADD COLUMN `available` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `poinSaatIni` INTEGER NOT NULL DEFAULT 0;
