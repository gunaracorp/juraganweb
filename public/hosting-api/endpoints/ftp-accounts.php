<?php
/** /hosting-api/ftp-accounts — FTPAccount CRUD (admin only; password hashed) */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function safe_ftp(array $r): array {
    unset($r['password']);
    cast_int($r, ['quota','usedQuota']);
    return $r;
}

if ($method === 'GET') {
    $user = require_auth();
    $status = $_GET['status'] ?? '';
    $where = '1=1'; $params = [];
    if ($status) { $where .= " AND status = ?"; $params[] = $status; }
    $stmt = DB::conn()->prepare('SELECT * FROM ' . DB::table('ftp_accounts') . ' WHERE ' . $where . ' ORDER BY username ASC');
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    $out = array_map('safe_ftp', $rows);
    respond(['ok' => true, 'items' => $out]);
}

if ($method === 'POST') {
    $user = require_auth();
    $b = body_json();
    if (empty($b['username'])) { DB::err('username required', 400); exit; }
    $id = rand_id();
    $hash = hash_password($b['password'] ?? 'changeme123');
    DB::conn()->prepare('INSERT INTO ' . DB::table('ftp_accounts') . ' (id, username, password, path, quota, status) VALUES (?,?,?,?,?,?)')
        ->execute([
            $id, $b['username'], $hash, $b['path'] ?? '/',
            (int)($b['quota'] ?? 0), $b['status'] ?? 'active',
        ]);
    log_activity($user, 'created', 'ftp-account', $id, $b['username']);
    $row = get_row('ftp_accounts', $id);
    respond(['ok' => true, 'item' => safe_ftp($row)]);
}

if ($method === 'PUT') {
    $user = require_auth();
    $b = body_json();
    $id = $b['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('ftp_accounts', $id);
    if (!$ex) { DB::err('FTP account not found', 404); exit; }
    $u = []; $v = [];
    foreach (['username','path','status'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f]; }
    }
    foreach (['quota','usedQuota'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = (int)$b[$f]; }
    }
    if (!empty($b['password'])) { $u[] = "`password` = ?"; $v[] = hash_password($b['password']); }
    if ($u) { $v[] = $id; DB::conn()->prepare('UPDATE ' . DB::table('ftp_accounts') . ' SET ' . implode(',', $u) . ' WHERE id = ?')->execute($v); }
    log_activity($user, 'updated', 'ftp-account', $id, $ex['username']);
    $row = get_row('ftp_accounts', $id);
    respond(['ok' => true, 'item' => safe_ftp($row)]);
}

if ($method === 'DELETE') {
    $user = require_auth();
    $id = $_GET['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('ftp_accounts', $id);
    if (!$ex) { DB::err('FTP account not found', 404); exit; }
    DB::conn()->prepare('DELETE FROM ' . DB::table('ftp_accounts') . ' WHERE id = ?')->execute([$id]);
    log_activity($user, 'deleted', 'ftp-account', $id, $ex['username']);
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
