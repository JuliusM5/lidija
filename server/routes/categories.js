// server/routes/categories.js - Categories API endpoints

const express = require('express');
const router = express.Router();
const { loadData, RECIPES_FILE } = require('../utils/fileUtil');

/**
 * GET /api/categories
 * Get all categories or recipes for a specific category
 */
router.get('/', (req, res) => {
  const { name, page = 1, per_page = 6 } = req.query;
  
  // Load recipes data
  const recipes = loadData(RECIPES_FILE);
  
  // Show only published recipes
  const publishedRecipes = recipes.filter(recipe => 
    recipe.status === 'published'
  );
  
  // Category descriptions
  const descriptions = {
    'Gėrimai ir kokteiliai': 'Gardūs, gaivūs ir įdomūs gėrimai bei kokteiliai kiekvienai progai.',
    'Desertai': 'Saldūs gardumynai, pyragai ir deserai jūsų malonumui.',
    'Sriubos': 'Šiltos, gaivios ir maistingos sriubos visais metų laikais.',
    'Užkandžiai': 'Greiti ir skanūs užkandžiai vakarėliams ar kasdieniam malonumui.',
    'Varškė': 'Įvairūs receptai su varške - nuo desertų iki pagrindinio patiekalo.',
    'Kiaušiniai': 'Kūrybiški ir gardūs patiekalai, kurių pagrindas - kiaušiniai.',
    'Daržovės': 'Gardūs ir sveiki daržovių patiekalai visiems metų laikams.',
    'Bulvės': 'Tradiciniai ir modernūs receptai su bulvėmis - lietuviška klasika.',
    'Mėsa': 'Gardūs ir sodrūs mėsos patiekalai šventėms ir kasdienai.',
    'Žuvis ir jūros gėrybės': 'Šviežios žuvies ir jūros gėrybių receptai jūsų stalui.',
    'Kruopos ir grūdai': 'Maistingi ir skanūs patiekalai iš įvairių kruopų ir grūdų.',
    'Be glitimo': 'Skanūs receptai tiems, kas vengia glitimo.',
    'Be laktozės': 'Gardūs patiekalai be laktozės.',
    'Gamta lėkštėje': 'Receptai su laukiniais augalais ir gamtos dovanomis.',
    'Iš močiutės virtuvės': 'Tradiciniai lietuviški receptai, perduodami iš kartos į kartą.'
  };
  
  // If category name is provided, get recipes for that category
  if (name) {
    // Filter recipes by category
    const categoryRecipes = publishedRecipes.filter(recipe => {
      return (recipe.categories && recipe.categories.includes(name)) || 
             (recipe.tags && recipe.tags.includes(name));
    });
    
    // Calculate pagination
    const pageNum = parseInt(page);
    const perPage = parseInt(per_page);
    const offset = (pageNum - 1) * perPage;
    const totalRecipes = categoryRecipes.length;
    const paginatedRecipes = categoryRecipes.slice(offset, offset + perPage);
    
    // Return category data with recipes
    return res.json({
      success: true,
      name,
      title: name,
      description: descriptions[name] || `Receptai kategorijoje "${name}".`,
      recipes: paginatedRecipes,
      total: totalRecipes,
      page: pageNum,
      perPage,
      hasMore: (offset + perPage) < totalRecipes
    });
  } else {
    // Get all categories with counts
    const categories = [];
    const categoryNames = [];
    
    // Extract all unique categories from recipes
    publishedRecipes.forEach(recipe => {
      if (recipe.categories && Array.isArray(recipe.categories)) {
        recipe.categories.forEach(category => {
          if (!categoryNames.includes(category)) {
            categoryNames.push(category);
          }
        });
      }
    });
    
    // Sort categories alphabetically
    categoryNames.sort();
    
    // Count recipes in each category
    categoryNames.forEach(category => {
      const count = publishedRecipes.filter(recipe => 
        recipe.categories && recipe.categories.includes(category)
      ).length;
      
      categories.push({
        name: category,
        count
      });
    });
    
    // Return all categories
    return res.json({
      success: true,
      categories
    });
  }
});

module.exports = router;