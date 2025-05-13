/**
 * Enhanced API integration for Šaukštas Meilės Admin Panel
 * 
 * This script replaces mock data with real API calls and handles proper authentication
 */

// Base API URL - change this according to your deployment
const API_BASE_URL = '/admin-connector';

// Authentication helper functions
function getAuthToken() {
  return localStorage.getItem('token');
}

function getAuthHeaders() {
  const token = getAuthToken();
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  };
}

/**
 * Authentication functions
 */
async function loginUser(username, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      // Store token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('isLoggedIn', 'true');
      
      // Show dashboard
      document.getElementById('login-page').style.display = 'none';
      document.getElementById('admin-dashboard').style.display = 'block';
      
      // Load dashboard
      showAdminPage('dashboard');
      
      // Show success notification
      showNotification('Sėkmė', 'Prisijungta sėkmingai!', 'success');
      
      return true;
    } else {
      showNotification('Klaida', data.error || 'Prisijungimo klaida', 'error');
      return false;
    }
  } catch (error) {
    console.error('Login error:', error);
    showNotification('Klaida', 'Serverio klaida, bandykite dar kartą', 'error');
    return false;
  }
}

async function logoutUser() {
  try {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    
    // Show login page, hide dashboard
    document.getElementById('login-page').style.display = 'block';
    document.getElementById('admin-dashboard').style.display = 'none';
    
    // Clear login form
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    
    // Show notification
    showNotification('Sėkmė', 'Atsijungta sėkmingai!', 'success');
    
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
}

/**
 * Data retrieval functions
 */
async function fetchDashboardStats() {
  try {
    const response = await fetch(`${API_BASE_URL}?action=dashboard_stats`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard stats: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      // Update dashboard widgets
      updateDashboardWidgets(data.data);
      
      // Update recent recipes
      updateRecentRecipes(data.data.recent_recipes || []);
      
      // Update recent comments
      updateRecentComments(data.data.recent_comments || []);
    } else {
      showNotification('Klaida', data.error || 'Failed to load dashboard stats', 'error');
    }
  } catch (error) {
    console.error('Dashboard stats error:', error);
    showNotification('Klaida', 'Nepavyko užkrauti duomenų. Bandykite dar kartą.', 'error');
  }
}

async function fetchRecipes(page = 1, status = 'all') {
  try {
    const response = await fetch(`${API_BASE_URL}?action=get_recipes&status=${status}&page=${page}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch recipes: ${response.status}`);
    }

    const data = await response.json();
    
    // Get recipes container
    const recipesTable = document.querySelector('#page-recipes tbody');
    if (!recipesTable) {
      return;
    }
    
    if (data.success) {
      if (data.data.length === 0) {
        // No recipes
        recipesTable.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nėra receptų</td></tr>';
        return;
      }
      
      // Clear loading message
      recipesTable.innerHTML = '';
      
      // Add recipes to the table
      data.data.forEach(recipe => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
          <td>${recipe.title || 'Untitled'}</td>
          <td>${recipe.categories && recipe.categories.length ? recipe.categories.join(', ') : '-'}</td>
          <td>${recipe.created_at || '-'}</td>
          <td>${recipe.status === 'published' ? 'Publikuotas' : 'Juodraštis'}</td>
          <td>
            <div class="action-buttons">
              <button type="button" class="action-btn edit-btn" onclick="editRecipe('${recipe.id}')"><i class="fas fa-edit"></i></button>
              <button type="button" class="action-btn delete-btn" onclick="showDeleteConfirmation('${recipe.id}', 'recipe')"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        `;
        
        recipesTable.appendChild(row);
      });
      
      // Update pagination
      updatePagination(data.meta);
    } else {
      showNotification('Klaida', data.error || 'Nežinoma klaida', 'error');
    }
  } catch (error) {
    console.error('Fetch recipes error:', error);
    showNotification('Klaida', 'Nepavyko gauti receptų sąrašo', 'error');
  }
}

async function fetchRecipeDetails(recipeId) {
  try {
    const response = await fetch(`${API_BASE_URL}?action=get_recipe&id=${recipeId}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch recipe: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      // Create edit form by cloning add recipe form
      const addRecipePage = document.getElementById('page-add-recipe');
      let editRecipePage = document.getElementById('page-edit-recipe');
      
      if (!editRecipePage) {
        // Create edit recipe page if it doesn't exist
        editRecipePage = document.createElement('div');
        editRecipePage.id = 'page-edit-recipe';
        editRecipePage.className = 'admin-page';
        editRecipePage.style.display = 'none';
        editRecipePage.innerHTML = addRecipePage.innerHTML;
        
        // Change title
        const title = editRecipePage.querySelector('.admin-section-title');
        if (title) {
          title.textContent = 'Redaguoti receptą';
        }
        
        // Add ID field
        const form = editRecipePage.querySelector('form');
        if (form) {
          const idField = document.createElement('input');
          idField.type = 'hidden';
          idField.name = 'id';
          idField.id = 'recipe-id';
          form.appendChild(idField);
          
          // Change submit button
          const submitButton = form.querySelector('.submit-button');
          if (submitButton) {
            submitButton.textContent = 'Atnaujinti receptą';
            submitButton.onclick = updateRecipe;
          }
        }
        
        // Add to DOM
        addRecipePage.parentNode.appendChild(editRecipePage);
      }
      
      // Populate form fields
      populateRecipeForm(data.data);
      
      // Show edit page
      showAdminPage('edit-recipe');
    } else {
      showNotification('Klaida', data.error || 'Failed to get recipe', 'error');
    }
  } catch (error) {
    console.error('Fetch recipe details error:', error);
    showNotification('Klaida', 'Nepavyko gauti recepto detalių', 'error');
  }
}

async function fetchComments(page = 1, status = 'all') {
  try {
    const response = await fetch(`${API_BASE_URL}?action=get_comments&status=${status}&page=${page}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.status}`);
    }

    const data = await response.json();
    
    // Get comments container
    const commentsTable = document.querySelector('#page-comments tbody');
    if (!commentsTable) {
      return;
    }
    
    if (data.success) {
      if (data.data.length === 0) {
        // No comments
        commentsTable.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nėra komentarų</td></tr>';
        return;
      }
      
      // Clear existing comments
      commentsTable.innerHTML = '';
      
      // Add comments to the table
      data.data.forEach(comment => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
          <td>${comment.author || 'Anonymous'}</td>
          <td>${comment.content ? comment.content.substring(0, 50) + (comment.content.length > 50 ? '...' : '') : '-'}</td>
          <td>${comment.recipe_title || '-'}</td>
          <td>${comment.created_at || '-'}</td>
          <td>${getCommentStatusLabel(comment.status)}</td>
          <td>
            <div class="action-buttons">
              <button type="button" class="action-btn view-btn" onclick="viewComment('${comment.id}')"><i class="fas fa-eye"></i></button>
              <button type="button" class="action-btn delete-btn" onclick="showDeleteConfirmation('${comment.id}', 'comment')"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        `;
        
        commentsTable.appendChild(row);
      });
      
      // Update pagination
      updatePagination(data.meta);
    } else {
      showNotification('Klaida', data.error || 'Nežinoma klaida', 'error');
    }
  } catch (error) {
    console.error('Fetch comments error:', error);
    showNotification('Klaida', 'Nepavyko gauti komentarų sąrašo', 'error');
  }
}

async function fetchCommentDetails(commentId) {
  try {
    const response = await fetch(`${API_BASE_URL}?action=get_comment&id=${commentId}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch comment: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      // Populate modal content
      populateCommentModal(data.data);
      
      // Show modal
      const modal = document.getElementById('comment-modal');
      if (modal) {
        modal.classList.add('show');
      }
    } else {
      showNotification('Klaida', data.error || 'Failed to get comment', 'error');
    }
  } catch (error) {
    console.error('Fetch comment details error:', error);
    showNotification('Klaida', 'Nepavyko gauti komentaro detalių', 'error');
  }
}

async function fetchMedia(page = 1, type = 'all') {
  try {
    const response = await fetch(`${API_BASE_URL}?action=get_media&type=${type}&page=${page}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch media: ${response.status}`);
    }

    const data = await response.json();
    
    // Get media container
    const mediaGrid = document.querySelector('#page-media .gallery-grid');
    if (!mediaGrid) {
      return;
    }
    
    if (data.success) {
      if (data.data.length === 0) {
        // No media
        mediaGrid.innerHTML = '<div class="empty-message">Nėra nuotraukų</div>';
        return;
      }
      
      // Clear loading message
      mediaGrid.innerHTML = '';
      
      // Add media to the grid
      data.data.forEach(media => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        item.innerHTML = `
          <img src="${media.path}" alt="${media.name}">
          <div class="gallery-item-actions">
            <button type="button" class="gallery-item-action delete-btn" onclick="showDeleteConfirmation('${media.id}', 'media')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `;
        
        mediaGrid.appendChild(item);
      });
      
      // Update pagination
      updatePagination(data.meta);
    } else {
      showNotification('Klaida', data.error || 'Nežinoma klaida', 'error');
    }
  } catch (error) {
    console.error('Fetch media error:', error);
    showNotification('Klaida', 'Nepavyko gauti nuotraukų sąrašo', 'error');
  }
}

