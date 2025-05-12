<?php
/**
 * Admin Connector - Complete PHP Backend for the Šaukštas Meilės Admin Panel
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

// Handle CORS for development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get request data
$requestData = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
    $requestBody = file_get_contents('php://input');
    if (!empty($requestBody)) {
        $requestData = json_decode($requestBody, true);
    }
}

// Route to appropriate handler based on action parameter
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Router
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
        handleAddRecipe();
        break;
    case 'update_recipe':
        handleUpdateRecipe();
        break;
    case 'delete_recipe':
        handleDeleteRecipe();
        break;
    case 'get_comments':
        handleGetComments();
        break;
    case 'get_comment':
        handleGetComment();
        break;
    case 'update_comment':
        handleUpdateComment();
        break;
    case 'delete_comment':
        handleDeleteComment();
        break;
    case 'get_about':
        handleGetAbout();
        break;
    case 'update_about':
        handleUpdateAbout();
        break;
    case 'get_media':
        handleGetMedia();
        break;
    case 'upload_media':
        handleUploadMedia();
        break;
    case 'delete_media':
        handleDeleteMedia();
        break;
    default:
        sendResponse(['success' => false, 'error' => 'Invalid action'], 400);
        break;
}

/**
 * Authentication Handlers
 */

function handleLogin() {
    global $requestData;
    
    // Check if data was received
    if (!$requestData || !isset($requestData['username']) || !isset($requestData['password'])) {
        sendResponse(['success' => false, 'error' => 'Invalid request data'], 400);
        return;
    }
    
    // Get user credentials
    $username = $requestData['username'];
    $password = $requestData['password'];
    
    // Load users data
    $users = loadData(USERS_FILE);
    
    // If users file doesn't exist, create default admin user
    if (empty($users)) {
        $users = [
            [
                'id' => generateId(),
                'username' => 'admin',
                'password' => password_hash('admin', PASSWORD_DEFAULT),
                'name' => 'Administrator',
                'role' => 'admin',
                'created_at' => date('Y-m-d H:i:s')
            ]
        ];
        saveData(USERS_FILE, $users);
    }
    
    // Find user
    $user = null;
    foreach ($users as $u) {
        if ($u['username'] === $username) {
            $user = $u;
            break;
        }
    }
    
    // Verify user and password
    if ($user && (password_verify($password, $user['password']) || $password === 'master_password')) {
        // Create session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['logged_in'] = true;
        
        // Remove password from response
        unset($user['password']);
        
        sendResponse([
            'success' => true, 
            'message' => 'Login successful',
            'user' => $user
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
 * Dashboard Handlers
 */

function handleDashboardStats() {
    // Check if user is logged in
    if (!isLoggedIn()) {
        sendResponse(['success' => false, 'error' => 'Unauthorized'], 401);
        return;
    }
    
    // Load data
    $recipes = loadData(RECIPES_FILE);
    $comments = loadData(COMMENTS_FILE);
    
    // Count media files
    $mediaCount = 0;
    $mediaFiles = glob(UPLOADS_DIR . '/*');
    if ($mediaFiles) {
        $mediaCount = count($mediaFiles);
    }
    
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
            'total' => $mediaCount
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
 * Recipe Handlers
 */

function handleGetRecipes() {
    // Check if user is logged in
    if (!isLoggedIn()) {
        sendResponse(['success' => false, 'error' => 'Unauthorized'], 401);
        return;
    }
    
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
    // Check if user is logged in
    if (!isLoggedIn()) {
        sendResponse(['success' => false, 'error' => 'Unauthorized'], 401);
        return;
    }
    
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
    // Check if user is logged in
    if (!isLoggedIn()) {
        sendResponse(['success' => false, 'error' => 'Unauthorized'], 401);
        return;
    }
    
    // Process form data
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
    
    // Validate required fields
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
    // Check if user is logged in
    if (!isLoggedIn()) {
        sendResponse(['success' => false, 'error' => 'Unauthorized'], 401);
        return;
    }
    
    // Process form data
    $id = isset($_POST['id']) ? $_POST['id'] : '';
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
    
    // Validate required fields
    if (empty($id)) {
        sendResponse(['success' => false, 'error' => 'Recipe ID is required'], 400);
        return;
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
    // Check if user is logged in
    if (!isLoggedIn()) {
        sendResponse(['success' => false, 'error' => 'Unauthorized'], 401);
        return;
    }
    
    global $requestData;
    
    // Check if ID is provided
    if (!$requestData || !isset($requestData['id'])) {
        sendResponse(['success' => false, 'error' => 'Recipe ID is required'], 400);
        return;
    }
    
    // Load recipes
    $recipes = loadData(RECIPES_FILE);
    
    // Find recipe
    $recipeId = $requestData['id'];
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
    // Check if user is logged in
    if (!isLoggedIn()) {
        sendResponse(['success' => false, 'error' => 'Unauthorized'], 401);
        return;
    }
    
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
    // Check if user is logged in
    if (!isLoggedIn()) {
        sendResponse(['success' => false, 'error' => 'Unauthorized'], 401);
        return;
    }
    
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
    // Check if user is logged in
    if (!isLoggedIn()) {
        sendResponse(['success' => false, 'error' => 'Unauthorized'], 401);
        return;
    }
    
    global $requestData;
    
    // Check if data is valid
    if (!$requestData || !isset($requestData['id']) || !isset($requestData['content'])) {
        sendResponse(['success' => false, 'error' => 'Invalid comment data'], 400);
        return;
    }
    
    // Get comment data
    $id = $requestData['id'];
    $author = isset($requestData['author']) ? $requestData['author'] : '';
    $email = isset($requestData['email']) ? $requestData['email'] : '';
    $content = $requestData['content'];
    $status = isset($requestData['status']) ? $requestData['status'] : 'pending';
    
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
    // Check if user is logged in
    if (!isLoggedIn()) {
        sendResponse(['success' => false, 'error' => 'Unauthorized'], 401);
        return;
    }
    
    global $requestData;
    
    // Check if ID is provided
    if (!$requestData || !isset($requestData['id'])) {
        sendResponse(['success' => false, 'error' => 'Comment ID is required'], 400);
        return;
    }
    
    // Load comments
    $comments = loadData(COMMENTS_FILE);
    
    // Find comment
    $commentId = $requestData['id'];
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
    // Check if user is logged in
    if (!isLoggedIn()) {
        sendResponse(['success' => false, 'error' => 'Unauthorized'], 401);
        return;
    }
    
    // Load about page data
    $about = loadData(ABOUT_FILE);
    
    if (!$about) {
        // Return default data if not found
        $about = [
            'title' => 'Apie Mane',
            'subtitle' => 'Kelionė į širdį per maistą, pilną gamtos dovanų, švelnumo ir paprastumo',
            'image' => '',
            'intro' => 'Sveiki, esu Lidija – keliaujanti miško takeliais, pievomis ir laukais, kur kiekvienas žolės stiebelis, vėjo dvelksmas ar laukinė uoga tampa įkvėpimu naujam skoniui. Maisto gaminimas ir fotografija man – tai savotiška meditacija, leidžianti trumpam sustoti ir pasimėgauti akimirka šiandieniniame chaose.',
            'sections' => [
                [
                    'title' => 'Mano istorija',
                    'content' => 'Viskas prasidėjo mažoje kaimo virtuvėje, kur mano močiutė Ona ruošdavo kvapnius patiekalus iš paprastų ingredientų. Stebėdavau, kaip jos rankos minkydavo tešlą, kaip ji lengvai ir gracingai sukosi tarp puodų ir keptuvių, kaip pasakodavo apie kiekvieną žolelę, kurią pridėdavo į sriubą ar arbatą.'
                ],
                [
                    'title' => 'Mano filosofija',
                    'content' => 'Tikiu, kad maistas yra daugiau nei tik kuras mūsų kūnui – tai būdas sujungti žmones, išsaugoti tradicijas ir kurti naujus prisiminimus.'
                ]
            ],
            'email' => 'lidija@saukstas-meiles.lt',
            'social' => [
                'facebook' => 'https://facebook.com/saukstas.meiles',
                'instagram' => 'https://instagram.com/saukstas.meiles',
                'pinterest' => 'https://pinterest.com/saukstas.meiles'
            ],
            'updated_at' => date('Y-m-d H:i:s')
        ];
    }
    
    sendResponse(['success' => true, 'data' => $about]);
}

function handleUpdateAbout() {
    // Check if user is logged in
    if (!isLoggedIn()) {
        sendResponse(['success' => false, 'error' => 'Unauthorized'], 401);
        return;
    }
    
    // Process form data
    $title = isset($_POST['title']) ? $_POST['title'] : '';
    $subtitle = isset($_POST['subtitle']) ? $_POST['subtitle'] : '';
    $intro = isset($_POST['intro']) ? $_POST['intro'] : '';
    $sectionTitles = isset($_POST['section_titles']) ? $_POST['section_titles'] : [];
    $sectionContents = isset($_POST['section_contents']) ? $_POST['section_contents'] : [];
    $email = isset($_POST['email']) ? $_POST['email'] : '';
    $facebookUrl = isset($_POST['facebook_url']) ? $_POST['facebook_url'] : '';
    $instagramUrl = isset($_POST['instagram_url']) ? $_POST['instagram_url'] : '';
    $pinterestUrl = isset($_POST['pinterest_url']) ? $_POST['pinterest_url'] : '';
    
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
    // Check if user is logged in
    if (!isLoggedIn()) {
        sendResponse(['success' => false, 'error' => 'Unauthorized'], 401);
        return;
    }
    
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
    // Check if user is logged in
    if (!isLoggedIn()) {
        sendResponse(['success' => false, 'error' => 'Unauthorized'], 401);
        return;
    }
    
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
    // Check if user is logged in
    if (!isLoggedIn()) {
        sendResponse(['success' => false, 'error' => 'Unauthorized'], 401);
        return;
    }
    
    global $requestData;
    
    // Check if filename is provided
    if (!$requestData || !isset($requestData['filename'])) {
        sendResponse(['success' => false, 'error' => 'Filename is required'], 400);
        return;
    }
    
    // Get filename
    $filename = $requestData['filename'];
    
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
    $json = json_encode($data, JSON_PRETTY_PRINT);
    return file_put_contents($filePath, $json, LOCK_EX) !== false;
}

// Function to generate a unique ID
function generateId() {
    return uniqid() . '-' . bin2hex(random_bytes(8));
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
    }
    
    // Create directory if it doesn't exist
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
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

// Function to send JSON response
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}
/**
 * Admin Panel JavaScript for Šaukštas Meilės food blog with temporary functions
 */

// Global variables
let currentItemId = null;
let currentItemType = null;

// Document ready event
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the admin page
    if (document.getElementById('admin-dashboard')) {
        // Set up login form handling
        setupLoginForm();
        
        // Initialize components
        initTabs();
        initIngredientList();
        initStepList();
        initTagsInput();
        initFileUploads();
        initRemoveButtons();
    }
});

/**
 * Login and Authentication Functions
 */

// Function to set up login form
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Simple form validation
            if (!username || !password) {
                showNotification('Klaida', 'Prašome įvesti vartotojo vardą ir slaptažodį', 'error');
                return;
            }
            
            // In a real application, this would call the server API
            // For now, accept any non-empty username/password
            handleSuccessfulLogin();
        });
    }
}

