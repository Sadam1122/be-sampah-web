-- AlterTable
ALTER TABLE `pengumpulansampah` ADD COLUMN `wasteTypeId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `wastetype` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `pricePerKg` DECIMAL(10, 2) NOT NULL,
    `recyclable` BOOLEAN NOT NULL DEFAULT false,
    `hazardous` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `WasteType_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `PengumpulanSampah_wasteTypeId_idx` ON `pengumpulansampah`(`wasteTypeId`);

-- AddForeignKey
ALTER TABLE `pengumpulansampah` ADD CONSTRAINT `PengumpulanSampah_wasteTypeId_fkey` FOREIGN KEY (`wasteTypeId`) REFERENCES `wastetype`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
