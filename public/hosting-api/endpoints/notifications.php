<?php
/** /hosting-api/notifications — Notification (admin only; ?read=false, ?action=read|readall|unread) */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $user = require_auth();
    $onlyUnread = ($_GET['read'] ?? '') === 'false';
    $type = $_GET['type'] ?? '';
    $where = 'userId = ?'; $params = [$user['username']];
    if ($onlyUnread) { $where .= " AND read = 0"; }
    if ($type) { $where .= " AND type = ?"; $params[] = $type; }
    $stmt = DB::conn()->prepare('SELECT * FROM ' . DB::table('notifications') . ' WHERE ' . $where . ' ORDER BY createdAt DESC LIMIT 100');
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) cast_bool($r, ['read']);
    respond(['ok' => true, 'items' => $rows]);
}

if ($method === 'POST') {
    $user = require_auth();
    $b = body_json();
    if (empty($b['title'])) { DB::err('title required', 400); exit; }
    $id = rand_id();
    DB::conn()->prepare('INSERT INTO ' . DB::table('notifications') . ' (id, userId, type, title, message, icon, read, link) VALUES (?,?,?,?,?,?,?,?)')
        ->execute([
            $id, $b['userId'] ?? $user['username'],
            $b['type'] ?? 'system', $b['title'], $b['message'] ?? '',
            $b['icon'] ?? 'Bell', !empty($b['read']) ? 1 : 0,
            $b['link'] ?? null,
        ]);
    $row = get_row('notifications', $id);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'PUT') {
    $user = require_auth();
    $id = $_GET['id'] ?? '';
    $action = $_GET['action'] ?? '';
    if ($action === 'readall') {
        $stmt = DB::conn()->prepare('UPDATE ' . DB::table('notifications') . ' SET read = 1 WHERE userId = ? AND read = 0');
        $stmt->execute([$user['username']]);
        respond(['ok' => true, 'updated' => $stmt->rowCount()]);
    }
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('notifications', $id);
    if (!$ex) { DB::err('Notification not found', 404); exit; }
    if ($action === 'read') {
        DB::conn()->prepare('UPDATE ' . DB::table('notifications') . ' SET read = 1 WHERE id = ?')->execute([$id]);
        $row = get_row('notifications', $id);
        respond(['ok' => true, 'item' => $row]);
    }
    if ($action === 'unread') {
        DB::conn()->prepare('UPDATE ' . DB::table('notifications') . ' SET read = 0 WHERE id = ?')->execute([$id]);
        $row = get_row('notifications', $id);
        respond(['ok' => true, 'item' => $row]);
    }
    // Generic update
    $b = body_json();
    $u = []; $v = [];
    foreach (['type','title','message','icon','link'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f]; }
    }
    if (isset($b['read'])) { $u[] = "`read` = ?"; $v[] = $b['read'] ? 1 : 0; }
    if ($u) { $v[] = $id; DB::conn()->prepare('UPDATE ' . DB::table('notifications') . ' SET ' . implode(',', $u) . ' WHERE id = ?')->execute($v); }
    $row = get_row('notifications', $id);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'DELETE') {
    $user = require_auth();
    $all = ($_GET['all'] ?? '') === 'true';
    $id = $_GET['id'] ?? '';
    if ($all) {
        $stmt = DB::conn()->prepare('DELETE FROM ' . DB::table('notifications') . ' WHERE userId = ?');
        $stmt->execute([$user['username']]);
        respond(['ok' => true, 'deleted' => $stmt->rowCount()]);
    }
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('notifications', $id);
    if (!$ex) { DB::err('Notification not found', 404); exit; }
    DB::conn()->prepare('DELETE FROM ' . DB::table('notifications') . ' WHERE id = ?')->execute([$id]);
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
