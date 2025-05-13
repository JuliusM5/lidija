// public/js/admin/comments.js
// Comment management functionality

import { getAuthHeaders } from './auth.js';
import { showNotification, updatePagination, closeModal } from './ui.js';
import { setCurrentItem, getCurrentItem } from './utils.js';

/**
 * Fetch comments for the comments page
 */
export function fetchComments(page = 1, status = 'all') {
  const commentsTable = document.querySelector('#page-comments tbody');
  if (!commentsTable) return;
  
  // Show loading message
  commentsTable.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading comments...</td></tr>';
  
  // Get active tab if status is not specified
  if (status === 'all') {
    const activeTab = document.querySelector('#page-comments .tab.active');
    if (activeTab) {
      status = activeTab.getAttribute('data-tab');
    }
  }
  
  fetch(`/admin-api/comments?status=${status}&page=${page}`, {
    headers: getAuthHeaders()
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      if (data.data.length === 0) {
        // No comments
        commentsTable.innerHTML = '<tr><td colspan="6" style="text-align: center;">No comments found</td></tr>';
        return;
      }
      
      // Clear loading message
      commentsTable.innerHTML = '';
      
      // Add comments to the table
      data.data.forEach(comment => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
          <td>${comment.author || 'Anonymous'}</td>
          <td>${comment.content ? comment.content.substring(0, 50) + (comment.content.length > 50 ? '...' : '') : '-'}</td>
          <td>${comment.recipe_title || '-'}</td>
          <td>${formatDate(comment.created_at) || '-'}</td>
          <td>${getCommentStatusLabel(comment.status)}</td>
          <td>
            <div class="action-buttons">
              <button type="button" class="action-btn view-btn" onclick="viewComment('${comment.id}')"><i class="fas fa-eye"></i></button>
              <button type="button" class="action-btn edit-btn" onclick="editComment('${comment.id}')"><i class="fas fa-edit"></i></button>
              <button type="button" class="action-btn delete-btn" onclick="showDeleteConfirmation('${comment.id}', 'comment')"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        `;
        
        commentsTable.appendChild(row);
      });
      
      // Update pagination
      updatePagination(data.meta);
    } else {
      showNotification('Error', data.error || 'Unknown error', 'error');
    }
  })
  .catch(error => {
    console.error('Fetch comments error:', error);
    commentsTable.innerHTML = '<tr><td colspan="6" style="text-align: center;">Failed to load comments. Please try again.</td></tr>';
    showNotification('Error', 'Failed to load comments', 'error');
  });
}

/**
 * View a specific comment
 */
export function viewComment(commentId) {
  fetch(`/admin-api/comments/${commentId}`, {
    headers: getAuthHeaders()
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to fetch comment: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      // Populate comment modal
      const comment = data.data;
      
      const commentView = document.getElementById('comment-view');
      if (commentView) {
        commentView.innerHTML = `
          <div class="comment-details">
            <p><strong>Author:</strong> ${comment.author || 'Anonymous'}</p>
            <p><strong>Email:</strong> ${comment.email || '-'}</p>
            <p><strong>Recipe:</strong> ${comment.recipe_title || '-'}</p>
            <p><strong>Date:</strong> ${formatDate(comment.created_at) || '-'}</p>
            <p><strong>Status:</strong> ${getCommentStatusLabel(comment.status)}</p>
          </div>
          <div class="comment-content">
            <h4>Comment:</h4>
            <p>${comment.content || '-'}</p>
          </div>
          <div class="comment-actions">
            <button type="button" class="submit-button" onclick="editComment('${comment.id}')">Edit</button>
            <button type="button" class="cancel-button" onclick="changeCommentStatus('${comment.id}', '${comment.status === 'approved' ? 'pending' : 'approved'}')">
              ${comment.status === 'approved' ? 'Mark as Pending' : 'Approve'}
            </button>
            <button type="button" class="cancel-button" onclick="changeCommentStatus('${comment.id}', 'spam')" style="background-color: #cf5151;">
              Mark as Spam
            </button>
          </div>
        `;
      }
      
      // Store comment ID
      setCurrentItem(comment.id, 'comment');
      
      // Show modal
      const modal = document.getElementById('comment-modal');
      if (modal) {
        modal.classList.add('show');
      }
    } else {
      showNotification('Error', data.error || 'Failed to get comment', 'error');
    }
  })
  .catch(error => {
    console.error('Fetch comment details error:', error);
    showNotification('Error', 'Failed to load comment details', 'error');
  });
}

/**
 * Edit a specific comment
 */
export function editComment(commentId) {
  // If we're already viewing the comment, switch to edit mode
  if (document.getElementById('comment-modal').classList.contains('show')) {
    switchToCommentEditMode(commentId);
    return;
  }
  
  // Otherwise, fetch the comment first
  fetch(`/admin-api/comments/${commentId}`, {
    headers: getAuthHeaders()
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to fetch comment: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      // Store comment ID
      setCurrentItem(data.data.id, 'comment');
      
      // Show modal in edit mode
      switchToCommentEditMode(commentId, data.data);
      
      // Show modal
      const modal = document.getElementById('comment-modal');
      if (modal) {
        modal.classList.add('show');
      }
    } else {
      showNotification('Error', data.error || 'Failed to get comment', 'error');
    }
  })
  .catch(error => {
    console.error('Fetch comment details error:', error);
    showNotification('Error', 'Failed to load comment details', 'error');
  });
}

/**
 * Switch comment modal to edit mode
 */
function switchToCommentEditMode(commentId, commentData = null) {
  const modal = document.getElementById('comment-modal');
  const commentView = document.getElementById('comment-view');
  const commentEdit = document.getElementById('comment-edit');
  const saveBtn = document.getElementById('comment-save-btn');
  const modalTitle = document.getElementById('comment-modal-title');
  
  if (!modal || !commentView || !commentEdit || !saveBtn || !modalTitle) {
    showNotification('Error', 'Comment modal elements not found', 'error');
    return;
  }
  
  // If comment data wasn't provided, get it from the view
  if (!commentData) {
    const details = commentView.querySelector('.comment-details');
    if (!details) {
      showNotification('Error', 'Comment details not found', 'error');
      return;
    }
    
    // Extract basic info from details
    const authorText = details.querySelector('p:nth-child(1)').textContent;
    const emailText = details.querySelector('p:nth-child(2)').textContent;
    const statusText = details.querySelector('p:nth-child(5)').textContent;
    const content = commentView.querySelector('.comment-content p').textContent;
    
    commentData = {
      id: commentId,
      author: authorText.replace('Author:', '').trim(),
      email: emailText.replace('Email:', '').trim(),
      content: content,
      status: getStatusFromLabel(statusText.replace('Status:', '').trim())
    };
  }
  
  // Populate edit form
  document.getElementById('edit-comment-author').value = commentData.author || '';
  document.getElementById('edit-comment-email').value = commentData.email || '';
  document.getElementById('edit-comment-content').value = commentData.content || '';
  document.getElementById('edit-comment-status').value = commentData.status || 'pending';
  
  // Switch to edit mode
  commentView.style.display = 'none';
  commentEdit.style.display = 'block';
  saveBtn.style.display = 'block';
  modalTitle.textContent = 'Edit Comment';
}

/**
 * Save comment changes
 */
export function saveComment() {
  // Get the current comment ID
  const { id, type } = getCurrentItem();
  
  if (type !== 'comment' || !id) {
    showNotification('Error', 'No comment selected', 'error');
    return;
  }
  
  // Get form values
  const author = document.getElementById('edit-comment-author').value;
  const email = document.getElementById('edit-comment-email').value;
  const content = document.getElementById('edit-comment-content').value;
  const status = document.getElementById('edit-comment-status').value;
  
  // Validate
  if (!content) {
    showNotification('Error', 'Comment content is required', 'error');
    return;
  }
  
  // Create request data
  const commentData = {
    author,
    email,
    content,
    status
  };
  
  // Show loading notification
  showNotification('Information', 'Saving comment...', 'success');
  
  // Send request
  fetch(`/admin-api/comments/${id}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(commentData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to update comment: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      // Close the modal
      closeModal('comment-modal');
      
      // Show success notification
      showNotification('Success', 'Comment updated successfully!', 'success');
      
      // Reload comments
      fetchComments();
    } else {
      showNotification('Error', data.error || 'Unknown error', 'error');
    }
  })
  .catch(error => {
    console.error('Update comment error:', error);
    showNotification('Error', `Error updating comment: ${error.message}`, 'error');
  });
}

/**
 * Change comment status
 */
export function changeCommentStatus(commentId, newStatus) {
  if (!commentId || !newStatus) {
    showNotification('Error', 'Comment ID and new status are required', 'error');
    return;
  }
  
  // Get current comment data
  fetch(`/admin-api/comments/${commentId}`, {
    headers: getAuthHeaders()
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to fetch comment: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      const commentData = {
        author: data.data.author,
        email: data.data.email,
        content: data.data.content,
        status: newStatus
      };
      
      // Update comment
      return fetch(`/admin-api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commentData)
      });
    } else {
      throw new Error(data.error || 'Failed to get comment');
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to update comment: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      // Close the modal
      closeModal('comment-modal');
      
      // Show success notification
      showNotification('Success', 'Comment status updated successfully!', 'success');
      
      // Reload comments
      fetchComments();
    } else {
      showNotification('Error', data.error || 'Unknown error', 'error');
    }
  })
  .catch(error => {
    console.error('Update comment status error:', error);
    showNotification('Error', `Error updating comment status: ${error.message}`, 'error');
  });
}

/**
 * Delete a comment
 */
export function deleteComment(commentId) {
  if (!commentId) {
    const { id, type } = getCurrentItem();
    commentId = id;
    
    if (type !== 'comment') {
      console.error('Invalid item type for deleteComment');
      return;
    }
  }
  
  if (!commentId) {
    showNotification('Error', 'Comment ID is required', 'error');
    return;
  }
  
  // Show loading notification
  showNotification('Information', 'Deleting comment...', 'success');
  
  // Send request
  fetch(`/admin-api/comments/${commentId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to delete comment: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      showNotification('Success', 'Comment deleted successfully!', 'success');
      
      // Close modals if open
      closeModal('delete-modal');
      closeModal('comment-modal');
      
      // Refresh comments
      fetchComments();
    } else {
      showNotification('Error', data.error || 'Unknown error', 'error');
    }
  })
  .catch(error => {
    console.error('Delete comment error:', error);
    showNotification('Error', `Error deleting comment: ${error.message}`, 'error');
  });
}

/**
 * Show delete confirmation dialog
 */
export function showDeleteConfirmation(itemId, itemType) {
  // Set current item for deletion
  setCurrentItem(itemId, itemType);
  
  // Show the modal
  const modal = document.getElementById('delete-modal');
  if (modal) {
    modal.classList.add('show');
  }
}

/**
 * Get readable status label
 */
export function getCommentStatusLabel(status) {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'pending':
      return 'Pending';
    case 'spam':
      return 'Spam';
    default:
      return 'Unknown';
  }
}

/**
 * Get status value from label
 */
function getStatusFromLabel(label) {
  switch (label.toLowerCase()) {
    case 'approved':
      return 'approved';
    case 'pending':
      return 'pending';
    case 'spam':
      return 'spam';
    default:
      return 'pending';
  }
}

/**
 * Format date string
 */
function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}