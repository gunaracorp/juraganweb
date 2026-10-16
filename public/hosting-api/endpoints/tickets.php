<?php
/** /hosting-api/tickets — Ticket CRUD (public POST + GET by email; admin all with ?admin=true) */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function gen_ticket_number(int $year): string {
    $prefix = "TKT-{$year}-";
    $stmt = DB::conn()->prepare("SELECT number FROM " . DB::table('tickets') . " WHERE number LIKE ? ORDER BY number DESC LIMIT 1");
    $stmt->execute([$prefix . '%']);
    $row = $stmt->fetch();
    $max = 0;
    if ($row) {
        $seq = (int)substr($row['number'], strlen($prefix));
        if ($seq > $max) $max = $seq;
    }
    return $prefix . str_pad((string)($max + 1), 4, '0', STR_PAD_LEFT);
}

if ($method === 'GET') {
    $admin = ($_GET['admin'] ?? '') === 'true';
    $email = $_GET['email'] ?? '';
    $status = $_GET['status'] ?? '';
    if ($admin) {
        require_auth();
        $where = '1=1'; $params = [];
        if ($status) { $where .= " AND status = ?"; $params[] = $status; }
        $stmt = DB::conn()->prepare('SELECT * FROM ' . DB::table('tickets') . ' WHERE ' . $where . ' ORDER BY createdAt DESC');
        $stmt->execute($params);
        respond(['ok' => true, 'items' => $stmt->fetchAll()]);
    }
    // Public: by email
    if (!$email) { DB::err('email required', 400); exit; }
    $where = "customerEmail = ?"; $params = [$email];
    if ($status) { $where .= " AND status = ?"; $params[] = $status; }
    $stmt = DB::conn()->prepare('SELECT * FROM ' . DB::table('tickets') . ' WHERE ' . $where . ' ORDER BY createdAt DESC');
    $stmt->execute($params);
    respond(['ok' => true, 'items' => $stmt->fetchAll()]);
}

if ($method === 'POST') {
    // Public: customers can create tickets
    $b = body_json();
    if (empty($b['customerEmail'])) { DB::err('email required', 400); exit; }
    if (empty($b['subject'])) { DB::err('subject required', 400); exit; }
    $year = (int)date('Y');
    $number = gen_ticket_number($year);
    $id = rand_id();
    DB::conn()->prepare('INSERT INTO ' . DB::table('tickets') . ' (id, number, customerId, customerName, customerEmail, subject, category, priority, status, department, assignedTo, message, tags) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)')
        ->execute([
            $id, $number, $b['customerId'] ?? null, $b['customerName'] ?? '', $b['customerEmail'],
            $b['subject'], $b['category'] ?? 'general', $b['priority'] ?? 'normal', 'open',
            $b['department'] ?? 'support', $b['assignedTo'] ?? null, $b['message'] ?? '', $b['tags'] ?? '',
        ]);
    $row = get_row('tickets', $id);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'PUT') {
    $user = require_auth();
    $b = body_json();
    $id = $b['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('tickets', $id);
    if (!$ex) { DB::err('Ticket not found', 404); exit; }
    $action = $_GET['action'] ?? '';
    $u = []; $v = [];
    foreach (['customerId','customerName','customerEmail','subject','category','priority','status','department','assignedTo','message','tags'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f]; }
    }
    if (isset($b['rating'])) { $u[] = "`rating` = ?"; $v[] = (int)$b['rating']; }
    if (isset($b['resolvedAt'])) { $u[] = "`resolvedAt` = ?"; $v[] = $b['resolvedAt'] ?: null; }
    if ($action === 'respond' && empty($ex['firstResponseAt'])) {
        $u[] = "`firstResponseAt` = ?"; $v[] = date('Y-m-d H:i:s');
    }
    if (($b['status'] ?? '') === 'resolved' && empty($ex['resolvedAt'])) {
        $u[] = "`resolvedAt` = ?"; $v[] = date('Y-m-d H:i:s');
    }
    if ($u) { $v[] = $id; DB::conn()->prepare('UPDATE ' . DB::table('tickets') . ' SET ' . implode(',', $u) . ' WHERE id = ?')->execute($v); }
    // Insert reply if respond action
    if ($action === 'respond' && !empty($b['reply'])) {
        $rid = rand_id();
        DB::conn()->prepare('INSERT INTO ' . DB::table('ticket_replies') . ' (id, ticketId, author, authorRole, message, internal) VALUES (?,?,?,?,?,?)')
            ->execute([$rid, $id, $user['name'] ?? 'Admin', 'admin', (string)$b['reply'], !empty($b['internal']) ? 1 : 0]);
    }
    log_activity($user, 'updated', 'ticket', $id, $ex['number']);
    $row = get_row('tickets', $id);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'DELETE') {
    $user = require_auth();
    $id = $_GET['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('tickets', $id);
    if (!$ex) { DB::err('Ticket not found', 404); exit; }
    DB::conn()->prepare('DELETE FROM ' . DB::table('tickets') . ' WHERE id = ?')->execute([$id]);
    log_activity($user, 'deleted', 'ticket', $id, $ex['number']);
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
