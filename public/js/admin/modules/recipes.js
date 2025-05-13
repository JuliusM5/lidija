// public/js/admin/recipes.js
// Recipe management functionality

import { getAuthHeaders } from './auth.js';
import { showNotification, updatePagination } from './ui.js';
import { setCurrentItem } from './utils.js';

/**
 * Initialize recipe forms and related functionality
 */
export function initRecipeForms() {
  initIngredientList();
  initStepList();
  initTagsInput();
  initFileUploads();
}

/**
 * Fetch recipes for the recipes page
 */
export function fetchRecipes(page = 1, status = 'all') {
  const recipesTable = document.querySelector('#page-recipes tbody');
  if (!recipesTable) return;
  
  // Show loading message
  recipesTable.innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading recipes...</td></tr>';
  
  // Get active tab if status is not specified
  if (status === 'all') {
    const activeTab = document.querySelector('#page-recipes .tab.active');
    if (activeTab) {
      status = activeTab.getAttribute('data-tab');
    }
  }
  
  fetch(`/admin-api/recipes?status=${status}&page=${page}`, {
    headers: getAuthHeaders()
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to fetch recipes: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      if (data.data.length === 0) {
        // No recipes
        recipesTable.innerHTML = '<tr><td colspan="5" style="text-align: center;">No recipes found</td></tr>';
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
          <td>${formatDate(recipe.created_at) || '-'}</td>
          <td>${recipe.status === 'published' ? 'Published' : 'Draft'}</td>
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
      showNotification('Error', data.error || 'Unknown error', 'error');
    }
  })
  .catch(error => {
    console.error('Fetch recipes error:', error);
    recipesTable.innerHTML = '<tr><td colspan="5" style="text-align: center;">Failed to load recipes. Please try again.</td></tr>';
    showNotification('Error', 'Failed to load recipes', 'error');
  });
}

/**
 * Fetch a specific recipe for editing
 */
export function editRecipe(recipeId) {
  fetch(`/admin-api/recipes/${recipeId}`, {
    headers: getAuthHeaders()
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to fetch recipe: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
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
          title.textContent = 'Edit Recipe';
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
            submitButton.textContent = 'Update Recipe';
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
      showNotification('Error', data.error || 'Failed to get recipe', 'error');
    }
  })
  .catch(error => {
    console.error('Fetch recipe details error:', error);
    showNotification('Error', 'Failed to load recipe details', 'error');
  });
}

/**
 * Populate recipe form with data
 */
export function populateRecipeForm(recipe) {
  // Set form fields
  document.getElementById('recipe-id').value = recipe.id;
  document.getElementById('recipe-title').value = recipe.title || '';
  document.getElementById('recipe-intro').value = recipe.intro || '';
  document.getElementById('prep-time').value = recipe.prep_time || '';
  document.getElementById('cook-time').value = recipe.cook_time || '';
  document.getElementById('servings').value = recipe.servings || '';
  document.getElementById('recipe-notes').value = recipe.notes || '';
  document.getElementById('recipe-status').value = recipe.status || 'draft';
  
  // Clear existing ingredient items
  const ingredientList = document.getElementById('ingredient-list');
  ingredientList.innerHTML = '';
  
  // Add ingredients
  if (recipe.ingredients && recipe.ingredients.length) {
    recipe.ingredients.forEach(ingredient => {
      addIngredientItem(ingredient);
    });
  } else {
    // Add an empty ingredient field
    addIngredientItem('');
  }
  
  // Clear existing step items
  const stepList = document.getElementById('step-list');
  stepList.innerHTML = '';
  
  // Add steps
  if (recipe.steps && recipe.steps.length) {
    recipe.steps.forEach((step, index) => {
      addStepItem(step, index + 1);
    });
  } else {
    // Add an empty step field
    addStepItem('', 1);
  }
  
  // Clear existing tags
  const tagsContainer = document.getElementById('tags-container');
  const tagsInput = document.getElementById('tags-input');
  
  // Remove existing tags (except the input)
  Array.from(tagsContainer.children).forEach(child => {
    if (child !== tagsInput) {
      tagsContainer.removeChild(child);
    }
  });
  
  // Add tags
  if (recipe.tags && recipe.tags.length) {
    recipe.tags.forEach(tag => {
      addTagItem(tag);
    });
  }
  
  // Set categories
  const categoryCheckboxes = document.querySelectorAll('.category-checkbox input[type="checkbox"]');
  categoryCheckboxes.forEach(checkbox => {
    checkbox.checked = recipe.categories && recipe.categories.includes(checkbox.value);
  });
  
  // Show image preview if available
  if (recipe.image) {
    const imagePreview = document.getElementById('image-preview');
    
    // Remove any existing image
    const existingImg = imagePreview.querySelector('img');
    if (existingImg) {
      imagePreview.removeChild(existingImg);
    }
    
    // Create new image
    const img = document.createElement('img');
    img.src = `/img/recipes/${recipe.image}`;
    img.alt = 'Recipe image preview';
    imagePreview.appendChild(img);
    imagePreview.style.display = 'block';
  }
}

