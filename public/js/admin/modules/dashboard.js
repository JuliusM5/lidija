// public/js/admin/dashboard.js
// Dashboard specific functionality

import { getAuthHeaders } from './auth.js';
import { showNotification } from './ui.js';

/**
 * Load dashboard statistics
 */
export function loadDashboardStats() {
  fetch('/admin-api/dashboard/stats', {
    headers: getAuthHeaders()
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard stats: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      // Update dashboard widgets
      updateDashboardWidgets(data.data);
      
      // Update recent recipes
      updateRecentRecipes(data.data.recent_recipes || []);
      
      // Update recent comments
      updateRecentComments(data.data.recent_comments || []);
    } else {
      showNotification('Error', data.error || 'Failed to load dashboard stats', 'error');
    }
  })
  .catch(error => {
    console.error('Dashboard stats error:', error);
    showNotification('Error', 'Failed to load dashboard data. Please refresh the page.', 'error');
  });
}

/**
 * Update dashboard widgets with statistics
 */
export function updateDashboardWidgets(data) {
  // Update recipe count
  const recipeWidget = document.querySelector('.widget:nth-child(1) .widget-count');
  if (recipeWidget && data.recipes) {
    recipeWidget.textContent = data.recipes.total || 0;
  }
  
  // Update comment count
  const commentWidget = document.querySelector('.widget:nth-child(2) .widget-count');
  if (commentWidget && data.comments) {
    commentWidget.textContent = data.comments.total || 0;
  }
  
  // Update media count
  const mediaWidget = document.querySelector('.widget:nth-child(3) .widget-count');
  if (mediaWidget && data.media) {
    mediaWidget.textContent = data.media.total || 0;
  }
}

/**
 * Update recent recipes table
 */
export function updateRecentRecipes(recipes) {
  const table = document.querySelector('#page-dashboard .admin-section:nth-child(2) tbody');
  if (!table) return;
  
  if (recipes.length === 0) {
    table.innerHTML = '<tr><td colspan="4" style="text-align: center;">No recipes</td></tr>';
    return;
  }
  
  table.innerHTML = '';
  
  recipes.forEach(recipe => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${recipe.title || 'Untitled'}</td>
      <td>${recipe.categories && recipe.categories.length ? recipe.categories.join(', ') : '-'}</td>
      <td>${recipe.created_at || '-'}</td>
      <td>
        <div class="action-buttons">
          <button type="button" class="action-btn edit-btn" onclick="editRecipe('${recipe.id}')"><i class="fas fa-edit"></i></button>
          <button type="button" class="action-btn delete-btn" onclick="showDeleteConfirmation('${recipe.id}', 'recipe')"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    `;
    
    table.appendChild(row);
  });
}

/**
 * Update recent comments table
 */
export function updateRecentComments(comments) {
  const table = document.querySelector('#page-dashboard .admin-section:nth-child(3) tbody');
  if (!table) return;
  
  if (comments.length === 0) {
    table.innerHTML = '<tr><td colspan="5" style="text-align: center;">No comments</td></tr>';
    return;
  }
  
  table.innerHTML = '';
  
  comments.forEach(comment => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${comment.author || 'Anonymous'}</td>
      <td>${comment.content ? comment.content.substring(0, 50) + (comment.content.length > 50 ? '...' : '') : '-'}</td>
      <td>${comment.recipe_title || '-'}</td>
      <td>${comment.created_at || '-'}</td>
      <td>
        <div class="action-buttons">
          <button type="button" class="action-btn view-btn" onclick="viewComment('${comment.id}')"><i class="fas fa-eye"></i></button>
          <button type="button" class="action-btn delete-btn" onclick="showDeleteConfirmation('${comment.id}', 'comment')"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    `;
    
    table.appendChild(row);
  });
}