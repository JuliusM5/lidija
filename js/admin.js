/**
 * Admin Panel JavaScript for Šaukštas Meilės food blog with temporary functions
 */

// Global variables
let currentItemId = null;
let currentItemType = null;

// Document ready event
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the admin page
    if (document.getElementById('admin-dashboard')) {
        // Set up login form handling
        setupLoginForm();
        
        // Initialize components
        initTabs();
        initIngredientList();
        initStepList();
        initTagsInput();
        initFileUploads();
        initRemoveButtons();
    }
});

/**
 * Login and Authentication Functions
 */

// Function to set up login form
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Simple form validation
            if (!username || !password) {
                showNotification('Klaida', 'Prašome įvesti vartotojo vardą ir slaptažodį', 'error');
                return;
            }
            
            // In a real application, this would call the server API
            // For now, accept any non-empty username/password
            handleSuccessfulLogin();
        });
    }
}

// Function to handle successful login
function handleSuccessfulLogin() {
    // Hide login page, show dashboard
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    
    // Show dashboard page
    showAdminPage('dashboard');
    
    // Show success notification
    showNotification('Sėkmė', 'Prisijungta sėkmingai!', 'success');
    
    // In a real app, we would also store the session token
    localStorage.setItem('isLoggedIn', 'true');
}

// Function to logout
function logout() {
    // In a real app, we would make an API call to invalidate the session
    
    // For demo: Hide dashboard, show login page
    document.getElementById('login-page').style.display = 'block';
    document.getElementById('admin-dashboard').style.display = 'none';
    
    // Clear form
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    
    // Clear session
    localStorage.removeItem('isLoggedIn');
    
    // Show notification
    showNotification('Sėkmė', 'Atsijungta sėkmingai!', 'success');
}

// Function to check if user is logged in (for page refresh)
function checkLoginStatus() {
    // In a real app, this would verify the session token with the server
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

/**
 * UI Initialization Functions
 */

// Function to initialize tabs
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
            
            // Handle tab content if needed
            const tabType = this.getAttribute('data-tab');
            if (tabType) {
                // For demonstration purposes, show notification
                showNotification('Informacija', `Pasirinkta kategorija: ${tabType}`, 'success');
            }
        });
    });
}

