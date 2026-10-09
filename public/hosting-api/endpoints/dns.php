<?php
/** /hosting-api/dns — DNSRecord CRUD (admin only; filter by ?domain=X) */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $user = require_auth();
    $domain = $_GET['domain'] ?? '';
    $type = $_GET['type'] ?? '';
    $where = '1=1'; $params = [];
    if ($domain) { $where .= " AND domain = ?"; $params[] = $domain; }
    if ($type) { $where .= " AND type = ?"; $params[] = $type; }
    $stmt = DB::conn()->prepare('SELECT * FROM ' . DB::table('dns_records') . ' WHERE ' . $where . ' ORDER BY domain ASC, type ASC');
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) { cast_int($r, ['priority','ttl']); cast_bool($r, ['enabled']); }
    respond(['ok' => true, 'items' => $rows]);
}

if ($method === 'POST') {
    $user = require_auth();
    $b = body_json();
    if (empty($b['domain'])) { DB::err('domain required', 400); exit; }
    if (empty($b['type'])) { DB::err('type required', 400); exit; }
    if (empty($b['name'])) { DB::err('name required', 400); exit; }
    if (empty($b['value'])) { DB::err('value required', 400); exit; }
    $id = rand_id();
    DB::conn()->prepare('INSERT INTO ' . DB::table('dns_records') . ' (id, domain, type, name, value, priority, ttl, enabled) VALUES (?,?,?,?,?,?,?,?)')
        ->execute([
            $id, $b['domain'], $b['type'], $b['name'], $b['value'],
            (int)($b['priority'] ?? 0), (int)($b['ttl'] ?? 3600),
            !isset($b['enabled']) || $b['enabled'] ? 1 : 0,
        ]);
    log_activity($user, 'created', 'dns', $id, $b['name'] . '.' . $b['domain']);
    $row = get_row('dns_records', $id);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'PUT') {
    $user = require_auth();
    $b = body_json();
    $id = $b['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('dns_records', $id);
    if (!$ex) { DB::err('DNS record not found', 404); exit; }
    $u = []; $v = [];
    foreach (['domain','type','name','value'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f]; }
    }
    foreach (['priority','ttl'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = (int)$b[$f]; }
    }
    if (isset($b['enabled'])) { $u[] = "`enabled` = ?"; $v[] = $b['enabled'] ? 1 : 0; }
    if ($u) { $v[] = $id; DB::conn()->prepare('UPDATE ' . DB::table('dns_records') . ' SET ' . implode(',', $u) . ' WHERE id = ?')->execute($v); }
    log_activity($user, 'updated', 'dns', $id, $ex['name'] . '.' . $ex['domain']);
    $row = get_row('dns_records', $id);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'DELETE') {
    $user = require_auth();
    $id = $_GET['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('dns_records', $id);
    if (!$ex) { DB::err('DNS record not found', 404); exit; }
    DB::conn()->prepare('DELETE FROM ' . DB::table('dns_records') . ' WHERE id = ?')->execute([$id]);
    log_activity($user, 'deleted', 'dns', $id, $ex['name'] . '.' . $ex['domain']);
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
