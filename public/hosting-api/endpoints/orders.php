<?php
/** /hosting-api/orders — Order CRUD (admin only) */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function gen_invoice_number(int $year): string {
    $prefix = "INV-{$year}-";
    $stmt = DB::conn()->prepare("SELECT invoice FROM " . DB::table('orders') . " WHERE invoice LIKE ? ORDER BY invoice DESC LIMIT 1");
    $stmt->execute([$prefix . '%']);
    $row = $stmt->fetch();
    $max = 0;
    if ($row) {
        $seq = (int)substr($row['invoice'], strlen($prefix));
        if ($seq > $max) $max = $seq;
    }
    return $prefix . str_pad((string)($max + 1), 4, '0', STR_PAD_LEFT);
}

function parse_order(array &$r): void {
    $r['items'] = json_decode($r['items'] ?? '[]', true) ?: [];
    cast_int($r, ['subtotal','discount','tax','total']);
}

if ($method === 'GET') {
    $user = require_auth();
    $status = $_GET['status'] ?? '';
    $customerId = $_GET['customerId'] ?? '';
    $where = '1=1'; $params = [];
    if ($status) { $where .= " AND status = ?"; $params[] = $status; }
    if ($customerId) { $where .= " AND customerId = ?"; $params[] = $customerId; }
    $stmt = DB::conn()->prepare('SELECT * FROM ' . DB::table('orders') . ' WHERE ' . $where . ' ORDER BY createdAt DESC');
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) parse_order($r);
    respond(['ok' => true, 'items' => $rows]);
}

if ($method === 'POST') {
    $user = require_auth();
    $b = body_json();
    $year = (int)date('Y');
    $invoice = gen_invoice_number($year);
    $id = rand_id();
    $items = is_array($b['items'] ?? null) ? json_encode($b['items']) : ($b['items'] ?? '[]');
    $paidAt = !empty($b['paidAt']) ? $b['paidAt'] : null;
    DB::conn()->prepare('INSERT INTO ' . DB::table('orders') . ' (id, invoice, customerId, customerName, customerEmail, items, subtotal, discount, tax, total, couponCode, paymentMethod, paymentStatus, status, notes, paidAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
        ->execute([
            $id, $invoice, $b['customerId'] ?? '', $b['customerName'] ?? '', $b['customerEmail'] ?? '',
            $items, (int)($b['subtotal'] ?? 0), (int)($b['discount'] ?? 0), (int)($b['tax'] ?? 0), (int)($b['total'] ?? 0),
            $b['couponCode'] ?? null, $b['paymentMethod'] ?? null, $b['paymentStatus'] ?? 'pending',
            $b['status'] ?? 'pending', $b['notes'] ?? '', $paidAt,
        ]);
    log_activity($user, 'created', 'order', $id, $invoice);
    $row = get_row('orders', $id);
    parse_order($row);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'PUT') {
    $user = require_auth();
    $b = body_json();
    $id = $b['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('orders', $id);
    if (!$ex) { DB::err('Order not found', 404); exit; }
    $u = []; $v = [];
    foreach (['customerId','customerName','customerEmail','couponCode','paymentMethod','paymentStatus','status','notes'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f]; }
    }
    foreach (['subtotal','discount','tax','total'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = (int)$b[$f]; }
    }
    if (isset($b['items'])) { $u[] = "`items` = ?"; $v[] = is_array($b['items']) ? json_encode($b['items']) : $b['items']; }
    if (isset($b['paidAt'])) { $u[] = "`paidAt` = ?"; $v[] = $b['paidAt'] ?: null; }
    // Auto-mark paidAt when paymentStatus=paid
    if (!empty($b['paymentStatus']) && $b['paymentStatus'] === 'paid' && empty($ex['paidAt'])) {
        $u[] = "`paidAt` = ?"; $v[] = date('Y-m-d H:i:s');
    }
    if ($u) { $v[] = $id; DB::conn()->prepare('UPDATE ' . DB::table('orders') . ' SET ' . implode(',', $u) . ' WHERE id = ?')->execute($v); }
    log_activity($user, 'updated', 'order', $id, $ex['invoice']);
    $row = get_row('orders', $id);
    parse_order($row);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'DELETE') {
    $user = require_auth();
    $id = $_GET['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('orders', $id);
    if (!$ex) { DB::err('Order not found', 404); exit; }
    DB::conn()->prepare('DELETE FROM ' . DB::table('orders') . ' WHERE id = ?')->execute([$id]);
    log_activity($user, 'deleted', 'order', $id, $ex['invoice']);
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
