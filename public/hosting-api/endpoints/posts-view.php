<?php
/** /hosting-api/posts/view — increment view count */
require_once __DIR__ . '/_shared.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'POST') !== 'POST') {
    DB::err('Method not allowed', 405); exit;
}

$b = body_json();
$slug = $b['slug'] ?? '';
if (!$slug) { DB::err('slug required', 400); exit; }
DB::conn()->prepare('UPDATE ' . DB::table('posts') . ' SET views = views + 1 WHERE slug = ?')->execute([$slug]);
respond(['ok' => true]);
