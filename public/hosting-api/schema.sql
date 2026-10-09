-- =====================================================
-- JuraganWebsite - MySQL Schema untuk cPanel / phpMyAdmin
-- PT Digital Bisnis Manajemen (Digiman) - sejak 2007
-- Versi 2.0 - WordPress-class CMS
-- =====================================================
-- Jalankan di cPanel > phpMyAdmin > tab "SQL" untuk membuat tabel.
-- Atau buka https://domain-anda/hosting-api/install.php untuk otomatis.
-- =====================================================

SET NAMES utf8mb4;
SET time_zone = '+07:00';

-- Admin (CMS users)
CREATE TABLE IF NOT EXISTS `jw_admins` (
  `id`        VARCHAR(40) NOT NULL,
  `username`  VARCHAR(60) NOT NULL,
  `password`  VARCHAR(255) NOT NULL,
  `name`      VARCHAR(120) NOT NULL,
  `email`     VARCHAR(120) NOT NULL,
  `role`      VARCHAR(30) NOT NULL DEFAULT 'admin',
  `avatar`    VARCHAR(500) DEFAULT NULL,
  `bio`       TEXT,
  `lastLogin` DATETIME DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Posts (Blog)
CREATE TABLE IF NOT EXISTS `jw_posts` (
  `id`        VARCHAR(40) NOT NULL,
  `slug`      VARCHAR(200) NOT NULL,
  `titleId`   VARCHAR(255) NOT NULL,
  `titleEn`   VARCHAR(255) NOT NULL,
  `excerptId` TEXT NOT NULL,
  `excerptEn` TEXT NOT NULL,
  `contentId` LONGTEXT NOT NULL,
  `contentEn` LONGTEXT NOT NULL,
  `category`  VARCHAR(80) NOT NULL DEFAULT 'Umum',
  `tags`      VARCHAR(255) NOT NULL DEFAULT '',
  `coverImage` VARCHAR(500) DEFAULT NULL,
  `author`    VARCHAR(120) NOT NULL DEFAULT 'Tim JuraganWebsite',
  `featured`  TINYINT(1) NOT NULL DEFAULT 0,
  `published` TINYINT(1) NOT NULL DEFAULT 1,
  `views`     INT NOT NULL DEFAULT 0,
  `metaTitle`       VARCHAR(255) DEFAULT NULL,
  `metaDescription` TEXT,
  `focusKeyword`    VARCHAR(160) DEFAULT NULL,
  `ogImage`         VARCHAR(500) DEFAULT NULL,
  `status`    VARCHAR(20) NOT NULL DEFAULT 'published',
  `pinned`    TINYINT(1) NOT NULL DEFAULT 0,
  `allowComments` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_status` (`status`),
  KEY `idx_category` (`category`),
  KEY `idx_published` (`published`),
  KEY `idx_featured` (`featured`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pages (static pages)
CREATE TABLE IF NOT EXISTS `jw_pages` (
  `id`        VARCHAR(40) NOT NULL,
  `slug`      VARCHAR(200) NOT NULL,
  `titleId`   VARCHAR(255) NOT NULL,
  `titleEn`   VARCHAR(255) NOT NULL,
  `contentId` LONGTEXT NOT NULL,
  `contentEn` LONGTEXT NOT NULL,
  `excerptId` TEXT NOT NULL,
  `excerptEn` TEXT NOT NULL,
  `coverImage` VARCHAR(500) DEFAULT NULL,
  `template`  VARCHAR(60) NOT NULL DEFAULT 'default',
  `status`    VARCHAR(20) NOT NULL DEFAULT 'published',
  `showInMenu` TINYINT(1) NOT NULL DEFAULT 1,
  `menuOrder` INT NOT NULL DEFAULT 0,
  `parentId`  VARCHAR(40) DEFAULT NULL,
  `metaTitle`       VARCHAR(255) DEFAULT NULL,
  `metaDescription` TEXT,
  `author`    VARCHAR(120) NOT NULL DEFAULT 'Admin',
  `views`     INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_status` (`status`),
  KEY `idx_showInMenu` (`showInMenu`),
  KEY `idx_parentId` (`parentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Portfolio
CREATE TABLE IF NOT EXISTS `jw_portfolios` (
  `id`        VARCHAR(40) NOT NULL,
  `slug`      VARCHAR(200) NOT NULL,
  `titleId`   VARCHAR(255) NOT NULL,
  `titleEn`   VARCHAR(255) NOT NULL,
  `descId`    TEXT NOT NULL,
  `descEn`    TEXT NOT NULL,
  `category`  VARCHAR(80) NOT NULL DEFAULT 'Website',
  `client`    VARCHAR(160) NOT NULL DEFAULT '',
  `url`       VARCHAR(500) DEFAULT NULL,
  `image`     VARCHAR(500) DEFAULT NULL,
  `gallery`   TEXT NOT NULL,
  `year`      INT NOT NULL,
  `featured`  TINYINT(1) NOT NULL DEFAULT 0,
  `status`    VARCHAR(20) NOT NULL DEFAULT 'published',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Services
CREATE TABLE IF NOT EXISTS `jw_services` (
  `id`         VARCHAR(40) NOT NULL,
  `slug`       VARCHAR(200) NOT NULL,
  `titleId`    VARCHAR(255) NOT NULL,
  `titleEn`    VARCHAR(255) NOT NULL,
  `descId`     TEXT NOT NULL,
  `descEn`     TEXT NOT NULL,
  `icon`       VARCHAR(60) NOT NULL DEFAULT 'Code',
  `price`      INT NOT NULL DEFAULT 0,
  `priceLabel` VARCHAR(120) NOT NULL DEFAULT '',
  `features`   TEXT NOT NULL,
  `active`     TINYINT(1) NOT NULL DEFAULT 1,
  `order`      INT NOT NULL DEFAULT 0,
  `createdAt`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_active` (`active`),
  KEY `idx_order` (`order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Testimonials
CREATE TABLE IF NOT EXISTS `jw_testimonials` (
  `id`        VARCHAR(40) NOT NULL,
  `name`      VARCHAR(120) NOT NULL,
  `company`   VARCHAR(160) NOT NULL DEFAULT '',
  `role`      VARCHAR(120) NOT NULL DEFAULT '',
  `messageId` TEXT NOT NULL,
  `messageEn` TEXT NOT NULL,
  `rating`    INT NOT NULL DEFAULT 5,
  `avatar`    VARCHAR(500) DEFAULT NULL,
  `active`    TINYINT(1) NOT NULL DEFAULT 1,
  `order`     INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_active` (`active`),
  KEY `idx_order` (`order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Messages (Contact form submissions)
CREATE TABLE IF NOT EXISTS `jw_messages` (
  `id`        VARCHAR(40) NOT NULL,
  `name`      VARCHAR(120) NOT NULL,
  `email`     VARCHAR(160) NOT NULL,
  `phone`     VARCHAR(40) DEFAULT NULL,
  `subject`   VARCHAR(200) NOT NULL,
  `message`   TEXT NOT NULL,
  `status`    VARCHAR(20) NOT NULL DEFAULT 'new',
  `read`      TINYINT(1) NOT NULL DEFAULT 0,
  `replied`   TINYINT(1) NOT NULL DEFAULT 0,
  `starred`   TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_read` (`read`),
  KEY `idx_starred` (`starred`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comments
CREATE TABLE IF NOT EXISTS `jw_comments` (
  `id`        VARCHAR(40) NOT NULL,
  `postId`    VARCHAR(40) NOT NULL,
  `name`      VARCHAR(120) NOT NULL,
  `email`     VARCHAR(160) NOT NULL,
  `website`   VARCHAR(500) DEFAULT NULL,
  `content`   TEXT NOT NULL,
  `status`    VARCHAR(20) NOT NULL DEFAULT 'pending',
  `parentId`  VARCHAR(40) DEFAULT NULL,
  `ip`        VARCHAR(45) DEFAULT NULL,
  `userAgent` TEXT,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_postId` (`postId`),
  KEY `idx_status` (`status`),
  KEY `idx_parentId` (`parentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Media Library
CREATE TABLE IF NOT EXISTS `jw_media` (
  `id`        VARCHAR(40) NOT NULL,
  `filename`  VARCHAR(255) NOT NULL,
  `url`       VARCHAR(500) NOT NULL,
  `thumbUrl`  VARCHAR(500) DEFAULT NULL,
  `mimeType`  VARCHAR(100) NOT NULL DEFAULT 'image/jpeg',
  `size`      INT NOT NULL DEFAULT 0,
  `width`     INT DEFAULT NULL,
  `height`    INT DEFAULT NULL,
  `alt`       VARCHAR(255) NOT NULL DEFAULT '',
  `caption`   TEXT NOT NULL,
  `uploadedBy` VARCHAR(60) NOT NULL DEFAULT 'admin',
  `folder`    VARCHAR(100) NOT NULL DEFAULT '/',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_folder` (`folder`),
  KEY `idx_uploadedBy` (`uploadedBy`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Menus
CREATE TABLE IF NOT EXISTS `jw_menus` (
  `id`        VARCHAR(40) NOT NULL,
  `slug`      VARCHAR(100) NOT NULL,
  `name`      VARCHAR(120) NOT NULL,
  `location`  VARCHAR(60) NOT NULL DEFAULT 'header',
  `items`     LONGTEXT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings (key-value, bilingual)
CREATE TABLE IF NOT EXISTS `jw_settings` (
  `id`        VARCHAR(40) NOT NULL,
  `key`       VARCHAR(80) NOT NULL,
  `valueId`   LONGTEXT NOT NULL,
  `valueEn`   LONGTEXT NOT NULL,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Subscribers (Newsletter)
CREATE TABLE IF NOT EXISTS `jw_subscribers` (
  `id`        VARCHAR(40) NOT NULL,
  `email`     VARCHAR(160) NOT NULL,
  `name`      VARCHAR(120) DEFAULT NULL,
  `active`    TINYINT(1) NOT NULL DEFAULT 1,
  `source`    VARCHAR(60) NOT NULL DEFAULT 'website',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity Log
CREATE TABLE IF NOT EXISTS `jw_activities` (
  `id`          VARCHAR(40) NOT NULL,
  `userId`      VARCHAR(60) NOT NULL,
  `userName`    VARCHAR(120) NOT NULL,
  `action`      VARCHAR(40) NOT NULL,
  `entity`      VARCHAR(40) NOT NULL,
  `entityId`    VARCHAR(40) DEFAULT NULL,
  `entityTitle` VARCHAR(255) DEFAULT NULL,
  `details`     TEXT NOT NULL,
  `ip`          VARCHAR(45) DEFAULT NULL,
  `createdAt`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_userId` (`userId`),
  KEY `idx_entity` (`entity`),
  KEY `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories
CREATE TABLE IF NOT EXISTS `jw_categories` (
  `id`          VARCHAR(40) NOT NULL,
  `slug`        VARCHAR(160) NOT NULL,
  `nameId`      VARCHAR(160) NOT NULL,
  `nameEn`      VARCHAR(160) NOT NULL,
  `description` TEXT NOT NULL,
  `parentId`    VARCHAR(40) DEFAULT NULL,
  `count`       INT NOT NULL DEFAULT 0,
  `createdAt`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_parentId` (`parentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tags
CREATE TABLE IF NOT EXISTS `jw_tags` (
  `id`        VARCHAR(40) NOT NULL,
  `slug`      VARCHAR(160) NOT NULL,
  `name`      VARCHAR(160) NOT NULL,
  `count`     INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- HOSTING PANEL TABLES (Task H3)
-- =====================================================

CREATE TABLE IF NOT EXISTS `jw_service_packages` (
  `id`          VARCHAR(40) NOT NULL,
  `slug`        VARCHAR(200) NOT NULL,
  `nameId`      VARCHAR(255) NOT NULL,
  `nameEn`      VARCHAR(255) NOT NULL,
  `descId`      TEXT NOT NULL,
  `descEn`      TEXT NOT NULL,
  `category`    VARCHAR(80) NOT NULL DEFAULT 'hosting',
  `price`       INT NOT NULL DEFAULT 0,
  `priceYearly` INT NOT NULL DEFAULT 0,
  `setupFee`    INT NOT NULL DEFAULT 0,
  `currency`    VARCHAR(10) NOT NULL DEFAULT 'IDR',
  `billingCycle` VARCHAR(20) NOT NULL DEFAULT 'monthly',
  `features`    LONGTEXT NOT NULL,
  `specs`       LONGTEXT NOT NULL,
  `popular`     TINYINT(1) NOT NULL DEFAULT 0,
  `featured`    TINYINT(1) NOT NULL DEFAULT 0,
  `active`      TINYINT(1) NOT NULL DEFAULT 1,
  `order`       INT NOT NULL DEFAULT 0,
  `maxOrders`   INT NOT NULL DEFAULT 0,
  `stock`       INT NOT NULL DEFAULT 0,
  `createdAt`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_category` (`category`),
  KEY `idx_active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jw_customers` (
  `id`        VARCHAR(40) NOT NULL,
  `email`     VARCHAR(160) NOT NULL,
  `name`      VARCHAR(160) NOT NULL,
  `phone`     VARCHAR(60) DEFAULT NULL,
  `company`   VARCHAR(160) DEFAULT NULL,
  `address`   VARCHAR(255) DEFAULT NULL,
  `city`      VARCHAR(120) DEFAULT NULL,
  `country`   VARCHAR(120) NOT NULL DEFAULT 'Indonesia',
  `password`  VARCHAR(255) NOT NULL,
  `status`    VARCHAR(20) NOT NULL DEFAULT 'active',
  `avatar`    VARCHAR(500) DEFAULT NULL,
  `verified`  TINYINT(1) NOT NULL DEFAULT 0,
  `totalSpent`  INT NOT NULL DEFAULT 0,
  `totalOrders` INT NOT NULL DEFAULT 0,
  `notes`     TEXT NOT NULL,
  `lastLogin` DATETIME DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jw_orders` (
  `id`            VARCHAR(40) NOT NULL,
  `invoice`       VARCHAR(40) NOT NULL,
  `customerId`    VARCHAR(40) NOT NULL,
  `customerName`  VARCHAR(160) NOT NULL,
  `customerEmail` VARCHAR(160) NOT NULL,
  `items`         LONGTEXT NOT NULL,
  `subtotal`      INT NOT NULL DEFAULT 0,
  `discount`      INT NOT NULL DEFAULT 0,
  `tax`           INT NOT NULL DEFAULT 0,
  `total`         INT NOT NULL DEFAULT 0,
  `couponCode`    VARCHAR(60) DEFAULT NULL,
  `paymentMethod` VARCHAR(40) DEFAULT NULL,
  `paymentStatus` VARCHAR(20) NOT NULL DEFAULT 'pending',
  `status`        VARCHAR(20) NOT NULL DEFAULT 'pending',
  `notes`         TEXT NOT NULL,
  `paidAt`        DATETIME DEFAULT NULL,
  `createdAt`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice` (`invoice`),
  KEY `idx_customerId` (`customerId`),
  KEY `idx_status` (`status`),
  KEY `idx_paymentStatus` (`paymentStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jw_invoices` (
  `id`            VARCHAR(40) NOT NULL,
  `number`        VARCHAR(40) NOT NULL,
  `orderId`       VARCHAR(40) DEFAULT NULL,
  `customerId`    VARCHAR(40) NOT NULL,
  `customerName`  VARCHAR(160) NOT NULL,
  `customerEmail` VARCHAR(160) NOT NULL,
  `items`         LONGTEXT NOT NULL,
  `subtotal`      INT NOT NULL DEFAULT 0,
  `discount`      INT NOT NULL DEFAULT 0,
  `tax`           INT NOT NULL DEFAULT 0,
  `total`         INT NOT NULL DEFAULT 0,
  `currency`      VARCHAR(10) NOT NULL DEFAULT 'IDR',
  `status`        VARCHAR(20) NOT NULL DEFAULT 'unpaid',
  `dueDate`       DATETIME DEFAULT NULL,
  `sentAt`        DATETIME DEFAULT NULL,
  `paidAt`        DATETIME DEFAULT NULL,
  `notes`         TEXT NOT NULL,
  `createdAt`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `number` (`number`),
  KEY `idx_customerId` (`customerId`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jw_payments` (
  `id`            VARCHAR(40) NOT NULL,
  `invoiceId`     VARCHAR(40) DEFAULT NULL,
  `orderId`       VARCHAR(40) DEFAULT NULL,
  `customerId`    VARCHAR(40) NOT NULL,
  `amount`        INT NOT NULL DEFAULT 0,
  `currency`      VARCHAR(10) NOT NULL DEFAULT 'IDR',
  `method`        VARCHAR(40) NOT NULL,
  `gateway`       VARCHAR(60) DEFAULT NULL,
  `gatewayRef`    VARCHAR(120) DEFAULT NULL,
  `status`        VARCHAR(20) NOT NULL DEFAULT 'pending',
  `fee`           INT NOT NULL DEFAULT 0,
  `notes`         TEXT NOT NULL,
  `paidAt`        DATETIME DEFAULT NULL,
  `createdAt`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_customerId` (`customerId`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jw_tickets` (
  `id`              VARCHAR(40) NOT NULL,
  `number`          VARCHAR(40) NOT NULL,
  `customerId`       VARCHAR(40) DEFAULT NULL,
  `customerName`     VARCHAR(160) NOT NULL,
  `customerEmail`    VARCHAR(160) NOT NULL,
  `subject`          VARCHAR(255) NOT NULL,
  `category`         VARCHAR(60) NOT NULL DEFAULT 'general',
  `priority`         VARCHAR(20) NOT NULL DEFAULT 'normal',
  `status`           VARCHAR(20) NOT NULL DEFAULT 'open',
  `department`       VARCHAR(60) NOT NULL DEFAULT 'support',
  `assignedTo`       VARCHAR(120) DEFAULT NULL,
  `message`          LONGTEXT NOT NULL,
  `tags`             VARCHAR(255) NOT NULL DEFAULT '',
  `rating`           INT NOT NULL DEFAULT 0,
  `firstResponseAt`  DATETIME DEFAULT NULL,
  `resolvedAt`       DATETIME DEFAULT NULL,
  `createdAt`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `number` (`number`),
  KEY `idx_status` (`status`),
  KEY `idx_priority` (`priority`),
  KEY `idx_assignedTo` (`assignedTo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jw_ticket_replies` (
  `id`           VARCHAR(40) NOT NULL,
  `ticketId`     VARCHAR(40) NOT NULL,
  `author`       VARCHAR(160) NOT NULL,
  `authorRole`   VARCHAR(20) NOT NULL DEFAULT 'customer',
  `message`     LONGTEXT NOT NULL,
  `attachments` LONGTEXT NOT NULL,
  `internal`    TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ticketId` (`ticketId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jw_knowledge_articles` (
  `id`        VARCHAR(40) NOT NULL,
  `slug`      VARCHAR(200) NOT NULL,
  `titleId`   VARCHAR(255) NOT NULL,
  `titleEn`   VARCHAR(255) NOT NULL,
  `contentId` LONGTEXT NOT NULL,
  `contentEn` LONGTEXT NOT NULL,
  `excerptId` TEXT NOT NULL,
  `excerptEn` TEXT NOT NULL,
  `category`  VARCHAR(80) NOT NULL DEFAULT 'general',
  `tags`      VARCHAR(255) NOT NULL DEFAULT '',
  `views`     INT NOT NULL DEFAULT 0,
  `helpful`   INT NOT NULL DEFAULT 0,
  `unhelpful` INT NOT NULL DEFAULT 0,
  `published` TINYINT(1) NOT NULL DEFAULT 1,
  `featured`  TINYINT(1) NOT NULL DEFAULT 0,
  `author`    VARCHAR(120) NOT NULL DEFAULT 'Tim JuraganWebsite',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_category` (`category`),
  KEY `idx_published` (`published`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jw_knowledge_categories` (
  `id`        VARCHAR(40) NOT NULL,
  `slug`      VARCHAR(200) NOT NULL,
  `nameId`    VARCHAR(160) NOT NULL,
  `nameEn`    VARCHAR(160) NOT NULL,
  `descId`    TEXT NOT NULL,
  `descEn`    TEXT NOT NULL,
  `icon`      VARCHAR(60) NOT NULL DEFAULT 'HelpCircle',
  `order`     INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jw_affiliates` (
  `id`          VARCHAR(40) NOT NULL,
  `customerId`  VARCHAR(40) DEFAULT NULL,
  `code`        VARCHAR(40) NOT NULL,
  `name`        VARCHAR(160) NOT NULL,
  `email`       VARCHAR(160) NOT NULL,
  `commissionRate` DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  `totalClicks` INT NOT NULL DEFAULT 0,
  `totalSignups` INT NOT NULL DEFAULT 0,
  `totalSales`  INT NOT NULL DEFAULT 0,
  `totalCommission` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `paidOut`     DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `balance`     DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `status`      VARCHAR(20) NOT NULL DEFAULT 'active',
  `createdAt`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jw_affiliate_clicks` (
  `id`           VARCHAR(40) NOT NULL,
  `affiliateId`  VARCHAR(40) NOT NULL,
  `code`         VARCHAR(40) NOT NULL,
  `ip`           VARCHAR(60) DEFAULT NULL,
  `userAgent`    VARCHAR(255) DEFAULT NULL,
  `referer`      VARCHAR(255) DEFAULT NULL,
  `converted`    TINYINT(1) NOT NULL DEFAULT 0,
  `convertedAt`  DATETIME DEFAULT NULL,
  `createdAt`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_affiliateId` (`affiliateId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jw_server_metrics` (
  `id`            VARCHAR(40) NOT NULL,
  `server`        VARCHAR(60) NOT NULL DEFAULT 'main',
  `cpuUsage`      DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `ramUsage`      DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `diskUsage`     DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `bandwidthIn`   BIGINT NOT NULL DEFAULT 0,
  `bandwidthOut`  BIGINT NOT NULL DEFAULT 0,
  `uptime`        BIGINT NOT NULL DEFAULT 0,
  `loadAvg`       VARCHAR(60) NOT NULL DEFAULT '0,0,0',
  `processes`     INT NOT NULL DEFAULT 0,
  `connections`  INT NOT NULL DEFAULT 0,
  `createdAt`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_server` (`server`),
  KEY `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jw_cron_jobs` (
  `id`          VARCHAR(40) NOT NULL,
  `name`        VARCHAR(160) NOT NULL,
  `command`     VARCHAR(500) NOT NULL,
  `schedule`    VARCHAR(60) NOT NULL,
  `description` TEXT NOT NULL,
  `enabled`     TINYINT(1) NOT NULL DEFAULT 1,
  `lastRun`     DATETIME DEFAULT NULL,
  `nextRun`     DATETIME DEFAULT NULL,
  `lastStatus`  VARCHAR(20) DEFAULT NULL,
  `lastOutput`  LONGTEXT,
  `createdAt`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jw_dns_records` (
  `id`        VARCHAR(40) NOT NULL,
  `domain`    VARCHAR(255) NOT NULL,
  `type`      VARCHAR(20) NOT NULL,
  `name`      VARCHAR(255) NOT NULL,
  `value`     VARCHAR(500) NOT NULL,
  `priority`  INT NOT NULL DEFAULT 0,
  `ttl`       INT NOT NULL DEFAULT 3600,
  `enabled`   TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_domain` (`domain`),
  KEY `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jw_ssl_certificates` (
  `id`         VARCHAR(40) NOT NULL,
  `domain`     VARCHAR(255) NOT NULL,
  `type`       VARCHAR(20) NOT NULL DEFAULT 'dv',
  `issuer`     VARCHAR(160) NOT NULL DEFAULT 'Let''s Encrypt',
  `validFrom`  DATETIME NOT NULL,
  `validTo`    DATETIME NOT NULL,
  `autoRenew`  TINYINT(1) NOT NULL DEFAULT 1,
  `status`     VARCHAR(20) NOT NULL DEFAULT 'active',
  `createdAt`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_domain` (`domain`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jw_backups` (
  `id`        VARCHAR(40) NOT NULL,
  `type`      VARCHAR(20) NOT NULL DEFAULT 'full',
  `size`      BIGINT NOT NULL DEFAULT 0,
  `path`      VARCHAR(500) NOT NULL,
  `status`    VARCHAR(20) NOT NULL DEFAULT 'completed',
  `source`    VARCHAR(20) NOT NULL DEFAULT 'manual',
  `notes`     TEXT NOT NULL,
  `expiresAt` DATETIME DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jw_email_accounts` (
  `id`         VARCHAR(40) NOT NULL,
  `email`      VARCHAR(160) NOT NULL,
  `domain`     VARCHAR(255) NOT NULL,
  `password`   VARCHAR(255) NOT NULL,
  `quota`      INT NOT NULL DEFAULT 1024,
  `usedQuota`  INT NOT NULL DEFAULT 0,
  `forwardTo`  VARCHAR(160) DEFAULT NULL,
  `autoReply`  TEXT,
  `status`     VARCHAR(20) NOT NULL DEFAULT 'active',
  `lastAccess` DATETIME DEFAULT NULL,
  `createdAt`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_domain` (`domain`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jw_ftp_accounts` (
  `id`         VARCHAR(40) NOT NULL,
  `username`   VARCHAR(160) NOT NULL,
  `password`    VARCHAR(255) NOT NULL,
  `path`        VARCHAR(500) NOT NULL DEFAULT '/',
  `quota`       INT NOT NULL DEFAULT 0,
  `usedQuota`   INT NOT NULL DEFAULT 0,
  `status`      VARCHAR(20) NOT NULL DEFAULT 'active',
  `createdAt`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jw_newsletter_campaigns` (
  `id`         VARCHAR(40) NOT NULL,
  `name`       VARCHAR(160) NOT NULL,
  `subjectId`  VARCHAR(255) NOT NULL,
  `subjectEn`  VARCHAR(255) NOT NULL,
  `contentId`  LONGTEXT NOT NULL,
  `contentEn`  LONGTEXT NOT NULL,
  `stats`      LONGTEXT NOT NULL,
  `status`     VARCHAR(20) NOT NULL DEFAULT 'draft',
  `scheduledAt` DATETIME DEFAULT NULL,
  `sentAt`     DATETIME DEFAULT NULL,
  `target`     VARCHAR(60) NOT NULL DEFAULT 'all',
  `targetCount` INT NOT NULL DEFAULT 0,
  `createdBy`  VARCHAR(120) NOT NULL DEFAULT 'admin',
  `createdAt`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jw_coupons` (
  `id`          VARCHAR(40) NOT NULL,
  `code`        VARCHAR(60) NOT NULL,
  `type`        VARCHAR(20) NOT NULL DEFAULT 'percent',
  `value`       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `minOrder`    INT NOT NULL DEFAULT 0,
  `maxDiscount` INT NOT NULL DEFAULT 0,
  `usageLimit`  INT NOT NULL DEFAULT 0,
  `used`        INT NOT NULL DEFAULT 0,
  `validFrom`   DATETIME DEFAULT NULL,
  `validTo`     DATETIME DEFAULT NULL,
  `status`      VARCHAR(20) NOT NULL DEFAULT 'active',
  `appliesTo`   VARCHAR(120) NOT NULL DEFAULT 'all',
  `createdAt`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jw_security_logs` (
  `id`         VARCHAR(40) NOT NULL,
  `type`       VARCHAR(60) NOT NULL,
  `userId`     VARCHAR(40) DEFAULT NULL,
  `username`   VARCHAR(120) DEFAULT NULL,
  `ip`         VARCHAR(60) DEFAULT NULL,
  `userAgent`  VARCHAR(255) DEFAULT NULL,
  `location`   VARCHAR(255) DEFAULT NULL,
  `details`    TEXT NOT NULL,
  `severity`   VARCHAR(20) NOT NULL DEFAULT 'info',
  `createdAt`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_userId` (`userId`),
  KEY `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jw_staging_envs` (
  `id`           VARCHAR(40) NOT NULL,
  `name`         VARCHAR(160) NOT NULL,
  `domain`       VARCHAR(255) NOT NULL,
  `sourceDomain` VARCHAR(255) NOT NULL,
  `branch`       VARCHAR(80) NOT NULL DEFAULT 'main',
  `status`       VARCHAR(20) NOT NULL DEFAULT 'idle',
  `deployUrl`    VARCHAR(500) NOT NULL,
  `lastDeploy`   DATETIME DEFAULT NULL,
  `autoSync`     TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jw_ai_website_projects` (
  `id`           VARCHAR(40) NOT NULL,
  `name`         VARCHAR(160) NOT NULL,
  `business`     VARCHAR(255) NOT NULL,
  `industry`     VARCHAR(120) NOT NULL,
  `template`     VARCHAR(60) NOT NULL DEFAULT 'modern',
  `pages`        LONGTEXT NOT NULL,
  `status`       VARCHAR(20) NOT NULL DEFAULT 'draft',
  `publishedUrl` VARCHAR(500) DEFAULT NULL,
  `createdBy`    VARCHAR(120) NOT NULL,
  `createdAt`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jw_visitor_stats` (
  `id`           VARCHAR(40) NOT NULL,
  `date`         DATE NOT NULL,
  `visitors`     INT NOT NULL DEFAULT 0,
  `pageViews`    INT NOT NULL DEFAULT 0,
  `uniqueIPs`    INT NOT NULL DEFAULT 0,
  `bounceRate`   DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `avgTime`      INT NOT NULL DEFAULT 0,
  `topReferrer`  VARCHAR(255) DEFAULT NULL,
  `topCountry`   VARCHAR(120) DEFAULT NULL,
  `topDevice`    VARCHAR(60) DEFAULT NULL,
  `createdAt`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jw_notifications` (
  `id`        VARCHAR(40) NOT NULL,
  `userId`    VARCHAR(120) NOT NULL,
  `type`      VARCHAR(40) NOT NULL,
  `title`     VARCHAR(255) NOT NULL,
  `message`   TEXT NOT NULL,
  `icon`      VARCHAR(60) NOT NULL DEFAULT 'Bell',
  `read`      TINYINT(1) NOT NULL DEFAULT 0,
  `link`      VARCHAR(500) DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_userId` (`userId`),
  KEY `idx_read` (`read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
