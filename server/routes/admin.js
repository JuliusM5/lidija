// server/routes/admin.js - Admin API endpoints

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { 
  loadData, 
  saveData, 
  generateId, 
  handleImageUpload,
  countMediaFiles,
  getMediaFiles,
  RECIPES_FILE,
  COMMENTS_FILE,
  USERS_FILE,
  ABOUT_FILE
} = require('../utils/fileUtil');
const { 
  verifyUser, 
  generateToken, 
  authMiddleware,
  adminMiddleware
} = require('../utils/authUtil');

/**
 * POST /admin-api/auth/login
 * Handle admin login
 */
router.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Validate required fields
  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Username and password are required' 
    });
  }
  
  // Verify user credentials
  const user = verifyUser(username, password);
  
  if (user) {
    // Generate JWT token
    const token = generateToken(user);
    
    // Send response with user data and token
    res.json({
      success: true,
      message: 'Login successful',
      user,
      token
    });
  } else {
    res.status(401).json({ 
      success: false, 
      error: 'Invalid username or password' 
    });
  }
});

/**
 * GET /admin-api/auth/verify
 * Verify authentication token
 */
router.get('/auth/verify', authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

/**
 * GET /admin-api/dashboard/stats
 * Get dashboard statistics
 */
router.get('/dashboard/stats', authMiddleware, adminMiddleware, (req, res) => {
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
  
  res.json({
    success: true,
    data: {
      recipes: stats.recipes,
      comments: stats.comments,
      media: stats.media,
      recent_recipes: recentRecipes,
      recent_comments: recentComments
    }
  });
});

/**
 * GET /admin-api/recipes
 * Get all recipes for admin panel
 */
router.get('/recipes', authMiddleware, adminMiddleware, (req, res) => {
  // Get request parameters
  const { status = 'all', page = 1, per_page = 10 } = req.query;
  
  // Load recipes
  let recipes = loadData(RECIPES_FILE);
  
  // Filter by status if provided
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
  const perPage = parseInt(per_page);
  const totalRecipes = recipes.length;
  const totalPages = Math.ceil(totalRecipes / perPage);
  const offset = (pageNum - 1) * perPage;
  const paginatedRecipes = recipes.slice(offset, offset + perPage);
  
  res.json({
    success: true,
    data: paginatedRecipes,
    meta: {
      page: pageNum,
      per_page: perPage,
      total: totalRecipes,
      pages: totalPages
    }
  });
});

/**
 * GET /admin-api/recipes/:id
 * Get a specific recipe for admin panel
 */
router.get('/recipes/:id', authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.params;
  
  // Check if ID is provided
  if (!id) {
    return res.status(400).json({ 
      success: false, 
      error: 'Recipe ID is required' 
    });
  }
  
  // Load recipes
  const recipes = loadData(RECIPES_FILE);
  
  // Find recipe
  const recipe = recipes.find(r => r.id === id);
  
  if (recipe) {
    res.json({ success: true, data: recipe });
  } else {
    res.status(404).json({ 
      success: false, 
      error: 'Recipe not found' 
    });
  }
});

/**
 * POST /admin-api/recipes
 * Add a new recipe
 */
router.post('/recipes', authMiddleware, adminMiddleware, (req, res) => {
  const { 
    title, intro, categories = [], tags = [], 
    prep_time, cook_time, servings, 
    ingredients = [], steps = [], notes, 
    status = 'draft' 
  } = req.body;
  
  // Validate required fields
  if (!title) {
    return res.status(400).json({ 
      success: false, 
      error: 'Title is required' 
    });
  }
  
  // Handle image upload
  let image = '';
  if (req.files && req.files.image) {
    image = handleImageUpload(req.files.image, 'recipes');
    if (!image) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to upload image' 
      });
    }
  }
  
  // Parse tags if provided as string
  let parsedTags = tags;
  if (typeof tags === 'string') {
    try {
      parsedTags = JSON.parse(tags);
    } catch (e) {
      parsedTags = tags.split(',').map(tag => tag.trim());
    }
  }
  
  // Create recipe data
  const recipe = {
    id: generateId(),
    title,
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
    status,
    views: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Load existing recipes
  const recipes = loadData(RECIPES_FILE);
  
  // Add new recipe
  recipes.push(recipe);
  
  // Save recipes
  if (saveData(RECIPES_FILE, recipes)) {
    res.json({ 
      success: true, 
      message: 'Recipe added successfully', 
      data: recipe 
    });
  } else {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save recipe' 
    });
  }
});

