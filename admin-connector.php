<?php
/**
 * Admin Connector - PHP Backend for the Šaukštas Meilės Admin Panel
 */

// Set error reporting for production environment
error_reporting(0);
ini_set('display_errors', 0);

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

// Make sure recipes directory exists
if (!file_exists(UPLOADS_DIR . '/recipes')) {
    mkdir(UPLOADS_DIR . '/recipes', 0755, true);
}

// Start session
session_start();

// Set CORS headers for all requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Set content type to JSON
header('Content-Type: application/json');

// Get action parameter - works for both GET and POST
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Get request data based on request method
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // For POST, use $_POST data
    $requestData = $_POST;
} else if ($_SERVER['REQUEST_METHOD'] === 'GET' && strpos($action, 'add_') === 0) {
    // Special case: Allow add_recipe via GET for workaround
    $requestData = $_GET;
} else if ($_SERVER['REQUEST_METHOD'] === 'DELETE' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
    // For DELETE and PUT, read from input stream
    $requestBody = file_get_contents('php://input');
    if (!empty($requestBody)) {
        $requestData = json_decode($requestBody, true);
    } else {
        $requestData = [];
    }
} else {
    // For other methods like GET, use $_GET
    $requestData = $_GET;
}

// Router - Process request based on action
switch ($action) {
    case 'login':
        handleLogin();
        break;
    case 'logout':
        handleLogout();
        break;
    case 'dashboard_stats':
        handleDashboardStats();
        break;
    case 'get_recipes':
        handleGetRecipes();
        break;
    case 'get_recipe':
        handleGetRecipe();
        break;
    case 'add_recipe':
        // Ensure user is authenticated
        if (isLoggedIn()) {
            handleAddRecipe();
        } else {
            sendResponse(['success' => false, 'error' => 'Unauthorized'], 401);
        }
        break;
    case 'update_recipe':
        // Ensure user is authenticated
        if (isLoggedIn()) {
            handleUpdateRecipe();
        } else {
            sendResponse(['success' => false, 'error' => 'Unauthorized'], 401);
        }
        break;
    case 'delete_recipe':
        // Ensure user is authenticated
        if (isLoggedIn()) {
            handleDeleteRecipe();
        } else {
            sendResponse(['success' => false, 'error' => 'Unauthorized'], 401);
        }
        break;
    case 'get_comments':
        handleGetComments();
        break;
    case 'get_comment':
        handleGetComment();
        break;
    case 'update_comment':
        // Ensure user is authenticated
        if (isLoggedIn()) {
            handleUpdateComment();
        } else {
            sendResponse(['success' => false, 'error' => 'Unauthorized'], 401);
        }
        break;
    case 'delete_comment':
        // Ensure user is authenticated
        if (isLoggedIn()) {
            handleDeleteComment();
        } else {
            sendResponse(['success' => false, 'error' => 'Unauthorized'], 401);
        }
        break;
    case 'get_about':
        handleGetAbout();
        break;
    case 'update_about':
        // Ensure user is authenticated
        if (isLoggedIn()) {
            handleUpdateAbout();
        } else {
            sendResponse(['success' => false, 'error' => 'Unauthorized'], 401);
        }
        break;
    case 'get_media':
        handleGetMedia();
        break;
    case 'upload_media':
        // Ensure user is authenticated
        if (isLoggedIn()) {
            handleUploadMedia();
        } else {
            sendResponse(['success' => false, 'error' => 'Unauthorized'], 401);
        }
        break;
    case 'delete_media':
        // Ensure user is authenticated
        if (isLoggedIn()) {
            handleDeleteMedia();
        } else {
            sendResponse(['success' => false, 'error' => 'Unauthorized'], 401);
        }
        break;
    default:
        sendResponse(['success' => false, 'error' => 'Invalid action: ' . $action], 400);
        break;
}

/**
 * Authentication Handlers
 */
function handleLogin() {
    global $requestData;
    
    // Validate required fields
    if (empty($requestData['username']) || empty($requestData['password'])) {
        sendResponse(['success' => false, 'error' => 'Username and password are required'], 400);
        return;
    }
    
    // Load users
    $users = loadData(USERS_FILE);
    
    // Check if user exists and password is correct
    $authenticated = false;
    $user = null;
    
    foreach ($users as $u) {
        if ($u['username'] === $requestData['username'] && password_verify($requestData['password'], $u['password'])) {
            $authenticated = true;
            $user = $u;
            break;
        }
    }
    
    if ($authenticated) {
        // Set session variables
        $_SESSION['logged_in'] = true;
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        
        // Send success response
        sendResponse([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'name' => $user['name'],
                'role' => $user['role']
            ]
        ]);
    } else {
        sendResponse(['success' => false, 'error' => 'Invalid username or password'], 401);
    }
}

