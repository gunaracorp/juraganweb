<?php
/** /hosting-api/realtime — VisitorStat (admin only; mock data if empty) */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function ensure_mock_visitors(): void {
    $count = DB::conn()->query('SELECT COUNT(*) AS c FROM ' . DB::table('visitor_stats'))->fetch();
    if ((int)($count['c'] ?? 0) > 0) return;
    $referrers = ['google.com', 'facebook.com', 'instagram.com', 'direct', 'bing.com'];
    $stmt = DB::conn()->prepare('INSERT INTO ' . DB::table('visitor_stats') . ' (id, date, visitors, pageViews, uniqueIPs, bounceRate, avgTime, topReferrer, topCountry, topDevice) VALUES (?,?,?,?,?,?,?,?,?,?)');
    for ($i = 29; $i >= 0; $i--) {
        $d = date('Y-m-d', time() - $i * 24 * 3600);
        $visitors = mt_rand(50, 200);
        $stmt->execute([
            rand_id(), $d, $visitors,
            (int)round($visitors * (1.5 + (mt_rand() / mt_getrandmax()))),
            (int)round($visitors * 0.85),
            round(mt_rand(3000, 6000) / 100, 2),
            mt_rand(60, 240),
            $referrers[array_rand($referrers)],
            'Indonesia',
            mt_rand(0, 10) > 4 ? 'Mobile' : 'Desktop',
        ]);
    }
}

function compute_stats(array $items): array {
    $today = date('Y-m-d');
    $weekAgo = date('Y-m-d', time() - 7 * 24 * 3600);
    $monthAgo = date('Y-m-d', time() - 30 * 24 * 3600);
    $sum_range = function (array $items, string $from) {
        $f = array_filter($items, fn($i) => $i['date'] >= $from);
        $visitors = array_sum(array_column($f, 'visitors'));
        $pageViews = array_sum(array_column($f, 'pageViews'));
        $uniqueIPs = array_sum(array_column($f, 'uniqueIPs'));
        $bounceRate = count($f) ? array_sum(array_column($f, 'bounceRate')) / count($f) : 0;
        $avgTime = count($f) ? (int)round(array_sum(array_column($f, 'avgTime')) / count($f)) : 0;
        return [
            'visitors' => $visitors, 'pageViews' => $pageViews, 'uniqueIPs' => $uniqueIPs,
            'bounceRate' => round($bounceRate, 2), 'avgTime' => $avgTime,
        ];
    };
    return [
        'today' => $sum_range($items, $today),
        'week' => $sum_range($items, $weekAgo),
        'month' => $sum_range($items, $monthAgo),
        'total' => [
            'visitors' => array_sum(array_column($items, 'visitors')),
            'pageViews' => array_sum(array_column($items, 'pageViews')),
        ],
    ];
}

if ($method === 'GET') {
    $user = require_auth();
    ensure_mock_visitors();
    $rows = DB::conn()->query('SELECT * FROM ' . DB::table('visitor_stats') . ' ORDER BY date ASC LIMIT 60')->fetchAll();
    foreach ($rows as &$r) {
        cast_int($r, ['visitors','pageViews','uniqueIPs','avgTime']);
        $r['bounceRate'] = (float)$r['bounceRate'];
    }
    $stats = compute_stats($rows);
    respond(['ok' => true, 'items' => $rows, 'stats' => $stats]);
}

if ($method === 'POST') {
    $user = require_auth();
    $b = body_json();
    $dateStr = $b['date'] ?? date('Y-m-d');
    $stmt = DB::conn()->prepare('SELECT * FROM ' . DB::table('visitor_stats') . ' WHERE date = ? LIMIT 1');
    $stmt->execute([$dateStr]);
    $ex = $stmt->fetch();
    if ($ex) {
        DB::conn()->prepare('UPDATE ' . DB::table('visitor_stats') . ' SET visitors = visitors + ?, pageViews = pageViews + ?, uniqueIPs = uniqueIPs + ? WHERE id = ?')
            ->execute([(int)($b['visitors'] ?? 0), (int)($b['pageViews'] ?? 0), (int)($b['uniqueIPs'] ?? 0), $ex['id']]);
        $row = get_row('visitor_stats', $ex['id']);
        respond(['ok' => true, 'item' => $row]);
    }
    $id = rand_id();
    DB::conn()->prepare('INSERT INTO ' . DB::table('visitor_stats') . ' (id, date, visitors, pageViews, uniqueIPs, bounceRate, avgTime, topReferrer, topCountry, topDevice) VALUES (?,?,?,?,?,?,?,?,?,?)')
        ->execute([
            $id, $dateStr, (int)($b['visitors'] ?? 0), (int)($b['pageViews'] ?? 0), (int)($b['uniqueIPs'] ?? 0),
            (float)($b['bounceRate'] ?? 0), (int)($b['avgTime'] ?? 0),
            $b['topReferrer'] ?? null, $b['topCountry'] ?? null, $b['topDevice'] ?? null,
        ]);
    $row = get_row('visitor_stats', $id);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'DELETE') {
    $user = require_auth();
    $cutoff = date('Y-m-d H:i:s', time() - 90 * 24 * 3600);
    $stmt = DB::conn()->prepare('DELETE FROM ' . DB::table('visitor_stats') . ' WHERE createdAt < ?');
    $stmt->execute([$cutoff]);
    respond(['ok' => true, 'deleted' => $stmt->rowCount()]);
}

DB::err('Method not allowed', 405);