/**
 * PUT /admin-api/recipes/:id
 * Update a recipe
 */
router.put('/recipes/:id', authMiddleware, adminMiddleware, (req, res) => {
  const recipeId = req.params.id;
  
  // Check if ID is provided
  if (!recipeId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Recipe ID is required' 
    });
  }
  
  const { 
    title, intro, categories = [], tags = [], 
    prep_time, cook_time, servings, 
    ingredients = [], steps = [], notes, 
    status = 'draft' 
  } = req.body;
  
  // Validate required fields
  if (!title) {
    return res.status(400).json({ 
      success: false, 
      error: 'Title is required' 
    });
  }
  
  // Load existing recipes
  const recipes = loadData(RECIPES_FILE);
  
  // Find recipe index
  const recipeIndex = recipes.findIndex(recipe => recipe.id === recipeId);
  
  if (recipeIndex === -1) {
    return res.status(404).json({ 
      success: false, 
      error: 'Recipe not found' 
    });
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
  
  // Parse tags if provided as string
  let parsedTags = tags;
  if (typeof tags === 'string') {
    try {
      parsedTags = JSON.parse(tags);
    } catch (e) {
      parsedTags = tags.split(',').map(tag => tag.trim());
    }
  }
  
  // Update recipe data
  recipes[recipeIndex] = {
    ...recipes[recipeIndex],
    title,
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
    status,
    updated_at: new Date().toISOString()
  };
  
  // Save recipes
  if (saveData(RECIPES_FILE, recipes)) {
    res.json({ 
      success: true, 
      message: 'Recipe updated successfully', 
      data: recipes[recipeIndex] 
    });
  } else {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update recipe' 
    });
  }
});

/**
 * DELETE /admin-api/recipes/:id
 * Delete a recipe
 */
router.delete('/recipes/:id', authMiddleware, adminMiddleware, (req, res) => {
  const recipeId = req.params.id;
  
  // Check if ID is provided
  if (!recipeId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Recipe ID is required' 
    });
  }
  
  // Load recipes
  const recipes = loadData(RECIPES_FILE);
  
  // Find recipe index
  const recipeIndex = recipes.findIndex(recipe => recipe.id === recipeId);
  
  if (recipeIndex === -1) {
    return res.status(404).json({ 
      success: false, 
      error: 'Recipe not found' 
    });
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
    res.json({ 
      success: true, 
      message: 'Recipe deleted successfully' 
    });
  } else {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete recipe' 
    });
  }
});

/**
 * GET /admin-api/comments
 * Get all comments for admin panel
 */
router.get('/comments', authMiddleware, adminMiddleware, (req, res) => {
  // Get request parameters
  const { status = 'all', page = 1, per_page = 10 } = req.query;
  
  // Load comments
  let comments = loadData(COMMENTS_FILE);
  
  // Filter by status if provided
  if (status && status !== 'all') {
    comments = comments.filter(comment => comment.status === status);
  }
  
  // Sort by date (newest first)
  comments.sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
    const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
    return dateB - dateA;
  });
  
  // Pagination
  const pageNum = parseInt(page);
  const perPage = parseInt(per_page);
  const totalComments = comments.length;
  const totalPages = Math.ceil(totalComments / perPage);
  const offset = (pageNum - 1) * perPage;
  const paginatedComments = comments.slice(offset, offset + perPage);
  
  // Add recipe titles
  const recipes = loadData(RECIPES_FILE);
  paginatedComments.forEach(comment => {
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
  
  res.json({
    success: true,
    data: paginatedComments,
    meta: {
      page: pageNum,
      per_page: perPage,
      total: totalComments,
      pages: totalPages
    }
  });
});