function handleLogout() {
    // Clear session
    session_unset();
    session_destroy();
    
    sendResponse(['success' => true, 'message' => 'Logout successful']);
}

/**
 * Recipe Handlers
 */
function handleGetRecipes() {
    // Load recipes
    $recipes = loadData(RECIPES_FILE);
    
    // Filter by status if provided
    $status = isset($_GET['status']) ? $_GET['status'] : null;
    if ($status && $status !== 'all') {
        $recipes = array_filter($recipes, function($recipe) use ($status) {
            return isset($recipe['status']) && $recipe['status'] === $status;
        });
    }
    
    // Sort by date
    usort($recipes, function($a, $b) {
        $dateA = isset($a['created_at']) ? strtotime($a['created_at']) : 0;
        $dateB = isset($b['created_at']) ? strtotime($b['created_at']) : 0;
        return $dateB - $dateA;
    });
    
    // Pagination
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $perPage = isset($_GET['per_page']) ? intval($_GET['per_page']) : 10;
    $totalRecipes = count($recipes);
    $totalPages = ceil($totalRecipes / $perPage);
    $offset = ($page - 1) * $perPage;
    $recipes = array_slice($recipes, $offset, $perPage);
    
    sendResponse([
        'success' => true,
        'data' => $recipes,
        'meta' => [
            'page' => $page,
            'per_page' => $perPage,
            'total' => $totalRecipes,
            'pages' => $totalPages
        ]
    ]);
}

function handleGetRecipe() {
    // Check if ID is provided
    if (!isset($_GET['id'])) {
        sendResponse(['success' => false, 'error' => 'Recipe ID is required'], 400);
        return;
    }
    
    // Load recipes
    $recipes = loadData(RECIPES_FILE);
    
    // Find recipe
    $recipeId = $_GET['id'];
    $recipe = null;
    foreach ($recipes as $r) {
        if ($r['id'] === $recipeId) {
            $recipe = $r;
            break;
        }
    }
    
    if ($recipe) {
        sendResponse(['success' => true, 'data' => $recipe]);
    } else {
        sendResponse(['success' => false, 'error' => 'Recipe not found'], 404);
    }
}

function handleAddRecipe() {
    global $requestData;
    
    // Process recipe data from POST
    $title = isset($_POST['title']) ? $_POST['title'] : '';
    $intro = isset($_POST['intro']) ? $_POST['intro'] : '';
    $categories = isset($_POST['categories']) ? $_POST['categories'] : [];
    $tags = isset($_POST['tags']) ? json_decode($_POST['tags'], true) : [];
    $prepTime = isset($_POST['prep_time']) ? $_POST['prep_time'] : '';
    $cookTime = isset($_POST['cook_time']) ? $_POST['cook_time'] : '';
    $servings = isset($_POST['servings']) ? $_POST['servings'] : '';
    $ingredients = isset($_POST['ingredients']) ? $_POST['ingredients'] : [];
    $steps = isset($_POST['steps']) ? $_POST['steps'] : [];
    $notes = isset($_POST['notes']) ? $_POST['notes'] : '';
    $status = isset($_POST['status']) ? $_POST['status'] : 'draft';
    
    // Check if title is provided
    if (empty($title)) {
        sendResponse(['success' => false, 'error' => 'Title is required'], 400);
        return;
    }
    
    // Handle image upload
    $image = '';
    if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
        $image = handleImageUpload($_FILES['image'], 'recipes');
        if (!$image) {
            sendResponse(['success' => false, 'error' => 'Failed to upload image'], 500);
            return;
        }
    }
    
    // Create recipe data
    $recipe = [
        'id' => generateId(),
        'title' => $title,
        'intro' => $intro,
        'image' => $image,
        'categories' => $categories,
        'tags' => $tags,
        'prep_time' => $prepTime,
        'cook_time' => $cookTime,
        'servings' => $servings,
        'ingredients' => $ingredients,
        'steps' => $steps,
        'notes' => $notes,
        'status' => $status,
        'created_at' => date('Y-m-d H:i:s'),
        'updated_at' => date('Y-m-d H:i:s')
    ];
    
    // Load existing recipes
    $recipes = loadData(RECIPES_FILE);
    
    // Add new recipe
    $recipes[] = $recipe;
    
    // Save recipes
    if (saveData(RECIPES_FILE, $recipes)) {
        sendResponse(['success' => true, 'message' => 'Recipe added successfully', 'data' => $recipe]);
    } else {
        sendResponse(['success' => false, 'error' => 'Failed to save recipe'], 500);
    }
}

