<?php
/** /hosting-api/ai-builder — AIWebsiteProject CRUD (admin only; ?action=generate|publish) */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function parse_project(array &$r): void {
    $r['pages'] = json_decode($r['pages'] ?? '[]', true) ?: [];
}

function mock_pages(string $business, string $industry): array {
    $safe = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $business ?: 'Business')) ?: 'business';
    $pages = [
        ['slug' => '', 'title' => "$business — Home", 'path' => '/'],
        ['slug' => 'about', 'title' => "About $business", 'path' => '/about'],
        ['slug' => "services-$industry", 'title' => "$industry Services", 'path' => '/services'],
        ['slug' => 'pricing', 'title' => 'Pricing Plans', 'path' => '/pricing'],
        ['slug' => 'blog', 'title' => "$business Blog", 'path' => '/blog'],
        ['slug' => 'contact', 'title' => "Contact $business", 'path' => '/contact'],
    ];
    foreach ($pages as &$p) { if (empty($p['slug'])) $p['slug'] = $safe; $p['id'] = rand_id(); }
    return $pages;
}

if ($method === 'GET') {
    $user = require_auth();
    $status = $_GET['status'] ?? '';
    $where = '1=1'; $params = [];
    if ($status) { $where .= " AND status = ?"; $params[] = $status; }
    $stmt = DB::conn()->prepare('SELECT * FROM ' . DB::table('ai_website_projects') . ' WHERE ' . $where . ' ORDER BY createdAt DESC');
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) parse_project($r);
    respond(['ok' => true, 'items' => $rows]);
}

if ($method === 'POST') {
    $user = require_auth();
    $b = body_json();
    if (empty($b['name'])) { DB::err('name required', 400); exit; }
    $id = rand_id();
    $pages = is_array($b['pages'] ?? null) ? json_encode($b['pages']) : ($b['pages'] ?? '[]');
    DB::conn()->prepare('INSERT INTO ' . DB::table('ai_website_projects') . ' (id, name, business, industry, template, pages, status, publishedUrl, createdBy) VALUES (?,?,?,?,?,?,?,?,?)')
        ->execute([
            $id, $b['name'], $b['business'] ?? '', $b['industry'] ?? '', $b['template'] ?? 'modern',
            $pages, $b['status'] ?? 'draft', $b['publishedUrl'] ?? null,
            $user['username'] ?? 'admin',
        ]);
    log_activity($user, 'created', 'ai-builder', $id, $b['name']);
    $row = get_row('ai_website_projects', $id);
    parse_project($row);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'PUT') {
    $user = require_auth();
    $action = $_GET['action'] ?? '';
    $b = body_json();
    $id = $b['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('ai_website_projects', $id);
    if (!$ex) { DB::err('AI project not found', 404); exit; }

    if ($action === 'generate') {
        DB::conn()->prepare('UPDATE ' . DB::table('ai_website_projects') . ' SET status = ? WHERE id = ?')
            ->execute(['generating', $id]);
        log_activity($user, 'generated', 'ai-builder', $id, $ex['name']);
        // Simulate AI generation completion after 2s
        $genId = $id;
        $business = $ex['business'];
        $industry = $ex['industry'];
        register_shutdown_function(function () use ($genId, $business, $industry) {
            try {
                $pages = json_encode(mock_pages($business, $industry));
                DB::conn()->prepare('UPDATE ' . DB::table('ai_website_projects') . ' SET status = ?, pages = ? WHERE id = ?')
                    ->execute(['completed', $pages, $genId]);
            } catch (\Throwable $e) {}
        });
        $row = get_row('ai_website_projects', $id);
        respond(['ok' => true, 'item' => $row]);
    }

    if ($action === 'publish') {
        $safe = strtolower(preg_replace('/[^a-z0-9]/i', '', $ex['business'] ?: 'site')) ?: 'site';
        $pubUrl = $b['publishedUrl'] ?? ("https://$safe.juragan.site");
        DB::conn()->prepare('UPDATE ' . DB::table('ai_website_projects') . ' SET status = ?, publishedUrl = ? WHERE id = ?')
            ->execute(['published', $pubUrl, $id]);
        log_activity($user, 'published', 'ai-builder', $id, $ex['name']);
        $row = get_row('ai_website_projects', $id);
        parse_project($row);
        respond(['ok' => true, 'item' => $row]);
    }

    $u = []; $v = [];
    foreach (['name','business','industry','template','status','publishedUrl'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f]; }
    }
    if (isset($b['pages'])) { $u[] = "`pages` = ?"; $v[] = is_array($b['pages']) ? json_encode($b['pages']) : $b['pages']; }
    if ($u) { $v[] = $id; DB::conn()->prepare('UPDATE ' . DB::table('ai_website_projects') . ' SET ' . implode(',', $u) . ' WHERE id = ?')->execute($v); }
    log_activity($user, 'updated', 'ai-builder', $id, $ex['name']);
    $row = get_row('ai_website_projects', $id);
    parse_project($row);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'DELETE') {
    $user = require_auth();
    $id = $_GET['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('ai_website_projects', $id);
    if (!$ex) { DB::err('AI project not found', 404); exit; }
    DB::conn()->prepare('DELETE FROM ' . DB::table('ai_website_projects') . ' WHERE id = ?')->execute([$id]);
    log_activity($user, 'deleted', 'ai-builder', $id, $ex['name']);
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
