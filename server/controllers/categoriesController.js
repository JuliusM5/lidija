// server/controllers/categoriesController.js
const { loadData, RECIPES_FILE } = require('../utils/fileUtil');

/**
 * Helper function to slugify text
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
 * Get all categories with counts
 */
exports.getAllCategories = () => {
  // Load recipes
  const recipes = loadData(RECIPES_FILE);
  
  // Filter published recipes
  const publishedRecipes = recipes.filter(recipe => recipe.status === 'published');
  
  // Category descriptions (predefined)
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
  
  // Extract all unique categories
  const categories = [];
  const categoryNames = new Set();
  
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
  
  return {
    success: true,
    categories
  };
};

/**
 * Get recipes by category
 */
exports.getRecipesByCategory = (categoryName, page = 1, perPage = 6) => {
  if (!categoryName) {
    return { success: false, error: 'Category name is required' };
  }
  
  // Load recipes
  const recipes = loadData(RECIPES_FILE);
  
  // Filter published recipes
  const publishedRecipes = recipes.filter(recipe => recipe.status === 'published');
  
  // Filter by category
  const categoryRecipes = publishedRecipes.filter(recipe => 
    recipe.categories && recipe.categories.includes(categoryName)
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
  
  // Sort by date (newest first)
  categoryRecipes.sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
    const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
    return dateB - dateA;
  });
  
  // Pagination
  const pageNum = parseInt(page);
  const pageSize = parseInt(perPage);
  const offset = (pageNum - 1) * pageSize;
  const totalRecipes = categoryRecipes.length;
  const paginatedRecipes = categoryRecipes.slice(offset, offset + pageSize);
  
  // Add slugs if missing
  paginatedRecipes.forEach(recipe => {
    if (!recipe.slug) {
      recipe.slug = slugify(recipe.title);
    }
  });
  
  return {
    success: true,
    name: categoryName,
    slug: slugify(categoryName),
    title: categoryName,
    description: descriptions[categoryName] || `Receptai kategorijoje "${categoryName}".`,
    recipes: paginatedRecipes,
    total: totalRecipes,
    page: pageNum,
    perPage: pageSize,
    hasMore: (offset + pageSize) < totalRecipes
  };
};

/**
 * Get all tags with counts
 */
exports.getAllTags = () => {
  // Load recipes
  const recipes = loadData(RECIPES_FILE);
  
  // Filter published recipes
  const publishedRecipes = recipes.filter(recipe => recipe.status === 'published');
  
  // Extract all unique tags
  const tags = [];
  const tagNames = new Set();
  
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
  
  return {
    success: true,
    tags
  };
};