function handleUpdateRecipe() {
    global $requestData;
    
    // Check if ID is provided
    $id = '';
    if (isset($_POST['id'])) {
        $id = $_POST['id'];
    } else if (isset($_GET['id'])) {
        $id = $_GET['id']; 
    }
    
    if (empty($id)) {
        sendResponse(['success' => false, 'error' => 'Recipe ID is required'], 400);
        return;
    }
    
    // Get title from POST or GET
    $title = '';
    if (isset($_POST['title'])) {
        $title = $_POST['title'];
    } else if (isset($_GET['title'])) {
        $title = $_GET['title'];
    }
    
    if (empty($title)) {
        sendResponse(['success' => false, 'error' => 'Title is required'], 400);
        return;
    }
    
    // Load existing recipes
    $recipes = loadData(RECIPES_FILE);
    
    // Find recipe
    $recipeIndex = -1;
    foreach ($recipes as $index => $recipe) {
        if ($recipe['id'] === $id) {
            $recipeIndex = $index;
            break;
        }
    }
    
    if ($recipeIndex === -1) {
        sendResponse(['success' => false, 'error' => 'Recipe not found'], 404);
        return;
    }
    
    // Get recipe data from POST or GET
    if (!empty($_POST)) {
        $title = $_POST['title'];
        $intro = isset($_POST['intro']) ? $_POST['intro'] : '';
        $categories = isset($_POST['categories']) ? $_POST['categories'] : [];
        $tags = isset($_POST['tags']) ? json_decode($_POST['tags'], true) : [];
        $prepTime = isset($_POST['prep_time']) ? $_POST['prep_time'] : '';
        $cookTime = isset($_POST['cook_time']) ? $_POST['cook_time'] : '';
        $servings = isset($_POST['servings']) ? $_POST['servings'] : '';
        $ingredients = isset($_POST['ingredients']) ? $_POST['ingredients'] : [];
        $steps = isset($_POST['steps']) ? $_POST['steps'] : [];
        $notes = isset($_POST['notes']) ? $_POST['notes'] : '';
        $status = isset($_POST['status']) ? $_POST['status'] : 'draft';
    } else {
        // Use GET parameters as fallback
        $title = $_GET['title'];
        $intro = isset($_GET['intro']) ? $_GET['intro'] : '';
        $categories = isset($_GET['categories']) ? $_GET['categories'] : [];
        $tags = isset($_GET['tags']) ? json_decode($_GET['tags'], true) : [];
        $prepTime = isset($_GET['prep_time']) ? $_GET['prep_time'] : '';
        $cookTime = isset($_GET['cook_time']) ? $_GET['cook_time'] : '';
        $servings = isset($_GET['servings']) ? $_GET['servings'] : '';
        $ingredients = isset($_GET['ingredients']) ? $_GET['ingredients'] : [];
        $steps = isset($_GET['steps']) ? $_GET['steps'] : [];
        $notes = isset($_GET['notes']) ? $_GET['notes'] : '';
        $status = isset($_GET['status']) ? $_GET['status'] : 'draft';
    }
    
    // Handle image upload
    $image = $recipes[$recipeIndex]['image'] ?? '';
    if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
        $newImage = handleImageUpload($_FILES['image'], 'recipes');
        if ($newImage) {
            // Delete old image if it exists
            if (!empty($image)) {
                $oldImagePath = UPLOADS_DIR . '/recipes/' . $image;
                if (file_exists($oldImagePath)) {
                    unlink($oldImagePath);
                }
            }
            $image = $newImage;
        }
    }
    
    // Update recipe data
    $recipes[$recipeIndex] = [
        'id' => $id,
        'title' => $title,
        'intro' => $intro,
        'image' => $image,
        'categories' => $categories,
        'tags' => $tags,
        'prep_time' => $prepTime,
        'cook_time' => $cookTime,
        'servings' => $servings,
        'ingredients' => $ingredients,
        'steps' => $steps,
        'notes' => $notes,
        'status' => $status,
        'created_at' => $recipes[$recipeIndex]['created_at'] ?? date('Y-m-d H:i:s'),
        'updated_at' => date('Y-m-d H:i:s')
    ];
    
    // Save recipes
    if (saveData(RECIPES_FILE, $recipes)) {
        sendResponse(['success' => true, 'message' => 'Recipe updated successfully', 'data' => $recipes[$recipeIndex]]);
    } else {
        sendResponse(['success' => false, 'error' => 'Failed to update recipe'], 500);
    }
}

