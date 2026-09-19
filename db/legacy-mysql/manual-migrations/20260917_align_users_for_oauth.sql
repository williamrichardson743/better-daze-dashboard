-- Align the legacy TiDB `users` table with the dashboard OAuth user contract.
-- This migration is additive except for widening nullable/enum definitions; it does not drop
-- tables, columns, rows, indexes, or alter existing primary keys.

ALTER TABLE `users`
  MODIFY COLUMN `email` varchar(320) NULL,
  MODIFY COLUMN `role` enum('user', 'admin', 'viewer') NOT NULL DEFAULT 'user',
  ADD COLUMN `unionId` varchar(255) NULL,
  ADD COLUMN `avatar` text NULL,
  ADD COLUMN `status` enum('active', 'inactive') NOT NULL DEFAULT 'active',
  ADD COLUMN `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD COLUMN `lastSignInAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Preserve existing records by assigning deterministic, collision-free legacy identities.
UPDATE `users`
SET `unionId` = CONCAT('legacy:', `id`)
WHERE `unionId` IS NULL;

-- TiDB does not permit a column modification and a constraint addition on the same
-- column within a single ALTER statement, so these operations must remain separate.
ALTER TABLE `users`
  MODIFY COLUMN `unionId` varchar(255) NOT NULL;

ALTER TABLE `users`
  ADD CONSTRAINT `users_unionId_unique` UNIQUE (`unionId`);
