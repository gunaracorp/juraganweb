<?php
/** /hosting-api/media — Media library */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $admin = ($_GET['admin'] ?? '') === 'true';
    if ($admin) require_auth();
    $folder = $_GET['folder'] ?? '';
    $sql = 'SELECT * FROM ' . DB::table('media');
    $args = [];
    if ($folder) { $sql .= ' WHERE folder = ?'; $args[] = $folder; }
    $sql .= ' ORDER BY createdAt DESC';
    $stmt = DB::conn()->prepare($sql);
    $stmt->execute($args);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) { cast_int($r, ['size','width','height']); }
    respond(['ok' => true, 'items' => $rows]);
}

if ($method === 'POST') {
    $user = require_auth();
    $b = body_json();
    $id = rand_id();
    DB::conn()->prepare('INSERT INTO ' . DB::table('media') . ' (id, filename, url, thumbUrl, mimeType, size, width, height, alt, caption, uploadedBy, folder) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
        ->execute([$id, $b['filename'] ?? 'untitled', $b['url'] ?? '', $b['thumbUrl'] ?? null, $b['mimeType'] ?? 'image/jpeg', (int)($b['size'] ?? 0), isset($b['width']) ? (int)$b['width'] : null, isset($b['height']) ? (int)$b['height'] : null, $b['alt'] ?? '', $b['caption'] ?? '', $user['username'] ?? 'admin', $b['folder'] ?? '/']);
    log_activity($user, 'uploaded', 'media', $id, $b['filename'] ?? '');
    respond(['ok' => true, 'item' => get_row('media', $id)]);
}

if ($method === 'PUT') {
    require_auth();
    $b = body_json();
    $id = $b['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $fields = ['filename','alt','caption','folder','thumbUrl','url'];
    $u = []; $v = [];
    foreach ($fields as $f) { if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f]; } }
    if ($u) { $v[] = $id; DB::conn()->prepare('UPDATE ' . DB::table('media') . ' SET ' . implode(',', $u) . ' WHERE id = ?')->execute($v); }
    respond(['ok' => true, 'item' => get_row('media', $id)]);
}

if ($method === 'DELETE') {
    $user = require_auth();
    $id = $_GET['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('media', $id);
    if (!$ex) { DB::err('Media not found', 404); exit; }
    DB::conn()->prepare('DELETE FROM ' . DB::table('media') . ' WHERE id = ?')->execute([$id]);
    log_activity($user, 'deleted', 'media', $id, $ex['filename']);
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
