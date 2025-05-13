<?php
// API endpoint for about page content
header('Content-Type: application/json');

// Include common functions
require_once __DIR__ . '/../includes/functions.php';

// Load about page data
$about = loadData(ABOUT_FILE);

if (!$about || empty($about)) {
    // Return empty data structure
    $about = [
        'title' => '',
        'subtitle' => '',
        'image' => '',
        'intro' => '',
        'sections' => [],
        'email' => '',
        'social' => [
            'facebook' => '',
            'instagram' => '',
            'pinterest' => ''
        ]
    ];
}

// Return about data
echo json_encode([
    'success' => true,
    'about' => $about
]);
?>