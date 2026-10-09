<?php
/** /hosting-api/menus — Navigation menus */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $rows = DB::conn()->query('SELECT * FROM ' . DB::table('menus') . ' ORDER BY createdAt DESC')->fetchAll();
    foreach ($rows as &$r) { $r['items'] = json_decode($r['items'] ?: '[]', true) ?: []; }
    respond(['ok' => true, 'items' => $rows]);
}

if ($method === 'POST') {
    $user = require_auth();
    $b = body_json();
    $slug = $b['slug'] ?? slugify($b['name'] ?? 'menu');
    $slug = ensure_unique_slug($slug, 'menus');
    $items = is_array($b['items'] ?? null) ? json_encode($b['items']) : ($b['items'] ?? '[]');
    $id = rand_id();
    DB::conn()->prepare('INSERT INTO ' . DB::table('menus') . ' (id, slug, name, location, items) VALUES (?,?,?,?,?)')
        ->execute([$id, $slug, $b['name'] ?? 'Menu', $b['location'] ?? 'header', $items]);
    log_activity($user, 'created', 'menu', $id, $b['name'] ?? 'Menu');
    $row = get_row('menus', $id);
    $row['items'] = json_decode($row['items'] ?: '[]', true) ?: [];
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'PUT') {
    $user = require_auth();
    $b = body_json();
    $id = $b['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('menus', $id);
    if (!$ex) { DB::err('Menu not found', 404); exit; }
    $u = []; $v = [];
    foreach (['name','location','slug'] as $f) { if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f]; } }
    if (isset($b['items'])) { $u[] = "`items` = ?"; $v[] = is_array($b['items']) ? json_encode($b['items']) : $b['items']; }
    if ($u) { $v[] = $id; DB::conn()->prepare('UPDATE ' . DB::table('menus') . ' SET ' . implode(',', $u) . ' WHERE id = ?')->execute($v); }
    log_activity($user, 'updated', 'menu', $id, $ex['name']);
    $row = get_row('menus', $id);
    $row['items'] = json_decode($row['items'] ?: '[]', true) ?: [];
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'DELETE') {
    $user = require_auth();
    $id = $_GET['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('menus', $id);
    if (!$ex) { DB::err('Menu not found', 404); exit; }
    DB::conn()->prepare('DELETE FROM ' . DB::table('menus') . ' WHERE id = ?')->execute([$id]);
    log_activity($user, 'deleted', 'menu', $id, $ex['name']);
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
