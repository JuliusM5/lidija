// admin.js - Main JavaScript file for the admin panel

// Global variables for tracking current selected items
let currentItemId = null;
let currentItemType = null;

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    // Set up login form handling
    setupLoginForm();
    
    // Check login status
    checkLoginStatus();
    
    // Initialize UI components
    initTabs();
    initIngredientList();
    initStepList();
    initTagsInput();
    initFileUploads();
    initRemoveButtons();
});

/**
 * Set up login form submission
 */
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Simple mock login (in a real system, this would be handled by the backend)
            if (username && password) {
                // Hide login page, show dashboard
                document.getElementById('login-page').style.display = 'none';
                document.getElementById('admin-dashboard').style.display = 'block';
                
                // Show dashboard page
                showAdminPage('dashboard');
                
                // Show success notification
                showNotification('Sėkmė', 'Prisijungta sėkmingai!', 'success');
            } else {
                showNotification('Klaida', 'Prašome įvesti vartotojo vardą ir slaptažodį', 'error');
            }
        });
    }
}

/**
 * Check login status
 */
function checkLoginStatus() {
    // This would typically check for a valid token or session
    // For now, it's just a placeholder
    console.log('Checking login status...');
}

/**
 * Initialize tabs
 */
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

/**
 * Initialize ingredient list functionality
 */
function initIngredientList() {
    // Add Ingredient Button Handler
    const addIngredientBtn = document.getElementById('add-ingredient-btn');
    if (addIngredientBtn) {
        addIngredientBtn.addEventListener('click', function() {
            addIngredientItem();
        });
    }
    
    // Add event listeners to existing remove buttons
    document.querySelectorAll('.remove-ingredient-btn').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.ingredient-item').remove();
        });
    });
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
        <input type="text" name="ingredients[]" class="form-control" placeholder="Įveskite ingredientą" value="${value}">
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
    
    // Add event listeners to existing remove buttons
    document.querySelectorAll('.step-actions .remove-ingredient-btn').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.step-item').remove();
            updateStepNumbers();
        });
    });
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
            <textarea name="steps[]" class="form-control" placeholder="Įveskite žingsnio aprašymą">${value}</textarea>
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
    const tagsContainer = document.getElementById('tags-container');
    
    if (tagsInput && tagsContainer) {
        tagsInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && this.value.trim() !== '') {
                e.preventDefault();
                addTagItem(this.value.trim());
                this.value = '';
            }
        });
        
        // Add event listeners to existing remove buttons
        tagsContainer.querySelectorAll('.tag-remove').forEach(button => {
            button.addEventListener('click', function() {
                this.closest('.tag').remove();
            });
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
 * Initialize file uploads
 */
function initFileUploads() {
    // Image preview
    const recipeImage = document.getElementById('recipe-image');
    const imagePreview = document.getElementById('image-preview');
    
    if (recipeImage && imagePreview) {
        recipeImage.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    // Clear existing preview
                    const existingImg = imagePreview.querySelector('img');
                    if (existingImg) {
                        existingImg.src = e.target.result;
                    } else {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.alt = 'Recipe image preview';
                        imagePreview.appendChild(img);
                    }
                    
                    imagePreview.style.display = 'block';
                };
                
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
}

/**
 * Initialize remove buttons
 */
function initRemoveButtons() {
    // Image remove button
    const removeImageBtn = document.querySelector('.remove-image');
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', function() {
            const imagePreview = this.closest('.image-preview');
            if (!imagePreview) return;
            
            // Clear image preview
            imagePreview.innerHTML = '<button type="button" class="remove-image"><i class="fas fa-times"></i></button>';
            imagePreview.style.display = 'none';
            
            // Reset file input
            const fileInput = document.getElementById('recipe-image');
            if (fileInput) {
                fileInput.value = '';
            }
            
            // Re-initialize remove button
            const newRemoveBtn = imagePreview.querySelector('.remove-image');
            if (newRemoveBtn) {
                newRemoveBtn.addEventListener('click', function() {
                    imagePreview.style.display = 'none';
                });
            }
        });
    }
}

