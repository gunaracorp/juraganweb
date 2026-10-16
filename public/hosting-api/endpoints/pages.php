<?php
/** /hosting-api/pages — CRUD for static pages */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $slug = $_GET['slug'] ?? '';
    $admin = ($_GET['admin'] ?? '') === 'true';
    if ($slug) {
        $stmt = DB::conn()->prepare('SELECT * FROM ' . DB::table('pages') . ' WHERE slug = ? LIMIT 1');
        $stmt->execute([$slug]);
        $page = $stmt->fetch();
        if (!$page) { DB::err('Page not found', 404); exit; }
        cast_bool($page, ['showInMenu']);
        cast_int($page, ['menuOrder','views']);
        respond(['ok' => true, 'page' => $page]);
    }
    if ($admin) require_auth();
    $where = $admin ? '1=1' : "status = 'published'";
    $rows = DB::conn()->query('SELECT * FROM ' . DB::table('pages') . ' WHERE ' . $where . ' ORDER BY menuOrder ASC, createdAt DESC')->fetchAll();
    foreach ($rows as &$r) { cast_bool($r, ['showInMenu']); cast_int($r, ['menuOrder','views']); }
    respond(['ok' => true, 'items' => $rows]);
}

if ($method === 'POST') {
    $user = require_auth();
    $b = body_json();
    $slug = $b['slug'] ?? slugify($b['titleId'] ?? $b['titleEn'] ?? 'page');
    $slug = ensure_unique_slug($slug, 'pages');
    $id = rand_id();
    DB::conn()->prepare('INSERT INTO ' . DB::table('pages') . ' (id, slug, titleId, titleEn, contentId, contentEn, excerptId, excerptEn, coverImage, template, status, showInMenu, menuOrder, parentId, metaTitle, metaDescription, author) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
        ->execute([$id, $slug, $b['titleId'] ?? '', $b['titleEn'] ?? $b['titleId'] ?? '', $b['contentId'] ?? '', $b['contentEn'] ?? $b['contentId'] ?? '', $b['excerptId'] ?? '', $b['excerptEn'] ?? '', $b['coverImage'] ?? null, $b['template'] ?? 'default', $b['status'] ?? 'published', ($b['showInMenu'] ?? true) ? 1 : 0, (int)($b['menuOrder'] ?? 0), $b['parentId'] ?? null, $b['metaTitle'] ?? null, $b['metaDescription'] ?? null, $b['author'] ?? 'Admin']);
    log_activity($user, 'created', 'page', $id, $b['titleId'] ?? '');
    respond(['ok' => true, 'item' => get_row('pages', $id)]);
}

if ($method === 'PUT') {
    $user = require_auth();
    $b = body_json();
    $id = $b['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('pages', $id);
    if (!$ex) { DB::err('Page not found', 404); exit; }
    $fields = ['titleId','titleEn','contentId','contentEn','excerptId','excerptEn','coverImage','template','status','parentId','metaTitle','metaDescription','author'];
    $u = []; $v = [];
    foreach ($fields as $f) { if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f]; } }
    if (isset($b['showInMenu'])) { $u[] = "`showInMenu` = ?"; $v[] = $b['showInMenu'] ? 1 : 0; }
    if (isset($b['menuOrder'])) { $u[] = "`menuOrder` = ?"; $v[] = (int)$b['menuOrder']; }
    if (isset($b['slug']) && $b['slug'] !== $ex['slug']) { $u[] = "`slug` = ?"; $v[] = ensure_unique_slug($b['slug'], 'pages', $id); }
    if ($u) { $v[] = $id; DB::conn()->prepare('UPDATE ' . DB::table('pages') . ' SET ' . implode(',', $u) . ' WHERE id = ?')->execute($v); }
    log_activity($user, 'updated', 'page', $id, $ex['titleId']);
    respond(['ok' => true, 'item' => get_row('pages', $id)]);
}

if ($method === 'DELETE') {
    $user = require_auth();
    $id = $_GET['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $permanent = ($_GET['permanent'] ?? '') === 'true';
    $ex = get_row('pages', $id);
    if (!$ex) { DB::err('Page not found', 404); exit; }
    if ($permanent) {
        DB::conn()->prepare('DELETE FROM ' . DB::table('pages') . ' WHERE id = ?')->execute([$id]);
    } else {
        DB::conn()->prepare("UPDATE " . DB::table('pages') . " SET status = 'trash' WHERE id = ?")->execute([$id]);
    }
    log_activity($user, 'deleted', 'page', $id, $ex['titleId']);
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
