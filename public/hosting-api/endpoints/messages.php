<?php
/** /hosting-api/messages — Contact form submissions + admin management */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'POST') {
    // Public - create new message
    $b = body_json();
    $name = $b['name'] ?? '';
    $email = $b['email'] ?? '';
    $subject = $b['subject'] ?? '';
    $message = $b['message'] ?? '';
    if (!$name || !$email || !$subject || !$message) { DB::err('Missing required fields', 400); exit; }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { DB::err('Invalid email', 400); exit; }
    $id = rand_id();
    DB::conn()->prepare('INSERT INTO ' . DB::table('messages') . ' (id, name, email, phone, subject, message, status, `read`, replied) VALUES (?,?,?,?,?,?,?,?,?)')
        ->execute([$id, $name, $email, $b['phone'] ?? null, $subject, $message, 'new', 0, 0]);
    respond(['ok' => true, 'id' => $id]);
}

if ($method === 'GET') {
    require_auth();
    $rows = DB::conn()->query('SELECT * FROM ' . DB::table('messages') . ' ORDER BY createdAt DESC')->fetchAll();
    foreach ($rows as &$r) { cast_bool($r, ['read','replied']); }
    respond(['ok' => true, 'items' => $rows]);
}

if ($method === 'PUT') {
    require_auth();
    $b = body_json();
    $id = $b['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $u = []; $v = [];
    if (isset($b['read'])) { $u[] = "`read` = ?"; $v[] = $b['read'] ? 1 : 0; }
    if (isset($b['status'])) { $u[] = "`status` = ?"; $v[] = $b['status']; }
    if (isset($b['replied'])) { $u[] = "`replied` = ?"; $v[] = $b['replied'] ? 1 : 0; }
    if ($u) { $v[] = $id; DB::conn()->prepare('UPDATE ' . DB::table('messages') . ' SET ' . implode(',', $u) . ' WHERE id = ?')->execute($v); }
    respond(['ok' => true, 'item' => get_row('messages', $id)]);
}

if ($method === 'DELETE') {
    require_auth();
    $id = $_GET['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    DB::conn()->prepare('DELETE FROM ' . DB::table('messages') . ' WHERE id = ?')->execute([$id]);
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
