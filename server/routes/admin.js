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
  RECIPES_FILE,
  COMMENTS_FILE,
  USERS_FILE,
  ABOUT_FILE
} = require('../utils/fileUtil');
const { verifyUser, generateToken, authMiddleware } = require('../utils/authUtil');

/**
 * POST /admin-connector?action=login
 * Handle admin login
 */
router.post('/login', (req, res) => {
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
 * GET /admin-connector?action=logout
 * Handle admin logout
 */
router.get('/logout', (req, res) => {
  // In a token-based auth system, the client should invalidate the token
  res.json({ 
    success: true, 
    message: 'Logout successful' 
  });
});

/**
 * GET /admin-connector?action=dashboard_stats
 * Get dashboard statistics
 */
router.get('/dashboard_stats', authMiddleware, (req, res) => {
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
 * GET /admin-connector?action=get_recipes
 * Get all recipes for admin panel
 */
router.get('/get_recipes', authMiddleware, (req, res) => {
  // Get request parameters
  const { status, page = 1, per_page = 10 } = req.query;
  
  // Load recipes
  let recipes = loadData(RECIPES_FILE);
  
  // Filter by status if provided
  if (status && status !== 'all') {
    recipes = recipes.filter(recipe => recipe.status === status);
  }
  
  // Sort by date
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
 * GET /admin-connector?action=get_recipe
 * Get a specific recipe for admin panel
 */
router.get('/get_recipe', authMiddleware, (req, res) => {
  const { id } = req.query;
  
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
 * GET /admin-connector?action=get_comments
 * Get all comments for admin panel
 */
router.get('/get_comments', authMiddleware, (req, res) => {
  // Get request parameters
  const { status, page = 1, per_page = 10 } = req.query;
  
  // Load comments
  let comments = loadData(COMMENTS_FILE);
  
  // Filter by status if provided
  if (status && status !== 'all') {
    comments = comments.filter(comment => comment.status === status);
  }
  
  // Sort by date
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
 * GET /admin-connector?action=get_about
 * Get about page data
 */
router.get('/get_about', (req, res) => {
  // Load about page data
  const about = loadData(ABOUT_FILE);
  
  if (!about || Object.keys(about).length === 0) {
    // Return empty data structure
    const emptyAbout = {
      title: '',
      subtitle: '',
      image: '',
      intro: '',
      sections: [],
      email: '',
      social: {
        facebook: '',
        instagram: '',
        pinterest: ''
      }
    };
    
    res.json({ success: true, data: emptyAbout });
  } else {
    res.json({ success: true, data: about });
  }
});

/**
 * POST /admin-connector?action=update_about
 * Update about page data
 */
router.post('/update_about', authMiddleware, (req, res) => {
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
  if (Array.isArray(section_titles)) {
    for (let i = 0; i < section_titles.length; i++) {
      if (section_titles[i]) {
        sections.push({
          title: section_titles[i],
          content: section_contents[i] || ''
        });
      }
    }
  } else if (section_titles) {
    sections.push({
      title: section_titles,
      content: section_contents || ''
    });
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

/**
 * GET /admin-connector?action=get_media
 * Get media files
 */
router.get('/get_media', authMiddleware, (req, res) => {
  const { type = 'all', page = 1, per_page = 18 } = req.query;
  
  // Get files from uploads directory
  const mediaFiles = [];
  
  // Base uploads directory
  const uploadsDir = path.join(__dirname, '../../public/img');
  
  // Directories to scan based on type
  const dirsToScan = [];
  
  if (type === 'all') {
    // Scan all directories
    dirsToScan.push(uploadsDir);
    
    // Add subdirectories
    const subdirs = fs.readdirSync(uploadsDir)
      .filter(file => {
        const filePath = path.join(uploadsDir, file);
        return fs.statSync(filePath).isDirectory();
      })
      .map(dir => path.join(uploadsDir, dir));
    
    dirsToScan.push(...subdirs);
  } else if (type === 'recipe' && fs.existsSync(path.join(uploadsDir, 'recipes'))) {
    dirsToScan.push(path.join(uploadsDir, 'recipes'));
  } else if (type === 'gallery' && fs.existsSync(path.join(uploadsDir, 'gallery'))) {
    dirsToScan.push(path.join(uploadsDir, 'gallery'));
  } else {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid media type' 
    });
  }
  
  // Scan directories
  dirsToScan.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir)
        .filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
        });
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        mediaFiles.push({
          id: file,
          name: file,
          path: filePath.replace(path.join(__dirname, '../../public'), ''),
          type: path.extname(file).substring(1),
          size: stats.size,
          created_at: stats.birthtime.toISOString()
        });
      });
    }
  });
  
  // Sort by date
  mediaFiles.sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
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
 * POST /admin-connector?action=upload_media
 * Upload media files
 */
router.post('/upload_media', authMiddleware, (req, res) => {
  // Check if files are uploaded
  if (!req.files || !req.files.files) {
    return res.status(400).json({ 
      success: false, 
      error: 'No files uploaded' 
    });
  }
  
  // Get upload type
  const type = req.body.type || 'gallery';
  
  // Upload directory
  const uploadDir = path.join(__dirname, '../../public/img', type);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
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
    
    // Generate unique filename
    const ext = path.extname(file.name);
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}${ext}`;
    const filePath = path.join(uploadDir, filename);
    
    // Move file
    try {
      file.mv(filePath);
      
      uploadedFiles.push({
        name: file.name,
        path: filePath.replace(path.join(__dirname, '../../public'), ''),
        size: file.size,
        type: file.mimetype
      });
    } catch (error) {
      console.error('Error moving file:', error);
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
 * DELETE /admin-connector?action=delete_media
 * Delete media file
 */
router.delete('/delete_media', authMiddleware, (req, res) => {
  const { filename } = req.body;
  
  if (!filename) {
    return res.status(400).json({ 
      success: false, 
      error: 'Filename is required' 
    });
  }
  
  // Check if file exists
  const uploadsDir = path.join(__dirname, '../../public/img');
  let filePath = path.join(uploadsDir, filename);
  let found = fs.existsSync(filePath);
  
  // Check in subdirectories if not found
  if (!found) {
    const subdirs = fs.readdirSync(uploadsDir)
      .filter(file => {
        const dirPath = path.join(uploadsDir, file);
        return fs.statSync(dirPath).isDirectory();
      });
    
    for (const dir of subdirs) {
      const subFilePath = path.join(uploadsDir, dir, filename);
      if (fs.existsSync(subFilePath)) {
        filePath = subFilePath;
        found = true;
        break;
      }
    }
  }
  
  if (!found) {
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

module.exports = router;