function handleDeleteRecipe() {
    global $requestData;
    
    // Get ID from either JSON body or query params
    $recipeId = '';
    if (isset($requestData['id'])) {
        $recipeId = $requestData['id'];
    } else if (isset($_GET['id'])) {
        $recipeId = $_GET['id'];
    }
    
    if (empty($recipeId)) {
        sendResponse(['success' => false, 'error' => 'Recipe ID is required'], 400);
        return;
    }
    
    // Load recipes
    $recipes = loadData(RECIPES_FILE);
    
    // Find recipe
    $recipeIndex = -1;
    foreach ($recipes as $index => $recipe) {
        if ($recipe['id'] === $recipeId) {
            $recipeIndex = $index;
            break;
        }
    }
    
    if ($recipeIndex === -1) {
        sendResponse(['success' => false, 'error' => 'Recipe not found'], 404);
        return;
    }
    
    // Delete recipe image if it exists
    $image = $recipes[$recipeIndex]['image'] ?? '';
    if (!empty($image)) {
        $imagePath = UPLOADS_DIR . '/recipes/' . $image;
        if (file_exists($imagePath)) {
            unlink($imagePath);
        }
    }
    
    // Remove recipe
    array_splice($recipes, $recipeIndex, 1);
    
    // Save recipes
    if (saveData(RECIPES_FILE, $recipes)) {
        sendResponse(['success' => true, 'message' => 'Recipe deleted successfully']);
    } else {
        sendResponse(['success' => false, 'error' => 'Failed to delete recipe'], 500);
    }
}

/**
 * Comment Handlers
 */
function handleGetComments() {
    // Load comments
    $comments = loadData(COMMENTS_FILE);
    
    // Filter by status if provided
    $status = isset($_GET['status']) ? $_GET['status'] : null;
    if ($status && $status !== 'all') {
        $comments = array_filter($comments, function($comment) use ($status) {
            return isset($comment['status']) && $comment['status'] === $status;
        });
    }
    
    // Sort by date
    usort($comments, function($a, $b) {
        $dateA = isset($a['created_at']) ? strtotime($a['created_at']) : 0;
        $dateB = isset($b['created_at']) ? strtotime($b['created_at']) : 0;
        return $dateB - $dateA;
    });
    
    // Pagination
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $perPage = isset($_GET['per_page']) ? intval($_GET['per_page']) : 10;
    $totalComments = count($comments);
    $totalPages = ceil($totalComments / $perPage);
    $offset = ($page - 1) * $perPage;
    $comments = array_slice($comments, $offset, $perPage);
    
    // Add recipe titles
    $recipes = loadData(RECIPES_FILE);
    foreach ($comments as &$comment) {
        if (isset($comment['recipe_id'])) {
            foreach ($recipes as $recipe) {
                if ($recipe['id'] === $comment['recipe_id']) {
                    $comment['recipe_title'] = $recipe['title'];
                    break;
                }
            }
            
            if (!isset($comment['recipe_title'])) {
                $comment['recipe_title'] = 'Unknown Recipe';
            }
        } else {
            $comment['recipe_title'] = 'Unknown Recipe';
        }
    }
    
    sendResponse([
        'success' => true,
        'data' => $comments,
        'meta' => [
            'page' => $page,
            'per_page' => $perPage,
            'total' => $totalComments,
            'pages' => $totalPages
        ]
    ]);
}

