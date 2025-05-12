<?php
header('Content-Type: application/json');

// Log all server variables to help diagnose the issue
$serverVars = $_SERVER;

// Log the request method
$method = $_SERVER['REQUEST_METHOD'];

// Get POST data
$postData = $_POST;

// Get raw input
$rawInput = file_get_contents('php://input');

// Create a response
$response = [
    'success' => true,
    'message' => 'POST request received',
    'request_method' => $method,
    'post_data' => $postData,
    'raw_input' => $rawInput,
    'server' => $serverVars
];

// Send response
echo json_encode($response);
exit;
?>