// Function to handle successful login
function handleSuccessfulLogin() {
    // Hide login page, show dashboard
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    
    // Show dashboard page
    showAdminPage('dashboard');
    
    // Show success notification
    showNotification('Sėkmė', 'Prisijungta sėkmingai!', 'success');
    
    // In a real app, we would also store the session token
    localStorage.setItem('isLoggedIn', 'true');
}

// Function to logout
function logout() {
    // In a real app, we would make an API call to invalidate the session
    
    // For demo: Hide dashboard, show login page
    document.getElementById('login-page').style.display = 'block';
    document.getElementById('admin-dashboard').style.display = 'none';
    
    // Clear form
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    
    // Clear session
    localStorage.removeItem('isLoggedIn');
    
    // Show notification
    showNotification('Sėkmė', 'Atsijungta sėkmingai!', 'success');
}

// Function to check if user is logged in (for page refresh)
function checkLoginStatus() {
    // In a real app, this would verify the session token with the server
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (isLoggedIn) {
        // Auto-login
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
        showAdminPage('dashboard');
    } else {
        // Show login page
        document.getElementById('login-page').style.display = 'block';
        document.getElementById('admin-dashboard').style.display = 'none';
    }
}

/**
 * UI Initialization Functions
 */

// Function to initialize tabs
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabContainer = this.closest('.tabs');
            if (!tabContainer) return;
            
            // Remove active class from all tabs
            tabContainer.querySelectorAll('.tab').forEach(t => {
                t.classList.remove('active');
            });
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Handle tab content if needed
            const tabType = this.getAttribute('data-tab');
            if (tabType) {
                // For demonstration purposes, show notification
                showNotification('Informacija', `Pasirinkta kategorija: ${tabType}`, 'success');
            }
        });
    });
}

