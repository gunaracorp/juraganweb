<?php
/** /hosting-api/portfolio */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $rows = DB::conn()->query('SELECT * FROM ' . DB::table('portfolios') . ' ORDER BY featured DESC, createdAt DESC')->fetchAll();
    foreach ($rows as &$r) { cast_bool($r, ['featured']); cast_int($r, ['year']); }
    respond(['ok' => true, 'items' => $rows]);
}

if ($method === 'POST') {
    require_auth();
    $b = body_json();
    $slug = $b['slug'] ?? slugify($b['titleId'] ?? $b['titleEn'] ?? 'portfolio');
    $slug = ensure_unique_slug($slug, 'portfolios');
    $id = rand_id();
    DB::conn()->prepare('INSERT INTO ' . DB::table('portfolios') . ' (id, slug, titleId, titleEn, descId, descEn, category, client, url, image, year, featured) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
        ->execute([$id, $slug, $b['titleId'] ?? '', $b['titleEn'] ?? $b['titleId'] ?? '', $b['descId'] ?? '', $b['descEn'] ?? '', $b['category'] ?? 'Website', $b['client'] ?? '', $b['url'] ?? null, $b['image'] ?? null, (int)($b['year'] ?? date('Y')), ($b['featured'] ?? false) ? 1 : 0]);
    respond(['ok' => true, 'item' => get_row('portfolios', $id)]);
}

if ($method === 'PUT') {
    require_auth();
    $b = body_json();
    $id = $b['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('portfolios', $id);
    if (!$ex) { DB::err('Portfolio not found', 404); exit; }
    $fields = ['titleId','titleEn','descId','descEn','category','client','url','image'];
    $u = []; $v = [];
    foreach ($fields as $f) { if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f]; } }
    if (isset($b['year'])) { $u[] = "`year` = ?"; $v[] = (int)$b['year']; }
    if (isset($b['featured'])) { $u[] = "`featured` = ?"; $v[] = $b['featured'] ? 1 : 0; }
    if (isset($b['slug']) && $b['slug'] !== $ex['slug']) { $u[] = "`slug` = ?"; $v[] = ensure_unique_slug($b['slug'], 'portfolios', $id); }
    if ($u) { $v[] = $id; DB::conn()->prepare('UPDATE ' . DB::table('portfolios') . ' SET ' . implode(',', $u) . ' WHERE id = ?')->execute($v); }
    respond(['ok' => true, 'item' => get_row('portfolios', $id)]);
}

if ($method === 'DELETE') {
    require_auth();
    $id = $_GET['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    DB::conn()->prepare('DELETE FROM ' . DB::table('portfolios') . ' WHERE id = ?')->execute([$id]);
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
