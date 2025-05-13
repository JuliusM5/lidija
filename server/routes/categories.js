// server/routes/categories.js - Categories API endpoints

const express = require('express');
const router = express.Router();
const { loadData, RECIPES_FILE } = require('../utils/fileUtil');

/**
 * Helper function to slugify text
 * @param {string} text - Text to slugify
 * @returns {string} - URL-friendly slug
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

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
    'Iš močiutės virtuvės': 'Tradiciniai lietuviški receptai, perduodami iš kartos į kartą.',
    'Vasara': 'Vasaros skoniai ir kvapai jūsų virtuvėje.',
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
    
    // Sort by date (newest first)
    categoryRecipes.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
      const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
      return dateB - dateA;
    });
    
    const paginatedRecipes = categoryRecipes.slice(offset, offset + perPage);
    
    // Add slug to each recipe if not exists
    paginatedRecipes.forEach(recipe => {
      if (!recipe.slug) {
        recipe.slug = slugify(recipe.title);
      }
    });
    
    // Return category data with recipes
    return res.json({
      success: true,
      name,
      slug: slugify(name),
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
    const categoryNames = new Set();
    
    // Extract all unique categories from recipes
    publishedRecipes.forEach(recipe => {
      if (recipe.categories && Array.isArray(recipe.categories)) {
        recipe.categories.forEach(category => {
          categoryNames.add(category);
        });
      }
    });
    
    // Sort categories alphabetically
    const sortedCategories = Array.from(categoryNames).sort();
    
    // Count recipes in each category
    sortedCategories.forEach(category => {
      const count = publishedRecipes.filter(recipe => 
        recipe.categories && recipe.categories.includes(category)
      ).length;
      
      categories.push({
        name: category,
        slug: slugify(category),
        count,
        description: descriptions[category] || ''
      });
    });
    
    // Return all categories
    return res.json({
      success: true,
      categories
    });
  }
});

/**
 * GET /api/categories/tags
 * Get all tags with counts
 */
router.get('/tags', (req, res) => {
  // Load recipes data
  const recipes = loadData(RECIPES_FILE);
  
  // Show only published recipes
  const publishedRecipes = recipes.filter(recipe => 
    recipe.status === 'published'
  );
  
  // Get all tags with counts
  const tags = [];
  const tagNames = new Set();
  
  // Extract all unique tags from recipes
  publishedRecipes.forEach(recipe => {
    if (recipe.tags && Array.isArray(recipe.tags)) {
      recipe.tags.forEach(tag => {
        tagNames.add(tag);
      });
    }
  });
  
  // Sort tags alphabetically
  const sortedTags = Array.from(tagNames).sort();
  
  // Count recipes for each tag
  sortedTags.forEach(tag => {
    const count = publishedRecipes.filter(recipe => 
      recipe.tags && recipe.tags.includes(tag)
    ).length;
    
    tags.push({
      name: tag,
      slug: slugify(tag),
      count
    });
  });
  
  return res.json({
    success: true,
    tags
  });
});

module.exports = router;