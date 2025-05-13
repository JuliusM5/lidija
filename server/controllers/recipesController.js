// server/controllers/recipesController.js
const { loadData, saveData, generateId, handleImageUpload, RECIPES_FILE } = require('../utils/fileUtil');
const path = require('path');
const fs = require('fs');

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
 * Get all recipes (with optional filters)
 */
exports.getAllRecipes = (req, res) => {
  const { featured, latest, popular, category, offset = 0, limit = 6 } = req.query;
  
  // Load recipes
  let recipes = loadData(RECIPES_FILE);
  
  // Filter published recipes for public api
  recipes = recipes.filter(recipe => recipe.status === 'published');
  
  // Apply filters
  if (featured === '1' || featured === 'true') {
    recipes = recipes.filter(recipe => recipe.featured);
  }
  
  if (category) {
    recipes = recipes.filter(recipe => 
      recipe.categories && recipe.categories.includes(category)
    );
  }
  
  if (latest === '1' || latest === 'true') {
    // Sort by date (newest first)
    recipes.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
      const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
      return dateB - dateA;
    });
  }
  
  if (popular === '1' || popular === 'true') {
    // Sort by views
    recipes.sort((a, b) => (b.views || 0) - (a.views || 0));
  }
  
  // Apply pagination
  const paginationOffset = parseInt(offset);
  const paginationLimit = parseInt(limit);
  const totalRecipes = recipes.length;
  const paginatedRecipes = recipes.slice(paginationOffset, paginationOffset + paginationLimit);
  
  // Add slugs if missing
  paginatedRecipes.forEach(recipe => {
    if (!recipe.slug) {
      recipe.slug = slugify(recipe.title);
    }
  });
  
  return {
    success: true,
    recipes: paginatedRecipes,
    total: totalRecipes,
    hasMore: (paginationOffset + paginationLimit) < totalRecipes
  };
};

/**
 * Get single recipe by ID or slug
 */
exports.getRecipe = (recipeId, isSlug = false) => {
  // Load recipes
  const recipes = loadData(RECIPES_FILE);
  
  // Find recipe
  let recipe;
  
  if (isSlug) {
    recipe = recipes.find(r => 
      (r.slug === recipeId || slugify(r.title) === recipeId) && 
      r.status === 'published'
    );
  } else {
    recipe = recipes.find(r => r.id === recipeId && r.status === 'published');
  }
  
  if (!recipe) {
    return { success: false, error: 'Recipe not found' };
  }
  
  // Increment view count
  recipe.views = (recipe.views || 0) + 1;
  saveData(RECIPES_FILE, recipes);
  
  // Make sure recipe has a slug
  if (!recipe.slug) {
    recipe.slug = slugify(recipe.title);
  }
  
  return { success: true, recipe };
};

/**
 * Search recipes
 */
exports.searchRecipes = (query, offset = 0, limit = 6) => {
  if (!query) {
    return { success: false, error: 'Search query is required' };
  }
  
  // Load recipes
  let recipes = loadData(RECIPES_FILE).filter(recipe => 
    recipe.status === 'published'
  );
  
  // Search in title, intro, ingredients, steps, categories, tags
  const searchQuery = query.toLowerCase();
  const searchResults = recipes.filter(recipe => {
    return (
      (recipe.title?.toLowerCase().includes(searchQuery)) ||
      (recipe.intro?.toLowerCase().includes(searchQuery)) ||
      (recipe.ingredients?.some(ingredient => ingredient.toLowerCase().includes(searchQuery))) ||
      (recipe.steps?.some(step => step.toLowerCase().includes(searchQuery))) ||
      (recipe.categories?.some(category => category.toLowerCase().includes(searchQuery))) ||
      (recipe.tags?.some(tag => tag.toLowerCase().includes(searchQuery)))
    );
  });
  
  // Sort by relevance and then by date
  searchResults.sort((a, b) => {
    const aTitleMatch = a.title?.toLowerCase().includes(searchQuery) ? 1 : 0;
    const bTitleMatch = b.title?.toLowerCase().includes(searchQuery) ? 1 : 0;
    
    if (aTitleMatch !== bTitleMatch) {
      return bTitleMatch - aTitleMatch;
    }
    
    const aDate = a.created_at ? new Date(a.created_at) : new Date(0);
    const bDate = b.created_at ? new Date(b.created_at) : new Date(0);
    return bDate - aDate;
  });
  
  // Pagination
  const paginationOffset = parseInt(offset);
  const paginationLimit = parseInt(limit);
  const totalResults = searchResults.length;
  const paginatedResults = searchResults.slice(paginationOffset, paginationOffset + paginationLimit);
  
  // Add slugs
  paginatedResults.forEach(recipe => {
    if (!recipe.slug) {
      recipe.slug = slugify(recipe.title);
    }
  });
  
  return {
    success: true,
    recipes: paginatedResults,
    total: totalResults,
    hasMore: (paginationOffset + paginationLimit) < totalResults
  };
};

/**
 * Create a new recipe
 */
