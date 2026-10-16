<?php
/** /hosting-api/knowledge — KnowledgeArticle CRUD (public GET for published; admin for all) */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $slug = $_GET['slug'] ?? '';
    $admin = ($_GET['admin'] ?? '') === 'true';
    $category = $_GET['category'] ?? '';
    if ($slug) {
        $stmt = DB::conn()->prepare('SELECT * FROM ' . DB::table('knowledge_articles') . ' WHERE slug = ? LIMIT 1');
        $stmt->execute([$slug]);
        $item = $stmt->fetch();
        if (!$item) { DB::err('Article not found', 404); exit; }
        if (!$admin) {
            DB::conn()->prepare('UPDATE ' . DB::table('knowledge_articles') . ' SET views = views + 1 WHERE id = ?')->execute([$item['id']]);
            $item['views'] = (int)$item['views'] + 1;
        }
        cast_int($item, ['views','helpful','unhelpful']);
        cast_bool($item, ['published','featured']);
        respond(['ok' => true, 'item' => $item]);
    }
    if ($admin) require_auth();
    $where = $admin ? '1=1' : "published = 1";
    $params = [];
    if ($category) { $where .= " AND category = ?"; $params[] = $category; }
    $stmt = DB::conn()->prepare('SELECT * FROM ' . DB::table('knowledge_articles') . ' WHERE ' . $where . ' ORDER BY featured DESC, createdAt DESC');
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) { cast_int($r, ['views','helpful','unhelpful']); cast_bool($r, ['published','featured']); }
    respond(['ok' => true, 'items' => $rows]);
}

if ($method === 'POST') {
    $user = require_auth();
    $b = body_json();
    $slug = $b['slug'] ?? slugify($b['titleId'] ?? $b['titleEn'] ?? 'article');
    $slug = ensure_unique_slug($slug, 'knowledge_articles');
    $id = rand_id();
    DB::conn()->prepare('INSERT INTO ' . DB::table('knowledge_articles') . ' (id, slug, titleId, titleEn, contentId, contentEn, excerptId, excerptEn, category, tags, published, featured, author) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)')
        ->execute([
            $id, $slug, $b['titleId'] ?? '', $b['titleEn'] ?? $b['titleId'] ?? '',
            $b['contentId'] ?? '', $b['contentEn'] ?? $b['contentId'] ?? '',
            $b['excerptId'] ?? '', $b['excerptEn'] ?? '',
            $b['category'] ?? 'general', $b['tags'] ?? '',
            !isset($b['published']) || $b['published'] ? 1 : 0, !empty($b['featured']) ? 1 : 0,
            $b['author'] ?? 'Admin',
        ]);
    log_activity($user, 'created', 'knowledge', $id, $b['titleId'] ?? '');
    $row = get_row('knowledge_articles', $id);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'PUT') {
    $user = require_auth();
    $b = body_json();
    $id = $b['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('knowledge_articles', $id);
    if (!$ex) { DB::err('Article not found', 404); exit; }
    $u = []; $v = [];
    foreach (['titleId','titleEn','contentId','contentEn','excerptId','excerptEn','category','tags','author'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f]; }
    }
    foreach (['published','featured'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f] ? 1 : 0; }
    }
    foreach (['helpful','unhelpful','views'] as $f) {
        if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = (int)$b[$f]; }
    }
    if (isset($b['slug']) && $b['slug'] !== $ex['slug']) { $u[] = "`slug` = ?"; $v[] = ensure_unique_slug($b['slug'], 'knowledge_articles', $id); }
    if ($u) { $v[] = $id; DB::conn()->prepare('UPDATE ' . DB::table('knowledge_articles') . ' SET ' . implode(',', $u) . ' WHERE id = ?')->execute($v); }
    log_activity($user, 'updated', 'knowledge', $id, $ex['titleId']);
    $row = get_row('knowledge_articles', $id);
    respond(['ok' => true, 'item' => $row]);
}

if ($method === 'DELETE') {
    $user = require_auth();
    $id = $_GET['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('knowledge_articles', $id);
    if (!$ex) { DB::err('Article not found', 404); exit; }
    DB::conn()->prepare('DELETE FROM ' . DB::table('knowledge_articles') . ' WHERE id = ?')->execute([$id]);
    log_activity($user, 'deleted', 'knowledge', $id, $ex['titleId']);
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