/**
 * GET /admin-api/comments/:id
 * Get a specific comment
 */
router.get('/comments/:id', authMiddleware, adminMiddleware, (req, res) => {
  const { id } = req.params;
  
  // Check if ID is provided
  if (!id) {
    return res.status(400).json({ 
      success: false, 
      error: 'Comment ID is required' 
    });
  }
  
  // Load comments
  const comments = loadData(COMMENTS_FILE);
  
  // Find comment
  const comment = comments.find(c => c.id === id);
  
  if (!comment) {
    return res.status(404).json({ 
      success: false, 
      error: 'Comment not found' 
    });
  }
  
  // Add recipe title
  const recipes = loadData(RECIPES_FILE);
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
  
  res.json({ 
    success: true, 
    data: comment 
  });
});

/**
 * PUT /admin-api/comments/:id
 * Update a comment
 */
router.put('/comments/:id', authMiddleware, adminMiddleware, (req, res) => {
  const commentId = req.params.id;
  const { author, email, content, status } = req.body;
  
  // Check if ID is provided
  if (!commentId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Comment ID is required' 
    });
  }
  
  // Validate required fields
  if (!content) {
    return res.status(400).json({ 
      success: false, 
      error: 'Comment content is required' 
    });
  }
  
  // Load comments
  const comments = loadData(COMMENTS_FILE);
  
  // Find comment index
  const commentIndex = comments.findIndex(c => c.id === commentId);
  
  if (commentIndex === -1) {
    return res.status(404).json({ 
      success: false, 
      error: 'Comment not found' 
    });
  }
  
  // Update comment
  comments[commentIndex] = {
    ...comments[commentIndex],
    author: author || comments[commentIndex].author,
    email: email || comments[commentIndex].email,
    content,
    status: status || comments[commentIndex].status,
    updated_at: new Date().toISOString()
  };
  
  // Save comments
  if (saveData(COMMENTS_FILE, comments)) {
    res.json({ 
      success: true, 
      message: 'Comment updated successfully', 
      data: comments[commentIndex] 
    });
  } else {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update comment' 
    });
  }
});

/**
 * DELETE /admin-api/comments/:id
 * Delete a comment
 */
router.delete('/comments/:id', authMiddleware, adminMiddleware, (req, res) => {
  const commentId = req.params.id;
  
  // Check if ID is provided
  if (!commentId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Comment ID is required' 
    });
  }
  
  // Load comments
  const comments = loadData(COMMENTS_FILE);
  
  // Find comment index
  const commentIndex = comments.findIndex(c => c.id === commentId);
  
  if (commentIndex === -1) {
    return res.status(404).json({ 
      success: false, 
      error: 'Comment not found' 
    });
  }
  
  // Remove comment
  comments.splice(commentIndex, 1);
  
  // Save comments
  if (saveData(COMMENTS_FILE, comments)) {
    res.json({ 
      success: true, 
      message: 'Comment deleted successfully' 
    });
  } else {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete comment' 
    });
  }
});

/**
 * GET /admin-api/media
 * Get media files
 */
router.get('/media', authMiddleware, adminMiddleware, (req, res) => {
  const { type = 'all', page = 1, per_page = 18 } = req.query;
  
  // Get all media files
  const mediaFiles = getMediaFiles(type);
  
  // Sort by date (newest first)
  mediaFiles.sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
    const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
    return dateB - dateA;
  });
  
  // Pagination
  const pageNum = parseInt(page);
  const perPage = parseInt(per_page);
  const totalFiles = mediaFiles.length;
  const totalPages = Math.ceil(totalFiles / perPage);
  const offset = (pageNum - 1) * perPage;
  const paginatedFiles = mediaFiles.slice(offset, offset + perPage);
  
  res.json({
    success: true,
    data: paginatedFiles,
    meta: {
      page: pageNum,
      per_page: perPage,
      total: totalFiles,
      pages: totalPages
    }
  });
});

/**
 * POST /admin-api/media
 * Upload media files
 */