function handleGetComment() {
    // Check if ID is provided
    if (!isset($_GET['id'])) {
        sendResponse(['success' => false, 'error' => 'Comment ID is required'], 400);
        return;
    }
    
    // Load comments
    $comments = loadData(COMMENTS_FILE);
    
    // Find comment
    $commentId = $_GET['id'];
    $comment = null;
    foreach ($comments as $c) {
        if ($c['id'] === $commentId) {
            $comment = $c;
            break;
        }
    }
    
    if ($comment) {
        // Add recipe title
        $recipes = loadData(RECIPES_FILE);
        if (isset($comment['recipe_id'])) {
            foreach ($recipes as $recipe) {
                if ($recipe['id'] === $comment['recipe_id']) {
                    $comment['recipe_title'] = $recipe['title'];
                    break;
                }
            }
            
            if (!isset($comment['recipe_title'])) {
                $comment['recipe_title'] = 'Unknown Recipe';
            }
        } else {
            $comment['recipe_title'] = 'Unknown Recipe';
        }
        
        sendResponse(['success' => true, 'data' => $comment]);
    } else {
        sendResponse(['success' => false, 'error' => 'Comment not found'], 404);
    }
}

function handleUpdateComment() {
    global $requestData;
    
    // Get data from either POST or JSON body
    $id = '';
    $author = '';
    $email = '';
    $content = '';
    $status = 'pending';
    
    if (!empty($_POST)) {
        $id = $_POST['id'] ?? '';
        $author = $_POST['author'] ?? '';
        $email = $_POST['email'] ?? '';
        $content = $_POST['content'] ?? '';
        $status = $_POST['status'] ?? 'pending';
    } else if (!empty($requestData)) {
        $id = $requestData['id'] ?? '';
        $author = $requestData['author'] ?? '';
        $email = $requestData['email'] ?? '';
        $content = $requestData['content'] ?? '';
        $status = $requestData['status'] ?? 'pending';
    }
    
    if (empty($id) || empty($content)) {
        sendResponse(['success' => false, 'error' => 'Comment ID and content are required'], 400);
        return;
    }
    
    // Load comments
    $comments = loadData(COMMENTS_FILE);
    
    // Find comment
    $commentIndex = -1;
    foreach ($comments as $index => $comment) {
        if ($comment['id'] === $id) {
            $commentIndex = $index;
            break;
        }
    }
    
    if ($commentIndex === -1) {
        sendResponse(['success' => false, 'error' => 'Comment not found'], 404);
        return;
    }
    
    // Update comment
    $comments[$commentIndex]['author'] = $author;
    $comments[$commentIndex]['email'] = $email;
    $comments[$commentIndex]['content'] = $content;
    $comments[$commentIndex]['status'] = $status;
    $comments[$commentIndex]['updated_at'] = date('Y-m-d H:i:s');
    
    // Save comments
    if (saveData(COMMENTS_FILE, $comments)) {
        sendResponse(['success' => true, 'message' => 'Comment updated successfully', 'data' => $comments[$commentIndex]]);
    } else {
        sendResponse(['success' => false, 'error' => 'Failed to update comment'], 500);
    }
}

function handleDeleteComment() {
    global $requestData;
    
    // Get ID from either JSON body or query params
    $commentId = '';
    if (isset($requestData['id'])) {
        $commentId = $requestData['id'];
    } else if (isset($_GET['id'])) {
        $commentId = $_GET['id'];
    }
    
    if (empty($commentId)) {
        sendResponse(['success' => false, 'error' => 'Comment ID is required'], 400);
        return;
    }
    
    // Load comments
    $comments = loadData(COMMENTS_FILE);
    
    // Find comment
    $commentIndex = -1;
    foreach ($comments as $index => $comment) {
        if ($comment['id'] === $commentId) {
            $commentIndex = $index;
            break;
        }
    }
    
    if ($commentIndex === -1) {
        sendResponse(['success' => false, 'error' => 'Comment not found'], 404);
        return;
    }
    
    // Remove comment
    array_splice($comments, $commentIndex, 1);
    
    // Save comments
    if (saveData(COMMENTS_FILE, $comments)) {
        sendResponse(['success' => true, 'message' => 'Comment deleted successfully']);
    } else {
        sendResponse(['success' => false, 'error' => 'Failed to delete comment'], 500);
    }
}

/**
 * About Page Handlers
 */
function handleGetAbout() {
    // Load about page data
    $about = loadData(ABOUT_FILE);
    
    if (!$about) {
        // Return empty data if not found
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
            ],
            'updated_at' => ''
        ];
    }
    
    sendResponse(['success' => true, 'data' => $about]);
}

