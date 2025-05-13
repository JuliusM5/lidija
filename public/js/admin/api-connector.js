// public/js/admin/api-connector.js
// This file provides compatibility with the existing admin.js API calls

/**
 * Map old PHP endpoints to new Node.js endpoints
 * @param {string} action - The action parameter from the old PHP calls
 * @returns {string} - The corresponding Node.js endpoint
 */
function mapEndpoint(action) {
  const endpoints = {
    // Dashboard
    'dashboard_stats': '/admin-api/dashboard/stats',
    
    // Recipes
    'get_recipes': '/admin-api/recipes',
    'get_recipe': '/admin-api/recipes/',  // Will be appended with ID
    'add_recipe': '/admin-api/recipes',
    'update_recipe': '/admin-api/recipes/', // Will be appended with ID
    'delete_recipe': '/admin-api/recipes/', // Will be appended with ID
    
    // Comments
    'get_comments': '/admin-api/comments',
    'get_comment': '/admin-api/comments/', // Will be appended with ID
    'update_comment': '/admin-api/comments/', // Will be appended with ID
    'delete_comment': '/admin-api/comments/', // Will be appended with ID
    
    // Media
    'get_media': '/admin-api/media',
    'upload_media': '/admin-api/media',
    'delete_media': '/admin-api/media', // Will need directory and filename
    
    // About page
    'get_about': '/admin-api/about',
    'update_about': '/admin-api/about'
  };
  
  return endpoints[action] || '/admin-api';
}

// Intercept all fetch calls to /admin-connector.php and redirect to the appropriate Node.js endpoint
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
  // Check if this is a request to the old PHP connector
  if (typeof url === 'string' && url.includes('/admin-connector.php')) {
    // Parse the action from the URL
    const urlObj = new URL(url, window.location.origin);
    const action = urlObj.searchParams.get('action');
    const id = urlObj.searchParams.get('id');
    
    if (action) {
      // Map to the new endpoint
      let newUrl = mapEndpoint(action);
      
      // Append ID if necessary
      if (id && ['get_recipe', 'update_recipe', 'delete_recipe', 'get_comment', 'update_comment', 'delete_comment'].includes(action)) {
        newUrl += id;
      }
      
      // Add any other query parameters
      const params = new URLSearchParams();
      for (const [key, value] of urlObj.searchParams.entries()) {
        if (key !== 'action' && key !== 'id') {
          params.append(key, value);
        }
      }
      
      if (params.toString()) {
        newUrl += '?' + params.toString();
      }
      
      console.log(`Redirecting request from ${url} to ${newUrl}`);
      
      // Return the fetch with the new URL
      return originalFetch(newUrl, options);
    }
  }
  
  // Pass through all other requests
  return originalFetch(url, options);
};

// Utility function to load fallback dashboard data (referenced in the original code)
window.loadFallbackDashboardData = function() {
  console.log('Loading fallback dashboard data');
  
  // Update widget counts
  const updateDashboardWidgets = window.updateDashboardWidgets || function() {};
  updateDashboardWidgets({
    recipes: { total: 3 },
    comments: { total: 3 },
    media: { total: 0 }
  });
  
  // Add fallback recipes
  const updateRecentRecipes = window.updateRecentRecipes || function() {};
  updateRecentRecipes([
    {
      id: 'fallback-1',
      title: 'Šaltibarščiai: vasaros skonis dubenyje',
      categories: ['Sriubos', 'Vasaros patiekalai'],
      created_at: '2025-05-03 14:32:15'
    },
    {
      id: 'fallback-2',
      title: 'Kugelis (bulvių plokštainis)',
      categories: ['Bulvės', 'Iš močiutės virtuvės'],
      created_at: '2025-03-15 10:45:22'
    },
    {
      id: 'fallback-3',
      title: 'Tinginys: desertas užimtoms dienoms',
      categories: ['Desertai'],
      created_at: '2025-02-10 16:12:45'
    }
  ]);
  
  // Add fallback comments
  const updateRecentComments = window.updateRecentComments || function() {};
  updateRecentComments([
    {
      id: 'comment-1',
      author: 'Laura',
      content: 'Mano močiutė visada dėdavo truputį krienų į šaltibarščius. Tai suteikia ypatingą aštrumą!',
      recipe_title: 'Šaltibarščiai: vasaros skonis dubenyje',
      created_at: '2025-05-03 16:42:10'
    },
    {
      id: 'comment-2',
      author: 'Tomas',
      content: 'Kefyrą galima pakeisti graikišku jogurtu?',
      recipe_title: 'Šaltibarščiai: vasaros skonis dubenyje',
      created_at: '2025-05-04 09:15:33'
    }
  ]);
};

