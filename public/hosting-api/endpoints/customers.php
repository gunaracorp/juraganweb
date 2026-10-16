<?php
/** /hosting-api/customers — Customer CRUD (admin only; password hashed) */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function safe_customer(array $r): array {
    unset($r['password']);
    cast_int($r, ['totalSpent','totalOrders']);
    cast_bool($r, ['verified']);
    return $r;
}

if ($method === 'GET') {
    $user = require_auth();
    $status = $_GET['status'] ?? '';
    $q = $_GET['q'] ?? '';
    $where = '1=1'; $params = [];
    if ($status) { $where .= " AND status = ?"; $params[] = $status; }
    if ($q) {
        $where .= " AND (name LIKE ? OR email LIKE ? OR company LIKE ?)";
        array_push($params, "%$q%", "%$q%", "%$q%");
    }
    $stmt = DB::conn()->prepare('SELECT * FROM ' . DB::table('customers') . ' WHERE ' . $where . ' ORDER BY createdAt DESC');
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    $out = array_map('safe_customer', $rows);
    respond(['ok' => true, 'items' => $out]);
}

if ($method === 'POST') {
    $user = require_auth();
    $b = body_json();
    if (empty($b['email'])) { DB::err('email required', 400); exit; }
    $chk = DB::conn()->prepare('SELECT id FROM ' . DB::table('customers') . ' WHERE email = ? LIMIT 1');
    $chk->execute([$b['email']]);
    if ($chk->fetch()) { DB::err('Email already exists', 400); exit; }
    $id = rand_id();
    $hash = hash_password($b['password'] ?? 'changeme123');
    DB::conn()->prepare('INSERT INTO ' . DB::table('customers') . ' (id, email, name, phone, company, address, city, country, password, status, verified, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
        ->execute([
            $id, $b['email'], $b['name'] ?? '', $b['phone'] ?? null, $b['company'] ?? null,
            $b['address'] ?? null, $b['city'] ?? null, $b['country'] ?? 'Indonesia',
            $hash, $b['status'] ?? 'active', !empty($b['verified']) ? 1 : 0, $b['notes'] ?? '',
        ]);
    log_activity($user, 'created', 'customer', $id, $b['name'] ?? '');
    $row = get_row('customers', $id);
    respond(['ok' => true, 'item' => safe_customer($row)]);
}

if ($method === 'PUT') {
    $user = require_auth();
    $b = body_json();
    $id = $b['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('customers', $id);
    if (!$ex) { DB::err('Customer not found', 404); exit; }
    $u = []; $v = [];
    foreach (['email','name','phone','company','address','city','country','status','notes'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f]; }
    }
    if (isset($b['verified'])) { $u[] = "`verified` = ?"; $v[] = $b['verified'] ? 1 : 0; }
    if (!empty($b['password'])) { $u[] = "`password` = ?"; $v[] = hash_password($b['password']); }
    if (!empty($b['email']) && $b['email'] !== $ex['email']) {
        $chk = DB::conn()->prepare('SELECT id FROM ' . DB::table('customers') . ' WHERE email = ? AND id <> ? LIMIT 1');
        $chk->execute([$b['email'], $id]);
        if ($chk->fetch()) { DB::err('Email already exists', 400); exit; }
    }
    if ($u) { $v[] = $id; DB::conn()->prepare('UPDATE ' . DB::table('customers') . ' SET ' . implode(',', $u) . ' WHERE id = ?')->execute($v); }
    log_activity($user, 'updated', 'customer', $id, $ex['name']);
    $row = get_row('customers', $id);
    respond(['ok' => true, 'item' => safe_customer($row)]);
}

if ($method === 'DELETE') {
    $user = require_auth();
    $id = $_GET['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('customers', $id);
    if (!$ex) { DB::err('Customer not found', 404); exit; }
    DB::conn()->prepare('DELETE FROM ' . DB::table('customers') . ' WHERE id = ?')->execute([$id]);
    log_activity($user, 'deleted', 'customer', $id, $ex['name']);
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