async function fetchAboutData() {
  try {
    const response = await fetch(`${API_BASE_URL}?action=get_about`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch about data: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      // Populate form fields
      populateAboutForm(data.data);
    } else {
      showNotification('Klaida', data.error || 'Nežinoma klaida', 'error');
    }
  } catch (error) {
    console.error('Fetch about data error:', error);
    showNotification('Klaida', 'Nepavyko gauti „Apie mane" puslapio duomenų', 'error');
  }
}

/**
 * Data submission functions
 */
async function saveNewRecipe(formData) {
  try {
    // Show loading notification
    showNotification('Informacija', 'Siunčiama...', 'success');
    
    const response = await fetch(`${API_BASE_URL}?action=add_recipe`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to add recipe: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      showNotification('Sėkmė', 'Receptas išsaugotas sėkmingai!', 'success');
      
      // Navigate to recipes page after save
      setTimeout(() => {
        showAdminPage('recipes');
      }, 1000);
      
      return true;
    } else {
      showNotification('Klaida', data.error || 'Nežinoma klaida', 'error');
      return false;
    }
  } catch (error) {
    console.error('Save recipe error:', error);
    showNotification('Klaida', `Klaida išsaugant receptą: ${error.message}`, 'error');
    return false;
  }
}

async function updateExistingRecipe(formData) {
  try {
    // Show loading notification
    showNotification('Informacija', 'Siunčiama...', 'success');
    
    const response = await fetch(`${API_BASE_URL}?action=update_recipe`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to update recipe: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      showNotification('Sėkmė', 'Receptas atnaujintas sėkmingai!', 'success');
      
      // Navigate to recipes page after save
      setTimeout(() => {
        showAdminPage('recipes');
      }, 1000);
      
      return true;
    } else {
      showNotification('Klaida', data.error || 'Nežinoma klaida', 'error');
      return false;
    }
  } catch (error) {
    console.error('Update recipe error:', error);
    showNotification('Klaida', `Klaida atnaujinant receptą: ${error.message}`, 'error');
    return false;
  }
}