router.post('/media', authMiddleware, adminMiddleware, (req, res) => {
  // Check if files are uploaded
  if (!req.files || !req.files.files) {
    return res.status(400).json({ 
      success: false, 
      error: 'No files uploaded' 
    });
  }
  
  // Get upload type
  const type = req.body.type || 'gallery';
  
  // Handle multiple files
  const uploadedFiles = [];
  const errors = [];
  
  // Convert to array if single file
  const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
  
  files.forEach(file => {
    // Check file type
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.mimetype)) {
      errors.push(`Invalid file type: ${file.name}`);
      return;
    }
    
    // Handle file upload
    const filename = handleImageUpload(file, type);
    
    if (filename) {
      uploadedFiles.push({
        name: file.name,
        path: `${type}/${filename}`,
        url: `/img/${type}/${filename}`,
        directory: type,
        size: file.size,
        type: file.mimetype
      });
    } else {
      errors.push(`Failed to move uploaded file: ${file.name}`);
    }
  });
  
  // Check if any files were uploaded
  if (uploadedFiles.length === 0) {
    res.status(400).json({ 
      success: false, 
      error: 'No files were uploaded', 
      errors 
    });
  } else {
    res.json({ 
      success: true, 
      message: 'Files uploaded successfully', 
      data: uploadedFiles, 
      errors 
    });
  }
});

/**
 * DELETE /admin-api/media/:directory/:filename
 * Delete media file
 */
router.delete('/media/:directory/:filename', authMiddleware, adminMiddleware, (req, res) => {
  const { directory, filename } = req.params;
  
  if (!directory || !filename) {
    return res.status(400).json({ 
      success: false, 
      error: 'Directory and filename are required' 
    });
  }
  
  // Check if file exists
  const filePath = path.join(__dirname, `../../public/img/${directory}`, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ 
      success: false, 
      error: 'File not found' 
    });
  }
  
  // Delete file
  try {
    fs.unlinkSync(filePath);
    res.json({ 
      success: true, 
      message: 'File deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete file' 
    });
  }
});

/**
 * GET /admin-api/about
 * Get about page data
 */
router.get('/about', authMiddleware, adminMiddleware, (req, res) => {
  // Load about page data
  const about = loadData(ABOUT_FILE);
  
  res.json({ 
    success: true, 
    data: about 
  });
});

/**
 * PUT /admin-api/about
 * Update about page data
 */
router.put('/about', authMiddleware, adminMiddleware, (req, res) => {
  const { 
    title = '', subtitle = '', intro = '', 
    section_titles = [], section_contents = [], 
    email = '', facebook_url = '', instagram_url = '', pinterest_url = '' 
  } = req.body;
  
  // Load existing about data
  let about = loadData(ABOUT_FILE);
  
  if (!about || Object.keys(about).length === 0) {
    about = {};
  }
  
  // Handle image upload
  let image = about.image || '';
  if (req.files && req.files.image) {
    const newImage = handleImageUpload(req.files.image, 'about');
    if (newImage) {
      // Delete old image if it exists
      if (image) {
        const oldImagePath = path.join(__dirname, '../../public/img/about', image);
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
  
  // Create sections array
  const sections = [];
  // Handle both array and single value cases
  const titlesArray = Array.isArray(section_titles) ? section_titles : [section_titles];
  const contentsArray = Array.isArray(section_contents) ? section_contents : [section_contents];
  
  for (let i = 0; i < titlesArray.length; i++) {
    if (titlesArray[i]) {
      sections.push({
        title: titlesArray[i],
        content: contentsArray[i] || ''
      });
    }
  }
  
  // Update about data
  about = {
    title,
    subtitle,
    image,
    intro,
    sections,
    email,
    social: {
      facebook: facebook_url,
      instagram: instagram_url,
      pinterest: pinterest_url
    },
    updated_at: new Date().toISOString()
  };
  
  // Save about data
  if (saveData(ABOUT_FILE, about)) {
    res.json({ 
      success: true, 
      message: 'About page updated successfully', 
      data: about 
    });
  } else {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update about page' 
    });
  }
});

module.exports = router;