function handleUpdateAbout() {
    global $requestData;
    
    // Get data from POST or GET
    if (!empty($_POST)) {
        $title = $_POST['title'] ?? '';
        $subtitle = $_POST['subtitle'] ?? '';
        $intro = $_POST['intro'] ?? '';
        $sectionTitles = $_POST['section_titles'] ?? [];
        $sectionContents = $_POST['section_contents'] ?? [];
        $email = $_POST['email'] ?? '';
        $facebookUrl = $_POST['facebook_url'] ?? '';
        $instagramUrl = $_POST['instagram_url'] ?? '';
        $pinterestUrl = $_POST['pinterest_url'] ?? '';
    } else {
        $title = $_GET['title'] ?? '';
        $subtitle = $_GET['subtitle'] ?? '';
        $intro = $_GET['intro'] ?? '';
        $sectionTitles = $_GET['section_titles'] ?? [];
        $sectionContents = $_GET['section_contents'] ?? [];
        $email = $_GET['email'] ?? '';
        $facebookUrl = $_GET['facebook_url'] ?? '';
        $instagramUrl = $_GET['instagram_url'] ?? '';
        $pinterestUrl = $_GET['pinterest_url'] ?? '';
    }
    
    // Load existing about data
    $about = loadData(ABOUT_FILE);
    
    if (!$about) {
        $about = [];
    }
    
    // Handle image upload
    $image = $about['image'] ?? '';
    if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
        $newImage = handleImageUpload($_FILES['image'], 'about');
        if ($newImage) {
            // Delete old image if it exists
            if (!empty($image)) {
                $oldImagePath = UPLOADS_DIR . '/about/' . $image;
                if (file_exists($oldImagePath)) {
                    unlink($oldImagePath);
                }
            }
            $image = $newImage;
        }
    }
    
    // Create sections array
    $sections = [];
    for ($i = 0; $i < count($sectionTitles); $i++) {
        if (!empty($sectionTitles[$i])) {
            $sections[] = [
                'title' => $sectionTitles[$i],
                'content' => isset($sectionContents[$i]) ? $sectionContents[$i] : ''
            ];
        }
    }
    
    // Update about data
    $about = [
        'title' => $title,
        'subtitle' => $subtitle,
        'image' => $image,
        'intro' => $intro,
        'sections' => $sections,
        'email' => $email,
        'social' => [
            'facebook' => $facebookUrl,
            'instagram' => $instagramUrl,
            'pinterest' => $pinterestUrl
        ],
        'updated_at' => date('Y-m-d H:i:s')
    ];
    
    // Save about data
    if (saveData(ABOUT_FILE, $about)) {
        sendResponse(['success' => true, 'message' => 'About page updated successfully', 'data' => $about]);
    } else {
        sendResponse(['success' => false, 'error' => 'Failed to update about page'], 500);
    }
}

/**
 * Media Handlers
 */
function handleGetMedia() {
    // Get files from uploads directory
    $mediaFiles = [];
    $type = isset($_GET['type']) ? $_GET['type'] : 'all';
    
    // Base uploads directory
    $uploadsDir = UPLOADS_DIR;
    
    // Directories to scan based on type
    $dirsToScan = [];
    
    if ($type === 'all') {
        // Scan all directories
        $dirsToScan[] = $uploadsDir;
        
        // Add subdirectories
        $subdirs = glob($uploadsDir . '/*', GLOB_ONLYDIR);
        if ($subdirs) {
            $dirsToScan = array_merge($dirsToScan, $subdirs);
        }
    } elseif ($type === 'recipe') {
        // Scan recipes directory
        $recipesDir = $uploadsDir . '/recipes';
        if (is_dir($recipesDir)) {
            $dirsToScan[] = $recipesDir;
        }
    } elseif ($type === 'gallery') {
        // Scan gallery directory
        $galleryDir = $uploadsDir . '/gallery';
        if (is_dir($galleryDir)) {
            $dirsToScan[] = $galleryDir;
        }
    } else {
        sendResponse(['success' => false, 'error' => 'Invalid media type'], 400);
        return;
    }
    
    // Scan directories
    foreach ($dirsToScan as $dir) {
        $files = glob($dir . '/*.{jpg,jpeg,png,gif}', GLOB_BRACE);
        if ($files) {
            foreach ($files as $file) {
                $fileInfo = pathinfo($file);
                $mediaFiles[] = [
                    'id' => basename($file),
                    'name' => $fileInfo['basename'],
                    'path' => str_replace(SITE_ROOT, '', $file),
                    'type' => $fileInfo['extension'],
                    'size' => filesize($file),
                    'created_at' => date('Y-m-d H:i:s', filectime($file))
                ];
            }
        }
    }
    
    // Sort by date
    usort($mediaFiles, function($a, $b) {
        $dateA = strtotime($a['created_at']);
        $dateB = strtotime($b['created_at']);
        return $dateB - $dateA;
    });
    
    // Pagination
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $perPage = isset($_GET['per_page']) ? intval($_GET['per_page']) : 18;
    $totalFiles = count($mediaFiles);
    $totalPages = ceil($totalFiles / $perPage);
    $offset = ($page - 1) * $perPage;
    $mediaFiles = array_slice($mediaFiles, $offset, $perPage);
    
    sendResponse([
        'success' => true,
        'data' => $mediaFiles,
        'meta' => [
            'page' => $page,
            'per_page' => $perPage,
            'total' => $totalFiles,
            'pages' => $totalPages
        ]
    ]);
}