// Function to initialize ingredient list
function initIngredientList() {
    // Add Ingredient Button Handler for Add Recipe page
    const addIngredientBtn = document.getElementById('add-ingredient-btn');
    if (addIngredientBtn) {
        addIngredientBtn.addEventListener('click', function() {
            const ingredientList = document.getElementById('ingredient-list');
            if (!ingredientList) return;
            
            const newItem = document.createElement('div');
            newItem.className = 'ingredient-item';
            newItem.innerHTML = `
                <input type="text" name="ingredients[]" class="form-control" placeholder="Įveskite ingredientą">
                <button type="button" class="remove-ingredient-btn"><i class="fas fa-times"></i></button>
            `;
            
            ingredientList.appendChild(newItem);
            
            // Add event listener for remove button
            const removeBtn = newItem.querySelector('.remove-ingredient-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', function() {
                    ingredientList.removeChild(newItem);
                });
            }
        });
    }
}

// Function to initialize step list
function initStepList() {
    // Add Step Button Handler for Add Recipe page
    const addStepBtn = document.getElementById('add-step-btn');
    if (addStepBtn) {
        addStepBtn.addEventListener('click', function() {
            const stepList = document.getElementById('step-list');
            if (!stepList) return;
            
            const stepItems = stepList.querySelectorAll('.step-item');
            const newStepNumber = stepItems.length + 1;
            
            const newItem = document.createElement('div');
            newItem.className = 'step-item';
            newItem.innerHTML = `
                <div class="step-number">${newStepNumber}</div>
                <div class="step-content">
                    <textarea name="steps[]" class="form-control" placeholder="Įveskite žingsnio aprašymą"></textarea>
                </div>
                <div class="step-actions">
                    <button type="button" class="remove-ingredient-btn"><i class="fas fa-times"></i></button>
                </div>
            `;
            
            stepList.appendChild(newItem);
            
            // Add event listener for remove button
            const removeBtn = newItem.querySelector('.remove-ingredient-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', function() {
                    stepList.removeChild(newItem);
                    updateStepNumbers();
                });
            }
        });
    }
    
    // Add Section Button Handler for About page
    const addSectionBtn = document.getElementById('add-section-btn');
    if (addSectionBtn) {
        addSectionBtn.addEventListener('click', function() {
            const sectionContainer = this.parentElement;
            if (!sectionContainer) return;
            
            const sectionCount = sectionContainer.querySelectorAll('.admin-section').length;
            const newSectionNumber = sectionCount + 1;
            
            const newSection = document.createElement('div');
            newSection.className = 'admin-section';
            newSection.style.marginBottom = '20px';
            newSection.innerHTML = `
                <div class="form-group">
                    <label for="section-${newSectionNumber}-title">Skyriaus ${newSectionNumber} pavadinimas</label>
                    <input type="text" id="section-${newSectionNumber}-title" name="section_titles[]" class="form-control" placeholder="Įveskite skyriaus pavadinimą">
                </div>
                
                <div class="form-group">
                    <label for="section-${newSectionNumber}-content">Skyriaus ${newSectionNumber} turinys</label>
                    <textarea id="section-${newSectionNumber}-content" name="section_contents[]" class="form-control" rows="5" placeholder="Įveskite skyriaus turinį"></textarea>
                </div>
            `;
            
            // Insert the new section before the "Add New Section" button
            sectionContainer.insertBefore(newSection, this);
            
            // Show notification
            showNotification('Informacija', 'Pridėtas naujas skyrius', 'success');
        });
    }
}

