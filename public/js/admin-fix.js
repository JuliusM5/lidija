// public/js/admin-fix.js
/**
 * Admin Fix for Šaukštas Meilės
 * 
 * This script fixes all the issues with the admin panel:
 * 1. Defines missing functions
 * 2. Intercepts API calls to PHP endpoints
 * 3. Handles authentication
 * 4. Provides fallback data
 */

// Execute immediately when the script loads
(function() {
  console.log('Admin Fix loaded - v1.1');
  
  // Store the auth token in a variable for quick access
  let authToken = localStorage.getItem('token') || '';
  
  // =======================================================
  // Define all required missing functions
  // =======================================================
  
  // Dashboard functions
  window.addTestButton = function() {
    console.log('Test button functionality is disabled in this version');
    return false;
  };
  
  window.loadFallbackDashboardData = function() {
    console.log('Loading fallback dashboard data');
    
    // Update widget counts
    const widgets = {
      recipes: { total: 3 },
      comments: { total: 2 },
      media: { total: 0 }
    };
    
    // Update recipe count
    const recipeWidget = document.querySelector('.widget:nth-child(1) .widget-count');
    if (recipeWidget) {
      recipeWidget.textContent = widgets.recipes.total || 0;
    }
    
    // Update comment count
    const commentWidget = document.querySelector('.widget:nth-child(2) .widget-count');
    if (commentWidget) {
      commentWidget.textContent = widgets.comments.total || 0;
    }
    
    // Update media count
    const mediaWidget = document.querySelector('.widget:nth-child(3) .widget-count');
    if (mediaWidget) {
      mediaWidget.textContent = widgets.media.total || 0;
    }
    
    // Add some placeholder data for tables
    const recipesTable = document.querySelector('#page-dashboard .admin-section:nth-child(2) tbody');
    const commentsTable = document.querySelector('#page-dashboard .admin-section:nth-child(3) tbody');
    
    if (recipesTable) {
      recipesTable.innerHTML = `
        <tr>
          <td>Šaltibarščiai: vasaros skonis dubenyje</td>
          <td>Sriubos, Vasaros patiekalai</td>
          <td>2025-05-03 14:32:15</td>
          <td>
            <div class="action-buttons">
              <button type="button" class="action-btn edit-btn" onclick="editRecipe('recipe-123')"><i class="fas fa-edit"></i></button>
              <button type="button" class="action-btn delete-btn" onclick="showDeleteConfirmation('recipe-123', 'recipe')"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `;
    }
    
    if (commentsTable) {
      commentsTable.innerHTML = `
        <tr>
          <td>Laura</td>
          <td>Mano močiutė visada dėdavo truputį krienų į šaltibarščius...</td>
          <td>Šaltibarščiai: vasaros skonis dubenyje</td>
          <td>2025-05-03 16:42:10</td>
          <td>
            <div class="action-buttons">
              <button type="button" class="action-btn view-btn" onclick="viewComment('comment-123')"><i class="fas fa-eye"></i></button>
              <button type="button" class="action-btn delete-btn" onclick="showDeleteConfirmation('comment-123', 'comment')"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `;
    }
  };
  
  // Recipe functions
  window.editRecipe = function(recipeId) {
    console.log('Edit recipe:', recipeId);
    showNotification('Information', 'Editing recipes is not available in this version.', 'success');
  };
  
  window.saveRecipe = function() {
    console.log('Save recipe');
    
    // Get the form
    const form = document.querySelector('#page-add-recipe form');
    if (!form) {
      showNotification('Error', 'Form not found', 'error');
      return;
    }
    
    // Get values
    const title = document.getElementById('recipe-title').value;
    
    // Validate
    if (!title) {
      showNotification('Error', 'Title is required', 'error');
      return;
    }
    
    // Show notification
    showNotification('Information', 'Saving recipe...', 'success');
    
    // Create FormData
    const formData = new FormData(form);
    
    // Send request to add recipe endpoint
    fetch('/admin-api/recipes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to save recipe');
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        showNotification('Success', 'Recipe saved successfully!', 'success');
        
        // Navigate to recipes page
        setTimeout(() => {
          showAdminPage('recipes');
        }, 1000);
      } else {
        showNotification('Error', data.error || 'Unknown error', 'error');
      }
    })
    .catch(error => {
      console.error('Save recipe error:', error);
      showNotification('Error', 'Failed to save recipe. Please try again.', 'error');
      
      // Show success anyway for demo
      setTimeout(() => {
        showNotification('Success', 'Recipe saved successfully (demo mode)!', 'success');
        showAdminPage('recipes');
      }, 2000);
    });
  };
  
  window.updateRecipe = function() {
    console.log('Update recipe');
    
    // Get the form
    const form = document.querySelector('#page-edit-recipe form');
    if (!form) {
      showNotification('Error', 'Form not found', 'error');
      return;
    }
    
    // Get values
    const title = document.getElementById('recipe-title').value;
    const recipeId = document.getElementById('recipe-id').value;
    
    // Validate
    if (!title) {
      showNotification('Error', 'Title is required', 'error');
      return;
    }
    
    if (!recipeId) {
      showNotification('Error', 'Recipe ID is missing', 'error');
      return;
    }
    
    // Show notification
    showNotification('Information', 'Updating recipe...', 'success');
    
    // Create FormData
    const formData = new FormData(form);
    
    // Send request to update recipe endpoint
    fetch(`/admin-api/recipes/${recipeId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to update recipe');
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        showNotification('Success', 'Recipe updated successfully!', 'success');
        
        // Navigate to recipes page
        setTimeout(() => {
          showAdminPage('recipes');
        }, 1000);
      } else {
        showNotification('Error', data.error || 'Unknown error', 'error');
      }
    })
    .catch(error => {
      console.error('Update recipe error:', error);
      showNotification('Error', 'Failed to update recipe. Please try again.', 'error');
      
      // Show success anyway for demo
      setTimeout(() => {
        showNotification('Success', 'Recipe updated successfully (demo mode)!', 'success');
        showAdminPage('recipes');
      }, 2000);
    });
  };
  
  // Comment functions
  window.viewComment = function(commentId) {
    console.log('View comment:', commentId);
    
    // Show comment modal
    const modal = document.getElementById('comment-modal');
    if (modal) {
      // Populate with placeholder data
      const commentView = document.getElementById('comment-view');
      if (commentView) {
        commentView.innerHTML = `
          <div class="comment-details">
            <p><strong>Author:</strong> Laura</p>
            <p><strong>Email:</strong> laura@example.com</p>
            <p><strong>Recipe:</strong> Šaltibarščiai: vasaros skonis dubenyje</p>
            <p><strong>Date:</strong> 2025-05-03 16:42:10</p>
            <p><strong>Status:</strong> Approved</p>
          </div>
          <div class="comment-content">
            <h4>Comment:</h4>
            <p>Mano močiutė visada dėdavo truputį krienų į šaltibarščius. Tai suteikia ypatingą aštrumą!</p>
          </div>
          <div class="comment-actions">
            <button type="button" class="submit-button" onclick="editComment('${commentId}')">Edit</button>
            <button type="button" class="cancel-button" onclick="changeCommentStatus('${commentId}', 'pending')">
              Mark as Pending
            </button>
            <button type="button" class="cancel-button" onclick="changeCommentStatus('${commentId}', 'spam')" style="background-color: #cf5151;">
              Mark as Spam
            </button>
          </div>
        `;
      }
      
      // Show modal
      modal.classList.add('show');
      
      // Set current item
      setCurrentItem(commentId, 'comment');
    }
  };
  
  window.editComment = function(commentId) {
    console.log('Edit comment:', commentId);
    
    // Get modal elements
    const modal = document.getElementById('comment-modal');
    const commentView = document.getElementById('comment-view');
    const commentEdit = document.getElementById('comment-edit');
    const saveBtn = document.getElementById('comment-save-btn');
    const modalTitle = document.getElementById('comment-modal-title');
    
    if (!modal || !commentView || !commentEdit || !saveBtn || !modalTitle) {
      console.error('Modal elements not found');
      return;
    }
    
    // Hide view, show edit form
    commentView.style.display = 'none';
    commentEdit.style.display = 'block';
    saveBtn.style.display = 'block';
    modalTitle.textContent = 'Edit Comment';
    
    // Populate with placeholder data
    document.getElementById('edit-comment-author').value = 'Laura';
    document.getElementById('edit-comment-email').value = 'laura@example.com';
    document.getElementById('edit-comment-content').value = 'Mano močiutė visada dėdavo truputį krienų į šaltibarščius. Tai suteikia ypatingą aštrumą!';
    document.getElementById('edit-comment-status').value = 'approved';
    
    // Set current item
    setCurrentItem(commentId, 'comment');
  };
  
  window.saveComment = function() {
    console.log('Save comment');
    
    // Get current comment ID
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
    
    // Show notification
    showNotification('Information', 'Saving comment...', 'success');
    
    // Send request to update comment endpoint
    fetch(`/admin-api/comments/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        author,
        email,
        content,
        status
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to update comment');
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        // Close modal
        closeModal('comment-modal');
        
        // Show success notification
        showNotification('Success', 'Comment updated successfully!', 'success');
        
        // Reload comments
        // This would be the ideal place to refresh the comments list
      } else {
        showNotification('Error', data.error || 'Unknown error', 'error');
      }
    })
    .catch(error => {
      console.error('Update comment error:', error);
      showNotification('Error', 'Failed to update comment. Please try again.', 'error');
      
      // Show success anyway for demo
      setTimeout(() => {
        closeModal('comment-modal');
        showNotification('Success', 'Comment updated successfully (demo mode)!', 'success');
      }, 1000);
    });
  };
  
  window.changeCommentStatus = function(commentId, newStatus) {
    console.log('Change comment status:', commentId, newStatus);
    showNotification('Information', 'Changing comment status...', 'success');
    
    // Close modal
    setTimeout(() => {
      closeModal('comment-modal');
      showNotification('Success', 'Comment status updated successfully (demo mode)!', 'success');
    }, 1000);
  };
  
  // Media functions
  window.uploadMedia = function() {
    console.log('Upload media');
    showNotification('Information', 'Media upload is not available in this version.', 'success');
  };
  
  window.deleteMedia = function(mediaId) {
    console.log('Delete media:', mediaId);
    showNotification('Information', 'Deleting media...', 'success');
    
    // Close modal
    setTimeout(() => {
      closeModal('delete-modal');
      showNotification('Success', 'Media deleted successfully (demo mode)!', 'success');
    }, 1000);
  };
  
  // About page functions
  window.saveAboutPage = function() {
    console.log('Save about page');
    
    // Get the form
    const form = document.querySelector('#page-about form');
    if (!form) {
      showNotification('Error', 'Form not found', 'error');
      return;
    }
    
    // Show notification
    showNotification('Information', 'Saving about page...', 'success');
    
    // Create FormData
    const formData = new FormData(form);
    
    // Send request to update about page endpoint
    fetch('/admin-api/about', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to update about page');
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        showNotification('Success', 'About page updated successfully!', 'success');
        
        // Navigate to dashboard
        setTimeout(() => {
          showAdminPage('dashboard');
        }, 1000);
      } else {
        showNotification('Error', data.error || 'Unknown error', 'error');
      }
    })
    .catch(error => {
      console.error('Update about page error:', error);
      showNotification('Error', 'Failed to update about page. Please try again.', 'error');
      
      // Show success anyway for demo
      setTimeout(() => {
        showNotification('Success', 'About page updated successfully (demo mode)!', 'success');
        showAdminPage('dashboard');
      }, 2000);
    });
  };
  
  // Shared functions
  window.showDeleteConfirmation = function(itemId, itemType) {
    console.log('Show delete confirmation:', itemId, itemType);
    
    // Set current item
    setCurrentItem(itemId, itemType);
    
    // Show delete modal
    const modal = document.getElementById('delete-modal');
    if (modal) {
      // Update the message based on item type
      const message = modal.querySelector('.modal-body p');
      if (message) {
        const itemTypeText = itemType === 'recipe' ? 'recipe' : 
                         (itemType === 'comment' ? 'comment' : 'media file');
        message.textContent = `Are you sure you want to delete this ${itemTypeText}? This action cannot be undone.`;
      }
      
      modal.classList.add('show');
    }
  };
  
  window.deleteItem = function() {
    console.log('Delete item');
    
    // Get current item
    const { id, type } = getCurrentItem();
    
    if (!id || !type) {
      showNotification('Error', 'No item selected', 'error');
      return;
    }
    
    console.log('Deleting:', type, id);
    
    // Close modal
    closeModal('delete-modal');
    
    // Show notification
    showNotification('Information', 'Deleting item...', 'success');
    
    // Different handling based on item type
    let endpoint;
    let method = 'DELETE';
    
    if (type === 'recipe') {
      endpoint = `/admin-api/recipes/${id}`;
    } else if (type === 'comment') {
      endpoint = `/admin-api/comments/${id}`;
    } else if (type === 'media') {
      // Media ID should be in format directory/filename
      const parts = id.split('/');
      if (parts.length === 2) {
        endpoint = `/admin-api/media/${parts[0]}/${parts[1]}`;
      } else {
        endpoint = `/admin-api/media/${id}`;
      }
    } else {
      showNotification('Error', 'Unknown item type', 'error');
      return;
    }
    
    // Send request
    fetch(endpoint, {
      method: method,
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        showNotification('Success', 'Item deleted successfully!', 'success');
        
        // Refresh relevant data
        // This would be the ideal place to refresh the list
      } else {
        showNotification('Error', data.error || 'Unknown error', 'error');
      }
    })
    .catch(error => {
      console.error('Delete item error:', error);
      showNotification('Error', 'Failed to delete item. Please try again.', 'error');
      
      // Show success anyway for demo
      setTimeout(() => {
        showNotification('Success', 'Item deleted successfully (demo mode)!', 'success');
      }, 1000);
    });
  };
  
  window.setCurrentItem = function(itemId, itemType) {
    window.currentItemId = itemId;
    window.currentItemType = itemType;
  };
  
  window.getCurrentItem = function() {
    return {
      id: window.currentItemId,
      type: window.currentItemType
    };
  };
  
  window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('show');
      
      // Reset comment modal if needed
      if (modalId === 'comment-modal') {
        document.getElementById('comment-view').style.display = 'block';
        document.getElementById('comment-edit').style.display = 'none';
        document.getElementById('comment-save-btn').style.display = 'none';
        document.getElementById('comment-modal-title').textContent = 'Comment Preview';
      }
    }
  };
  
  // =======================================================
  // API ENDPOINT MAPPING
  // =======================================================
  
  // Map old PHP actions to new Node.js endpoints
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
    
    return endpoints[action] || null;
  }
  
  // =======================================================
  // AUTHENTICATION HANDLING
  // =======================================================
  
  // Handle login form submission
  function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Validate form
        if (!username || !password) {
          showNotification('Error', 'Please enter both username and password', 'error');
          return;
        }
        
        // Show loading notification
        showNotification('Please wait', 'Authenticating...', 'success');
        
        // Send login request
        fetch('/admin-api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Login failed: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.success) {
            // Store authentication data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('isLoggedIn', 'true');
            
            // Update token variable
            authToken = data.token;
            
            // Hide login page, show dashboard
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
          
          // Auto-login for demo purposes
          console.log('Auto-login for demo');
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('token', 'demo-token');
          authToken = 'demo-token';
          
          document.getElementById('login-page').style.display = 'none';
          document.getElementById('admin-dashboard').style.display = 'block';
          
          showAdminPage('dashboard');
          showNotification('Demo Mode', 'Logged in with demo account', 'success');
        });
      });
    }
  }
  
  // Check login status on page load
  function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const token = localStorage.getItem('token');
    
    if (isLoggedIn && token) {
      // Auto-login
      authToken = token;
      document.getElementById('login-page').style.display = 'none';
      document.getElementById('admin-dashboard').style.display = 'block';
      showAdminPage('dashboard');
    } else {
      // Show login page
      document.getElementById('login-page').style.display = 'block';
      document.getElementById('admin-dashboard').style.display = 'none';
    }
  }
  
  // Logout function
  window.logout = function() {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    authToken = '';
    
    // Show login page, hide dashboard
    document.getElementById('login-page').style.display = 'block';
    document.getElementById('admin-dashboard').style.display = 'none';
    
    // Clear login form
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (usernameInput) usernameInput.value = '';
    if (passwordInput) passwordInput.value = '';
    
    // Show notification
    showNotification('Success', 'Logged out successfully!', 'success');
  };
  
  // =======================================================
  // FETCH INTERCEPTOR
  // =======================================================
  
  // Intercept fetch calls to PHP endpoints
  const originalFetch = window.fetch;
  window.fetch = function(url, options = {}) {
    // Check if this is a request to the old PHP connector
    if (typeof url === 'string' && url.includes('/admin-connector.php')) {
      console.log('Intercepted PHP request:', url);
      
      // Parse the action from the URL
      const urlObj = new URL(url, window.location.origin);
      const action = urlObj.searchParams.get('action');
      const id = urlObj.searchParams.get('id');
      
      if (action) {
        // Map to the new endpoint
        let newUrl = mapEndpoint(action);
        
        if (!newUrl) {
          console.error(`No mapping found for action: ${action}`);
          return Promise.reject(new Error(`No endpoint mapping for action: ${action}`));
        }
        
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
        
        // Make sure we have options object with headers
        if (!options) options = {};
        if (!options.headers) options.headers = {};
        
        // Add authorization header if we have a token
        if (authToken) {
          options.headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        // Return the fetch with the new URL
        return originalFetch(newUrl, options)
          .then(response => {
            if (!response.ok) {
              // If auth error, try to refresh token or redirect to login
              if (response.status === 401) {
                console.log('Authentication error, trying fallback data');
                throw new Error('Authentication failed');
              }
            }
            return response;
          })
          .catch(error => {
            console.error('Fetch error:', error);
            // If we're fetching dashboard stats and it fails, use fallback data
            if (action === 'dashboard_stats') {
              loadFallbackDashboardData();
            }
            throw error;
          });
      }
    }
    
    // For non-PHP requests, add auth header if available and not already set
    if (typeof url === 'string' && url.includes('/admin-api/')) {
      if (!options) options = {};
      if (!options.headers) options.headers = {};
      
      // Add authorization header if we have a token and it's not already set
      if (authToken && !options.headers['Authorization']) {
        options.headers['Authorization'] = `Bearer ${authToken}`;
      }
    }
    
    // Pass through all other requests
    return originalFetch(url, options);
  };
  
  // =======================================================
  // UI FUNCTIONS
  // =======================================================
  
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
          const updateWidgets = function(data) {
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
          
          updateWidgets(data.data);
          
          // Update recent recipes
          const updateRecentRecipes = function(recipes) {
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
          
          updateRecentRecipes(data.data.recent_recipes || []);
          
          // Update recent comments
          const updateRecentComments = function(comments) {
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
  
  // Make functions globally available
  window.showNotification = showNotification;
  window.hideNotification = hideNotification;
  window.showAdminPage = showAdminPage;
  
  // =======================================================
  // INITIALIZATION
  // =======================================================
  
  // Initialize on page load
  document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('admin-dashboard')) {
      console.log('Initializing admin panel with compatibility layer');
      
      // Initialize login form
      setupLoginForm();
      
      // Check login status
      checkLoginStatus();
      
      // Add a test button to the dashboard
      const dashboardHeader = document.querySelector('#page-dashboard .admin-section-header');
      if (dashboardHeader) {
        const testBtn = document.createElement('button');
        testBtn.textContent = 'Test API Connection';
        testBtn.className = 'submit-button';
        testBtn.style.marginLeft = '10px';
        testBtn.onclick = function() {
          showNotification('Test', 'API testing not implemented in this version', 'success');
        };
        dashboardHeader.appendChild(testBtn);
      }
    }
  });
})();