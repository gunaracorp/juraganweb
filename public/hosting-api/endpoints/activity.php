<?php
/** /hosting-api/activity — Activity log (admin) */
require_once __DIR__ . '/_shared.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method !== 'GET') { DB::err('Method not allowed', 405); exit; }

$user = require_auth();
$entity = $_GET['entity'] ?? '';
$limit = (int)($_GET['limit'] ?? 50);
if ($limit < 1) $limit = 50;
if ($limit > 500) $limit = 500;

$sql = 'SELECT * FROM ' . DB::table('activities');
$args = [];
if ($entity) { $sql .= ' WHERE entity = ?'; $args[] = $entity; }
$sql .= ' ORDER BY createdAt DESC LIMIT ' . $limit;
$stmt = DB::conn()->prepare($sql);
$stmt->execute($args);
respond(['ok' => true, 'items' => $stmt->fetchAll()]);
