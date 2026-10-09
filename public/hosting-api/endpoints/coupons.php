<?php
/** /hosting-api/coupons — Coupon CRUD (admin only) */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $user = require_auth();
    $status = $_GET['status'] ?? '';
    $where = '1=1'; $params = [];
    if ($status) { $where .= " AND status = ?"; $params[] = $status; }
    $stmt = DB::conn()->prepare('SELECT * FROM ' . DB::table('coupons') . ' WHERE ' . $where . ' ORDER BY createdAt DESC');
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) { cast_int($r, ['minOrder','maxDiscount','usageLimit','used']); cast_int_float($r, 'value'); }
    respond(['ok' => true, 'items' => $rows]);
}

if ($method === 'POST') {
    $user = require_auth();
    $b = body_json();
    if (empty($b['code'])) { DB::err('code required', 400); exit; }
    $code = strtoupper($b['code']);
    $chk = DB::conn()->prepare('SELECT id FROM ' . DB::table('coupons') . ' WHERE code = ? LIMIT 1');
    $chk->execute([$code]);
    if ($chk->fetch()) { DB::err('Coupon code already exists', 400); exit; }
    $id = rand_id();
    DB::conn()->prepare('INSERT INTO ' . DB::table('coupons') . ' (id, code, type, value, minOrder, maxDiscount, usageLimit, used, validFrom, validTo, status, appliesTo) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
        ->execute([
            $id, $code, $b['type'] ?? 'percent', (float)($b['value'] ?? 0),
            (int)($b['minOrder'] ?? 0), (int)($b['maxDiscount'] ?? 0), (int)($b['usageLimit'] ?? 0), 0,
            !empty($b['validFrom']) ? $b['validFrom'] : null,
            !empty($b['validTo']) ? $b['validTo'] : null,
            $b['status'] ?? 'active', $b['appliesTo'] ?? 'all',
        ]);
    log_activity($user, 'created', 'coupon', $id, $code);
    $row = get_row('coupons', $id);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'PUT') {
    $user = require_auth();
    $b = body_json();
    $id = $b['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('coupons', $id);
    if (!$ex) { DB::err('Coupon not found', 404); exit; }
    $u = []; $v = [];
    foreach (['type','status','appliesTo'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f]; }
    }
    foreach (['value'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = (float)$b[$f]; }
    }
    foreach (['minOrder','maxDiscount','usageLimit','used'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = (int)$b[$f]; }
    }
    foreach (['validFrom','validTo'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f] ?: null; }
    }
    if (!empty($b['code'])) {
        $code = strtoupper($b['code']);
        if ($code !== $ex['code']) {
            $chk = DB::conn()->prepare('SELECT id FROM ' . DB::table('coupons') . ' WHERE code = ? AND id <> ? LIMIT 1');
            $chk->execute([$code, $id]);
            if ($chk->fetch()) { DB::err('Coupon code already exists', 400); exit; }
            $u[] = "`code` = ?"; $v[] = $code;
        }
    }
    if ($u) { $v[] = $id; DB::conn()->prepare('UPDATE ' . DB::table('coupons') . ' SET ' . implode(',', $u) . ' WHERE id = ?')->execute($v); }
    log_activity($user, 'updated', 'coupon', $id, $ex['code']);
    $row = get_row('coupons', $id);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'DELETE') {
    $user = require_auth();
    $id = $_GET['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('coupons', $id);
    if (!$ex) { DB::err('Coupon not found', 404); exit; }
    DB::conn()->prepare('DELETE FROM ' . DB::table('coupons') . ' WHERE id = ?')->execute([$id]);
    log_activity($user, 'deleted', 'coupon', $id, $ex['code']);
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);

// Helper for float casting (some servers don't have it)
function cast_int_float(array &$r, string $f): void {
    if (isset($r[$f])) $r[$f] = (float)$r[$f];
}
