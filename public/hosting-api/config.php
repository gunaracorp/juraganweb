<?php
/**
 * JuraganWebsite - Shared Hosting Configuration
 * PT Digital Bisnis Manajemen (Digiman) - since 2007
 *
 * Edit this file with your cPanel MySQL database credentials.
 * You can also set values via environment variables (.env file) in cPanel.
 */

return [
    // === Database (MySQL - dari cPanel > MySQL Databases) ===
    'db' => [
        'host'     => getenv('DB_HOST') ?: 'localhost',
        'name'     => getenv('DB_NAME') ?: 'juraganwebsite',
        'user'     => getenv('DB_USER') ?: 'root',
        'pass'     => getenv('DB_PASS') ?: '',
        'charset'  => 'utf8mb4',
        'prefix'   => getenv('DB_PREFIX') ?: 'jw_',
    ],

    // === Application ===
    'app' => [
        'name'        => 'JuraganWebsite',
        'company'     => 'PT Digital Bisnis Manajemen (Digiman)',
        'established'=> '2007',
        'url'         => 'https://juraganwebsite.web.id',
        'env'         => 'production',
        'debug'       => false,         // set true saat troubleshooting
        'timezone'    => 'Asia/Jakarta',
    ],

    // === Auth & Security ===
    'auth' => [
        // Ganti secret ini dengan string acak minimal 32 karakter!
        // Generate: openssl rand -hex 32
        'secret'    => getenv('AUTH_SECRET') ?: 'CHANGE_THIS_TO_RANDOM_32_CHAR_STRING_JURAGAN_2007_DIGIMAN',
        // Token expired dalam 7 hari (dalam detik)
        'token_ttl' => 7 * 24 * 60 * 60,
        // Admin default (dibuat saat install)
        'default_username' => 'admin',
        'default_password' => 'juragan2007',
        // Algoritma hashing password (PHP default, paling aman)
        'hash_algo' => PASSWORD_DEFAULT,
    ],

    // === Upload ===
    'upload' => [
        'path'       => __DIR__ . '/../uploads',
        'max_size'   => 5 * 1024 * 1024, // 5MB
        'allowed'    => ['jpg','jpeg','png','webp','gif','svg','pdf','doc','docx'],
        'url_prefix' => '/uploads',
    ],

    // === Email (SMTP via cPanel > Email Accounts) ===
    'mail' => [
        'from_name'  => 'JuraganWebsite',
        'from_email'  => 'juraganwebsite10@gmail.com',
        'smtp_host'  => '',
        'smtp_port'  => 465,
        'smtp_user'  => '',
        'smtp_pass'  => '',
        'smtp_secure'=> 'ssl',
    ],

    // === CORS / API path ===
    'api' => [
        'path'   => '/hosting-api',
        'prefix' => '/hosting-api/',
    ],
];
