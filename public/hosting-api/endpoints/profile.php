<?php
/** /hosting-api/profile — Current user profile (auth) */
require_once __DIR__ . '/_shared.php';
require_once __DIR__ . '/../auth.php';

$token = get_token_from_request();
$session = verify_token($token);
if (!$session) { respond(['ok' => false, 'error' => 'Unauthorized'], 401); exit; }

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $stmt = DB::conn()->prepare('SELECT id, username, name, email, role, avatar, bio, lastLogin, createdAt FROM ' . DB::table('admins') . ' WHERE username = ? LIMIT 1');
    $stmt->execute([$session['username']]);
    $user = $stmt->fetch();
    if (!$user) { DB::err('User not found', 404); exit; }
    respond(['ok' => true, 'user' => $user]);
}

if ($method === 'PUT') {
    $stmt = DB::conn()->prepare('SELECT * FROM ' . DB::table('admins') . ' WHERE username = ? LIMIT 1');
    $stmt->execute([$session['username']]);
    $admin = $stmt->fetch();
    if (!$admin) { DB::err('User not found', 404); exit; }
    $b = body_json();
    $u = []; $v = [];
    foreach (['name','email','avatar','bio'] as $f) { if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f]; } }
    if (!empty($b['newPassword'])) {
        if (empty($b['currentPassword'])) { DB::err('Current password required', 400); exit; }
        if (!password_verify($b['currentPassword'], $admin['password'])) { DB::err('Current password is incorrect', 400); exit; }
        if ($b['newPassword'] !== ($b['confirmPassword'] ?? '')) { DB::err('New passwords don\'t match', 400); exit; }
        if (strlen($b['newPassword']) < 6) { DB::err('Password must be at least 6 characters', 400); exit; }
        $u[] = "`password` = ?"; $v[] = password_hash($b['newPassword'], PASSWORD_DEFAULT);
    }
    if ($u) { $v[] = $admin['id']; DB::conn()->prepare('UPDATE ' . DB::table('admins') . ' SET ' . implode(',', $u) . ' WHERE id = ?')->execute($v); }
    $stmt = DB::conn()->prepare('SELECT id, username, name, email, role, avatar, bio, lastLogin, createdAt FROM ' . DB::table('admins') . ' WHERE id = ? LIMIT 1');
    $stmt->execute([$admin['id']]);
    respond(['ok' => true, 'user' => $stmt->fetch()]);
}

DB::err('Method not allowed', 405);
