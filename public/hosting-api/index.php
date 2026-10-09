<?php
/**
 * JuraganWebsite - PHP API Router untuk shared hosting
 * Mengikuti kontrak yang sama dengan versi Next.js (/api/*) supaya frontend sama.
 *
 * URL mapping:
 *   /api/posts          → /hosting-api/index.php?endpoint=posts
 *   /api/portfolio      → /hosting-api/index.php?endpoint=portfolio
 *   dst.
 *
 * File .htaccess akan handle rewrite sehingga /hosting-api/posts.php
 * bisa dipanggil langsung tanpa ?endpoint=
 */
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

// CORS headers (same-origin juga aman)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('X-Content-Type-Options: nosniff');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Determine endpoint from query (?endpoint=) or path
$endpoint = $_GET['endpoint'] ?? '';
if (!$endpoint) {
    // /hosting-api/index.php/posts → 'posts'
    $uri = $_SERVER['PATH_INFO'] ?? '';
    $uri = trim($uri, '/');
    if ($uri) $endpoint = $uri;
}
if (!$endpoint) $endpoint = 'index';

// Validate endpoint (allow only alphanumeric + dash, no slashes)
$endpoint = preg_replace('/[^a-z0-9\-]/', '', $endpoint);
if (!$endpoint) {
    DB::err('Invalid endpoint', 404);
    exit;
}

// Route to handler file
$handler = __DIR__ . '/endpoints/' . $endpoint . '.php';
if (!file_exists($handler)) {
    DB::err("Endpoint not found: $endpoint", 404);
    exit;
}

require $handler;
