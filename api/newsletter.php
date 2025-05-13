<?php
// API endpoint for newsletter subscriptions
header('Content-Type: application/json');

// Include common functions
require_once __DIR__ . '/../includes/functions.php';

// Handle POST request for subscribing to newsletter
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Validate email
    if (empty($_POST['email'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Email is required']);
        exit;
    }
    
    $email = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL);
    if (!$email) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid email address']);
        exit;
    }
    
    // Load subscribers
    $subscribersFile = DATA_DIR . '/subscribers.json';
    $subscribers = loadData($subscribersFile);
    
    // Check if email already exists
    foreach ($subscribers as $subscriber) {
        if ($subscriber['email'] === $email) {
            echo json_encode(['success' => true, 'message' => 'You are already subscribed']);
            exit;
        }
    }
    
    // Add new subscriber
    $subscribers[] = [
        'id' => generateId(),
        'email' => $email,
        'created_at' => date('Y-m-d H:i:s'),
        'status' => 'active'
    ];
    
    // Save subscribers
    if (saveData($subscribersFile, $subscribers)) {
        echo json_encode(['success' => true, 'message' => 'Subscription successful']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to save subscription']);
    }
    exit;
}

// Return error for unsupported methods
http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
?>