/**
 * Save a new recipe
 */
export function saveRecipe() {
  // Get the form
  const form = document.querySelector('#page-add-recipe form');
  if (!form) {
    showNotification('Error', 'Form not found', 'error');
    return;
  }
  
  // Validate form
  const title = document.getElementById('recipe-title').value;
  if (!title) {
    showNotification('Error', 'Recipe title is required', 'error');
    return;
  }
  
  // Create FormData object
  const formData = new FormData(form);
  
  // Get and add tags
  const tags = [];
  document.querySelectorAll('#tags-container .tag-text').forEach(tag => {
    tags.push(tag.textContent);
  });
  formData.append('tags', JSON.stringify(tags));
  
  // Show loading notification
  showNotification('Information', 'Saving recipe...', 'success');
  
  // Send request
  fetch('/admin-api/recipes', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to add recipe: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      showNotification('Success', 'Recipe saved successfully!', 'success');
      
      // Navigate to recipes page after save
      setTimeout(() => {
        showAdminPage('recipes');
      }, 1000);
    } else {
      showNotification('Error', data.error || 'Unknown error', 'error');
    }
  })
  .catch(error => {
    console.error('Save recipe error:', error);
    showNotification('Error', `Error saving recipe: ${error.message}`, 'error');
  });
}

/**
 * Update an existing recipe
 */
export function updateRecipe() {
  // Get the form
  const form = document.querySelector('#page-edit-recipe form');
  if (!form) {
    showNotification('Error', 'Form not found', 'error');
    return;
  }
  
  // Validate form
  const title = document.getElementById('recipe-title').value;
  const recipeId = document.getElementById('recipe-id').value;
  
  if (!title) {
    showNotification('Error', 'Recipe title is required', 'error');
    return;
  }
  
  if (!recipeId) {
    showNotification('Error', 'Recipe ID is missing', 'error');
    return;
  }
  
  // Create FormData object
  const formData = new FormData(form);
  
  // Get and add tags
  const tags = [];
  document.querySelectorAll('#tags-container .tag-text').forEach(tag => {
    tags.push(tag.textContent);
  });
  formData.append('tags', JSON.stringify(tags));
  
  // Show loading notification
  showNotification('Information', 'Updating recipe...', 'success');
  
  // Send request
  fetch(`/admin-api/recipes/${recipeId}`, {
    method: 'PUT',
    body: formData
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to update recipe: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      showNotification('Success', 'Recipe updated successfully!', 'success');
      
      // Navigate to recipes page after save
      setTimeout(() => {
        showAdminPage('recipes');
      }, 1000);
    } else {
      showNotification('Error', data.error || 'Unknown error', 'error');
    }
  })
  .catch(error => {
    console.error('Update recipe error:', error);
    showNotification('Error', `Error updating recipe: ${error.message}`, 'error');
  });
}

/**
 * Delete a recipe
 */
