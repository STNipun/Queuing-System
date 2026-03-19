-- AlterTable
ALTER TABLE `patientvisit` ADD COLUMN `allergies` VARCHAR(191) NULL,
    ADD COLUMN `bloodType` VARCHAR(191) NULL,
    ADD COLUMN `gp` VARCHAR(191) NULL;
