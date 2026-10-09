<?php
/**
 * GET /hosting-api/index
 * Health-check & info endpoint
 */
DB::ok([
    'ok' => true,
    'service' => 'JuraganWebsite API',
    'version' => '1.0.0',
    'company' => 'PT Digital Bisnis Manajemen (Digiman)',
    'since'   => '2007',
    'endpoints' => [
        'GET  /hosting-api/services',
        'GET  /hosting-api/portfolio',
        'GET  /hosting-api/testimonials',
        'GET  /hosting-api/posts?published=true',
        'GET  /hosting-api/posts?slug=SLUG',
        'GET  /hosting-api/posts?admin=true   (auth)',
        'POST /hosting-api/posts              (auth)',
        'PUT  /hosting-api/posts               (auth)',
        'DELETE /hosting-api/posts?id=ID       (auth)',
        'POST /hosting-api/posts/view',
        'GET  /hosting-api/settings',
        'PUT  /hosting-api/settings            (auth)',
        'POST /hosting-api/messages',
        'GET  /hosting-api/messages            (auth)',
        'PUT  /hosting-api/messages            (auth)',
        'DELETE /hosting-api/messages?id=ID    (auth)',
        'POST /hosting-api/subscribers',
        'GET  /hosting-api/stats               (auth)',
        'POST /hosting-api/auth/login',
        'POST /hosting-api/auth/logout',
        'GET  /hosting-api/auth/session?token=',
    ],
]);
