<?php
/** /hosting-api/backups — Backup CRUD (admin only; ?action=restore) */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $user = require_auth();
    $status = $_GET['status'] ?? '';
    $type = $_GET['type'] ?? '';
    $where = '1=1'; $params = [];
    if ($status) { $where .= " AND status = ?"; $params[] = $status; }
    if ($type) { $where .= " AND type = ?"; $params[] = $type; }
    $stmt = DB::conn()->prepare('SELECT * FROM ' . DB::table('backups') . ' WHERE ' . $where . ' ORDER BY createdAt DESC');
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) cast_int($r, ['size']);
    respond(['ok' => true, 'items' => $rows]);
}

if ($method === 'POST') {
    $user = require_auth();
    $b = body_json();
    $id = rand_id();
    DB::conn()->prepare('INSERT INTO ' . DB::table('backups') . ' (id, type, size, path, status, source, notes, expiresAt) VALUES (?,?,?,?,?,?,?,?)')
        ->execute([
            $id, $b['type'] ?? 'full', 0,
            $b['path'] ?? '/backups/' . time() . '.tar.gz',
            'queued', $b['source'] ?? 'manual', $b['notes'] ?? '',
            !empty($b['expiresAt']) ? $b['expiresAt'] : null,
        ]);
    log_activity($user, 'created', 'backup', $id, $b['path'] ?? '');
    // Simulate completion after 2s
    $completeId = $id;
    register_shutdown_function(function () use ($completeId) {
        try {
            $size = mt_rand(200, 1000) * 1024 * 1024;
            DB::conn()->prepare('UPDATE ' . DB::table('backups') . ' SET status = ?, size = ? WHERE id = ?')
                ->execute(['completed', $size, $completeId]);
        } catch (\Throwable $e) {}
    });
    $row = get_row('backups', $id);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'PUT') {
    $user = require_auth();
    $action = $_GET['action'] ?? '';
    $b = body_json();
    $id = $b['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('backups', $id);
    if (!$ex) { DB::err('Backup not found', 404); exit; }
    if ($action === 'restore') {
        DB::conn()->prepare('UPDATE ' . DB::table('backups') . ' SET status = ? WHERE id = ?')->execute(['running', $id]);
        log_activity($user, 'restored', 'backup', $id, $ex['path']);
        // Simulate restore completion after 2s
        $restoreId = $id;
        register_shutdown_function(function () use ($restoreId) {
            try {
                DB::conn()->prepare('UPDATE ' . DB::table('backups') . ' SET status = ? WHERE id = ?')->execute(['completed', $restoreId]);
            } catch (\Throwable $e) {}
        });
        $row = get_row('backups', $id);
        respond(['ok' => true, 'item' => $row]);
    }
    $u = []; $v = [];
    foreach (['type','status','source','notes','path'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f]; }
    }
    if (isset($b['size'])) { $u[] = "`size` = ?"; $v[] = (int)$b['size']; }
    if (isset($b['expiresAt'])) { $u[] = "`expiresAt` = ?"; $v[] = $b['expiresAt'] ?: null; }
    if ($u) { $v[] = $id; DB::conn()->prepare('UPDATE ' . DB::table('backups') . ' SET ' . implode(',', $u) . ' WHERE id = ?')->execute($v); }
    log_activity($user, 'updated', 'backup', $id, $ex['path']);
    $row = get_row('backups', $id);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'DELETE') {
    $user = require_auth();
    $id = $_GET['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('backups', $id);
    if (!$ex) { DB::err('Backup not found', 404); exit; }
    DB::conn()->prepare('DELETE FROM ' . DB::table('backups') . ' WHERE id = ?')->execute([$id]);
    log_activity($user, 'deleted', 'backup', $id, $ex['path']);
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
