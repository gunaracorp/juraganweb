<?php
/** /hosting-api/ssl-certs — SSLCertificate CRUD (admin only) */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $user = require_auth();
    $status = $_GET['status'] ?? '';
    $domain = $_GET['domain'] ?? '';
    $where = '1=1'; $params = [];
    if ($status) { $where .= " AND status = ?"; $params[] = $status; }
    if ($domain) { $where .= " AND domain = ?"; $params[] = $domain; }
    $stmt = DB::conn()->prepare('SELECT * FROM ' . DB::table('ssl_certificates') . ' WHERE ' . $where . ' ORDER BY validTo ASC');
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) cast_bool($r, ['autoRenew']);
    respond(['ok' => true, 'items' => $rows]);
}

if ($method === 'POST') {
    $user = require_auth();
    $b = body_json();
    if (empty($b['domain'])) { DB::err('domain required', 400); exit; }
    $id = rand_id();
    $validFrom = !empty($b['validFrom']) ? $b['validFrom'] : date('Y-m-d H:i:s');
    $validTo = !empty($b['validTo']) ? $b['validTo'] : date('Y-m-d H:i:s', time() + 90 * 24 * 3600);
    DB::conn()->prepare('INSERT INTO ' . DB::table('ssl_certificates') . ' (id, domain, type, issuer, validFrom, validTo, autoRenew, status) VALUES (?,?,?,?,?,?,?,?)')
        ->execute([
            $id, $b['domain'], $b['type'] ?? 'dv', $b['issuer'] ?? "Let's Encrypt",
            $validFrom, $validTo, !isset($b['autoRenew']) || $b['autoRenew'] ? 1 : 0,
            $b['status'] ?? 'active',
        ]);
    log_activity($user, 'created', 'ssl', $id, $b['domain']);
    $row = get_row('ssl_certificates', $id);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'PUT') {
    $user = require_auth();
    $b = body_json();
    $id = $b['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('ssl_certificates', $id);
    if (!$ex) { DB::err('SSL certificate not found', 404); exit; }
    $u = []; $v = [];
    foreach (['domain','type','issuer','status'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f]; }
    }
    if (isset($b['autoRenew'])) { $u[] = "`autoRenew` = ?"; $v[] = $b['autoRenew'] ? 1 : 0; }
    foreach (['validFrom','validTo'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f] ?: null; }
    }
    if ($u) { $v[] = $id; DB::conn()->prepare('UPDATE ' . DB::table('ssl_certificates') . ' SET ' . implode(',', $u) . ' WHERE id = ?')->execute($v); }
    log_activity($user, 'updated', 'ssl', $id, $ex['domain']);
    $row = get_row('ssl_certificates', $id);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'DELETE') {
    $user = require_auth();
    $id = $_GET['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('ssl_certificates', $id);
    if (!$ex) { DB::err('SSL certificate not found', 404); exit; }
    DB::conn()->prepare('DELETE FROM ' . DB::table('ssl_certificates') . ' WHERE id = ?')->execute([$id]);
    log_activity($user, 'deleted', 'ssl', $id, $ex['domain']);
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
