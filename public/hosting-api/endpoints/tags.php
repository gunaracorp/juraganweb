<?php
/** /hosting-api/tags — Blog tags */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $rows = DB::conn()->query('SELECT * FROM ' . DB::table('tags') . ' ORDER BY name ASC')->fetchAll();
    cast_int($rows, ['count']);
    respond(['ok' => true, 'items' => $rows]);
}

if ($method === 'POST') {
    require_auth();
    $b = body_json();
    $name = trim($b['name'] ?? '');
    if (!$name) { DB::err('Tag name required', 400); exit; }
    $slug = $b['slug'] ?? slugify($name);
    $slug = ensure_unique_slug($slug, 'tags');
    $id = rand_id();
    DB::conn()->prepare('INSERT INTO ' . DB::table('tags') . ' (id, slug, name) VALUES (?,?,?)')->execute([$id, $slug, $name]);
    respond(['ok' => true, 'item' => get_row('tags', $id)]);
}

if ($method === 'DELETE') {
    require_auth();
    $id = $_GET['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    DB::conn()->prepare('DELETE FROM ' . DB::table('tags') . ' WHERE id = ?')->execute([$id]);
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
