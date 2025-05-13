<?php
// API endpoint for categories
header('Content-Type: application/json');

// Include common functions
require_once __DIR__ . '/../includes/functions.php';

// Get request parameters
$name = isset($_GET['name']) ? $_GET['name'] : null;
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$perPage = isset($_GET['per_page']) ? (int)$_GET['per_page'] : 6;

// Load recipes data
$recipes = loadData(RECIPES_FILE);

// Show only published recipes
$publishedRecipes = array_filter($recipes, function($recipe) {
    return isset($recipe['status']) && $recipe['status'] === 'published';
});

// If category name is provided, get recipes for that category
if ($name) {
    // Category descriptions
    $descriptions = [
        'Gėrimai ir kokteiliai' => 'Gardūs, gaivūs ir įdomūs gėrimai bei kokteiliai kiekvienai progai.',
        'Desertai' => 'Saldūs gardumynai, pyragai ir deserai jūsų malonumui.',
        'Sriubos' => 'Šiltos, gaivios ir maistingos sriubos visais metų laikais.',
        'Užkandžiai' => 'Greiti ir skanūs užkandžiai vakarėliams ar kasdieniam malonumui.',
        'Varškė' => 'Įvairūs receptai su varške - nuo desertų iki pagrindinio patiekalo.',
        'Kiaušiniai' => 'Kūrybiški ir gardūs patiekalai, kurių pagrindas - kiaušiniai.',
        'Daržovės' => 'Gardūs ir sveiki daržovių patiekalai visiems metų laikams.',
        'Bulvės' => 'Tradiciniai ir modernūs receptai su bulvėmis - lietuviška klasika.',
        'Mėsa' => 'Gardūs ir sodrūs mėsos patiekalai šventėms ir kasdienai.',
        'Žuvis ir jūros gėrybės' => 'Šviežios žuvies ir jūros gėrybių receptai jūsų stalui.',
        'Kruopos ir grūdai' => 'Maistingi ir skanūs patiekalai iš įvairių kruopų ir grūdų.',
        'Be glitimo' => 'Skanūs receptai tiems, kas vengia glitimo.',
        'Be laktozės' => 'Gardūs patiekalai be laktozės.',
        'Gamta lėkštėje' => 'Receptai su laukiniais augalais ir gamtos dovanomis.',
        'Iš močiutės virtuvės' => 'Tradiciniai lietuviški receptai, perduodami iš kartos į kartą.'
    ];
    
    // Filter recipes by category
    $categoryRecipes = array_filter($publishedRecipes, function($recipe) use ($name) {
        return in_array($name, $recipe['categories']) || in_array($name, $recipe['tags'] ?? []);
    });
    
    // Calculate pagination
    $offset = ($page - 1) * $perPage;
    $totalRecipes = count($categoryRecipes);
    $paginatedRecipes = array_slice($categoryRecipes, $offset, $perPage);
    
    // Return category data with recipes
    echo json_encode([
        'success' => true,
        'name' => $name,
        'title' => $name,
        'description' => $descriptions[$name] ?? "Receptai kategorijoje \"$name\".",
        'recipes' => $paginatedRecipes,
        'total' => $totalRecipes,
        'page' => $page,
        'perPage' => $perPage,
        'hasMore' => ($offset + $perPage) < $totalRecipes
    ]);
} else {
    // Get all categories with counts
    $categories = [];
    $categoryNames = [];
    
    // Extract all unique categories from recipes
    foreach ($publishedRecipes as $recipe) {
        if (isset($recipe['categories']) && is_array($recipe['categories'])) {
            foreach ($recipe['categories'] as $category) {
                if (!in_array($category, $categoryNames)) {
                    $categoryNames[] = $category;
                }
            }
        }
    }
    
    // Sort categories alphabetically
    sort($categoryNames);
    
    // Count recipes in each category
    foreach ($categoryNames as $category) {
        $count = 0;
        foreach ($publishedRecipes as $recipe) {
            if (isset($recipe['categories']) && in_array($category, $recipe['categories'])) {
                $count++;
            }
        }
        
        $categories[] = [
            'name' => $category,
            'count' => $count
        ];
    }
    
    // Return all categories
    echo json_encode([
        'success' => true,
        'categories' => $categories
    ]);
}
?>