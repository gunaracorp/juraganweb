<?php
/** /hosting-api/posts  — Blog (bilingual) */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function cast_post(array $r): array {
    cast_bool($r, ['featured','published']);
    cast_int($r, ['views']);
    return $r;
}

if ($method === 'GET') {
    $slug = $_GET['slug'] ?? '';
    $publishedOnly = ($_GET['published'] ?? '') === 'true';
    $admin = ($_GET['admin'] ?? '') === 'true';

    if ($slug) {
        $stmt = DB::conn()->prepare('SELECT * FROM ' . DB::table('posts') . ' WHERE slug = ? LIMIT 1');
        $stmt->execute([$slug]);
        $post = $stmt->fetch();
        if (!$post) { DB::err('Post not found', 404); exit; }
        if ($publishedOnly && !$post['published'] && !$admin) { DB::err('Post not found', 404); exit; }
        respond(['ok' => true, 'post' => cast_post($post)]);
    }

    $where = []; $args = [];
    if ($publishedOnly) { $where[] = 'published = 1'; }
    elseif ($admin) { require_auth(); }
    $sql = 'SELECT * FROM ' . DB::table('posts');
    if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
    $sql .= ' ORDER BY createdAt DESC';
    $rows = DB::conn()->query($sql)->fetchAll();
    respond(['ok' => true, 'posts' => array_map('cast_post', $rows)]);
}

if ($method === 'POST') {
    require_auth();
    $b = body_json();
    $slug = $b['slug'] ?? slugify($b['titleId'] ?? $b['titleEn'] ?? 'post');
    $slug = ensure_unique_slug($slug, 'posts');
    $id = rand_id();
    DB::conn()->prepare('INSERT INTO ' . DB::table('posts') . ' (id, slug, titleId, titleEn, excerptId, excerptEn, contentId, contentEn, category, tags, coverImage, author, featured, published) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
        ->execute([$id, $slug, $b['titleId'] ?? '', $b['titleEn'] ?? $b['titleId'] ?? '', $b['excerptId'] ?? '', $b['excerptEn'] ?? $b['excerptId'] ?? '', $b['contentId'] ?? '', $b['contentEn'] ?? $b['contentId'] ?? '', $b['category'] ?? 'Umum', $b['tags'] ?? '', $b['coverImage'] ?? null, $b['author'] ?? 'Tim JuraganWebsite', ($b['featured'] ?? false) ? 1 : 0, ($b['published'] ?? true) ? 1 : 0]);
    respond(['ok' => true, 'post' => cast_post(get_row('posts', $id))]);
}

if ($method === 'PUT') {
    require_auth();
    $b = body_json();
    $id = $b['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('posts', $id);
    if (!$ex) { DB::err('Post not found', 404); exit; }
    $fields = ['titleId','titleEn','excerptId','excerptEn','contentId','contentEn','category','tags','coverImage','author'];
    $u = []; $v = [];
    foreach ($fields as $f) { if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f]; } }
    if (isset($b['featured'])) { $u[] = "`featured` = ?"; $v[] = $b['featured'] ? 1 : 0; }
    if (isset($b['published'])) { $u[] = "`published` = ?"; $v[] = $b['published'] ? 1 : 0; }
    if (isset($b['slug']) && $b['slug'] !== $ex['slug']) { $u[] = "`slug` = ?"; $v[] = ensure_unique_slug($b['slug'], 'posts', $id); }
    if ($u) { $v[] = $id; DB::conn()->prepare('UPDATE ' . DB::table('posts') . ' SET ' . implode(',', $u) . ' WHERE id = ?')->execute($v); }
    respond(['ok' => true, 'post' => cast_post(get_row('posts', $id))]);
}

if ($method === 'DELETE') {
    require_auth();
    $id = $_GET['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    DB::conn()->prepare('DELETE FROM ' . DB::table('posts') . ' WHERE id = ?')->execute([$id]);
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
