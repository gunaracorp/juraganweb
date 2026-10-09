<?php
/** /hosting-api/cron — CronJob CRUD (admin only) */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $user = require_auth();
    $enabled = $_GET['enabled'] ?? null;
    $where = '1=1'; $params = [];
    if ($enabled !== null) { $where .= " AND enabled = ?"; $params[] = $enabled === 'true' ? 1 : 0; }
    $stmt = DB::conn()->prepare('SELECT * FROM ' . DB::table('cron_jobs') . ' WHERE ' . $where . ' ORDER BY createdAt DESC');
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) cast_bool($r, ['enabled']);
    respond(['ok' => true, 'items' => $rows]);
}

if ($method === 'POST') {
    $user = require_auth();
    $b = body_json();
    if (empty($b['name'])) { DB::err('name required', 400); exit; }
    if (empty($b['command'])) { DB::err('command required', 400); exit; }
    if (empty($b['schedule'])) { DB::err('schedule required', 400); exit; }
    $id = rand_id();
    DB::conn()->prepare('INSERT INTO ' . DB::table('cron_jobs') . ' (id, name, command, schedule, description, enabled, nextRun) VALUES (?,?,?,?,?,?,?)')
        ->execute([
            $id, $b['name'], $b['command'], $b['schedule'], $b['description'] ?? '',
            !isset($b['enabled']) || $b['enabled'] ? 1 : 0,
            !empty($b['nextRun']) ? $b['nextRun'] : null,
        ]);
    log_activity($user, 'created', 'cron', $id, $b['name']);
    $row = get_row('cron_jobs', $id);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'PUT') {
    $user = require_auth();
    $b = body_json();
    $id = $b['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('cron_jobs', $id);
    if (!$ex) { DB::err('Cron job not found', 404); exit; }
    $u = []; $v = [];
    foreach (['name','command','schedule','description','lastStatus','lastOutput'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f]; }
    }
    if (isset($b['enabled'])) { $u[] = "`enabled` = ?"; $v[] = $b['enabled'] ? 1 : 0; }
    foreach (['lastRun','nextRun'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f] ?: null; }
    }
    if ($u) { $v[] = $id; DB::conn()->prepare('UPDATE ' . DB::table('cron_jobs') . ' SET ' . implode(',', $u) . ' WHERE id = ?')->execute($v); }
    log_activity($user, 'updated', 'cron', $id, $ex['name']);
    $row = get_row('cron_jobs', $id);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'DELETE') {
    $user = require_auth();
    $id = $_GET['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('cron_jobs', $id);
    if (!$ex) { DB::err('Cron job not found', 404); exit; }
    DB::conn()->prepare('DELETE FROM ' . DB::table('cron_jobs') . ' WHERE id = ?')->execute([$id]);
    log_activity($user, 'deleted', 'cron', $id, $ex['name']);
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