exports.createRecipe = (recipeData, imageFile) => {
  const { 
    title, intro, categories = [], tags = [], 
    prep_time, cook_time, servings, 
    ingredients = [], steps = [], notes, 
    status = 'draft', featured = false 
  } = recipeData;
  
  // Validate required fields
  if (!title) {
    return { success: false, error: 'Title is required' };
  }
  
  // Handle image upload
  let image = '';
  if (imageFile) {
    const uploadedImage = handleImageUpload(imageFile, 'recipes');
    if (!uploadedImage) {
      return { success: false, error: 'Failed to upload image' };
    }
    image = uploadedImage;
  }
  
  // Parse tags if needed
  let parsedTags = tags;
  if (typeof tags === 'string') {
    try {
      parsedTags = JSON.parse(tags);
    } catch (e) {
      parsedTags = tags.split(',').map(tag => tag.trim());
    }
  }
  
  // Create recipe object
  const recipe = {
    id: generateId(),
    title,
    slug: slugify(title),
    intro: intro || '',
    image,
    categories: Array.isArray(categories) ? categories : [categories].filter(Boolean),
    tags: Array.isArray(parsedTags) ? parsedTags : [parsedTags].filter(Boolean),
    prep_time: prep_time || '',
    cook_time: cook_time || '',
    servings: servings || '',
    ingredients: Array.isArray(ingredients) ? ingredients : [ingredients].filter(Boolean),
    steps: Array.isArray(steps) ? steps : [steps].filter(Boolean),
    notes: notes || '',
    status: status || 'draft',
    featured: featured === true || featured === 'true',
    views: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Load recipes
  const recipes = loadData(RECIPES_FILE);
  
  // Add recipe
  recipes.push(recipe);
  
  // Save recipes
  if (saveData(RECIPES_FILE, recipes)) {
    return { success: true, recipe };
  } else {
    return { success: false, error: 'Failed to save recipe' };
  }
};

/**
 * Update a recipe
 */
exports.updateRecipe = (recipeId, recipeData, imageFile) => {
  // Load recipes
  const recipes = loadData(RECIPES_FILE);
  
  // Find recipe
  const recipeIndex = recipes.findIndex(r => r.id === recipeId);
  
  if (recipeIndex === -1) {
    return { success: false, error: 'Recipe not found' };
  }
  
  const existingRecipe = recipes[recipeIndex];
  
  // Handle image upload
  let image = existingRecipe.image || '';
  if (imageFile) {
    const uploadedImage = handleImageUpload(imageFile, 'recipes');
    
    if (uploadedImage) {
      // Delete old image
      if (image) {
        const oldImagePath = path.join(__dirname, '../../public/img/recipes', image);
        try {
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
      
      image = uploadedImage;
    }
  }
  
  // Extract and validate data
  const { 
    title, intro, categories = [], tags = [], 
    prep_time, cook_time, servings, 
    ingredients = [], steps = [], notes, 
    status, featured 
  } = recipeData;
  
  // Parse tags if needed
  let parsedTags = tags;
  if (typeof tags === 'string') {
    try {
      parsedTags = JSON.parse(tags);
    } catch (e) {
      parsedTags = tags.split(',').map(tag => tag.trim());
    }
  }
  
  // Update recipe
  recipes[recipeIndex] = {
    ...existingRecipe,
    title: title || existingRecipe.title,
    slug: title ? slugify(title) : existingRecipe.slug,
    intro: intro !== undefined ? intro : existingRecipe.intro,
    image,
    categories: Array.isArray(categories) ? categories : [categories].filter(Boolean),
    tags: Array.isArray(parsedTags) ? parsedTags : [parsedTags].filter(Boolean),
    prep_time: prep_time !== undefined ? prep_time : existingRecipe.prep_time,
    cook_time: cook_time !== undefined ? cook_time : existingRecipe.cook_time,
    servings: servings !== undefined ? servings : existingRecipe.servings,
    ingredients: Array.isArray(ingredients) ? ingredients : 
                typeof ingredients === 'string' ? [ingredients] : existingRecipe.ingredients,
    steps: Array.isArray(steps) ? steps : 
           typeof steps === 'string' ? [steps] : existingRecipe.steps,
    notes: notes !== undefined ? notes : existingRecipe.notes,
    status: status || existingRecipe.status,
    featured: featured === true || featured === 'true' || existingRecipe.featured,
    updated_at: new Date().toISOString()
  };
  
  // Save recipes
  if (saveData(RECIPES_FILE, recipes)) {
    return { success: true, recipe: recipes[recipeIndex] };
  } else {
    return { success: false, error: 'Failed to update recipe' };
  }
};

/**
 * Delete a recipe
 */
exports.deleteRecipe = (recipeId) => {
  // Load recipes
  const recipes = loadData(RECIPES_FILE);
  
  // Find recipe
  const recipeIndex = recipes.findIndex(r => r.id === recipeId);
  
  if (recipeIndex === -1) {
    return { success: false, error: 'Recipe not found' };
  }
  
  // Delete recipe image
  const image = recipes[recipeIndex].image;
  if (image) {
    const imagePath = path.join(__dirname, '../../public/img/recipes', image);
    try {
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    } catch (error) {
      console.error('Error deleting recipe image:', error);
    }
  }
  
  // Remove recipe
  recipes.splice(recipeIndex, 1);
  
  // Save recipes
  if (saveData(RECIPES_FILE, recipes)) {
    return { success: true, message: 'Recipe deleted successfully' };
  } else {
    return { success: false, error: 'Failed to delete recipe' };
  }
};