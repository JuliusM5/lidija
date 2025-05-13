<?php
// API endpoint for comments
header('Content-Type: application/json');

// Include common functions
require_once __DIR__ . '/../includes/functions.php';

// Handle POST request for adding a comment
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Validate required fields
    if (empty($_POST['recipe_id']) || empty($_POST['author']) || empty($_POST['content'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Recipe ID, author, and content are required']);
        exit;
    }
    
    // Get comment data
    $recipeId = $_POST['recipe_id'];
    $parentId = isset($_POST['parent_id']) ? $_POST['parent_id'] : null;
    $author = $_POST['author'];
    $email = isset($_POST['email']) ? $_POST['email'] : '';
    $content = $_POST['content'];
    
    // Create comment data
    $comment = [
        'id' => generateId(),
        'recipe_id' => $recipeId,
        'parent_id' => $parentId,
        'author' => $author,
        'email' => $email,
        'content' => $content,
        'status' => 'pending', // Comments are pending until approved
        'created_at' => date('Y-m-d H:i:s')
    ];
    
    // Load existing comments
    $comments = loadData(COMMENTS_FILE);
    
    // Add new comment
    $comments[] = $comment;
    
    // Save comments
    if (saveData(COMMENTS_FILE, $comments)) {
        echo json_encode(['success' => true, 'message' => 'Comment added successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to save comment']);
    }
    exit;
}

// Handle GET request for fetching comments
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $recipeId = isset($_GET['recipe_id']) ? $_GET['recipe_id'] : null;
    
    if (!$recipeId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Recipe ID is required']);
        exit;
    }
    
    // Load comments
    $comments = loadData(COMMENTS_FILE);
    
    // Filter comments by recipe and status (only approved comments)
    $recipeComments = array_filter($comments, function($comment) use ($recipeId) {
        return $comment['recipe_id'] === $recipeId && $comment['status'] === 'approved';
    });
    
    // Organize comments into threads (top-level and replies)
    $commentThreads = [];
    $replies = [];
    
    foreach ($recipeComments as $comment) {
        if (!empty($comment['parent_id'])) {
            // This is a reply
            if (!isset($replies[$comment['parent_id']])) {
                $replies[$comment['parent_id']] = [];
            }
            $replies[$comment['parent_id']][] = $comment;
        } else {
            // This is a top-level comment
            $commentThreads[] = $comment;
        }
    }
    
    // Add replies to their parent comments
    foreach ($commentThreads as &$thread) {
        $thread['replies'] = isset($replies[$thread['id']
        // Add replies to their parent comments
    foreach ($commentThreads as &$thread) {
        $thread['replies'] = isset($replies[$thread['id']]) ? $replies[$thread['id']] : [];
    }
    
    echo json_encode([
        'success' => true,
        'comments' => $commentThreads
    ]);
    exit;
}

// Return error for unsupported methods
http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
?>