<?php
/** /hosting-api/analytics — Dashboard analytics (admin) */
require_once __DIR__ . '/_shared.php';

$user = require_auth();
$pdo = DB::conn();

$posts = $pdo->query('SELECT COUNT(*) c FROM ' . DB::table('posts'))->fetch()['c'];
$pages = $pdo->query('SELECT COUNT(*) c FROM ' . DB::table('pages'))->fetch()['c'];
$portfolio = $pdo->query('SELECT COUNT(*) c FROM ' . DB::table('portfolios'))->fetch()['c'];
$services = $pdo->query('SELECT COUNT(*) c FROM ' . DB::table('services'))->fetch()['c'];
$testimonials = $pdo->query('SELECT COUNT(*) c FROM ' . DB::table('testimonials'))->fetch()['c'];
$messages = $pdo->query('SELECT COUNT(*) c FROM ' . DB::table('messages'))->fetch()['c'];
$newMessages = $pdo->query("SELECT COUNT(*) c FROM " . DB::table('messages') . " WHERE status = 'new'")->fetch()['c'];
$subscribers = $pdo->query('SELECT COUNT(*) c FROM ' . DB::table('subscribers'))->fetch()['c'];
$comments = $pdo->query('SELECT COUNT(*) c FROM ' . DB::table('comments'))->fetch()['c'];
$pendingComments = $pdo->query("SELECT COUNT(*) c FROM " . DB::table('comments') . " WHERE status = 'pending'")->fetch()['c'];
$media = $pdo->query('SELECT COUNT(*) c FROM ' . DB::table('media'))->fetch()['c'];
$users = $pdo->query('SELECT COUNT(*) c FROM ' . DB::table('admins'))->fetch()['c'];
$totalViews = $pdo->query('SELECT COALESCE(SUM(views),0) s FROM ' . DB::table('posts'))->fetch()['s'];

$topPosts = $pdo->query('SELECT id, titleId, titleEn, slug, views, category, published, createdAt FROM ' . DB::table('posts') . ' ORDER BY views DESC LIMIT 5')->fetchAll();
$recentPosts = $pdo->query('SELECT id, titleId, titleEn, slug, status, published, createdAt FROM ' . DB::table('posts') . ' ORDER BY createdAt DESC LIMIT 5')->fetchAll();
$recentPages = $pdo->query('SELECT id, titleId, titleEn, slug, status, createdAt FROM ' . DB::table('pages') . ' ORDER BY createdAt DESC LIMIT 5')->fetchAll();
$recentMessages = $pdo->query('SELECT * FROM ' . DB::table('messages') . ' ORDER BY createdAt DESC LIMIT 5')->fetchAll();
$recentComments = $pdo->query('SELECT c.*, p.titleId postTitleId, p.titleEn postTitleEn, p.slug postSlug FROM ' . DB::table('comments') . ' c LEFT JOIN ' . DB::table('posts') . ' p ON c.postId = p.id ORDER BY c.createdAt DESC LIMIT 5')->fetchAll();
$activities = $pdo->query('SELECT * FROM ' . DB::table('activities') . ' ORDER BY createdAt DESC LIMIT 10')->fetchAll();

foreach ($topPosts as &$p) { cast_int($p, ['views']); cast_bool($p, ['published']); }
foreach ($recentPosts as &$p) { cast_bool($p, ['published']); }
foreach ($recentMessages as &$m) { cast_bool($m, ['read','replied','starred']); }

respond([
    'ok' => true,
    'stats' => [
        'posts' => (int)$posts,
        'pages' => (int)$pages,
        'portfolio' => (int)$portfolio,
        'services' => (int)$services,
        'testimonials' => (int)$testimonials,
        'messages' => (int)$messages,
        'newMessages' => (int)$newMessages,
        'subscribers' => (int)$subscribers,
        'comments' => (int)$comments,
        'pendingComments' => (int)$pendingComments,
        'media' => (int)$media,
        'users' => (int)$users,
        'totalViews' => (int)$totalViews,
    ],
    'topPosts' => $topPosts,
    'recentPosts' => $recentPosts,
    'recentPages' => $recentPages,
    'recentMessages' => $recentMessages,
    'recentComments' => $recentComments,
    'activities' => $activities,
]);
