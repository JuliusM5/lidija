<?php
/**
 * Admin Connector - PHP Backend for the Šaukštas Meilės Admin Panel
 */

// Set error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Define constants
define('SITE_ROOT', __DIR__);
define('DATA_DIR', SITE_ROOT . '/data');
define('UPLOADS_DIR', SITE_ROOT . '/img');
define('RECIPES_FILE', DATA_DIR . '/recipes.json');
define('COMMENTS_FILE', DATA_DIR . '/comments.json');
define('USERS_FILE', DATA_DIR . '/users.json');
define('ABOUT_FILE', DATA_DIR . '/about.json');

// Create directories if they don't exist
if (!file_exists(DATA_DIR)) {
    mkdir(DATA_DIR, 0755, true);
}
if (!file_exists(UPLOADS_DIR)) {
    mkdir(UPLOADS_DIR, 0755, true);
}

// Start session
session_start();

// Handle request
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Route to appropriate handler
switch ($action) {
    case 'login':
        handleLogin();
        break;
    case 'logout':
        handleLogout();
        break;
    case 'get_recipes':
        handleGetRecipes();
        break;
    // ... all other action handlers
}

// Function definitions for all handlers
// ...

// Helper functions
// ...

// Send JSON response
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}
?>