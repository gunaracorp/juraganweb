<?php
/** /hosting-api/security-logs — SecurityLog (admin only; read + delete; no POST/PUT) */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $user = require_auth();
    $type = $_GET['type'] ?? '';
    $severity = $_GET['severity'] ?? '';
    $userId = $_GET['userId'] ?? '';
    $where = '1=1'; $params = [];
    if ($type) { $where .= " AND type = ?"; $params[] = $type; }
    if ($severity) { $where .= " AND severity = ?"; $params[] = $severity; }
    if ($userId) { $where .= " AND userId = ?"; $params[] = $userId; }
    $stmt = DB::conn()->prepare('SELECT * FROM ' . DB::table('security_logs') . ' WHERE ' . $where . ' ORDER BY createdAt DESC LIMIT 500');
    $stmt->execute($params);
    respond(['ok' => true, 'items' => $stmt->fetchAll()]);
}

if ($method === 'DELETE') {
    $user = require_auth();
    $all = ($_GET['all'] ?? '') === 'true';
    $id = $_GET['id'] ?? '';
    if ($all) {
        $stmt = DB::conn()->prepare('DELETE FROM ' . DB::table('security_logs'));
        $stmt->execute();
        respond(['ok' => true, 'deleted' => $stmt->rowCount()]);
    }
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('security_logs', $id);
    if (!$ex) { DB::err('Log not found', 404); exit; }
    DB::conn()->prepare('DELETE FROM ' . DB::table('security_logs') . ' WHERE id = ?')->execute([$id]);
    log_activity($user, 'deleted', 'security-log', $id, null);
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
