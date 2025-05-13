<?php
/**
 * Common functions for the Šaukštas Meilės website
 */

// Define constants for file paths
define('SITE_ROOT', dirname(__DIR__));
define('DATA_DIR', SITE_ROOT . '/data');
define('UPLOADS_DIR', SITE_ROOT . '/img');
define('RECIPES_FILE', DATA_DIR . '/recipes.json');
define('COMMENTS_FILE', DATA_DIR . '/comments.json');
define('USERS_FILE', DATA_DIR . '/users.json');
define('ABOUT_FILE', DATA_DIR . '/about.json');

// Make sure data directory exists
if (!file_exists(DATA_DIR)) {
    mkdir(DATA_DIR, 0755, true);
}

/**
 * Load data from a JSON file
 * 
 * @param string $filePath Path to the JSON file
 * @return array Data from the file or empty array if file doesn't exist
 */
function loadData($filePath) {
    if (file_exists($filePath)) {
        $json = file_get_contents($filePath);
        return json_decode($json, true) ?: [];
    }
    return [];
}

/**
 * Save data to a JSON file
 * 
 * @param string $filePath Path to the JSON file
 * @param array $data Data to save
 * @return bool True if save was successful, false otherwise
 */
function saveData($filePath, $data) {
    // Ensure the directory exists
    $dir = dirname($filePath);
    if (!file_exists($dir)) {
        mkdir($dir, 0755, true);
    }
    
    $json = json_encode($data, JSON_PRETTY_PRINT);
    return file_put_contents($filePath, $json, LOCK_EX) !== false;
}

/**
 * Generate a unique ID
 * 
 * @return string Unique ID
 */
function generateId() {
    return uniqid() . '-' . bin2hex(random_bytes(4));
}

/**
 * Validate email address
 * 
 * @param string $email Email address to validate
 * @return bool True if email is valid, false otherwise
 */
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Format date for display
 * 
 * @param string $dateString Date string in Y-m-d H:i:s format
 * @return string Formatted date
 */
function formatDate($dateString) {
    $date = new DateTime($dateString);
    return $date->format('F j, Y');
}

/**
 * Handle image upload
 * 
 * @param array $fileData $_FILES array element
 * @param string $subdir Subdirectory to save the file in
 * @return string|false Filename if successful, false otherwise
 */
function handleImageUpload($fileData, $subdir = '') {
    // Check for errors
    if ($fileData['error'] !== 0) {
        return false;
    }
    
    // Check file type
    $fileType = $fileData['type'];
    if (!in_array($fileType, ['image/jpeg', 'image/png', 'image/gif'])) {
        return false;
    }
    
    // Upload directory
    $uploadDir = UPLOADS_DIR;
    if (!empty($subdir)) {
        $uploadDir .= '/' . $subdir;
        
        // Create directory if it doesn't exist
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
    }
    
    // Generate unique filename
    $extension = pathinfo($fileData['name'], PATHINFO_EXTENSION);
    $filename = uniqid() . '.' . $extension;
    $filePath = $uploadDir . '/' . $filename;
    
    // Move file
    if (move_uploaded_file($fileData['tmp_name'], $filePath)) {
        return $filename;
    }
    
    return false;
}

/**
 * Sanitize string for output
 * 
 * @param string $string String to sanitize
 * @return string Sanitized string
 */
function sanitizeOutput($string) {
    return htmlspecialchars($string, ENT_QUOTES, 'UTF-8');
}
?>