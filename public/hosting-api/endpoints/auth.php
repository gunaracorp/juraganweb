<?php
/** /hosting-api/auth/login, /auth/logout, /auth/session — auth endpoints */
require_once __DIR__ . '/_shared.php';

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Login
if ($action === 'login' || ($method === 'POST' && !$action)) {
    if ($method !== 'POST') { DB::err('Method not allowed', 405); exit; }
    $b = body_json();
    $username = $b['username'] ?? '';
    $password = $b['password'] ?? '';
    if (!$username || !$password) { DB::err('Username and password required', 400); exit; }
    $user = authenticate($username, $password);
    if (!$user) { respond(['ok' => false, 'error' => 'Invalid credentials'], 401); exit; }
    $token = make_token($user);
    respond(['ok' => true, 'token' => $token, 'user' => $user]);
    exit;
}

// Logout (stateless — just respond ok)
if ($action === 'logout') {
    respond(['ok' => true]);
    exit;
}

// Session check
if ($action === 'session' || $method === 'GET') {
    $user = verify_token(get_token_from_request());
    if (!$user) { respond(['ok' => false, 'error' => 'Unauthorized'], 401); exit; }
    respond(['ok' => true, 'user' => $user]);
    exit;
}

DB::err('Unknown auth action', 404);
