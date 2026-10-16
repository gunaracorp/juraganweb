<?php
/** /hosting-api/affiliate — Affiliate CRUD (admin only) */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function gen_code(int $len = 8): string {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $out = '';
    for ($i = 0; $i < $len; $i++) $out .= $chars[random_int(0, strlen($chars) - 1)];
    return $out;
}

function unique_code(): string {
    $code = gen_code();
    $attempts = 0;
    while ($attempts < 20) {
        $stmt = DB::conn()->prepare('SELECT id FROM ' . DB::table('affiliates') . ' WHERE code = ? LIMIT 1');
        $stmt->execute([$code]);
        if (!$stmt->fetch()) return $code;
        $code = gen_code();
        $attempts++;
    }
    return $code;
}

if ($method === 'GET') {
    $user = require_auth();
    $status = $_GET['status'] ?? '';
    $where = '1=1'; $params = [];
    if ($status) { $where .= " AND status = ?"; $params[] = $status; }
    $stmt = DB::conn()->prepare('SELECT * FROM ' . DB::table('affiliates') . ' WHERE ' . $where . ' ORDER BY createdAt DESC');
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) {
        cast_int($r, ['totalClicks','totalSignups','totalSales']);
        $r['commissionRate'] = (float)$r['commissionRate'];
        $r['totalCommission'] = (float)$r['totalCommission'];
        $r['paidOut'] = (float)$r['paidOut'];
        $r['balance'] = (float)$r['balance'];
    }
    respond(['ok' => true, 'items' => $rows]);
}

if ($method === 'POST') {
    $user = require_auth();
    $b = body_json();
    if (empty($b['name'])) { DB::err('name required', 400); exit; }
    if (empty($b['email'])) { DB::err('email required', 400); exit; }
    $code = !empty($b['code']) ? strtoupper($b['code']) : unique_code();
    $chk = DB::conn()->prepare('SELECT id FROM ' . DB::table('affiliates') . ' WHERE code = ? LIMIT 1');
    $chk->execute([$code]);
    if ($chk->fetch()) { DB::err('Affiliate code already exists', 400); exit; }
    $id = rand_id();
    DB::conn()->prepare('INSERT INTO ' . DB::table('affiliates') . ' (id, code, customerId, name, email, commissionRate, status) VALUES (?,?,?,?,?,?,?)')
        ->execute([
            $id, $code, $b['customerId'] ?? null, $b['name'], $b['email'],
            (float)($b['commissionRate'] ?? 10), $b['status'] ?? 'active',
        ]);
    log_activity($user, 'created', 'affiliate', $id, $code);
    $row = get_row('affiliates', $id);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'PUT') {
    $user = require_auth();
    $b = body_json();
    $id = $b['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('affiliates', $id);
    if (!$ex) { DB::err('Affiliate not found', 404); exit; }
    $u = []; $v = [];
    foreach (['customerId','name','email','status'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f]; }
    }
    if (isset($b['commissionRate'])) { $u[] = "`commissionRate` = ?"; $v[] = (float)$b['commissionRate']; }
    foreach (['totalClicks','totalSignups','totalSales'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = (int)$b[$f]; }
    }
    foreach (['totalCommission','paidOut','balance'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = (float)$b[$f]; }
    }
    if (!empty($b['code']) && $b['code'] !== $ex['code']) {
        $code = strtoupper($b['code']);
        $chk = DB::conn()->prepare('SELECT id FROM ' . DB::table('affiliates') . ' WHERE code = ? AND id <> ? LIMIT 1');
        $chk->execute([$code, $id]);
        if ($chk->fetch()) { DB::err('Affiliate code already exists', 400); exit; }
        $u[] = "`code` = ?"; $v[] = $code;
    }
    if ($u) { $v[] = $id; DB::conn()->prepare('UPDATE ' . DB::table('affiliates') . ' SET ' . implode(',', $u) . ' WHERE id = ?')->execute($v); }
    log_activity($user, 'updated', 'affiliate', $id, $ex['code']);
    $row = get_row('affiliates', $id);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'DELETE') {
    $user = require_auth();
    $id = $_GET['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('affiliates', $id);
    if (!$ex) { DB::err('Affiliate not found', 404); exit; }
    DB::conn()->prepare('DELETE FROM ' . DB::table('affiliates') . ' WHERE id = ?')->execute([$id]);
    log_activity($user, 'deleted', 'affiliate', $id, $ex['code']);
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