// Export functions to make them accessible globally
window.updateDashboardWidgets = function(data) {
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
};

window.updateRecentRecipes = function(recipes) {
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
};

window.updateRecentComments = function(comments) {
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
};

// Support for the original admin.js init function
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('admin-dashboard')) {
    setupLoginForm();
    initTabs();
    initIngredientList();
    initStepList();
    initTagsInput();
    initFileUploads();
    initRemoveButtons();
    checkLoginStatus();
  }
});

// Placeholder implementations of critical functions
function setupLoginForm() {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      if (!username || !password) {
        showNotification('Error', 'Please enter both username and password', 'error');
        return;
      }
      
      // Show loading notification
      showNotification('Please wait', 'Authenticating...', 'success');
      
      // Send login request to Node.js backend
      fetch('/admin-api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Save authentication data
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('isLoggedIn', 'true');
          
          // Show dashboard
          document.getElementById('login-page').style.display = 'none';
          document.getElementById('admin-dashboard').style.display = 'block';
          
          // Load dashboard
          showAdminPage('dashboard');
          
          // Show success notification
          showNotification('Success', 'Login successful!', 'success');
        } else {
          showNotification('Error', data.error || 'Login failed', 'error');
        }
      })
      .catch(error => {
        console.error('Login error:', error);
        showNotification('Error', 'Login failed. Please check your credentials and try again.', 'error');
      });
    });
  }
}

function checkLoginStatus() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (isLoggedIn) {
    // Auto-login
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    showAdminPage('dashboard');
  } else {
    // Show login page
    document.getElementById('login-page').style.display = 'block';
    document.getElementById('admin-dashboard').style.display = 'none';
  }
}

function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const tabContainer = this.closest('.tabs');
      if (!tabContainer) return;
      
      // Remove active class from all tabs
      tabContainer.querySelectorAll('.tab').forEach(t => {
        t.classList.remove('active');
      });
      
      // Add active class to clicked tab
      this.classList.add('active');
    });
  });
}

function initIngredientList() {
  // Add Ingredient Button Handler
  const addIngredientBtn = document.getElementById('add-ingredient-btn');
  if (addIngredientBtn) {
    addIngredientBtn.addEventListener('click', function() {
      const ingredientList = document.getElementById('ingredient-list');
      if (!ingredientList) return;
      
      const newItem = document.createElement('div');
      newItem.className = 'ingredient-item';
      newItem.innerHTML = `
        <input type="text" name="ingredients[]" class="form-control" placeholder="Enter ingredient">
        <button type="button" class="remove-ingredient-btn"><i class="fas fa-times"></i></button>
      `;
      
      ingredientList.appendChild(newItem);
      
      // Add event listener for remove button
      const removeBtn = newItem.querySelector('.remove-ingredient-btn');
      if (removeBtn) {
        removeBtn.addEventListener('click', function() {
          ingredientList.removeChild(newItem);
        });
      }
    });
  }
}

function initStepList() {
  // Add Step Button Handler
  const addStepBtn = document.getElementById('add-step-btn');
  if (addStepBtn) {
    addStepBtn.addEventListener('click', function() {
      const stepList = document.getElementById('step-list');
      if (!stepList) return;
      
      const stepItems = stepList.querySelectorAll('.step-item');
      const newStepNumber = stepItems.length + 1;
      
      const newItem = document.createElement('div');
      newItem.className = 'step-item';
      newItem.innerHTML = `
        <div class="step-number">${newStepNumber}</div>
        <div class="step-content">
          <textarea name="steps[]" class="form-control" placeholder="Enter step description"></textarea>
        </div>
        <div class="step-actions">
          <button type="button" class="remove-ingredient-btn"><i class="fas fa-times"></i></button>
        </div>
      `;
      
      stepList.appendChild(newItem);
      
      // Add event listener for remove button
      const removeBtn = newItem.querySelector('.remove-ingredient-btn');
      if (removeBtn) {
        removeBtn.addEventListener('click', function() {
          stepList.removeChild(newItem);
          updateStepNumbers();
        });
      }
    });
  }
}

