<?php
/** /hosting-api/email-accounts — EmailAccount CRUD (admin only; password hashed) */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function safe_email(array $r): array {
    unset($r['password']);
    cast_int($r, ['quota','usedQuota']);
    return $r;
}

if ($method === 'GET') {
    $user = require_auth();
    $domain = $_GET['domain'] ?? '';
    $where = '1=1'; $params = [];
    if ($domain) { $where .= " AND domain = ?"; $params[] = $domain; }
    $stmt = DB::conn()->prepare('SELECT * FROM ' . DB::table('email_accounts') . ' WHERE ' . $where . ' ORDER BY email ASC');
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    $out = array_map('safe_email', $rows);
    respond(['ok' => true, 'items' => $out]);
}

if ($method === 'POST') {
    $user = require_auth();
    $b = body_json();
    if (empty($b['email'])) { DB::err('email required', 400); exit; }
    if (empty($b['domain'])) { DB::err('domain required', 400); exit; }
    $chk = DB::conn()->prepare('SELECT id FROM ' . DB::table('email_accounts') . ' WHERE email = ? LIMIT 1');
    $chk->execute([$b['email']]);
    if ($chk->fetch()) { DB::err('Email already exists', 400); exit; }
    $id = rand_id();
    $hash = hash_password($b['password'] ?? 'changeme123');
    DB::conn()->prepare('INSERT INTO ' . DB::table('email_accounts') . ' (id, email, domain, password, quota, forwardTo, autoReply, status) VALUES (?,?,?,?,?,?,?,?)')
        ->execute([
            $id, $b['email'], $b['domain'], $hash,
            (int)($b['quota'] ?? 1024), $b['forwardTo'] ?? null, $b['autoReply'] ?? null,
            $b['status'] ?? 'active',
        ]);
    log_activity($user, 'created', 'email-account', $id, $b['email']);
    $row = get_row('email_accounts', $id);
    respond(['ok' => true, 'item' => safe_email($row)]);
}

if ($method === 'PUT') {
    $user = require_auth();
    $b = body_json();
    $id = $b['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('email_accounts', $id);
    if (!$ex) { DB::err('Email account not found', 404); exit; }
    $u = []; $v = [];
    foreach (['domain','forwardTo','autoReply','status'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f]; }
    }
    foreach (['quota','usedQuota'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = (int)$b[$f]; }
    }
    if (!empty($b['password'])) { $u[] = "`password` = ?"; $v[] = hash_password($b['password']); }
    if (!empty($b['email']) && $b['email'] !== $ex['email']) {
        $chk = DB::conn()->prepare('SELECT id FROM ' . DB::table('email_accounts') . ' WHERE email = ? AND id <> ? LIMIT 1');
        $chk->execute([$b['email'], $id]);
        if ($chk->fetch()) { DB::err('Email already exists', 400); exit; }
        $u[] = "`email` = ?"; $v[] = $b['email'];
    }
    if (isset($b['lastAccess'])) { $u[] = "`lastAccess` = ?"; $v[] = $b['lastAccess'] ?: null; }
    if ($u) { $v[] = $id; DB::conn()->prepare('UPDATE ' . DB::table('email_accounts') . ' SET ' . implode(',', $u) . ' WHERE id = ?')->execute($v); }
    log_activity($user, 'updated', 'email-account', $id, $ex['email']);
    $row = get_row('email_accounts', $id);
    respond(['ok' => true, 'item' => safe_email($row)]);
}

if ($method === 'DELETE') {
    $user = require_auth();
    $id = $_GET['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('email_accounts', $id);
    if (!$ex) { DB::err('Email account not found', 404); exit; }
    DB::conn()->prepare('DELETE FROM ' . DB::table('email_accounts') . ' WHERE id = ?')->execute([$id]);
    log_activity($user, 'deleted', 'email-account', $id, $ex['email']);
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