export function deleteRecipe(recipeId) {
  if (!recipeId) {
    const { id, type } = getCurrentItem();
    recipeId = id;
    
    if (type !== 'recipe') {
      console.error('Invalid item type for deleteRecipe');
      return;
    }
  }
  
  if (!recipeId) {
    showNotification('Error', 'Recipe ID is required', 'error');
    return;
  }
  
  // Show loading notification
  showNotification('Information', 'Deleting recipe...', 'success');
  
  // Send request
  fetch(`/admin-api/recipes/${recipeId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to delete recipe: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      showNotification('Success', 'Recipe deleted successfully!', 'success');
      
      // Close delete modal if open
      closeModal('delete-modal');
      
      // Refresh recipes
      fetchRecipes();
    } else {
      showNotification('Error', data.error || 'Unknown error', 'error');
    }
  })
  .catch(error => {
    console.error('Delete recipe error:', error);
    showNotification('Error', `Error deleting recipe: ${error.message}`, 'error');
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
 * Initialize ingredients list functionality
 */
function initIngredientList() {
  // Add Ingredient Button Handler
  const addIngredientBtn = document.getElementById('add-ingredient-btn');
  if (addIngredientBtn) {
    addIngredientBtn.addEventListener('click', function() {
      addIngredientItem('');
    });
  }
}

/**
 * Add a new ingredient item to the list
 */
function addIngredientItem(value = '') {
  const ingredientList = document.getElementById('ingredient-list');
  if (!ingredientList) return;
  
  const newItem = document.createElement('div');
  newItem.className = 'ingredient-item';
  newItem.innerHTML = `
    <input type="text" name="ingredients[]" class="form-control" placeholder="Enter ingredient" value="${value}">
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
}

/**
 * Initialize steps list functionality
 */
function initStepList() {
  // Add Step Button Handler
  const addStepBtn = document.getElementById('add-step-btn');
  if (addStepBtn) {
    addStepBtn.addEventListener('click', function() {
      const stepList = document.getElementById('step-list');
      if (!stepList) return;
      
      const stepItems = stepList.querySelectorAll('.step-item');
      const newStepNumber = stepItems.length + 1;
      
      addStepItem('', newStepNumber);
    });
  }
}

/**
 * Add a new step item to the list
 */
function addStepItem(value = '', number = 1) {
  const stepList = document.getElementById('step-list');
  if (!stepList) return;
  
  const newItem = document.createElement('div');
  newItem.className = 'step-item';
  newItem.innerHTML = `
    <div class="step-number">${number}</div>
    <div class="step-content">
      <textarea name="steps[]" class="form-control" placeholder="Enter step description">${value}</textarea>
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
}

/**
 * Update step numbers after removing a step
 */
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

/**
 * Initialize tags input functionality
 */
function initTagsInput() {
  const tagsInput = document.getElementById('tags-input');
  if (tagsInput) {
    tagsInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && this.value.trim() !== '') {
        e.preventDefault();
        addTagItem(this.value.trim());
        this.value = '';
      }
    });
  }
}

/**
 * Add a new tag item
 */
function addTagItem(tagText) {
  const tagsContainer = document.getElementById('tags-container');
  const tagsInput = document.getElementById('tags-input');
  if (!tagsContainer || !tagsInput) return;
  
  const tag = document.createElement('div');
  tag.className = 'tag';
  
  const tagTextEl = document.createElement('span');
  tagTextEl.className = 'tag-text';
  tagTextEl.textContent = tagText;
  
  const tagRemove = document.createElement('button');
  tagRemove.className = 'tag-remove';
  tagRemove.type = 'button';
  tagRemove.innerHTML = '<i class="fas fa-times"></i>';
  tagRemove.addEventListener('click', function() {
    tagsContainer.removeChild(tag);
  });
  
  tag.appendChild(tagTextEl);
  tag.appendChild(tagRemove);
  
  tagsContainer.insertBefore(tag, tagsInput);
}

/**
 * Initialize file uploads functionality
 */
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

// Import necessary functions
import { showAdminPage, closeModal } from './ui.js';
import { getCurrentItem } from './utils.js';