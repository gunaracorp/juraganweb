<?php
/** /hosting-api/invoices — Invoice CRUD (admin only) */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function gen_invoice_number(int $year): string {
    $prefix = "INV-{$year}-";
    $stmt = DB::conn()->prepare("SELECT number FROM " . DB::table('invoices') . " WHERE number LIKE ? ORDER BY number DESC LIMIT 1");
    $stmt->execute([$prefix . '%']);
    $row = $stmt->fetch();
    $max = 0;
    if ($row) {
        $seq = (int)substr($row['number'], strlen($prefix));
        if ($seq > $max) $max = $seq;
    }
    return $prefix . str_pad((string)($max + 1), 4, '0', STR_PAD_LEFT);
}

function parse_invoice(array &$r): void {
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
    $stmt = DB::conn()->prepare('SELECT * FROM ' . DB::table('invoices') . ' WHERE ' . $where . ' ORDER BY createdAt DESC');
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) parse_invoice($r);
    respond(['ok' => true, 'items' => $rows]);
}

if ($method === 'POST') {
    $user = require_auth();
    $b = body_json();
    $year = (int)date('Y');
    $number = $b['number'] ?? gen_invoice_number($year);
    $id = rand_id();
    $items = is_array($b['items'] ?? null) ? json_encode($b['items']) : ($b['items'] ?? '[]');
    DB::conn()->prepare('INSERT INTO ' . DB::table('invoices') . ' (id, number, orderId, customerId, customerName, customerEmail, items, subtotal, discount, tax, total, currency, status, dueDate, sentAt, paidAt, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
        ->execute([
            $id, $number, $b['orderId'] ?? null, $b['customerId'] ?? '', $b['customerName'] ?? '', $b['customerEmail'] ?? '',
            $items, (int)($b['subtotal'] ?? 0), (int)($b['discount'] ?? 0), (int)($b['tax'] ?? 0), (int)($b['total'] ?? 0),
            $b['currency'] ?? 'IDR', $b['status'] ?? 'unpaid',
            !empty($b['dueDate']) ? $b['dueDate'] : null,
            !empty($b['sentAt']) ? $b['sentAt'] : null,
            !empty($b['paidAt']) ? $b['paidAt'] : null,
            $b['notes'] ?? '',
        ]);
    log_activity($user, 'created', 'invoice', $id, $number);
    $row = get_row('invoices', $id);
    parse_invoice($row);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'PUT') {
    $user = require_auth();
    $b = body_json();
    $id = $b['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('invoices', $id);
    if (!$ex) { DB::err('Invoice not found', 404); exit; }
    $u = []; $v = [];
    foreach (['orderId','customerId','customerName','customerEmail','currency','status','notes'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f]; }
    }
    foreach (['subtotal','discount','tax','total'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = (int)$b[$f]; }
    }
    if (isset($b['items'])) { $u[] = "`items` = ?"; $v[] = is_array($b['items']) ? json_encode($b['items']) : $b['items']; }
    foreach (['dueDate','sentAt','paidAt'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f] ?: null; }
    }
    // markPaid / markUnpaid
    if (!empty($b['markPaid']) || ($b['status'] ?? '') === 'paid') {
        $u[] = "`status` = ?"; $v[] = 'paid';
        $u[] = "`paidAt` = ?"; $v[] = date('Y-m-d H:i:s');
    } elseif (!empty($b['markUnpaid']) || ($b['status'] ?? '') === 'unpaid') {
        $u[] = "`status` = ?"; $v[] = 'unpaid';
        $u[] = "`paidAt` = ?"; $v[] = null;
    }
    if ($u) { $v[] = $id; DB::conn()->prepare('UPDATE ' . DB::table('invoices') . ' SET ' . implode(',', $u) . ' WHERE id = ?')->execute($v); }
    log_activity($user, 'updated', 'invoice', $id, $ex['number']);
    $row = get_row('invoices', $id);
    parse_invoice($row);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'DELETE') {
    $user = require_auth();
    $id = $_GET['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('invoices', $id);
    if (!$ex) { DB::err('Invoice not found', 404); exit; }
    DB::conn()->prepare('DELETE FROM ' . DB::table('invoices') . ' WHERE id = ?')->execute([$id]);
    log_activity($user, 'deleted', 'invoice', $id, $ex['number']);
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
