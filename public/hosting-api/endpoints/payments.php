<?php
/** /hosting-api/payments — Payment CRUD (admin only) */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $user = require_auth();
    $status = $_GET['status'] ?? '';
    $where = '1=1'; $params = [];
    if ($status) { $where .= " AND status = ?"; $params[] = $status; }
    $stmt = DB::conn()->prepare('SELECT * FROM ' . DB::table('payments') . ' WHERE ' . $where . ' ORDER BY createdAt DESC');
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) cast_int($r, ['amount','fee']);
    respond(['ok' => true, 'items' => $rows]);
}

if ($method === 'POST') {
    $user = require_auth();
    $b = body_json();
    $id = rand_id();
    DB::conn()->prepare('INSERT INTO ' . DB::table('payments') . ' (id, invoiceId, orderId, customerId, amount, currency, method, gateway, gatewayRef, status, fee, notes, paidAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)')
        ->execute([
            $id, $b['invoiceId'] ?? null, $b['orderId'] ?? null, $b['customerId'] ?? '',
            (int)($b['amount'] ?? 0), $b['currency'] ?? 'IDR', $b['method'] ?? 'bank_transfer',
            $b['gateway'] ?? null, $b['gatewayRef'] ?? null, $b['status'] ?? 'pending',
            (int)($b['fee'] ?? 0), $b['notes'] ?? '', !empty($b['paidAt']) ? $b['paidAt'] : null,
        ]);
    log_activity($user, 'created', 'payment', $id, '#' . substr($id, -6));
    $row = get_row('payments', $id);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'PUT') {
    $user = require_auth();
    $b = body_json();
    $id = $b['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('payments', $id);
    if (!$ex) { DB::err('Payment not found', 404); exit; }
    $u = []; $v = [];
    foreach (['invoiceId','orderId','customerId','currency','method','gateway','gatewayRef','status','notes'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f]; }
    }
    foreach (['amount','fee'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = (int)$b[$f]; }
    }
    if (isset($b['paidAt'])) { $u[] = "`paidAt` = ?"; $v[] = $b['paidAt'] ?: null; }
    if (!empty($b['status']) && $b['status'] === 'success' && empty($ex['paidAt'])) {
        $u[] = "`paidAt` = ?"; $v[] = date('Y-m-d H:i:s');
    }
    if ($u) { $v[] = $id; DB::conn()->prepare('UPDATE ' . DB::table('payments') . ' SET ' . implode(',', $u) . ' WHERE id = ?')->execute($v); }
    log_activity($user, 'updated', 'payment', $id, '#' . substr($id, -6));
    $row = get_row('payments', $id);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'DELETE') {
    $user = require_auth();
    $id = $_GET['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('payments', $id);
    if (!$ex) { DB::err('Payment not found', 404); exit; }
    DB::conn()->prepare('DELETE FROM ' . DB::table('payments') . ' WHERE id = ?')->execute([$id]);
    log_activity($user, 'deleted', 'payment', $id, '#' . substr($id, -6));
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
