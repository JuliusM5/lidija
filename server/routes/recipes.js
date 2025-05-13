// server/routes/recipes.js - Recipe API endpoints

const express = require('express');
const router = express.Router();
const path = require('path');
const { 
  loadData, 
  saveData, 
  generateId, 
  handleImageUpload, 
  RECIPES_FILE,
  COMMENTS_FILE 
} = require('../utils/fileUtil');
const { authMiddleware } = require('../utils/authUtil');

/**
 * GET /api/recipes
 * Get recipes with optional filters (featured, latest, popular)
 */
router.get('/', (req, res) => {
  const { id, featured, latest, popular, offset, limit } = req.query;
  
  // If ID is provided, return a specific recipe
  if (id) {
    const recipes = loadData(RECIPES_FILE);
    const recipe = recipes.find(r => r.id === id);
    
    if (recipe) {
      // Load comments for this recipe
      const comments = loadData(COMMENTS_FILE);
      const recipeComments = comments.filter(comment => 
        comment.recipe_id === id && comment.status === 'approved'
      );
      
      // Add comments to recipe
      recipe.comments = recipeComments;
      
      return res.json({ success: true, recipe });
    } else {
      return res.status(404).json({ success: false, error: 'Recipe not found' });
    }
  }
  
  // Load all recipes
  let recipes = loadData(RECIPES_FILE);
  
  // Show only published recipes for public API
  recipes = recipes.filter(recipe => 
    recipe.status === 'published'
  );
  
  // Apply filters
  if (featured === '1' || featured === 'true') {
    recipes = recipes.filter(recipe => recipe.featured);
  }
  
  if (latest === '1' || latest === 'true') {
    // Sort by date
    recipes.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
      const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
      return dateB - dateA;
    });
    
    // Limit to 5 latest recipes
    recipes = recipes.slice(0, 5);
  }
  
  if (popular === '1' || popular === 'true') {
    // Sort by view count or popularity metric
    recipes.sort((a, b) => {
      const viewsA = a.views || 0;
      const viewsB = b.views || 0;
      return viewsB - viewsA;
    });
    
    // Limit to 3 popular recipes
    recipes = recipes.slice(0, 3);
  }
  
  // Apply pagination
  const paginationOffset = parseInt(offset) || 0;
  const paginationLimit = parseInt(limit) || 6;
  const totalRecipes = recipes.length;
  const paginatedRecipes = recipes.slice(paginationOffset, paginationOffset + paginationLimit);
  
  res.json({
    success: true,
    recipes: paginatedRecipes,
    total: totalRecipes,
    hasMore: (paginationOffset + paginationLimit) < totalRecipes
  });
});

/**
 * POST /api/recipes
 * Add a new recipe (protected route)
 */
router.post('/', authMiddleware, (req, res) => {
  const { 
    title, intro, categories = [], tags = [], 
    prep_time, cook_time, servings, 
    ingredients = [], steps = [], notes, 
    status = 'draft' 
  } = req.body;
  
  // Validate required fields
  if (!title) {
    return res.status(400).json({ success: false, error: 'Title is required' });
  }
  
  // Handle image upload
  let image = '';
  if (req.files && req.files.image) {
    image = handleImageUpload(req.files.image, 'recipes');
    if (!image) {
      return res.status(500).json({ success: false, error: 'Failed to upload image' });
    }
  }
  
  // Create recipe data
  const recipe = {
    id: generateId(),
    title,
    intro: intro || '',
    image,
    categories: Array.isArray(categories) ? categories : [categories].filter(Boolean),
    tags: Array.isArray(tags) ? tags : JSON.parse(tags || '[]'),
    prep_time: prep_time || '',
    cook_time: cook_time || '',
    servings: servings || '',
    ingredients: Array.isArray(ingredients) ? ingredients : [ingredients].filter(Boolean),
    steps: Array.isArray(steps) ? steps : [steps].filter(Boolean),
    notes: notes || '',
    status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Load existing recipes
  const recipes = loadData(RECIPES_FILE);
  
  // Add new recipe
  recipes.push(recipe);
  
  // Save recipes
  if (saveData(RECIPES_FILE, recipes)) {
    res.json({ success: true, message: 'Recipe added successfully', data: recipe });
  } else {
    res.status(500).json({ success: false, error: 'Failed to save recipe' });
  }
});

/**
 * PUT /api/recipes/:id
 * Update a recipe (protected route)
 */
router.put('/:id', authMiddleware, (req, res) => {
  const recipeId = req.params.id;
  
  // Check if ID is provided
  if (!recipeId) {
    return res.status(400).json({ success: false, error: 'Recipe ID is required' });
  }
  
  const { 
    title, intro, categories = [], tags = [], 
    prep_time, cook_time, servings, 
    ingredients = [], steps = [], notes, 
    status = 'draft' 
  } = req.body;
  
  // Validate required fields
  if (!title) {
    return res.status(400).json({ success: false, error: 'Title is required' });
  }
  
  // Load existing recipes
  const recipes = loadData(RECIPES_FILE);
  
  // Find recipe index
  const recipeIndex = recipes.findIndex(recipe => recipe.id === recipeId);
  
  if (recipeIndex === -1) {
    return res.status(404).json({ success: false, error: 'Recipe not found' });
  }
  
  // Handle image upload
  let image = recipes[recipeIndex].image || '';
  if (req.files && req.files.image) {
    const newImage = handleImageUpload(req.files.image, 'recipes');
    if (newImage) {
      // Delete old image if it exists
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
      image = newImage;
    }
  }
  
  // Update recipe data
  recipes[recipeIndex] = {
    ...recipes[recipeIndex],
    title,
    intro: intro || '',
    image,
    categories: Array.isArray(categories) ? categories : [categories].filter(Boolean),
    tags: Array.isArray(tags) ? tags : JSON.parse(tags || '[]'),
    prep_time: prep_time || '',
    cook_time: cook_time || '',
    servings: servings || '',
    ingredients: Array.isArray(ingredients) ? ingredients : [ingredients].filter(Boolean),
    steps: Array.isArray(steps) ? steps : [steps].filter(Boolean),
    notes: notes || '',
    status,
    updated_at: new Date().toISOString()
  };
  
  // Save recipes
  if (saveData(RECIPES_FILE, recipes)) {
    res.json({ success: true, message: 'Recipe updated successfully', data: recipes[recipeIndex] });
  } else {
    res.status(500).json({ success: false, error: 'Failed to update recipe' });
  }
});

/**
 * DELETE /api/recipes/:id
 * Delete a recipe (protected route)
 */
router.delete('/:id', authMiddleware, (req, res) => {
  const recipeId = req.params.id;
  
  // Check if ID is provided
  if (!recipeId) {
    return res.status(400).json({ success: false, error: 'Recipe ID is required' });
  }
  
  // Load recipes
  const recipes = loadData(RECIPES_FILE);
  
  // Find recipe index
  const recipeIndex = recipes.findIndex(recipe => recipe.id === recipeId);
  
  if (recipeIndex === -1) {
    return res.status(404).json({ success: false, error: 'Recipe not found' });
  }
  
  // Delete recipe image if it exists
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
    res.json({ success: true, message: 'Recipe deleted successfully' });
  } else {
    res.status(500).json({ success: false, error: 'Failed to delete recipe' });
  }
});

module.exports = router;