/**
 * Save recipe function - this is the missing function
 */
function saveRecipe() {
    // Get the form
    const form = document.querySelector('#page-add-recipe form');
    if (!form) {
        showNotification('Klaida', 'Forma nerasta', 'error');
        return;
    }
    
    // Validate form
    const title = document.getElementById('recipe-title').value;
    if (!title) {
        showNotification('Klaida', 'Recepto pavadinimas yra būtinas', 'error');
        return;
    }
    
    // Get form data
    const formData = new FormData(form);
    
    // Add tags
    const tags = [];
    document.querySelectorAll('#tags-container .tag-text').forEach(tag => {
        tags.push(tag.textContent);
    });
    formData.append('tags', JSON.stringify(tags));
    
    // Show loading notification
    showNotification('Informacija', 'Receptas siunčiamas...', 'success');
    
    // Simulate saving (in a real app, this would be an AJAX request to the server)
    setTimeout(() => {
        showNotification('Sėkmė', 'Receptas išsaugotas sėkmingai!', 'success');
        
        // In a real app, we would navigate to the recipes page after save
        setTimeout(() => {
            showAdminPage('recipes');
        }, 1000);
    }, 1500);
}

/**
 * Update recipe function
 */
function updateRecipe() {
    // Get the form
    const form = document.querySelector('#page-edit-recipe form');
    if (!form) {
        showNotification('Klaida', 'Forma nerasta', 'error');
        return;
    }
    
    // Validate form
    const title = document.getElementById('recipe-title').value;
    const recipeId = document.getElementById('recipe-id').value;
    
    if (!title) {
        showNotification('Klaida', 'Recepto pavadinimas yra būtinas', 'error');
        return;
    }
    
    if (!recipeId) {
        showNotification('Klaida', 'Recepto ID nerastas', 'error');
        return;
    }
    
    // Get form data
    const formData = new FormData(form);
    
    // Add tags
    const tags = [];
    document.querySelectorAll('#tags-container .tag-text').forEach(tag => {
        tags.push(tag.textContent);
    });
    formData.append('tags', JSON.stringify(tags));
    
    // Show loading notification
    showNotification('Informacija', 'Receptas atnaujinamas...', 'success');
    
    // Simulate updating (in a real app, this would be an AJAX request to the server)
    setTimeout(() => {
        showNotification('Sėkmė', 'Receptas atnaujintas sėkmingai!', 'success');
        
        // In a real app, we would navigate to the recipes page after save
        setTimeout(() => {
            showAdminPage('recipes');
        }, 1000);
    }, 1500);
}

/**
 * Edit recipe
 */
function editRecipe(recipeId) {
    // In a real app, this would fetch the recipe data from the server
    showNotification('Informacija', 'Receptas įkeliamas...', 'success');
    
    // Simulate loading (in a real app, this would be an AJAX request to the server)
    setTimeout(() => {
        showAdminPage('edit-recipe');
        showNotification('Sėkmė', 'Receptas įkeltas redagavimui!', 'success');
    }, 1000);
}

/**
 * Show delete confirmation dialog
 */
function showDeleteConfirmation(itemId, itemType) {
    currentItemId = itemId;
    currentItemType = itemType;
    
    // Show the modal
    const modal = document.getElementById('delete-modal');
    if (modal) {
        modal.classList.add('show');
    }
}

/**
 * Delete item
 */
function deleteItem() {
    // Close the modal
    closeModal('delete-modal');
    
    if (!currentItemId || !currentItemType) {
        showNotification('Klaida', 'Nėra pasirinkto elemento', 'error');
        return;
    }
    
    // Show loading notification
    showNotification('Informacija', 'Elementas trinamas...', 'success');
    
    // Simulate deletion (in a real app, this would be an AJAX request to the server)
    setTimeout(() => {
        showNotification('Sėkmė', 'Elementas ištrintas sėkmingai!', 'success');
        
        // Refresh the page based on item type
        if (currentItemType === 'recipe') {
            // Reload recipes
            showAdminPage('recipes');
        } else if (currentItemType === 'comment') {
            // Reload comments
            showAdminPage('comments');
        } else if (currentItemType === 'media') {
            // Reload media
            showAdminPage('media');
        }
        
        // Clear current item
        currentItemId = null;
        currentItemType = null;
    }, 1000);
}

