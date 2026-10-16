<?php
/** /hosting-api/subscribers — Newsletter signup (public) */
require_once __DIR__ . '/_shared.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'POST') !== 'POST') {
    DB::err('Method not allowed', 405); exit;
}

$b = body_json();
$email = $b['email'] ?? '';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { DB::err('Valid email required', 400); exit; }

$existing = DB::conn()->prepare('SELECT id, active FROM ' . DB::table('subscribers') . ' WHERE email = ? LIMIT 1');
$existing->execute([$email]);
if ($row = $existing->fetch()) {
    if (!$row['active']) {
        DB::conn()->prepare('UPDATE ' . DB::table('subscribers') . ' SET active = 1, name = ? WHERE id = ?')
            ->execute([$b['name'] ?? null, $row['id']]);
    }
    respond(['ok' => true, 'message' => 'Already subscribed']);
}

DB::conn()->prepare('INSERT INTO ' . DB::table('subscribers') . ' (id, email, name, active) VALUES (?, ?, ?, 1)')
    ->execute([rand_id(), $email, $b['name'] ?? null]);
respond(['ok' => true]);