function handleUploadMedia() {
    // Check if files are uploaded
    if (!isset($_FILES['files'])) {
        sendResponse(['success' => false, 'error' => 'No files uploaded'], 400);
        return;
    }
    
    // Get upload type
    $type = isset($_POST['type']) ? $_POST['type'] : 'gallery';
    
    // Upload directory
    $uploadDir = UPLOADS_DIR . '/' . $type;
    
    // Create directory if it doesn't exist
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // Handle multiple files
    $uploadedFiles = [];
    $errors = [];
    
    foreach ($_FILES['files']['name'] as $key => $name) {
        // Check for errors
        if ($_FILES['files']['error'][$key] !== 0) {
            $errors[] = "Error uploading file: $name";
            continue;
        }
        
        // Check file type
        $fileType = $_FILES['files']['type'][$key];
        if (!in_array($fileType, ['image/jpeg', 'image/png', 'image/gif'])) {
            $errors[] = "Invalid file type: $name";
            continue;
        }
        
        // Generate unique filename
        $extension = pathinfo($name, PATHINFO_EXTENSION);
        $filename = uniqid() . '.' . $extension;
        $filePath = $uploadDir . '/' . $filename;
        
        // Move file
        if (move_uploaded_file($_FILES['files']['tmp_name'][$key], $filePath)) {
            $uploadedFiles[] = [
                'name' => $name,
                'path' => str_replace(SITE_ROOT, '', $filePath),
                'size' => $_FILES['files']['size'][$key],
                'type' => $fileType
            ];
        } else {
            $errors[] = "Failed to move uploaded file: $name";
        }
    }
    
    // Check if any files were uploaded
    if (empty($uploadedFiles)) {
        sendResponse(['success' => false, 'error' => 'No files were uploaded', 'errors' => $errors], 400);
    } else {
        sendResponse(['success' => true, 'message' => 'Files uploaded successfully', 'data' => $uploadedFiles, 'errors' => $errors]);
    }
}

function handleDeleteMedia() {
    global $requestData;
    
    // Get filename from either JSON body or query params
    $filename = '';
    if (isset($requestData['filename'])) {
        $filename = $requestData['filename'];
    } else if (isset($_GET['filename'])) {
        $filename = $_GET['filename'];
    }
    
    if (empty($filename)) {
        sendResponse(['success' => false, 'error' => 'Filename is required'], 400);
        return;
    }
    
    // Check if file exists
    $filePath = UPLOADS_DIR . '/' . $filename;
    if (!file_exists($filePath)) {
        // Check in subdirectories
        $found = false;
        $subdirs = glob(UPLOADS_DIR . '/*', GLOB_ONLYDIR);
        if ($subdirs) {
            foreach ($subdirs as $dir) {
                $subFilePath = $dir . '/' . $filename;
                if (file_exists($subFilePath)) {
                    $filePath = $subFilePath;
                    $found = true;
                    break;
                }
            }
        }
        
        if (!$found) {
            sendResponse(['success' => false, 'error' => 'File not found'], 404);
            return;
        }
    }
    
    // Delete file
    if (unlink($filePath)) {
        sendResponse(['success' => true, 'message' => 'File deleted successfully']);
    } else {
        sendResponse(['success' => false, 'error' => 'Failed to delete file'], 500);
    }
}

