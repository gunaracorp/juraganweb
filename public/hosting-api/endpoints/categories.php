<?php
/** /hosting-api/categories — Blog categories */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $rows = DB::conn()->query('SELECT * FROM ' . DB::table('categories') . ' ORDER BY nameId ASC')->fetchAll();
    cast_int($rows, ['count']);
    respond(['ok' => true, 'items' => $rows]);
}

if ($method === 'POST') {
    require_auth();
    $b = body_json();
    $slug = $b['slug'] ?? slugify($b['nameId'] ?? $b['nameEn'] ?? 'category');
    $slug = ensure_unique_slug($slug, 'categories');
    $id = rand_id();
    DB::conn()->prepare('INSERT INTO ' . DB::table('categories') . ' (id, slug, nameId, nameEn, description, parentId) VALUES (?,?,?,?,?,?)')
        ->execute([$id, $slug, $b['nameId'] ?? '', $b['nameEn'] ?? $b['nameId'] ?? '', $b['description'] ?? '', $b['parentId'] ?? null]);
    respond(['ok' => true, 'item' => get_row('categories', $id)]);
}

if ($method === 'PUT') {
    require_auth();
    $b = body_json();
    $id = $b['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $u = []; $v = [];
    foreach (['nameId','nameEn','description','parentId'] as $f) { if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f]; } }
    if (isset($b['slug'])) { $u[] = "`slug` = ?"; $v[] = slugify($b['slug']); }
    if ($u) { $v[] = $id; DB::conn()->prepare('UPDATE ' . DB::table('categories') . ' SET ' . implode(',', $u) . ' WHERE id = ?')->execute($v); }
    respond(['ok' => true, 'item' => get_row('categories', $id)]);
}

if ($method === 'DELETE') {
    require_auth();
    $id = $_GET['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    DB::conn()->prepare('DELETE FROM ' . DB::table('categories') . ' WHERE id = ?')->execute([$id]);
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