// Function to initialize ingredient list
function initIngredientList() {
    // Add Ingredient Button Handler for Add Recipe page
    const addIngredientBtn = document.getElementById('add-ingredient-btn');
    if (addIngredientBtn) {
        addIngredientBtn.addEventListener('click', function() {
            const ingredientList = document.getElementById('ingredient-list');
            if (!ingredientList) return;
            
            const newItem = document.createElement('div');
            newItem.className = 'ingredient-item';
            newItem.innerHTML = `
                <input type="text" name="ingredients[]" class="form-control" placeholder="Įveskite ingredientą">
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

// Function to initialize step list
function initStepList() {
    // Add Step Button Handler for Add Recipe page
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
                    <textarea name="steps[]" class="form-control" placeholder="Įveskite žingsnio aprašymą"></textarea>
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
    
    // Add Section Button Handler for About page
    const addSectionBtn = document.getElementById('add-section-btn');
    if (addSectionBtn) {
        addSectionBtn.addEventListener('click', function() {
            const sectionContainer = this.parentElement;
            if (!sectionContainer) return;
            
            const sectionCount = sectionContainer.querySelectorAll('.admin-section').length;
            const newSectionNumber = sectionCount + 1;
            
            const newSection = document.createElement('div');
            newSection.className = 'admin-section';
            newSection.style.marginBottom = '20px';
            newSection.innerHTML = `
                <div class="form-group">
                    <label for="section-${newSectionNumber}-title">Skyriaus ${newSectionNumber} pavadinimas</label>
                    <input type="text" id="section-${newSectionNumber}-title" name="section_titles[]" class="form-control" placeholder="Įveskite skyriaus pavadinimą">
                </div>
                
                <div class="form-group">
                    <label for="section-${newSectionNumber}-content">Skyriaus ${newSectionNumber} turinys</label>
                    <textarea id="section-${newSectionNumber}-content" name="section_contents[]" class="form-control" rows="5" placeholder="Įveskite skyriaus turinį"></textarea>
                </div>
            `;
            
            // Insert the new section before the "Add New Section" button
            sectionContainer.insertBefore(newSection, this);
            
            // Show notification
            showNotification('Informacija', 'Pridėtas naujas skyrius', 'success');
        });
    }
}

// Function to update step numbers
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

// Function to initialize tags input
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

// Function to initialize file uploads
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
                
                // Show notification
                showNotification('Informacija', 'Nuotrauka pasirinkta sėkmingai', 'success');
            }
        });
    }
    
    // About image upload
    const aboutImage = document.getElementById('about-image');
    if (aboutImage) {
        aboutImage.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imagePreview = document.getElementById('about-image-preview');
                    if (!imagePreview) return;
                    
                    const placeholderDiv = imagePreview.querySelector('.local-placeholder');
                    
                    if (placeholderDiv) {
                        // Replace placeholder with actual image
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.alt = 'Profile image preview';
                        img.style.maxWidth = '100%';
                        img.style.height = 'auto';
                        img.style.borderRadius = '5px';
                        img.style.marginTop = '15px';
                        
                        imagePreview.replaceChild(img, placeholderDiv);
                    } else {
                        // Update existing image
                        const previewImg = imagePreview.querySelector('img');
                        if (previewImg) {
                            previewImg.src = e.target.result;
                        }
                    }
                    
                    imagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
                
                // Show notification
                showNotification('Informacija', 'Profilio nuotrauka pasirinkta sėkmingai', 'success');
            }
        });
    }
    
    // Media upload
    const mediaUpload = document.getElementById('media-upload');
    if (mediaUpload) {
        mediaUpload.addEventListener('change', function() {
            const files = this.files;
            if (files.length > 0) {
                // For demonstration purposes, just show a notification
                showNotification('Informacija', `Pasirinkta ${files.length} nuotraukos`, 'success');
            }
        });
    }
}

// Function to initialize remove buttons
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
            
            // Show notification
            showNotification('Informacija', 'Nuotrauka pašalinta', 'success');
        });
    });
    
    // Remove ingredient buttons
    const removeIngredientButtons = document.querySelectorAll('.remove-ingredient-btn');
    removeIngredientButtons.forEach(button => {
        button.addEventListener('click', function() {
            const ingredientItem = this.closest('.ingredient-item');
            const stepItem = this.closest('.step-item');
            
            if (ingredientItem && ingredientItem.parentNode) {
                ingredientItem.parentNode.removeChild(ingredientItem);
            } else if (stepItem && stepItem.parentNode) {
                stepItem.parentNode.removeChild(stepItem);
                // Update step numbers
                updateStepNumbers();
            }
        });
    });
}

/**
 * Navigation and Page Management
 */

// Function to switch between admin pages
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
 * Mock Functions for Demonstration
 */

// Function to save recipe
function saveRecipe() {
    // For demonstration purposes, just show a notification
    showNotification('Sėkmė', 'Receptas išsaugotas sėkmingai!', 'success');
    
    // In a real app, we would send the form data to the server
    // Navigate to recipes page after save
    setTimeout(() => {
        showAdminPage('recipes');
    }, 1000);
}

// Function to save about page
function saveAboutPage() {
    // For demonstration purposes, just show a notification
    showNotification('Sėkmė', 'Apie mane puslapis atnaujintas sėkmingai!', 'success');
    
    // In a real app, we would send the form data to the server
    // Navigate to dashboard after save
    setTimeout(() => {
        showAdminPage('dashboard');
    }, 1000);
}

// Function to save comment
function saveComment() {
    // Close the modal
    closeModal('comment-modal');
    
    // For demonstration purposes, just show a notification
    showNotification('Sėkmė', 'Komentaras atnaujintas sėkmingai!', 'success');
}

// Function to show delete confirmation modal
function showDeleteConfirmation(itemId, itemType) {
    currentItemId = itemId;
    currentItemType = itemType;
    
    // Show the modal
    const modal = document.getElementById('delete-modal');
    if (modal) {
        modal.classList.add('show');
    }
}

// Function to delete item
function deleteItem() {
    // Close the modal
    closeModal('delete-modal');
    
    // For demonstration purposes, just show a notification
    const itemTypeText = currentItemType === 'recipe' ? 'Receptas' : (currentItemType === 'comment' ? 'Komentaras' : 'Elementas');
    showNotification('Sėkmė', `${itemTypeText} ištrintas sėkmingai!`, 'success');
    
    // In a real app, we would send a delete request to the server
}

/**
 * Utility Functions
 */

// Function to close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

// Function to show notification
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

// Function to hide notification
function hideNotification() {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.classList.remove('show');
    }
}

// Check login status on page load
document.addEventListener('DOMContentLoaded', checkLoginStatus);