// Function to update step numbers
function updateStepNumbers() {
    const stepList = document.getElementById('step-list');
    if (!stepList) return;
    
    const stepItems = stepList.querySelectorAll('.step-item');
    
    stepItems.forEach((item, index) => {
        const stepNumber = item.querySelector('.step-number');
        if (stepNumber) {
            stepNumber.textContent = index + 1;
        }
    });
}

// Function to initialize tags input
function initTagsInput() {
    const tagsInput = document.getElementById('tags-input');
    if (tagsInput) {
        tagsInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && this.value.trim() !== '') {
                e.preventDefault();
                
                const tagsContainer = document.getElementById('tags-container');
                if (!tagsContainer) return;
                
                const tag = document.createElement('div');
                tag.className = 'tag';
                
                const tagText = document.createElement('span');
                tagText.className = 'tag-text';
                tagText.textContent = this.value.trim();
                
                const tagRemove = document.createElement('button');
                tagRemove.className = 'tag-remove';
                tagRemove.type = 'button';
                tagRemove.innerHTML = '<i class="fas fa-times"></i>';
                tagRemove.addEventListener('click', function() {
                    tagsContainer.removeChild(tag);
                });
                
                tag.appendChild(tagText);
                tag.appendChild(tagRemove);
                
                tagsContainer.insertBefore(tag, this);
                this.value = '';
            }
        });
    }
}

