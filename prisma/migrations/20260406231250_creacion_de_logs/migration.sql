-- CreateTable
CREATE TABLE `log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `statusCode` INTEGER NOT NULL,
    `path` VARCHAR(255) NOT NULL,
    `error` TEXT NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `errorCode` VARCHAR(255) NOT NULL,
    `sessionId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `log` ADD CONSTRAINT `log_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
