<?php
/** /hosting-api/testimonials */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $rows = DB::conn()->query('SELECT * FROM ' . DB::table('testimonials') . ' WHERE active = 1 ORDER BY `order` ASC')->fetchAll();
    foreach ($rows as &$r) { cast_int($r, ['rating','order']); cast_bool($r, ['active']); }
    respond(['ok' => true, 'items' => $rows]);
}

if ($method === 'POST') {
    require_auth();
    $b = body_json();
    $id = rand_id();
    DB::conn()->prepare('INSERT INTO ' . DB::table('testimonials') . ' (id, name, company, role, messageId, messageEn, rating, avatar, active, `order`) VALUES (?,?,?,?,?,?,?,?,?,?)')
        ->execute([$id, $b['name'] ?? '', $b['company'] ?? '', $b['role'] ?? '', $b['messageId'] ?? '', $b['messageEn'] ?? $b['messageId'] ?? '', max(1, min(5, (int)($b['rating'] ?? 5))), $b['avatar'] ?? null, ($b['active'] ?? true) ? 1 : 0, (int)($b['order'] ?? 0)]);
    respond(['ok' => true, 'item' => get_row('testimonials', $id)]);
}

if ($method === 'PUT') {
    require_auth();
    $b = body_json();
    $id = $b['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('testimonials', $id);
    if (!$ex) { DB::err('Testimonial not found', 404); exit; }
    $fields = ['name','company','role','messageId','messageEn','avatar'];
    $u = []; $v = [];
    foreach ($fields as $f) { if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f]; } }
    if (isset($b['rating'])) { $u[] = "`rating` = ?"; $v[] = max(1, min(5, (int)$b['rating'])); }
    if (isset($b['order'])) { $u[] = "`order` = ?"; $v[] = (int)$b['order']; }
    if (isset($b['active'])) { $u[] = "`active` = ?"; $v[] = $b['active'] ? 1 : 0; }
    if ($u) { $v[] = $id; DB::conn()->prepare('UPDATE ' . DB::table('testimonials') . ' SET ' . implode(',', $u) . ' WHERE id = ?')->execute($v); }
    respond(['ok' => true, 'item' => get_row('testimonials', $id)]);
}

if ($method === 'DELETE') {
    require_auth();
    $id = $_GET['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    DB::conn()->prepare('DELETE FROM ' . DB::table('testimonials') . ' WHERE id = ?')->execute([$id]);
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