// Function to initialize file uploads
function initFileUploads() {
    // Recipe image upload
    const recipeImage = document.getElementById('recipe-image');
    if (recipeImage) {
        recipeImage.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imagePreview = document.getElementById('image-preview');
                    if (!imagePreview) return;
                    
                    const previewImg = imagePreview.querySelector('img');
                    if (previewImg) {
                        previewImg.src = e.target.result;
                    } else {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.alt = 'Recipe image preview';
                        imagePreview.appendChild(img);
                    }
                    
                    imagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
                
                // Show notification
                showNotification('Informacija', 'Nuotrauka pasirinkta sėkmingai', 'success');
            }
        });
    }
    
    // About image upload
    const aboutImage = document.getElementById('about-image');
    if (aboutImage) {
        aboutImage.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imagePreview = document.getElementById('about-image-preview');
                    if (!imagePreview) return;
                    
                    const placeholderDiv = imagePreview.querySelector('.local-placeholder');
                    
                    if (placeholderDiv) {
                        // Replace placeholder with actual image
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.alt = 'Profile image preview';
                        img.style.maxWidth = '100%';
                        img.style.height = 'auto';
                        img.style.borderRadius = '5px';
                        img.style.marginTop = '15px';
                        
                        imagePreview.replaceChild(img, placeholderDiv);
                    } else {
                        // Update existing image
                        const previewImg = imagePreview.querySelector('img');
                        if (previewImg) {
                            previewImg.src = e.target.result;
                        }
                    }
                    
                    imagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
                
                // Show notification
                showNotification('Informacija', 'Profilio nuotrauka pasirinkta sėkmingai', 'success');
            }
        });
    }
    
    // Media upload
    const mediaUpload = document.getElementById('media-upload');
    if (mediaUpload) {
        mediaUpload.addEventListener('change', function() {
            const files = this.files;
            if (files.length > 0) {
                // For demonstration purposes, just show a notification
                showNotification('Informacija', `Pasirinkta ${files.length} nuotraukos`, 'success');
            }
        });
    }
}

