<?php
/**
 * Auth helpers - stateless HMAC token (sama persis dengan versi Next.js)
 * Token = base64url(payload).base64url(HMAC-SHA256)
 */
require_once __DIR__ . '/db.php';

function jwt_secret(): string {
    $cfg = require __DIR__ . '/config.php';
    return $cfg['auth']['secret'];
}

function jwt_ttl(): int {
    $cfg = require __DIR__ . '/config.php';
    return $cfg['auth']['token_ttl'];
}

function b64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}
function b64url_decode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/'));
}

function make_token(array $user): string {
    $payload = [
        'username' => $user['username'],
        'name'     => $user['name'],
        'role'     => $user['role'],
        'exp'      => time() + jwt_ttl(),
    ];
    $data = b64url_encode(json_encode($payload));
    $sig  = b64url_encode(hash_hmac('sha256', $data, jwt_secret(), true));
    return $data . '.' . $sig;
}

function verify_token(?string $token): ?array {
    if (!$token) return null;
    $parts = explode('.', $token);
    if (count($parts) !== 2) return null;
    [$data, $sig] = $parts;
    $expected = b64url_encode(hash_hmac('sha256', $data, jwt_secret(), true));
    if (!hash_equals($expected, $sig)) return null;
    $payload = json_decode(b64url_decode($data), true);
    if (!is_array($payload)) return null;
    if (($payload['exp'] ?? 0) < time()) return null;
    return $payload;
}

function get_token_from_request(): ?string {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (preg_match('/^Bearer\s+(.+)$/i', $auth, $m)) return $m[1];
    return $_GET['token'] ?? null;
}

function require_auth(): array {
    $user = verify_token(get_token_from_request());
    if (!$user) {
        DB::err('Unauthorized', 401);
        exit;
    }
    return $user;
}

function hash_password(string $plain): string {
    $cfg = require __DIR__ . '/config.php';
    return password_hash($plain, $cfg['auth']['hash_algo']);
}
function verify_password(string $plain, string $hash): bool {
    return password_verify($plain, $hash);
}

function authenticate(string $username, string $password): ?array {
    $stmt = DB::conn()->prepare('SELECT * FROM ' . DB::table('admins') . ' WHERE username = ? LIMIT 1');
    $stmt->execute([$username]);
    $admin = $stmt->fetch();
    if (!$admin) return null;
    if (!verify_password($password, $admin['password'])) return null;
    return [
        'username' => $admin['username'],
        'name'     => $admin['name'],
        'role'     => $admin['role'],
    ];
}
