-- CreateTable
CREATE TABLE `activitylog` (
    `id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `details` TEXT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ActivityLog_createdAt_idx`(`createdAt`),
    INDEX `ActivityLog_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `desa` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `kecamatan` VARCHAR(191) NOT NULL,
    `kabupaten` VARCHAR(191) NOT NULL,
    `provinsi` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Desa_nama_key`(`nama`),
    INDEX `Desa_nama_idx`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `insiden` (
    `id` VARCHAR(191) NOT NULL,
    `desaId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reporterId` VARCHAR(191) NOT NULL,
    `handledBy` VARCHAR(191) NULL,
    `timeHandled` DATETIME(3) NULL,

    INDEX `Insiden_desaId_idx`(`desaId`),
    INDEX `Insiden_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jadwalpengumpulan` (
    `id` VARCHAR(191) NOT NULL,
    `desaId` VARCHAR(191) NOT NULL,
    `hari` VARCHAR(191) NOT NULL,
    `waktuMulai` DATETIME(3) NOT NULL,
    `waktuSelesai` DATETIME(3) NOT NULL,

    INDEX `JadwalPengumpulan_desaId_idx`(`desaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leaderboard` (
    `id` VARCHAR(191) NOT NULL,
    `totalPoin` INTEGER NOT NULL,
    `jumlahPengumpulan` INTEGER NOT NULL,
    `userId` VARCHAR(191) NULL,

    INDEX `Leaderboard_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pengumpulansampah` (
    `id` VARCHAR(191) NOT NULL,
    `desaId` VARCHAR(191) NOT NULL,
    `berat` DECIMAL(5, 2) NOT NULL,
    `jenisSampah` VARCHAR(191) NOT NULL,
    `poin` INTEGER NOT NULL,
    `waktu` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `rt` VARCHAR(3) NOT NULL,
    `rw` VARCHAR(3) NOT NULL,
    `userId` VARCHAR(191) NULL,

    INDEX `PengumpulanSampah_desaId_idx`(`desaId`),
    INDEX `PengumpulanSampah_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session` (
    `id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_token_key`(`token`),
    INDEX `Session_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('SUPERADMIN', 'ADMIN', 'WARGA') NOT NULL DEFAULT 'WARGA',
    `desaId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_username_key`(`username`),
    INDEX `User_desaId_idx`(`desaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `activitylog` ADD CONSTRAINT `ActivityLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `insiden` ADD CONSTRAINT `Insiden_desaId_fkey` FOREIGN KEY (`desaId`) REFERENCES `desa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jadwalpengumpulan` ADD CONSTRAINT `JadwalPengumpulan_desaId_fkey` FOREIGN KEY (`desaId`) REFERENCES `desa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leaderboard` ADD CONSTRAINT `Leaderboard_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pengumpulansampah` ADD CONSTRAINT `PengumpulanSampah_desaId_fkey` FOREIGN KEY (`desaId`) REFERENCES `desa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pengumpulansampah` ADD CONSTRAINT `PengumpulanSampah_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `User_desaId_fkey` FOREIGN KEY (`desaId`) REFERENCES `desa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
