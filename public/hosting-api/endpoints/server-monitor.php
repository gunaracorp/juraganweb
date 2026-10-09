<?php
/** /hosting-api/server-monitor — ServerMetric (admin only; mock data if empty) */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function rand_float(float $min, float $max): float {
    return round(mt_rand((int)($min * 100), (int)($max * 100)) / 100, 2);
}

function ensure_mock_metrics(): void {
    $count = DB::conn()->query('SELECT COUNT(*) AS c FROM ' . DB::table('server_metrics'))->fetch();
    if ((int)($count['c'] ?? 0) > 0) return;
    // Generate last 24h of mock metrics (every 5 min = 288 rows)
    $now = time();
    $stmt = DB::conn()->prepare('INSERT INTO ' . DB::table('server_metrics') . ' (id, server, cpuUsage, ramUsage, diskUsage, bandwidthIn, bandwidthOut, uptime, loadAvg, processes, connections, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)');
    for ($i = 287; $i >= 0; $i--) {
        $t = date('Y-m-d H:i:s', $now - $i * 5 * 60);
        $stmt->execute([
            rand_id(), 'main',
            rand_float(20, 60), rand_float(40, 70), rand_float(50, 80),
            mt_rand(1_000_000, 50_000_000), mt_rand(500_000, 20_000_000),
            $now - ($now - $i * 5 * 60),
            sprintf('%.2f,%.2f,%.2f', rand_float(0.1, 2), rand_float(0.1, 2), rand_float(0.1, 2)),
            mt_rand(80, 180), mt_rand(20, 200),
            $t,
        ]);
    }
}

function compute_stats(array $items): array {
    if (!$items) return ['avgCpu'=>0,'avgRam'=>0,'avgDisk'=>0,'maxCpu'=>0,'maxRam'=>0,'maxDisk'=>0,'minCpu'=>0,'minRam'=>0,'minDisk'=>0];
    $cpus = array_column($items, 'cpuUsage');
    $rams = array_column($items, 'ramUsage');
    $disks = array_column($items, 'diskUsage');
    return [
        'avgCpu' => round(array_sum($cpus) / count($cpus), 2),
        'avgRam' => round(array_sum($rams) / count($rams), 2),
        'avgDisk' => round(array_sum($disks) / count($disks), 2),
        'maxCpu' => max($cpus), 'maxRam' => max($rams), 'maxDisk' => max($disks),
        'minCpu' => min($cpus), 'minRam' => min($rams), 'minDisk' => min($disks),
    ];
}

if ($method === 'GET') {
    $user = require_auth();
    ensure_mock_metrics();
    $since = date('Y-m-d H:i:s', time() - 24 * 3600);
    $stmt = DB::conn()->prepare('SELECT * FROM ' . DB::table('server_metrics') . ' WHERE createdAt >= ? ORDER BY createdAt ASC LIMIT 500');
    $stmt->execute([$since]);
    $items = $stmt->fetchAll();
    foreach ($items as &$r) { cast_int($r, ['bandwidthIn','bandwidthOut','uptime','processes','connections']); }
    $stats = compute_stats($items);
    $current = $items ? $items[count($items) - 1] : null;
    respond(['ok' => true, 'items' => $items, 'stats' => $stats, 'current' => $current]);
}

if ($method === 'POST') {
    $user = require_auth();
    $b = body_json();
    $id = rand_id();
    DB::conn()->prepare('INSERT INTO ' . DB::table('server_metrics') . ' (id, server, cpuUsage, ramUsage, diskUsage, bandwidthIn, bandwidthOut, uptime, loadAvg, processes, connections) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
        ->execute([
            $id, $b['server'] ?? 'main',
            (float)($b['cpuUsage'] ?? 0), (float)($b['ramUsage'] ?? 0), (float)($b['diskUsage'] ?? 0),
            (int)($b['bandwidthIn'] ?? 0), (int)($b['bandwidthOut'] ?? 0),
            (int)($b['uptime'] ?? 0), $b['loadAvg'] ?? '0,0,0',
            (int)($b['processes'] ?? 0), (int)($b['connections'] ?? 0),
        ]);
    $row = get_row('server_metrics', $id);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'DELETE') {
    $user = require_auth();
    $cutoff = date('Y-m-d H:i:s', time() - 7 * 24 * 3600);
    $stmt = DB::conn()->prepare('DELETE FROM ' . DB::table('server_metrics') . ' WHERE createdAt < ?');
    $stmt->execute([$cutoff]);
    respond(['ok' => true, 'deleted' => $stmt->rowCount()]);
}

DB::err('Method not allowed', 405);
