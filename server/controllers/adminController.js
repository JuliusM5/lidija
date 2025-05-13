// server/controllers/adminController.js
const { 
  loadData, 
  saveData, 
  countMediaFiles,
  RECIPES_FILE,
  COMMENTS_FILE
} = require('../utils/fileUtil');

const { verifyUser, generateToken } = require('../utils/authUtil');

/**
 * Handle admin login
 */
exports.login = (username, password) => {
  // Validate
  if (!username || !password) {
    return { success: false, error: 'Username and password are required' };
  }
  
  // Verify credentials
  const user = verifyUser(username, password);
  
  if (user) {
    // Generate token
    const token = generateToken(user);
    
    return {
      success: true,
      message: 'Login successful',
      user,
      token
    };
  } else {
    return { success: false, error: 'Invalid username or password' };
  }
};

/**
 * Get dashboard statistics
 */
exports.getDashboardStats = () => {
  // Load data
  const recipes = loadData(RECIPES_FILE);
  const comments = loadData(COMMENTS_FILE);
  
  // Calculate stats
  const stats = {
    recipes: {
      total: recipes.length,
      published: recipes.filter(recipe => recipe.status === 'published').length,
      draft: recipes.filter(recipe => !recipe.status || recipe.status === 'draft').length
    },
    comments: {
      total: comments.length,
      approved: comments.filter(comment => comment.status === 'approved').length,
      pending: comments.filter(comment => !comment.status || comment.status === 'pending').length,
      spam: comments.filter(comment => comment.status === 'spam').length
    },
    media: {
      total: countMediaFiles()
    }
  };
  
  // Get recent recipes
  const recentRecipes = [...recipes]
    .sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
      const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
      return dateB - dateA;
    })
    .slice(0, 5);
  
  // Get recent comments
  const recentComments = [...comments]
    .sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
      const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
      return dateB - dateA;
    })
    .slice(0, 5);
  
  // Add recipe titles to comments
  recentComments.forEach(comment => {
    if (comment.recipe_id) {
      const recipe = recipes.find(r => r.id === comment.recipe_id);
      if (recipe) {
        comment.recipe_title = recipe.title;
      } else {
        comment.recipe_title = 'Unknown Recipe';
      }
    } else {
      comment.recipe_title = 'Unknown Recipe';
    }
  });
  
  return {
    success: true,
    data: {
      recipes: stats.recipes,
      comments: stats.comments,
      media: stats.media,
      recent_recipes: recentRecipes,
      recent_comments: recentComments
    }
  };
};

/**
 * Get all recipes for admin panel
 */
exports.getRecipesForAdmin = (status = 'all', page = 1, perPage = 10) => {
  // Load recipes
  let recipes = loadData(RECIPES_FILE);
  
  // Filter by status
  if (status && status !== 'all') {
    recipes = recipes.filter(recipe => recipe.status === status);
  }
  
  // Sort by date (newest first)
  recipes.sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
    const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
    return dateB - dateA;
  });
  
  // Pagination
  const pageNum = parseInt(page);
  const pageSize = parseInt(perPage);
  const totalRecipes = recipes.length;
  const totalPages = Math.ceil(totalRecipes / pageSize);
  const offset = (pageNum - 1) * pageSize;
  const paginatedRecipes = recipes.slice(offset, offset + pageSize);
  
  return {
    success: true,
    data: paginatedRecipes,
    meta: {
      page: pageNum,
      per_page: pageSize,
      total: totalRecipes,
      pages: totalPages
    }
  };
};