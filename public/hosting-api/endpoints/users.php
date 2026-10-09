<?php
/** /hosting-api/users — Admin users management */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function hash_pw(string $plain): string {
    return password_hash($plain, PASSWORD_DEFAULT);
}

function sanitize_user(array $r): array {
    unset($r['password']);
    return $r;
}

if ($method === 'GET') {
    $user = require_auth();
    $rows = DB::conn()->query('SELECT id, username, name, email, role, avatar, bio, lastLogin, createdAt FROM ' . DB::table('admins') . ' ORDER BY createdAt DESC')->fetchAll();
    respond(['ok' => true, 'items' => $rows]);
}

if ($method === 'POST') {
    require_auth();
    $b = body_json();
    $username = $b['username'] ?? '';
    $password = $b['password'] ?? '';
    $name = $b['name'] ?? '';
    $email = $b['email'] ?? '';
    $role = $b['role'] ?? 'editor';
    if (!$username || !$password || !$name || !$email) { DB::err('Missing required fields', 400); exit; }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { DB::err('Invalid email', 400); exit; }
    $ex = DB::conn()->prepare('SELECT id FROM ' . DB::table('admins') . ' WHERE username = ? LIMIT 1');
    $ex->execute([$username]);
    if ($ex->fetch()) { DB::err('Username already exists', 400); exit; }
    $id = rand_id();
    DB::conn()->prepare('INSERT INTO ' . DB::table('admins') . ' (id, username, password, name, email, role) VALUES (?,?,?,?,?,?)')
        ->execute([$id, $username, hash_pw($password), $name, $email, $role]);
    $row = get_row('admins', $id);
    respond(['ok' => true, 'item' => sanitize_user($row)]);
}

if ($method === 'PUT') {
    require_auth();
    $b = body_json();
    $id = $b['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('admins', $id);
    if (!$ex) { DB::err('User not found', 404); exit; }
    $u = []; $v = [];
    foreach (['name','email','role','avatar','bio'] as $f) { if (isset($b[$f])) { $u[] = "`$f` = ?"; $v[] = $b[$f]; } }
    if (!empty($b['password'])) { $u[] = "`password` = ?"; $v[] = hash_pw($b['password']); }
    if ($u) { $v[] = $id; DB::conn()->prepare('UPDATE ' . DB::table('admins') . ' SET ' . implode(',', $u) . ' WHERE id = ?')->execute($v); }
    $row = get_row('admins', $id);
    respond(['ok' => true, 'item' => sanitize_user($row)]);
}

if ($method === 'DELETE') {
    $user = require_auth();
    $id = $_GET['id'] ?? '';
    if (!$id) { DB::err('id required', 400); exit; }
    $ex = get_row('admins', $id);
    if (!$ex) { DB::err('User not found', 404); exit; }
    if ($ex['username'] === $user['username']) { DB::err('Cannot delete your own account', 400); exit; }
    DB::conn()->prepare('DELETE FROM ' . DB::table('admins') . ' WHERE id = ?')->execute([$id]);
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
