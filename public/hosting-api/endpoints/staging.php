<?php
/** /hosting-api/staging — StagingEnv CRUD (admin only; ?action=deploy) */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $user = require_auth();
    $status = $_GET['status'] ?? '';
    $where = '1=1'; $params = [];
    if ($status) { $where .= " AND status = ?"; $params[] = $status; }
    $stmt = DB::conn()->prepare('SELECT * FROM ' . DB::table('staging_envs') . ' WHERE ' . $where . ' ORDER BY createdAt DESC');
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) cast_bool($r, ['autoSync']);
    respond(['ok' => true, 'items' => $rows]);
}

if ($method === 'POST') {
    $user = require_auth();
    $b = body_json();
    if (empty($b['name'])) { DB::err('name required', 400); exit; }
    if (empty($b['domain'])) { DB::err('domain required', 400); exit; }
    $id = rand_id();
    $deployUrl = $b['deployUrl'] ?? ('https://staging.' . $b['domain']);
    DB::conn()->prepare('INSERT INTO ' . DB::table('staging_envs') . ' (id, name, domain, sourceDomain, branch, status, deployUrl, autoSync) VALUES (?,?,?,?,?,?,?,?)')
        ->execute([
            $id, $b['name'], $b['domain'], $b['sourceDomain'] ?? '', $b['branch'] ?? 'main',
            $b['status'] ?? 'idle', $deployUrl, !empty($b['autoSync']) ? 1 : 0,
        ]);
    log_activity($user, 'created', 'staging', $id, $b['name']);
    $row = get_row('staging_envs', $id);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'PUT') {
    $user = require_auth();
    $action = $_GET['action'] ?? '';
    $b = body_json();
    $id = $b['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('staging_envs', $id);
    if (!$ex) { DB::err('Staging env not found', 404); exit; }
    if ($action === 'deploy') {
        DB::conn()->prepare('UPDATE ' . DB::table('staging_envs') . ' SET status = ?, lastDeploy = ? WHERE id = ?')
            ->execute(['deploying', date('Y-m-d H:i:s'), $id]);
        log_activity($user, 'deployed', 'staging', $id, $ex['name']);
        // Simulate deploy completion after 2s
        $deployId = $id;
        register_shutdown_function(function () use ($deployId) {
            try {
                DB::conn()->prepare('UPDATE ' . DB::table('staging_envs') . ' SET status = ? WHERE id = ?')
                    ->execute(['running', $deployId]);
            } catch (\Throwable $e) {}
        });
        $row = get_row('staging_envs', $id);
        respond(['ok' => true, 'item' => $row]);
    }
    $u = []; $v = [];
    foreach (['name','domain','sourceDomain','branch','status','deployUrl'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f]; }
    }
    if (isset($b['autoSync'])) { $u[] = "`autoSync` = ?"; $v[] = $b['autoSync'] ? 1 : 0; }
    if ($u) { $v[] = $id; DB::conn()->prepare('UPDATE ' . DB::table('staging_envs') . ' SET ' . implode(',', $u) . ' WHERE id = ?')->execute($v); }
    log_activity($user, 'updated', 'staging', $id, $ex['name']);
    $row = get_row('staging_envs', $id);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'DELETE') {
    $user = require_auth();
    $id = $_GET['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('staging_envs', $id);
    if (!$ex) { DB::err('Staging env not found', 404); exit; }
    DB::conn()->prepare('DELETE FROM ' . DB::table('staging_envs') . ' WHERE id = ?')->execute([$id]);
    log_activity($user, 'deleted', 'staging', $id, $ex['name']);
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
