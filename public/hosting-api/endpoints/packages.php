<?php
/** /hosting-api/packages — ServicePackage CRUD (public GET for active; admin for all) */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function parse_package(array &$r): void {
    $r['features'] = json_decode($r['features'] ?? '[]', true) ?: [];
    $r['specs'] = json_decode($r['specs'] ?? '{}', true) ?: [];
    cast_bool($r, ['popular','featured','active']);
    cast_int($r, ['price','priceYearly','setupFee','order','maxOrders','stock']);
}

if ($method === 'GET') {
    $slug = $_GET['slug'] ?? '';
    $admin = ($_GET['admin'] ?? '') === 'true';
    $category = $_GET['category'] ?? '';
    if ($slug) {
        $stmt = DB::conn()->prepare('SELECT * FROM ' . DB::table('service_packages') . ' WHERE slug = ? LIMIT 1');
        $stmt->execute([$slug]);
        $pkg = $stmt->fetch();
        if (!$pkg) { DB::err('Package not found', 404); exit; }
        parse_package($pkg);
        respond(['ok' => true, 'item' => $pkg]);
    }
    if ($admin) require_auth();
    $where = $admin ? '1=1' : "active = 1";
    $params = [];
    if ($category) { $where .= " AND category = ?"; $params[] = $category; }
    $stmt = DB::conn()->prepare('SELECT * FROM ' . DB::table('service_packages') . ' WHERE ' . $where . ' ORDER BY `order` ASC, createdAt DESC');
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) parse_package($r);
    respond(['ok' => true, 'items' => $rows]);
}

if ($method === 'POST') {
    $user = require_auth();
    $b = body_json();
    $slug = $b['slug'] ?? slugify($b['nameId'] ?? $b['nameEn'] ?? 'package');
    $slug = ensure_unique_slug($slug, 'service_packages');
    $id = rand_id();
    $features = is_array($b['features'] ?? null) ? json_encode($b['features']) : ($b['features'] ?? '[]');
    $specs = is_array($b['specs'] ?? null) ? json_encode($b['specs']) : ($b['specs'] ?? '{}');
    DB::conn()->prepare('INSERT INTO ' . DB::table('service_packages') . ' (id, slug, nameId, nameEn, descId, descEn, category, price, priceYearly, setupFee, currency, billingCycle, features, specs, popular, featured, active, `order`, maxOrders, stock) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
        ->execute([
            $id, $slug, $b['nameId'] ?? '', $b['nameEn'] ?? $b['nameId'] ?? '', $b['descId'] ?? '', $b['descEn'] ?? '',
            $b['category'] ?? 'hosting', (int)($b['price'] ?? 0), (int)($b['priceYearly'] ?? 0), (int)($b['setupFee'] ?? 0),
            $b['currency'] ?? 'IDR', $b['billingCycle'] ?? 'monthly', $features, $specs,
            !empty($b['popular']) ? 1 : 0, !empty($b['featured']) ? 1 : 0, isset($b['active']) && !$b['active'] ? 0 : 1,
            (int)($b['order'] ?? 0), (int)($b['maxOrders'] ?? 0), (int)($b['stock'] ?? 0),
        ]);
    log_activity($user, 'created', 'package', $id, $b['nameId'] ?? '');
    $row = get_row('service_packages', $id);
    parse_package($row);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'PUT') {
    $user = require_auth();
    $b = body_json();
    $id = $b['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('service_packages', $id);
    if (!$ex) { DB::err('Package not found', 404); exit; }
    $u = []; $v = [];
    foreach (['nameId','nameEn','descId','descEn','category','currency','billingCycle'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f]; }
    }
    foreach (['price','priceYearly','setupFee','order','maxOrders','stock'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = (int)$b[$f]; }
    }
    foreach (['popular','featured','active'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f] ? 1 : 0; }
    }
    if (isset($b['features'])) { $u[] = "`features` = ?"; $v[] = is_array($b['features']) ? json_encode($b['features']) : $b['features']; }
    if (isset($b['specs'])) { $u[] = "`specs` = ?"; $v[] = is_array($b['specs']) ? json_encode($b['specs']) : $b['specs']; }
    if (isset($b['slug']) && $b['slug'] !== $ex['slug']) { $u[] = "`slug` = ?"; $v[] = ensure_unique_slug($b['slug'], 'service_packages', $id); }
    if ($u) { $v[] = $id; DB::conn()->prepare('UPDATE ' . DB::table('service_packages') . ' SET ' . implode(',', $u) . ' WHERE id = ?')->execute($v); }
    log_activity($user, 'updated', 'package', $id, $ex['nameId']);
    $row = get_row('service_packages', $id);
    parse_package($row);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'DELETE') {
    $user = require_auth();
    $id = $_GET['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $permanent = ($_GET['permanent'] ?? '') === 'true';
    $ex = get_row('service_packages', $id);
    if (!$ex) { DB::err('Package not found', 404); exit; }
    if ($permanent) {
        DB::conn()->prepare('DELETE FROM ' . DB::table('service_packages') . ' WHERE id = ?')->execute([$id]);
    } else {
        DB::conn()->prepare("UPDATE " . DB::table('service_packages') . " SET active = 0 WHERE id = ?")->execute([$id]);
    }
    log_activity($user, 'deleted', 'package', $id, $ex['nameId']);
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
