<?php
/** /hosting-api/comments — Blog comments */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $admin = ($_GET['admin'] ?? '') === 'true';
    $status = $_GET['status'] ?? '';
    $postId = $_GET['postId'] ?? '';
    if ($admin) require_auth();
    $where = []; $args = [];
    if ($status) { $where[] = 'status = ?'; $args[] = $status; }
    if ($postId) { $where[] = 'postId = ?'; $args[] = $postId; }
    if (!$admin && !$status) { $where[] = "status = 'approved'"; }
    $sql = 'SELECT * FROM ' . DB::table('comments');
    if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
    $sql .= ' ORDER BY createdAt DESC';
    $stmt = DB::conn()->prepare($sql);
    $stmt->execute($args);
    respond(['ok' => true, 'items' => $stmt->fetchAll()]);
}

if ($method === 'POST') {
    // Public — create new comment
    $b = body_json();
    $postId = $b['postId'] ?? '';
    $name = $b['name'] ?? '';
    $email = $b['email'] ?? '';
    $content = $b['content'] ?? '';
    $website = $b['website'] ?? '';
    if (!$postId || !$name || !$email || !$content) { DB::err('Missing required fields', 400); exit; }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { DB::err('Invalid email', 400); exit; }
    $post = DB::conn()->prepare('SELECT id FROM ' . DB::table('posts') . ' WHERE id = ? LIMIT 1');
    $post->execute([$postId]);
    if (!$post->fetch()) { DB::err('Post not found', 404); exit; }
    $id = rand_id();
    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? null;
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? null;
    DB::conn()->prepare('INSERT INTO ' . DB::table('comments') . ' (id, postId, name, email, website, content, status, ip, userAgent) VALUES (?,?,?,?,?,?,?,?,?)')
        ->execute([$id, $postId, $name, $email, $website ?: null, $content, 'pending', $ip, $ua]);
    respond(['ok' => true, 'id' => $id]);
}

if ($method === 'PUT') {
    require_auth();
    $b = body_json();
    $id = $b['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $u = []; $v = [];
    if (isset($b['status'])) { $u[] = "`status` = ?"; $v[] = $b['status']; }
    if (isset($b['content'])) { $u[] = "`content` = ?"; $v[] = $b['content']; }
    if (isset($b['parentId'])) { $u[] = "`parentId` = ?"; $v[] = $b['parentId'] ?: null; }
    if ($u) { $v[] = $id; DB::conn()->prepare('UPDATE ' . DB::table('comments') . ' SET ' . implode(',', $u) . ' WHERE id = ?')->execute($v); }
    respond(['ok' => true, 'item' => get_row('comments', $id)]);
}

if ($method === 'DELETE') {
    require_auth();
    $id = $_GET['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $permanent = ($_GET['permanent'] ?? '') === 'true';
    if ($permanent) {
        DB::conn()->prepare('DELETE FROM ' . DB::table('comments') . ' WHERE id = ?')->execute([$id]);
    } else {
        DB::conn()->prepare("UPDATE " . DB::table('comments') . " SET status = 'trash' WHERE id = ?")->execute([$id]);
    }
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