function updateStepNumbers() {
  const stepList = document.getElementById('step-list');
  if (!stepList) return;
  
  const stepItems = stepList.querySelectorAll('.step-item');
  
  stepItems.forEach((item, index) => {
    const stepNumber = item.querySelector('.step-number');
    if (stepNumber) {
      stepNumber.textContent = index + 1;
    }
  });
}

function initTagsInput() {
  const tagsInput = document.getElementById('tags-input');
  if (tagsInput) {
    tagsInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && this.value.trim() !== '') {
        e.preventDefault();
        
        const tagsContainer = document.getElementById('tags-container');
        if (!tagsContainer) return;
        
        const tag = document.createElement('div');
        tag.className = 'tag';
        
        const tagText = document.createElement('span');
        tagText.className = 'tag-text';
        tagText.textContent = this.value.trim();
        
        const tagRemove = document.createElement('button');
        tagRemove.className = 'tag-remove';
        tagRemove.type = 'button';
        tagRemove.innerHTML = '<i class="fas fa-times"></i>';
        tagRemove.addEventListener('click', function() {
          tagsContainer.removeChild(tag);
        });
        
        tag.appendChild(tagText);
        tag.appendChild(tagRemove);
        
        tagsContainer.insertBefore(tag, this);
        this.value = '';
      }
    });
  }
}

function initFileUploads() {
  // Recipe image upload
  const recipeImage = document.getElementById('recipe-image');
  if (recipeImage) {
    recipeImage.addEventListener('change', function() {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const imagePreview = document.getElementById('image-preview');
          if (!imagePreview) return;
          
          const previewImg = imagePreview.querySelector('img');
          if (previewImg) {
            previewImg.src = e.target.result;
          } else {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = 'Recipe image preview';
            imagePreview.appendChild(img);
          }
          
          imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

function initRemoveButtons() {
  // Remove image buttons
  const removeImageButtons = document.querySelectorAll('.remove-image');
  removeImageButtons.forEach(button => {
    button.addEventListener('click', function() {
      const imagePreview = this.closest('.image-preview');
      if (!imagePreview) return;
      
      imagePreview.style.display = 'none';
      
      // Clear file input
      const fileInput = document.querySelector('.file-upload-input');
      if (fileInput) {
        fileInput.value = '';
      }
    });
  });
}

function showAdminPage(pageId) {
  // Hide all pages
  const pages = document.querySelectorAll('.admin-page');
  pages.forEach(page => {
    page.style.display = 'none';
  });
  
  // Show selected page
  const selectedPage = document.getElementById(`page-${pageId}`);
  if (selectedPage) {
    selectedPage.style.display = 'block';
    
    // Load page data if needed
    if (pageId === 'dashboard') {
      loadDashboardStats();
    }
  }
}

// Reuse the existing showNotification and hideNotification functions
function showNotification(title, message, type = 'success') {
  const notification = document.getElementById('notification');
  if (!notification) return;
  
  const notificationTitle = notification.querySelector('.notification-title');
  const notificationMessage = notification.querySelector('.notification-message');
  const notificationIcon = notification.querySelector('.notification-icon i');
  
  if (notificationTitle && notificationMessage && notificationIcon) {
    // Set notification content
    notificationTitle.textContent = title;
    notificationMessage.textContent = message;
    
    // Set notification type
    notification.className = 'notification';
    if (type === 'success') {
      notification.classList.add('notification-success');
      notificationIcon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
      notification.classList.add('notification-error');
      notificationIcon.className = 'fas fa-exclamation-circle';
    }
    
    // Show notification
    notification.classList.add('show');
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      hideNotification();
    }, 5000);
  }
}

function hideNotification() {
  const notification = document.getElementById('notification');
  if (notification) {
    notification.classList.remove('show');
  }
}

// Define loadDashboardStats to fix the original error
function loadDashboardStats() {
  fetch('/admin-connector.php?action=dashboard_stats')
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to load dashboard stats');
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      // Update widget counts
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
    // Load fallback data for demo
    loadFallbackDashboardData();
  });
}

// Expose functions to window
window.showAdminPage = showAdminPage;
window.showNotification = showNotification;
window.hideNotification = hideNotification;
window.loadDashboardStats = loadDashboardStats;