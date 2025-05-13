// server/controllers/commentsController.js
const { loadData, saveData, generateId, COMMENTS_FILE, RECIPES_FILE } = require('../utils/fileUtil');

/**
 * Get comments for a specific recipe
 */
exports.getCommentsByRecipe = (recipeId) => {
  if (!recipeId) {
    return { success: false, error: 'Recipe ID is required' };
  }
  
  // Load comments
  const comments = loadData(COMMENTS_FILE);
  
  // Filter by recipe and status (only approved)
  const recipeComments = comments.filter(comment => 
    comment.recipe_id === recipeId && comment.status === 'approved'
  );
  
  // Organize into threads
  const commentThreads = [];
  const replies = {};
  
  recipeComments.forEach(comment => {
    if (comment.parent_id) {
      if (!replies[comment.parent_id]) {
        replies[comment.parent_id] = [];
      }
      replies[comment.parent_id].push(comment);
    } else {
      commentThreads.push(comment);
    }
  });
  
  // Add replies to parent comments
  commentThreads.forEach(thread => {
    thread.replies = replies[thread.id] || [];
    
    // Sort replies by date (oldest first)
    thread.replies.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
      const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
      return dateA - dateB;
    });
  });
  
  // Sort threads by date (newest first)
  commentThreads.sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
    const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
    return dateB - dateA;
  });
  
  return {
    success: true,
    comments: commentThreads
  };
};

/**
 * Get recent comments (across all recipes)
 */
exports.getRecentComments = (limit = 5) => {
  // Load comments
  const comments = loadData(COMMENTS_FILE);
  
  // Filter and sort approved comments
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
      recipe_title: recipe ? recipe.title : 'Unknown Recipe',
      recipe_slug: recipe ? (recipe.slug || slugify(recipe.title)) : ''
    };
  });
  
  return {
    success: true,
    comments: commentsWithRecipes
  };
};

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
 * Add a new comment
 */
exports.addComment = (commentData) => {
  const { recipe_id, parent_id, author, email, content } = commentData;
  
  // Validate required fields
  if (!recipe_id || !author || !content) {
    return { success: false, error: 'Recipe ID, author, and content are required' };
  }
  
  // Check if recipe exists
  const recipes = loadData(RECIPES_FILE);
  const recipe = recipes.find(r => r.id === recipe_id);
  
  if (!recipe) {
    return { success: false, error: 'Recipe not found' };
  }
  
  // If parent_id is provided, check if it exists
  if (parent_id) {
    const comments = loadData(COMMENTS_FILE);
    const parentComment = comments.find(c => c.id === parent_id);
    
    if (!parentComment) {
      return { success: false, error: 'Parent comment not found' };
    }
    
    // Ensure parent comment is for the same recipe
    if (parentComment.recipe_id !== recipe_id) {
      return { success: false, error: 'Parent comment is for a different recipe' };
    }
  }
  
  // Create new comment
  const comment = {
    id: generateId(),
    recipe_id,
    parent_id: parent_id || null,
    author,
    email: email || '',
    content,
    status: 'pending', // Default status is pending
    created_at: new Date().toISOString()
  };
  
  // Load comments
  const comments = loadData(COMMENTS_FILE);
  
  // Add comment
  comments.push(comment);
  
  // Save comments
  if (saveData(COMMENTS_FILE, comments)) {
    return { 
      success: true, 
      message: 'Comment added successfully and will be visible after moderation',
      comment
    };
  } else {
    return { success: false, error: 'Failed to save comment' };
  }
};

/**
 * Update a comment
 */
exports.updateComment = (commentId, commentData) => {
  const { author, email, content, status } = commentData;
  
  // Validate
  if (!commentId || !content) {
    return { success: false, error: 'Comment ID and content are required' };
  }
  
  // Load comments
  const comments = loadData(COMMENTS_FILE);
  
  // Find comment
  const commentIndex = comments.findIndex(c => c.id === commentId);
  
  if (commentIndex === -1) {
    return { success: false, error: 'Comment not found' };
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
    return { 
      success: true, 
      message: 'Comment updated successfully',
      comment: comments[commentIndex]
    };
  } else {
    return { success: false, error: 'Failed to update comment' };
  }
};

/**
 * Delete a comment
 */
exports.deleteComment = (commentId) => {
  // Validate
  if (!commentId) {
    return { success: false, error: 'Comment ID is required' };
  }
  
  // Load comments
  const comments = loadData(COMMENTS_FILE);
  
  // Find comment
  const commentIndex = comments.findIndex(c => c.id === commentId);
  
  if (commentIndex === -1) {
    return { success: false, error: 'Comment not found' };
  }
  
  // Remove comment
  comments.splice(commentIndex, 1);
  
  // Save comments
  if (saveData(COMMENTS_FILE, comments)) {
    return { success: true, message: 'Comment deleted successfully' };
  } else {
    return { success: false, error: 'Failed to delete comment' };
  }
};

/**
 * Get comments for admin panel
 */
exports.getCommentsForAdmin = (status = 'all', page = 1, perPage = 10) => {
  // Load comments
  let comments = loadData(COMMENTS_FILE);
  
  // Filter by status
  if (status && status !== 'all') {
    comments = comments.filter(comment => comment.status === status);
  }
  
  // Sort by date (newest first)
  comments.sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
    const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
    return dateB - dateA;
  });
  
  // Add recipe titles
  const recipes = loadData(RECIPES_FILE);
  comments.forEach(comment => {
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
  
  // Pagination
  const pageNum = parseInt(page);
  const pageSize = parseInt(perPage);
  const totalComments = comments.length;
  const totalPages = Math.ceil(totalComments / pageSize);
  const offset = (pageNum - 1) * pageSize;
  const paginatedComments = comments.slice(offset, offset + pageSize);
  
  return {
    success: true,
    data: paginatedComments,
    meta: {
      page: pageNum,
      per_page: pageSize,
      total: totalComments,
      pages: totalPages
    }
  };
};