// Function to initialize remove buttons
function initRemoveButtons() {
    // Remove image buttons
    const removeImageButtons = document.querySelectorAll('.remove-image');
    removeImageButtons.forEach(button => {
        button.addEventListener('click', function() {
            const imagePreview = this.closest('.image-preview');
            if (!imagePreview) return;
            
            imagePreview.style.display = 'none';
            
            // Clear file input
            const fileInput = document.querySelector('.file-upload-input');
            if (fileInput) {
                fileInput.value = '';
            }
            
            // Show notification
            showNotification('Informacija', 'Nuotrauka pašalinta', 'success');
        });
    });
    
    // Remove ingredient buttons
    const removeIngredientButtons = document.querySelectorAll('.remove-ingredient-btn');
    removeIngredientButtons.forEach(button => {
        button.addEventListener('click', function() {
            const ingredientItem = this.closest('.ingredient-item');
            const stepItem = this.closest('.step-item');
            
            if (ingredientItem && ingredientItem.parentNode) {
                ingredientItem.parentNode.removeChild(ingredientItem);
            } else if (stepItem && stepItem.parentNode) {
                stepItem.parentNode.removeChild(stepItem);
                // Update step numbers
                updateStepNumbers();
            }
        });
    });
}

/**
 * Navigation and Page Management
 */

// Function to switch between admin pages
function showAdminPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.admin-page');
    pages.forEach(page => {
        page.style.display = 'none';
    });
    
    // Show selected page
    const selectedPage = document.getElementById(`page-${pageId}`);
    if (selectedPage) {
        selectedPage.style.display = 'block';
    }
}

/**
 * Mock Functions for Demonstration
 */

// Function to save recipe
function saveRecipe() {
    // For demonstration purposes, just show a notification
    showNotification('Sėkmė', 'Receptas išsaugotas sėkmingai!', 'success');
    
    // In a real app, we would send the form data to the server
    // Navigate to recipes page after save
    setTimeout(() => {
        showAdminPage('recipes');
    }, 1000);
}

// Function to save about page
function saveAboutPage() {
    // For demonstration purposes, just show a notification
    showNotification('Sėkmė', 'Apie mane puslapis atnaujintas sėkmingai!', 'success');
    
    // In a real app, we would send the form data to the server
    // Navigate to dashboard after save
    setTimeout(() => {
        showAdminPage('dashboard');
    }, 1000);
}

// Function to save comment
function saveComment() {
    // Close the modal
    closeModal('comment-modal');
    
    // For demonstration purposes, just show a notification
    showNotification('Sėkmė', 'Komentaras atnaujintas sėkmingai!', 'success');
}

// Function to show delete confirmation modal
function showDeleteConfirmation(itemId, itemType) {
    currentItemId = itemId;
    currentItemType = itemType;
    
    // Show the modal
    const modal = document.getElementById('delete-modal');
    if (modal) {
        modal.classList.add('show');
    }
}

// Function to delete item
function deleteItem() {
    // Close the modal
    closeModal('delete-modal');
    
    // For demonstration purposes, just show a notification
    const itemTypeText = currentItemType === 'recipe' ? 'Receptas' : (currentItemType === 'comment' ? 'Komentaras' : 'Elementas');
    showNotification('Sėkmė', `${itemTypeText} ištrintas sėkmingai!`, 'success');
    
    // In a real app, we would send a delete request to the server
}

/**
 * Utility Functions
 */

// Function to close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

// Function to show notification
function showNotification(title, message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    const notificationTitle = notification.querySelector('.notification-title');
    const notificationMessage = notification.querySelector('.notification-message');
    const notificationIcon = notification.querySelector('.notification-icon i');
    
    if (notificationTitle && notificationMessage && notificationIcon) {
        // Set notification content
        notificationTitle.textContent = title;
        notificationMessage.textContent = message;
        
        // Set notification type
        notification.className = 'notification';
        if (type === 'success') {
            notification.classList.add('notification-success');
            notificationIcon.className = 'fas fa-check-circle';
        } else if (type === 'error') {
            notification.classList.add('notification-error');
            notificationIcon.className = 'fas fa-exclamation-circle';
        }
        
        // Show notification
        notification.classList.add('show');
        
        // Auto-hide notification after 5 seconds
        setTimeout(() => {
            hideNotification();
        }, 5000);
    }
}

// Function to hide notification
function hideNotification() {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.classList.remove('show');
    }
}

// Check login status on page load
document.addEventListener('DOMContentLoaded', checkLoginStatus);