<?php
// API endpoint for recipes
header('Content-Type: application/json');

// Include common functions
require_once __DIR__ . '/../includes/functions.php';

// Get request parameters
$id = isset($_GET['id']) ? $_GET['id'] : null;
$featured = isset($_GET['featured']) ? (bool)$_GET['featured'] : false;
$latest = isset($_GET['latest']) ? (bool)$_GET['latest'] : false;
$popular = isset($_GET['popular']) ? (bool)$_GET['popular'] : false;
$offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 6;

// Load recipes data
$recipes = loadData(RECIPES_FILE);

// Handle specific recipe request
if ($id) {
    $recipe = null;
    foreach ($recipes as $r) {
        if ($r['id'] === $id) {
            $recipe = $r;
            break;
        }
    }
    
    if ($recipe) {
        // Load comments for this recipe
        $comments = loadData(COMMENTS_FILE);
        $recipeComments = array_filter($comments, function($comment) use ($id) {
            return $comment['recipe_id'] === $id && $comment['status'] === 'approved';
        });
        
        // Add comments to recipe
        $recipe['comments'] = array_values($recipeComments);
        
        echo json_encode(['success' => true, 'recipe' => $recipe]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Recipe not found']);
    }
    exit;
}

// Filter recipes based on parameters
$filteredRecipes = $recipes;

// Show only published recipes for public API
$filteredRecipes = array_filter($filteredRecipes, function($recipe) {
    return isset($recipe['status']) && $recipe['status'] === 'published';
});

// Featured recipes
if ($featured) {
    $filteredRecipes = array_filter($filteredRecipes, function($recipe) {
        return isset($recipe['featured']) && $recipe['featured'];
    });
}

// Latest recipes
if ($latest) {
    // Sort by date
    usort($filteredRecipes, function($a, $b) {
        $dateA = isset($a['created_at']) ? strtotime($a['created_at']) : 0;
        $dateB = isset($b['created_at']) ? strtotime($b['created_at']) : 0;
        return $dateB - $dateA;
    });
    
    // Limit to 5 latest recipes
    $limit = 5;
}

// Popular recipes
if ($popular) {
    // Sort by view count or popularity metric
    usort($filteredRecipes, function($a, $b) {
        $viewsA = isset($a['views']) ? (int)$a['views'] : 0;
        $viewsB = isset($b['views']) ? (int)$b['views'] : 0;
        return $viewsB - $viewsA;
    });
    
    // Limit to 3 popular recipes
    $limit = 3;
}

// Apply pagination
$totalRecipes = count($filteredRecipes);
$paginatedRecipes = array_slice($filteredRecipes, $offset, $limit);

// Return recipes
echo json_encode([
    'success' => true,
    'recipes' => $paginatedRecipes,
    'total' => $totalRecipes,
    'hasMore' => ($offset + $limit) < $totalRecipes
]);
?>