/**
 * View comment
 */
function viewComment(commentId) {
    // In a real app, this would fetch the comment data from the server
    showNotification('Informacija', 'Komentaras įkeliamas...', 'success');
    
    // Simulate loading (in a real app, this would be an AJAX request to the server)
    setTimeout(() => {
        // Show modal
        const modal = document.getElementById('comment-modal');
        if (modal) {
            modal.classList.add('show');
        }
        
        // Set current item
        currentItemId = commentId;
        currentItemType = 'comment';
    }, 500);
}

/**
 * Edit comment
 */
function editComment(commentId) {
    // Get the comment view
    const commentView = document.getElementById('comment-view');
    const commentEdit = document.getElementById('comment-edit');
    const saveBtn = document.getElementById('comment-save-btn');
    const modalTitle = document.getElementById('comment-modal-title');
    
    if (!commentView || !commentEdit || !saveBtn || !modalTitle) {
        showNotification('Klaida', 'Komentaro redagavimo elementai nerasti', 'error');
        return;
    }
    
    // Show edit form
    commentView.style.display = 'none';
    commentEdit.style.display = 'block';
    saveBtn.style.display = 'block';
    modalTitle.textContent = 'Redaguoti komentarą';
    
    // Set current item
    currentItemId = commentId;
    currentItemType = 'comment';
    
    // Show modal if not already visible
    const modal = document.getElementById('comment-modal');
    if (modal && !modal.classList.contains('show')) {
        modal.classList.add('show');
    }
}

/**
 * Save comment
 */
function saveComment() {
    // Get form values
    const author = document.getElementById('edit-comment-author').value;
    const email = document.getElementById('edit-comment-email').value;
    const content = document.getElementById('edit-comment-content').value;
    const status = document.getElementById('edit-comment-status').value;
    
    // Validate
    if (!content) {
        showNotification('Klaida', 'Komentaro turinys yra būtinas', 'error');
        return;
    }
    
    // Show loading notification
    showNotification('Informacija', 'Komentaras saugomas...', 'success');
    
    // Simulate saving (in a real app, this would be an AJAX request to the server)
    setTimeout(() => {
        // Close the modal
        closeModal('comment-modal');
        
        // Show success notification
        showNotification('Sėkmė', 'Komentaras išsaugotas sėkmingai!', 'success');
        
        // Reload comments
        showAdminPage('comments');
    }, 1000);
}

/**
 * Close modal
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        
        // Reset comment modal if needed
        if (modalId === 'comment-modal') {
            document.getElementById('comment-view').style.display = 'block';
            document.getElementById('comment-edit').style.display = 'none';
            document.getElementById('comment-save-btn').style.display = 'none';
            document.getElementById('comment-modal-title').textContent = 'Komentaro peržiūra';
        }
    }
}

/**
 * Show notification
 */
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

/**
 * Hide notification
 */
function hideNotification() {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.classList.remove('show');
    }
}

/**
 * Show admin page
 */
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
    }
}

/**
 * Save about page
 */
function saveAboutPage() {
    // Get the form
    const form = document.querySelector('#page-about form');
    if (!form) {
        showNotification('Klaida', 'Forma nerasta', 'error');
        return;
    }
    
    // Show loading notification
    showNotification('Informacija', '"Apie mane" puslapis saugomas...', 'success');
    
    // Simulate saving (in a real app, this would be an AJAX request to the server)
    setTimeout(() => {
        showNotification('Sėkmė', '"Apie mane" puslapis išsaugotas sėkmingai!', 'success');
        
        // In a real app, we would navigate to the dashboard after save
        setTimeout(() => {
            showAdminPage('dashboard');
        }, 1000);
    }, 1500);
}