<?php
// Simple test endpoint to debug HTTP requests
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log request info
$requestLog = date('Y-m-d H:i:s') . " - Test.php accessed - Method: " . $_SERVER['REQUEST_METHOD'] . " - URI: " . $_SERVER['REQUEST_URI'] . "\n";
file_put_contents('test_log.txt', $requestLog, FILE_APPEND);

// Set headers for CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get server info
$serverInfo = [
    'PHP_VERSION' => PHP_VERSION,
    'SERVER_SOFTWARE' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'REQUEST_METHOD' => $_SERVER['REQUEST_METHOD'],
    'CONTENT_TYPE' => $_SERVER['CONTENT_TYPE'] ?? 'Not set',
    'CONTENT_LENGTH' => $_SERVER['CONTENT_LENGTH'] ?? '0',
    'SCRIPT_FILENAME' => $_SERVER['SCRIPT_FILENAME'],
    'REQUEST_URI' => $_SERVER['REQUEST_URI']
];

// Get raw input
$rawInput = file_get_contents('php://input');

// Create test response
$response = [
    'success' => true,
    'message' => 'Test endpoint is working correctly',
    'request_method' => $_SERVER['REQUEST_METHOD'],
    'timestamp' => date('Y-m-d H:i:s'),
    'server_info' => $serverInfo,
    'post_data' => $_POST,
    'get_data' => $_GET,
    'files' => isset($_FILES) ? $_FILES : [],
    'raw_input' => $rawInput
];

// Output JSON response
echo json_encode($response, JSON_PRETTY_PRINT);
exit;
?>