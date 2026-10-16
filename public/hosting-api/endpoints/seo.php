<?php
/** /hosting-api/seo — SEO settings */
require_once __DIR__ . '/_shared.php';

$SEO_KEYS = ['seoMetaTitle','seoMetaDescription','seoMetaKeywords','seoOgTitle','seoOgDescription','seoOgImage','seoTwitterCard','seoGoogleAnalytics','seoGoogleSearchConsole','seoBingWebmaster','seoRobotsTxt','seoSitemap','seoStructuredData'];

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $stmt = DB::conn()->prepare('SELECT `key`, valueId, valueEn FROM ' . DB::table('settings') . ' WHERE `key` LIKE ?');
    $stmt->execute(['seo%']);
    $rows = $stmt->fetchAll();
    $out = [];
    foreach ($rows as $r) { $out[$r['key']] = ['valueId' => $r['valueId'], 'valueEn' => $r['valueEn']]; }
    foreach ($SEO_KEYS as $k) { if (!isset($out[$k])) $out[$k] = ['valueId' => '', 'valueEn' => '']; }
    respond(['ok' => true, 'settings' => $out]);
}

if ($method === 'PUT') {
    require_auth();
    $b = body_json();
    $settings = $b['settings'] ?? [];
    foreach ($settings as $key => $val) {
        if (strpos($key, 'seo') !== 0) continue;
        $vId = $val['valueId'] ?? '';
        $vEn = $val['valueEn'] ?? $vId;
        $ex = DB::conn()->prepare('SELECT id FROM ' . DB::table('settings') . ' WHERE `key` = ? LIMIT 1');
        $ex->execute([$key]);
        if ($row = $ex->fetch()) {
            DB::conn()->prepare('UPDATE ' . DB::table('settings') . ' SET valueId = ?, valueEn = ? WHERE id = ?')->execute([$vId, $vEn, $row['id']]);
        } else {
            DB::conn()->prepare('INSERT INTO ' . DB::table('settings') . ' (id, `key`, valueId, valueEn) VALUES (?, ?, ?, ?)')->execute([rand_id(), $key, $vId, $vEn]);
        }
    }
    respond(['ok' => true]);
}

DB::err('Method not allowed', 405);