async function saveComment(commentData) {
  try {
    // Show loading notification
    showNotification('Informacija', 'Siunčiama...', 'success');
    
    const response = await fetch(`${API_BASE_URL}?action=update_comment`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(commentData)
    });

    if (!response.ok) {
      throw new Error(`Failed to update comment: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      // Close the modal
      closeModal('comment-modal');
      
      // Show success notification
      showNotification('Sėkmė', 'Komentaras atnaujintas sėkmingai!', 'success');
      
      // Reload comments
      fetchComments();
      
      return true;
    } else {
      showNotification('Klaida', data.error || 'Nežinoma klaida', 'error');
      return false;
    }
  } catch (error) {
    console.error('Update comment error:', error);
    showNotification('Klaida', `Klaida atnaujinant komentarą: ${error.message}`, 'error');
    return false;
  }
}

async function saveAboutPage(formData = null) {
  try {
    // If formData is not provided, get it from the about form
    if (!formData) {
      const form = document.querySelector('#page-about form');
      if (!form) {
        showNotification('Klaida', 'Forma nerasta', 'error');
        return false;
      }
      
      formData = new FormData(form);
    }
    
    // Show loading notification
    showNotification('Informacija', 'Siunčiama...', 'success');
    
    const response = await fetch(`${API_BASE_URL}?action=update_about`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to update about page: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      showNotification('Sėkmė', 'Apie mane puslapis atnaujintas sėkmingai!', 'success');
      
      // Navigate to dashboard after save
      setTimeout(() => {
        showAdminPage('dashboard');
      }, 1000);
      
      return true;
    } else {
      showNotification('Klaida', data.error || 'Nežinoma klaida', 'error');
      return false;
    }
  } catch (error) {
    console.error('Update about page error:', error);
    showNotification('Klaida', `Klaida atnaujinant puslapį: ${error.message}`, 'error');
    return false;
  }
}

async function uploadMedia(formData) {
  try {
    // Show loading notification
    showNotification('Informacija', 'Siunčiama...', 'success');
    
    const response = await fetch(`${API_BASE_URL}?action=upload_media`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to upload media: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      showNotification('Sėkmė', 'Nuotraukos įkeltos sėkmingai!', 'success');
      
      // Reload media
      fetchMedia();
      
      return true;
    } else {
      showNotification('Klaida', data.error || 'Nežinoma klaida', 'error');
      return false;
    }
  } catch (error) {
    console.error('Upload media error:', error);
    showNotification('Klaida', `Klaida įkeliant nuotraukas: ${error.message}`, 'error');
    return false;
  }
}

async function deleteItem(itemId, itemType) {
  try {
    // Prepare request URL and data
    let url, requestData;
    
    switch (itemType) {
      case 'recipe':
        url = `${API_BASE_URL}?action=delete_recipe`;
        requestData = { id: itemId };
        break;
      case 'comment':
        url = `${API_BASE_URL}?action=delete_comment`;
        requestData = { id: itemId };
        break;
      case 'media':
        url = `${API_BASE_URL}?action=delete_media`;
        requestData = { filename: itemId };
        break;
      default:
        showNotification('Klaida', 'Nežinomas elemento tipas', 'error');
        return false;
    }
    
    // Show loading notification
    showNotification('Informacija', 'Trinama...', 'success');
    
    // Send delete request
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders()
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`Failed to delete item: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      const itemTypeText = itemType === 'recipe' ? 'Receptas' : 
                         (itemType === 'comment' ? 'Komentaras' : 'Nuotrauka');
      
      // Show success notification
      showNotification('Sėkmė', `${itemTypeText} ištrintas sėkmingai!`, 'success');
      
      // Reload data based on item type
      if (itemType === 'recipe') {
        fetchRecipes();
      } else if (itemType === 'comment') {
        fetchComments();
      } else if (itemType === 'media') {
        fetchMedia();
      }
      
      return true;
    } else {
      showNotification('Klaida', data.error || 'Nežinoma klaida', 'error');
      return false;
    }
  } catch (error) {
    console.error('Delete item error:', error);
    showNotification('Klaida', `Klaida trinant elementą: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Exported API functions to replace the existing ones
 */
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.fetchDashboardStats = fetchDashboardStats;
window.fetchRecipes = fetchRecipes;
window.fetchRecipeDetails = fetchRecipeDetails;
window.fetchComments = fetchComments;
window.fetchCommentDetails = fetchCommentDetails;
window.fetchMedia = fetchMedia;
window.fetchAboutData = fetchAboutData;
window.saveNewRecipe = saveNewRecipe;
window.updateExistingRecipe = updateExistingRecipe;
window.saveComment = saveComment;
window.saveAboutPage = saveAboutPage;
window.uploadMedia = uploadMedia;
window.deleteItem = deleteItem;