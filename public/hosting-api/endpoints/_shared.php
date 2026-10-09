<?php
/**
 * Shared helpers for endpoint handlers
 */
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../auth.php';

/** Read + decode JSON body */
function body_json(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function rand_id(): string {
    return 'c' . substr(bin2hex(random_bytes(12)), 0, 24);
}

function slugify(string $s): string {
    $s = strtolower(trim($s));
    $s = preg_replace('/[^a-z0-9]+/', '-', $s);
    return trim($s, '-');
}

function ensure_unique_slug(string $base, string $table, ?string $excludeId = null): string {
    $slug = $base; $i = 1;
    while (true) {
        if ($excludeId) {
            $stmt = DB::conn()->prepare('SELECT id FROM ' . DB::table($table) . ' WHERE slug = ? AND id <> ? LIMIT 1');
            $stmt->execute([$slug, $excludeId]);
        } else {
            $stmt = DB::conn()->prepare('SELECT id FROM ' . DB::table($table) . ' WHERE slug = ? LIMIT 1');
            $stmt->execute([$slug]);
        }
        if (!$stmt->fetch()) return $slug;
        $slug = $base . '-' . $i++;
    }
}

function get_row(string $table, string $id): ?array {
    $stmt = DB::conn()->prepare('SELECT * FROM ' . DB::table($table) . ' WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    return $row ?: null;
}

function cast_bool(array &$r, array $fields): void {
    foreach ($fields as $f) {
        if (isset($r[$f])) $r[$f] = (bool)$r[$f];
    }
}
function cast_int(array &$r, array $fields): void {
    foreach ($fields as $f) {
        if (isset($r[$f])) $r[$f] = (int)$r[$f];
    }
}

/** Respond with JSON */
function respond($data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/** Insert activity log entry (best-effort) */
function log_activity(array $user, string $action, string $entity, ?string $entityId = null, ?string $entityTitle = null): void {
    try {
        $id = rand_id();
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? null;
        DB::conn()->prepare('INSERT INTO ' . DB::table('activities') . ' (id, userId, userName, action, entity, entityId, entityTitle, details, ip) VALUES (?,?,?,?,?,?,?,?,?)')
            ->execute([$id, $user['username'] ?? 'system', $user['name'] ?? 'System', $action, $entity, $entityId, $entityTitle, '', $ip]);
    } catch (\Throwable $e) { /* ignore */ }
}
