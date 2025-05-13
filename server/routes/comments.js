// server/routes/comments.js - Comments API endpoints

const express = require('express');
const router = express.Router();
const { loadData, saveData, generateId, COMMENTS_FILE, RECIPES_FILE } = require('../utils/fileUtil');
const { authMiddleware, adminMiddleware } = require('../utils/authUtil');

/**
 * GET /api/comments
 * Get comments for a specific recipe
 */
router.get('/', (req, res) => {
  const { recipe_id } = req.query;
  
  if (!recipe_id) {
    return res.status(400).json({
      success: false,
      error: 'Recipe ID is required'
    });
  }
  
  // Load comments
  const comments = loadData(COMMENTS_FILE);
  
  // Filter comments by recipe and status (only approved comments)
  const recipeComments = comments.filter(comment => 
    comment.recipe_id === recipe_id && comment.status === 'approved'
  );
  
  // Organize comments into threads (top-level and replies)
  const commentThreads = [];
  const replies = {};
  
  recipeComments.forEach(comment => {
    if (comment.parent_id) {
      // This is a reply
      if (!replies[comment.parent_id]) {
        replies[comment.parent_id] = [];
      }
      replies[comment.parent_id].push(comment);
    } else {
      // This is a top-level comment
      commentThreads.push(comment);
    }
  });
  
  // Add replies to their parent comments
  commentThreads.forEach(thread => {
    thread.replies = replies[thread.id] || [];
    
    // Sort replies by date (oldest first)
    thread.replies.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
      const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
      return dateA - dateB;
    });
  });
  
  // Sort top-level comments by date (newest first)
  commentThreads.sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
    const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
    return dateB - dateA;
  });
  
  res.json({
    success: true,
    comments: commentThreads
  });
});

/**
 * GET /api/comments/recent
 * Get recent comments
 */
router.get('/recent', (req, res) => {
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
  const commentsWithRecipes = approvedComments.map(comment => {
    const recipe = recipes.find(r => r.id === comment.recipe_id);
    return {
      ...comment,
      recipe_title: recipe ? recipe.title : 'Unknown Recipe'
    };
  });
  
  res.json({
    success: true,
    comments: commentsWithRecipes
  });
});

/**
 * POST /api/comments
 * Add a new comment
 */
router.post('/', (req, res) => {
  const { recipe_id, parent_id, author, email, content } = req.body;
  
  // Validate required fields
  if (!recipe_id || !author || !content) {
    return res.status(400).json({
      success: false,
      error: 'Recipe ID, author, and content are required'
    });
  }
  
  // Check if recipe exists
  const recipes = loadData(RECIPES_FILE);
  const recipe = recipes.find(r => r.id === recipe_id);
  
  if (!recipe) {
    return res.status(404).json({
      success: false,
      error: 'Recipe not found'
    });
  }
  
  // If parent_id is provided, check if it exists
  if (parent_id) {
    const comments = loadData(COMMENTS_FILE);
    const parentComment = comments.find(c => c.id === parent_id);
    
    if (!parentComment) {
      return res.status(404).json({
        success: false,
        error: 'Parent comment not found'
      });
    }
    
    // Ensure parent comment is for the same recipe
    if (parentComment.recipe_id !== recipe_id) {
      return res.status(400).json({
        success: false,
        error: 'Parent comment is for a different recipe'
      });
    }
  }
  
  // Create comment data
  const comment = {
    id: generateId(),
    recipe_id,
    parent_id: parent_id || null,
    author,
    email: email || '',
    content,
    status: 'pending', // Comments are pending until approved
    created_at: new Date().toISOString()
  };
  
  // Load existing comments
  const comments = loadData(COMMENTS_FILE);
  
  // Add new comment
  comments.push(comment);
  
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

/**
 * PUT /api/comments/:id
 * Update a comment (admin only)
 */
router.put('/:id', authMiddleware, adminMiddleware, (req, res) => {
  const commentId = req.params.id;
  const { author, email, content, status } = req.body;
  
  // Validate required fields
  if (!commentId || !content) {
    return res.status(400).json({
      success: false,
      error: 'Comment ID and content are required'
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
 * DELETE /api/comments/:id
 * Delete a comment (admin only)
 */
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
  const commentId = req.params.id;
  
  // Validate required fields
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

module.exports = router;