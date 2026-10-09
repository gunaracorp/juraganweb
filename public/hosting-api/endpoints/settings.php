<?php
/** /hosting-api/settings — bilingual key-value */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $rows = DB::conn()->query('SELECT `key`, valueId, valueEn FROM ' . DB::table('settings'))->fetchAll();
    $out = [];
    foreach ($rows as $r) {
        $out[$r['key']] = ['valueId' => $r['valueId'], 'valueEn' => $r['valueEn']];
    }
    respond(['ok' => true, 'settings' => $out]);
}

if ($method === 'PUT') {
    require_auth();
    $b = body_json();
    $settings = $b['settings'] ?? [];
    foreach ($settings as $key => $val) {
        $vId = $val['valueId'] ?? '';
        $vEn = $val['valueEn'] ?? $vId;
        $stmt = DB::conn()->prepare('SELECT id FROM ' . DB::table('settings') . ' WHERE `key` = ? LIMIT 1');
        $stmt->execute([$key]);
        if ($existing = $stmt->fetch()) {
            DB::conn()->prepare('UPDATE ' . DB::table('settings') . ' SET valueId = ?, valueEn = ? WHERE id = ?')
                ->execute([$vId, $vEn, $existing['id']]);
        } else {
            DB::conn()->prepare('INSERT INTO ' . DB::table('settings') . ' (id, `key`, valueId, valueEn) VALUES (?, ?, ?, ?)')
                ->execute([rand_id(), $key, $vId, $vEn]);
        }
    }
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
