// server/routes/comments.js - Comments API endpoints

const express = require('express');
const router = express.Router();
const { loadData, saveData, generateId, COMMENTS_FILE } = require('../utils/fileUtil');
const { authMiddleware } = require('../utils/authUtil');

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
  });
  
  res.json({
    success: true,
    comments: commentThreads
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
      message: 'Comment added successfully'
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
 * Update a comment (protected route)
 */
router.put('/:id', authMiddleware, (req, res) => {
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
 * Delete a comment (protected route)
 */
router.delete('/:id', authMiddleware, (req, res) => {
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