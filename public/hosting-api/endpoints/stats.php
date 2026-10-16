<?php
/** /hosting-api/stats — admin dashboard stats */
require_once __DIR__ . '/_shared.php';

require_auth();
$pdo = DB::conn();
$posts = $pdo->query('SELECT COUNT(*) c FROM ' . DB::table('posts'))->fetch()['c'];
$pages = $pdo->query('SELECT COUNT(*) c FROM ' . DB::table('pages'))->fetch()['c'];
$portfolio = $pdo->query('SELECT COUNT(*) c FROM ' . DB::table('portfolios'))->fetch()['c'];
$newMessages = $pdo->query("SELECT COUNT(*) c FROM " . DB::table('messages') . " WHERE status = 'new'")->fetch()['c'];
$subscribers = $pdo->query('SELECT COUNT(*) c FROM ' . DB::table('subscribers'))->fetch()['c'];
$pendingComments = $pdo->query("SELECT COUNT(*) c FROM " . DB::table('comments') . " WHERE status = 'pending'")->fetch()['c'];
$media = $pdo->query('SELECT COUNT(*) c FROM ' . DB::table('media'))->fetch()['c'];
$users = $pdo->query('SELECT COUNT(*) c FROM ' . DB::table('admins'))->fetch()['c'];

respond(['ok' => true, 'stats' => [
    'posts' => (int)$posts,
    'pages' => (int)$pages,
    'portfolio' => (int)$portfolio,
    'newMessages' => (int)$newMessages,
    'subscribers' => (int)$subscribers,
    'pendingComments' => (int)$pendingComments,
    'media' => (int)$media,
    'users' => (int)$users,
]]);
