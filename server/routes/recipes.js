// server/routes/recipes.js - Recipe API endpoints

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { 
  loadData, 
  saveData, 
  RECIPES_FILE,
  COMMENTS_FILE 
} = require('../utils/fileUtil');

/**
 * Helper function to create URL-friendly slugs
 * @param {string} text - Text to slugify
 * @returns {string} - URL-friendly slug
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

/**
 * GET /api/recipes
 * Get recipes with optional filters (featured, latest, popular)
 */
router.get('/', (req, res) => {
  const { id, slug, featured, latest, popular, offset = 0, limit = 6 } = req.query;
  
  // If ID is provided, return a specific recipe
  if (id) {
    const recipes = loadData(RECIPES_FILE);
    const recipe = recipes.find(r => r.id === id && r.status === 'published');
    
    if (recipe) {
      // Load comments for this recipe
      const comments = loadData(COMMENTS_FILE);
      const recipeComments = comments.filter(comment => 
        comment.recipe_id === id && comment.status === 'approved'
      );
      
      // Add comments to recipe
      recipe.comments = recipeComments;
      
      // Increment view count (optional)
      recipe.views = (recipe.views || 0) + 1;
      saveData(RECIPES_FILE, recipes);
      
      return res.json({ success: true, recipe });
    } else {
      return res.status(404).json({ success: false, error: 'Recipe not found' });
    }
  }
  
  // If slug is provided, return a specific recipe
  if (slug) {
    const recipes = loadData(RECIPES_FILE);
    const recipe = recipes.find(r => 
      (r.slug === slug || slugify(r.title) === slug) && 
      r.status === 'published'
    );
    
    if (recipe) {
      // Load comments for this recipe
      const comments = loadData(COMMENTS_FILE);
      const recipeComments = comments.filter(comment => 
        comment.recipe_id === recipe.id && comment.status === 'approved'
      );
      
      // Add comments to recipe
      recipe.comments = recipeComments;
      
      // Increment view count (optional)
      recipe.views = (recipe.views || 0) + 1;
      saveData(RECIPES_FILE, recipes);
      
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
    
    // Limit to 5 latest recipes, or the value specified in limit
    const latestLimit = parseInt(limit) || 5;
    recipes = recipes.slice(0, latestLimit);
  }
  
  if (popular === '1' || popular === 'true') {
    // Sort by view count or popularity metric
    recipes.sort((a, b) => {
      const viewsA = a.views || 0;
      const viewsB = b.views || 0;
      return viewsB - viewsA;
    });
    
    // Limit to 3 popular recipes, or the value specified in limit
    const popularLimit = parseInt(limit) || 3;
    recipes = recipes.slice(0, popularLimit);
  }
  
  // Apply pagination
  const paginationOffset = parseInt(offset);
  const paginationLimit = parseInt(limit);
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
 * GET /api/recipes/search
 * Search recipes by query
 */
router.get('/search', (req, res) => {
  const { q, offset = 0, limit = 6 } = req.query;
  
  if (!q) {
    return res.status(400).json({ 
      success: false, 
      error: 'Search query is required' 
    });
  }
  
  // Load published recipes
  let recipes = loadData(RECIPES_FILE).filter(recipe => 
    recipe.status === 'published'
  );
  
  // Search in title, intro, ingredients, and steps
  const query = q.toLowerCase();
  const searchResults = recipes.filter(recipe => {
    const titleMatch = recipe.title?.toLowerCase().includes(query);
    const introMatch = recipe.intro?.toLowerCase().includes(query);
    
    // Search in ingredients
    const ingredientsMatch = recipe.ingredients?.some(ingredient => 
      ingredient.toLowerCase().includes(query)
    );
    
    // Search in steps
    const stepsMatch = recipe.steps?.some(step => 
      step.toLowerCase().includes(query)
    );
    
    // Search in categories and tags
    const categoriesMatch = recipe.categories?.some(category => 
      category.toLowerCase().includes(query)
    );
    
    const tagsMatch = recipe.tags?.some(tag => 
      tag.toLowerCase().includes(query)
    );
    
    return titleMatch || introMatch || ingredientsMatch || stepsMatch || categoriesMatch || tagsMatch;
  });
  
  // Sort by relevance (title match first, then intro, etc.)
  searchResults.sort((a, b) => {
    const aTitleMatch = a.title?.toLowerCase().includes(query) ? 1 : 0;
    const bTitleMatch = b.title?.toLowerCase().includes(query) ? 1 : 0;
    
    // First sort by title match
    if (aTitleMatch !== bTitleMatch) {
      return bTitleMatch - aTitleMatch;
    }
    
    // Then by date (newest first)
    const aDate = a.created_at ? new Date(a.created_at) : new Date(0);
    const bDate = b.created_at ? new Date(b.created_at) : new Date(0);
    return bDate - aDate;
  });
  
  // Apply pagination
  const paginationOffset = parseInt(offset);
  const paginationLimit = parseInt(limit);
  const totalResults = searchResults.length;
  const paginatedResults = searchResults.slice(paginationOffset, paginationOffset + paginationLimit);
  
  res.json({
    success: true,
    recipes: paginatedResults,
    total: totalResults,
    hasMore: (paginationOffset + paginationLimit) < totalResults
  });
});

/**
 * GET /api/recipes/recent-comments
 * Get recipes with recent comments
 */
router.get('/recent-comments', (req, res) => {
  const { limit = 5 } = req.query;
  
  // Load comments
  const comments = loadData(COMMENTS_FILE);
  
  // Get approved comments, sorted by date (newest first)
  const approvedComments = comments
    .filter(comment => comment.status === 'approved')
    .sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
      const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
      return dateB - dateA;
    })
    .slice(0, parseInt(limit));
  
  // Load recipes to get titles
  const recipes = loadData(RECIPES_FILE);
  
  // Add recipe titles to comments
  const commentWithRecipes = approvedComments.map(comment => {
    const recipe = recipes.find(r => r.id === comment.recipe_id);
    return {
      ...comment,
      recipe_title: recipe ? recipe.title : 'Unknown Recipe',
      recipe_slug: recipe ? (recipe.slug || slugify(recipe.title)) : ''
    };
  });
  
  res.json({
    success: true,
    comments: commentWithRecipes
  });
});

/**
 * POST /api/recipes/:id/comments
 * Add a comment to a recipe
 */
router.post('/:id/comments', (req, res) => {
  const recipeId = req.params.id;
  const { author, email, content, parent_id } = req.body;
  
  // Validate required fields
  if (!author || !content) {
    return res.status(400).json({
      success: false,
      error: 'Author and content are required'
    });
  }
  
  // Check if recipe exists
  const recipes = loadData(RECIPES_FILE);
  const recipe = recipes.find(r => r.id === recipeId);
  
  if (!recipe) {
    return res.status(404).json({
      success: false,
      error: 'Recipe not found'
    });
  }
  
  // Load existing comments
  const comments = loadData(COMMENTS_FILE);
  
  // Create new comment
  const newComment = {
    id: Date.now().toString(),
    recipe_id: recipeId,
    parent_id: parent_id || null,
    author,
    email: email || '',
    content,
    status: 'pending', // New comments are pending until approved
    created_at: new Date().toISOString()
  };
  
  // Add comment
  comments.push(newComment);
  
  // Save comments
  if (saveData(COMMENTS_FILE, comments)) {
    res.json({
      success: true,
      message: 'Comment added successfully and will be visible after moderation'
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'Failed to save comment'
    });
  }
});

module.exports = router;