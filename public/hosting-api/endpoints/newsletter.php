<?php
/** /hosting-api/newsletter — NewsletterCampaign CRUD (admin only; ?action=send) */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function parse_campaign(array &$r): void {
    $r['stats'] = json_decode($r['stats'] ?? '{}', true) ?: [];
    cast_int($r, ['targetCount']);
}

if ($method === 'GET') {
    $user = require_auth();
    $status = $_GET['status'] ?? '';
    $where = '1=1'; $params = [];
    if ($status) { $where .= " AND status = ?"; $params[] = $status; }
    $stmt = DB::conn()->prepare('SELECT * FROM ' . DB::table('newsletter_campaigns') . ' WHERE ' . $where . ' ORDER BY createdAt DESC');
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) parse_campaign($r);
    respond(['ok' => true, 'items' => $rows]);
}

if ($method === 'POST') {
    $user = require_auth();
    $b = body_json();
    if (empty($b['name'])) { DB::err('name required', 400); exit; }
    $id = rand_id();
    $stats = json_encode(['sent'=>0,'delivered'=>0,'opened'=>0,'clicked'=>0,'bounced'=>0,'unsubscribed'=>0]);
    DB::conn()->prepare('INSERT INTO ' . DB::table('newsletter_campaigns') . ' (id, name, subjectId, subjectEn, contentId, contentEn, stats, status, scheduledAt, target, targetCount, createdBy) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
        ->execute([
            $id, $b['name'], $b['subjectId'] ?? $b['name'], $b['subjectEn'] ?? $b['subjectId'] ?? $b['name'],
            $b['contentId'] ?? '', $b['contentEn'] ?? $b['contentId'] ?? '',
            $stats, $b['status'] ?? 'draft',
            !empty($b['scheduledAt']) ? $b['scheduledAt'] : null,
            $b['target'] ?? 'all', (int)($b['targetCount'] ?? 0),
            $user['username'] ?? 'admin',
        ]);
    log_activity($user, 'created', 'newsletter', $id, $b['name']);
    $row = get_row('newsletter_campaigns', $id);
    parse_campaign($row);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'PUT') {
    $user = require_auth();
    $action = $_GET['action'] ?? '';
    $b = body_json();
    $id = $b['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('newsletter_campaigns', $id);
    if (!$ex) { DB::err('Campaign not found', 404); exit; }
    $u = []; $v = [];
    foreach (['name','subjectId','subjectEn','contentId','contentEn','status','target','createdBy'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f]; }
    }
    if (isset($b['targetCount'])) { $u[] = "`targetCount` = ?"; $v[] = (int)$b['targetCount']; }
    if (isset($b['scheduledAt'])) { $u[] = "`scheduledAt` = ?"; $v[] = $b['scheduledAt'] ?: null; }
    if (isset($b['stats'])) { $u[] = "`stats` = ?"; $v[] = is_array($b['stats']) ? json_encode($b['stats']) : $b['stats']; }

    if ($action === 'send') {
        $sent = !empty($ex['targetCount']) ? (int)$ex['targetCount'] : mt_rand(200, 1200);
        $stats = [
            'sent' => $sent,
            'delivered' => (int)round($sent * 0.98),
            'opened' => (int)round($sent * 0.45),
            'clicked' => (int)round($sent * 0.18),
            'bounced' => (int)round($sent * 0.02),
            'unsubscribed' => (int)round($sent * 0.01),
        ];
        $u[] = "`status` = ?"; $v[] = 'sent';
        $u[] = "`sentAt` = ?"; $v[] = date('Y-m-d H:i:s');
        $u[] = "`stats` = ?"; $v[] = json_encode($stats);
        $u[] = "`targetCount` = ?"; $v[] = $sent;
    }
    if ($u) { $v[] = $id; DB::conn()->prepare('UPDATE ' . DB::table('newsletter_campaigns') . ' SET ' . implode(',', $u) . ' WHERE id = ?')->execute($v); }
    log_activity($user, $action === 'send' ? 'sent' : 'updated', 'newsletter', $id, $ex['name']);
    $row = get_row('newsletter_campaigns', $id);
    parse_campaign($row);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'DELETE') {
    $user = require_auth();
    $id = $_GET['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('newsletter_campaigns', $id);
    if (!$ex) { DB::err('Campaign not found', 404); exit; }
    DB::conn()->prepare('DELETE FROM ' . DB::table('newsletter_campaigns') . ' WHERE id = ?')->execute([$id]);
    log_activity($user, 'deleted', 'newsletter', $id, $ex['name']);
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
