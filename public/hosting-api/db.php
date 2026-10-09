<?php
/**
 * Database singleton (PDO MySQL)
 * Singleton koneksi MySQL untuk seluruh endpoint PHP.
 */
class DB {
    private static ?PDO $pdo = null;

    public static function conn(): PDO {
        if (self::$pdo === null) {
            $cfg = require __DIR__ . '/config.php';
            $db = $cfg['db'];
            $dsn = "mysql:host={$db['host']};dbname={$db['name']};charset={$db['charset']}";
            try {
                self::$pdo = new PDO($dsn, $db['user'], $db['pass'], [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES    => false,
                ]);
            } catch (PDOException $e) {
                http_response_code(500);
                self::json([
                    'ok' => false,
                    'error' => 'Database connection failed. Jalankan install.php atau cek config.php. Detail: ' . (getenv('APP_DEBUG') ? $e->getMessage() : 'DB error'),
                ]);
                exit;
            }
        }
        return self::$pdo;
    }

    /** Prefix-aware table name */
    public static function table(string $name): string {
        $cfg = require __DIR__ . '/config.php';
        return $cfg['db']['prefix'] . $name;
    }

    public static function json($data, int $status = 200): void {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    public static function ok($data = ['ok' => true]): void {
        self::json($data, 200);
    }

    public static function err(string $msg, int $status = 400, array $extra = []): void {
        self::json(array_merge(['ok' => false, 'error' => $msg], $extra), $status);
    }
}
