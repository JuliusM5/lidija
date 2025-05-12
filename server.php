<?php
// Router script for PHP's built-in server
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log the request for debugging
$requestLog = [
    'time' => date('Y-m-d H:i:s'),
    'method' => $_SERVER['REQUEST_METHOD'],
    'uri' => $_SERVER['REQUEST_URI'],
    'query' => $_SERVER['QUERY_STRING'] ?? ''
];
file_put_contents('server_log.txt', json_encode($requestLog) . "\n", FILE_APPEND);

// Parse the requested URI
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$ext = pathinfo($uri, PATHINFO_EXTENSION);

// Serve static files directly
if (file_exists(__DIR__ . $uri) && is_file(__DIR__ . $uri)) {
    // Set content type based on file extension
    $contentTypes = [
        'css' => 'text/css',
        'js' => 'application/javascript',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'gif' => 'image/gif',
        'svg' => 'image/svg+xml',
        'ico' => 'image/x-icon',
        'html' => 'text/html',
        'json' => 'application/json',
        'txt' => 'text/plain'
    ];
    
    if (isset($contentTypes[$ext])) {
        header('Content-Type: ' . $contentTypes[$ext]);
    }
    
    readfile(__DIR__ . $uri);
    return true;
}

// API endpoints
if ($uri === '/admin-connector.php') {
    require_once __DIR__ . '/admin-connector.php';
    return true;
}

if ($uri === '/test.php') {
    require_once __DIR__ . '/test.php';
    return true;
}

// Default to index.html for root and undefined paths
if ($uri === '/' || !file_exists(__DIR__ . $uri)) {
    if (file_exists(__DIR__ . '/index.html')) {
        header('Content-Type: text/html');
        readfile(__DIR__ . '/index.html');
    } else {
        http_response_code(404);
        echo '404 Not Found - Default page not available';
    }
    return true;
}

// Return 404 for all other requests
http_response_code(404);
echo '404 Not Found';
return true;
?>