function handleDashboardStats() {
    // Load data
    $recipes = loadData(RECIPES_FILE);
    $comments = loadData(COMMENTS_FILE);
    
    // Calculate stats
    $stats = [
        'recipes' => [
            'total' => count($recipes),
            'published' => count(array_filter($recipes, function($recipe) {
                return isset($recipe['status']) && $recipe['status'] === 'published';
            })),
            'draft' => count(array_filter($recipes, function($recipe) {
                return !isset($recipe['status']) || $recipe['status'] === 'draft';
            }))
        ],
        'comments' => [
            'total' => count($comments),
            'approved' => count(array_filter($comments, function($comment) {
                return isset($comment['status']) && $comment['status'] === 'approved';
            })),
            'pending' => count(array_filter($comments, function($comment) {
                return !isset($comment['status']) || $comment['status'] === 'pending';
            })),
            'spam' => count(array_filter($comments, function($comment) {
                return isset($comment['status']) && $comment['status'] === 'spam';
            }))
        ],
        'media' => [
            'total' => countMediaFiles()
        ]
    ];
    
    // Get recent recipes
    usort($recipes, function($a, $b) {
        $dateA = isset($a['created_at']) ? strtotime($a['created_at']) : 0;
        $dateB = isset($b['created_at']) ? strtotime($b['created_at']) : 0;
        return $dateB - $dateA;
    });
    $recentRecipes = array_slice($recipes, 0, 5);
    
    // Get recent comments
    usort($comments, function($a, $b) {
        $dateA = isset($a['created_at']) ? strtotime($a['created_at']) : 0;
        $dateB = isset($b['created_at']) ? strtotime($b['created_at']) : 0;
        return $dateB - $dateA;
    });
    $recentComments = array_slice($comments, 0, 5);
    
    // Add recipe titles to comments
    foreach ($recentComments as &$comment) {
        if (isset($comment['recipe_id'])) {
            foreach ($recipes as $recipe) {
                if ($recipe['id'] === $comment['recipe_id']) {
                    $comment['recipe_title'] = $recipe['title'];
                    break;
                }
            }
            
            if (!isset($comment['recipe_title'])) {
                $comment['recipe_title'] = 'Unknown Recipe';
            }
        } else {
            $comment['recipe_title'] = 'Unknown Recipe';
        }
    }
    
    sendResponse([
        'success' => true,
        'data' => [
            'recipes' => $stats['recipes'],
            'comments' => $stats['comments'],
            'media' => $stats['media'],
            'recent_recipes' => $recentRecipes,
            'recent_comments' => $recentComments
        ]
    ]);
}

/**
 * Helper Functions
 */

// Function to check if user is logged in
function isLoggedIn() {
    return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
}

// Function to load data from a JSON file
function loadData($filePath) {
    if (file_exists($filePath)) {
        $json = file_get_contents($filePath);
        return json_decode($json, true) ?: [];
    }
    return [];
}

// Function to save data to a JSON file
function saveData($filePath, $data) {
    // Ensure the directory exists
    $dir = dirname($filePath);
    if (!file_exists($dir)) {
        mkdir($dir, 0755, true);
    }
    
    $json = json_encode($data, JSON_PRETTY_PRINT);
    return file_put_contents($filePath, $json, LOCK_EX) !== false;
}

// Function to generate a unique ID
function generateId() {
    return uniqid() . '-' . bin2hex(random_bytes(4));
}

// Function to handle image upload
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

// Function to count media files
function countMediaFiles() {
    $count = 0;
    
    // Count files in the uploads directory
    $files = glob(UPLOADS_DIR . '/*.{jpg,jpeg,png,gif}', GLOB_BRACE);
    if ($files) {
        $count += count($files);
    }
    
    // Count files in subdirectories
    $subdirs = glob(UPLOADS_DIR . '/*', GLOB_ONLYDIR);
    if ($subdirs) {
        foreach ($subdirs as $dir) {
            $subfiles = glob($dir . '/*.{jpg,jpeg,png,gif}', GLOB_BRACE);
            if ($subfiles) {
                $count += count($subfiles);
            }
        }
    }
    
    return $count;
}

// Function to send JSON response
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}
?>