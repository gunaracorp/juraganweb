<?php
/** /hosting-api/services  — GET (public), POST/PUT/DELETE (auth) */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $rows = DB::conn()->query('SELECT * FROM ' . DB::table('services') . ' WHERE active = 1 ORDER BY `order` ASC')->fetchAll();
    echo json_encode(['ok' => true, 'items' => array_map('cast_service', $rows)]);
    exit;
}

if ($method === 'POST') {
    $user = require_auth();
    $body = body_json();
    $slug = $body['slug'] ?? slugify($body['titleId'] ?? $body['titleEn'] ?? 'service');
    $slug = ensure_unique_slug($slug, 'services');
    $id = rand_id();
    DB::conn()->prepare('INSERT INTO ' . DB::table('services') . ' (id, slug, titleId, titleEn, descId, descEn, icon, price, priceLabel, features, active, `order`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
        ->execute([$id, $slug, $body['titleId'] ?? '', $body['titleEn'] ?? $body['titleId'] ?? '', $body['descId'] ?? '', $body['descEn'] ?? '', $body['icon'] ?? 'Code', (int)($body['price'] ?? 0), $body['priceLabel'] ?? '', $body['features'] ?? '', ($body['active'] ?? true) ? 1 : 0, (int)($body['order'] ?? 0)]);
    DB::ok(['ok' => true, 'item' => get_row('services', $id)]);
    exit;
}

if ($method === 'PUT') {
    $user = require_auth();
    $body = body_json();
    $id = $body['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $existing = get_row('services', $id);
    if (!$existing) { DB::err('Service not found', 404); exit; }
    $fields = ['titleId','titleEn','descId','descEn','icon','priceLabel','features'];
    $updates = []; $vals = [];
    foreach ($fields as $f) {
        if (isset($body[$f])) { $updates[] = "`$f` = ?"; $vals[] = $body[$f]; }
    }
    if (isset($body['price'])) { $updates[] = "`price` = ?"; $vals[] = (int)$body['price']; }
    if (isset($body['order'])) { $updates[] = "`order` = ?"; $vals[] = (int)$body['order']; }
    if (isset($body['active'])) { $updates[] = "`active` = ?"; $vals[] = $body['active'] ? 1 : 0; }
    if (isset($body['slug']) && $body['slug'] !== $existing['slug']) {
        $newSlug = ensure_unique_slug($body['slug'], 'services', $id);
        $updates[] = "`slug` = ?"; $vals[] = $newSlug;
    }
    if ($updates) {
        $vals[] = $id;
        DB::conn()->prepare('UPDATE ' . DB::table('services') . ' SET ' . implode(',', $updates) . ' WHERE id = ?')->execute($vals);
    }
    DB::ok(['ok' => true, 'item' => get_row('services', $id)]);
    exit;
}

if ($method === 'DELETE') {
    $user = require_auth();
    $id = $_GET['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    DB::conn()->prepare('DELETE FROM ' . DB::table('services') . ' WHERE id = ?')->execute([$id]);
    DB::ok();
    exit;
}

DB::err('Method not allowed', 405);

function cast_service(array $r): array {
    $r['price'] = (int)$r['price'];
    $r['order'] = (int)$r['order'];
    $r['active'] = (bool)$r['active'];
    $r['featured'] = (bool)($r['featured'] ?? false);
    return $r;
}
