/**
 * Admin Panel JavaScript for Šaukštas Meilės food blog
 */

// Global variables
let currentItemId = null;
let currentItemType = null;

// Document ready event
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the admin page
    if (document.getElementById('admin-dashboard')) {
        // Initialize components
        initTabs();
        initIngredientList();
        initStepList();
        initTagsInput();
        initFileUploads();
        initRemoveButtons();
        setupAPIConnections();
    }
});

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
                // If this is for recipe filtering
                if (tabContainer.closest('#page-recipes')) {
                    loadRecipes(tabType);
                }
                // If this is for comment filtering
                else if (tabContainer.closest('#page-comments')) {
                    loadComments(tabType);
                }
                // If this is for media filtering
                else if (tabContainer.closest('#page-media')) {
                    loadMedia(tabType);
                }
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
    
    // Add Ingredient Button Handler for Edit Recipe page
    const editAddIngredientBtn = document.getElementById('edit-add-ingredient-btn');
    if (editAddIngredientBtn) {
        editAddIngredientBtn.addEventListener('click', function() {
            const ingredientList = document.getElementById('edit-ingredient-list');
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
                    <textarea name="steps[]" class="form-control" placeholder="Enter step instructions"></textarea>
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
    
    // Add Step Button Handler for Edit Recipe page
    const editAddStepBtn = document.getElementById('edit-add-step-btn');
    if (editAddStepBtn) {
        editAddStepBtn.addEventListener('click', function() {
            const stepList = document.getElementById('edit-step-list');
            if (!stepList) return;
            
            const stepItems = stepList.querySelectorAll('.step-item');
            const newStepNumber = stepItems.length + 1;
            
            const newItem = document.createElement('div');
            newItem.className = 'step-item';
            newItem.innerHTML = `
                <div class="step-number">${newStepNumber}</div>
                <div class="step-content">
                    <textarea name="steps[]" class="form-control" placeholder="Enter step instructions"></textarea>
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
                    updateStepNumbersEdit();
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
                    <label for="section-${newSectionNumber}-title">Section ${newSectionNumber} Title</label>
                    <input type="text" id="section-${newSectionNumber}-title" name="section_titles[]" class="form-control" placeholder="Enter section title">
                </div>
                
                <div class="form-group">
                    <label for="section-${newSectionNumber}-content">Section ${newSectionNumber} Content</label>
                    <textarea id="section-${newSectionNumber}-content" name="section_contents[]" class="form-control" rows="5" placeholder="Enter section content"></textarea>
                </div>
            `;
            
            // Insert the new section before the "Add New Section" button
            sectionContainer.insertBefore(newSection, this);
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

// Function to update step numbers for edit recipe page
function updateStepNumbersEdit() {
    const stepList = document.getElementById('edit-step-list');
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
    
    const editTagsInput = document.getElementById('edit-tags-input');
    if (editTagsInput) {
        editTagsInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && this.value.trim() !== '') {
                e.preventDefault();
                
                const tagsContainer = document.getElementById('edit-tags-container');
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
        
        // Add event listeners to existing tag remove buttons
        const tagRemoveButtons = document.querySelectorAll('#edit-tags-container .tag-remove');
        tagRemoveButtons.forEach(button => {
            button.addEventListener('click', function() {
                const tag = this.closest('.tag');
                if (tag && tag.parentNode) {
                    tag.parentNode.removeChild(tag);
                }
            });
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
            }
        });
    }
    
    // Edit recipe image upload
    const editRecipeImage = document.getElementById('edit-recipe-image');
    if (editRecipeImage) {
        editRecipeImage.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imagePreview = document.getElementById('edit-image-preview');
                    if (!imagePreview) return;
                    
                    const placeholderDiv = imagePreview.querySelector('.local-placeholder');
                    
                    if (placeholderDiv) {
                        // Replace placeholder with actual image
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.alt = 'Recipe image preview';
                        
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
            }
        });
    }
    
    // Media upload
    const mediaUpload = document.getElementById('media-upload');
    if (mediaUpload) {
        mediaUpload.addEventListener('change', function() {
            const files = this.files;
            if (files.length > 0) {
                // Create form data for file upload
                const formData = new FormData();
                for (let i = 0; i < files.length; i++) {
                    formData.append('files[]', files[i]);
                }
                
                // Send files to server
                fetch('admin-connector.php?action=upload_media', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showNotification('Success', `${files.length} file(s) uploaded successfully!`, 'success');
                        loadMedia(); // Reload media list
                    } else {
                        showNotification('Error', data.error || 'Failed to upload files.', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error uploading files:', error);
                    showNotification('Error', 'Failed to connect to server.', 'error');
                });
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
                if (stepItem.closest('#step-list')) {
                    updateStepNumbers();
                } else if (stepItem.closest('#edit-step-list')) {
                    updateStepNumbersEdit();
                }
            }
        });
    });
}

// Function to add factbox item
function addFactBoxItem(sectionIndex) {
    const factboxList = document.getElementById(`factbox-list-${sectionIndex}`);
    if (!factboxList) return;
    
    const newItem = document.createElement('div');
    newItem.className = 'ingredient-item';
    newItem.innerHTML = `
        <input type="text" name="factbox_items_${sectionIndex}[]" class="form-control" placeholder="Enter fact">
        <button type="button" class="remove-ingredient-btn"><i class="fas fa-times"></i></button>
    `;
    
    factboxList.appendChild(newItem);
    
    // Add event listener for remove button
    const removeBtn = newItem.querySelector('.remove-ingredient-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', function() {
            factboxList.removeChild(newItem);
        });
    }
}

/**
 * API Connection Functions
 */

// Function to set up API connections
function setupAPIConnections() {
    // Handle login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Validate input
            if (!username || !password) {
                showNotification('Error', 'Please enter both username and password.', 'error');
                return;
            }
            
            // Send login request to API
            fetch('admin-connector.php?action=login', {
                method: 'POST',
                body: JSON.stringify({
                    username: username,
                    password: password
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Login successful
                    document.getElementById('login-page').style.display = 'none';
                    document.getElementById('admin-dashboard').style.display = 'block';
                    showAdminPage('dashboard');
                    showNotification('Success', 'Logged in successfully!', 'success');
                } else {
                    // Login failed
                    showNotification('Error', data.error || 'Invalid username or password!', 'error');
                }
            })
            .catch(error => {
                console.error('Login error:', error);
                showNotification('Error', 'Failed to connect to server.', 'error');
            });
        });
    }
    
    // Set up admin navigation links
    const adminNavLinks = document.querySelectorAll('.admin-nav a');
    adminNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') {
                e.preventDefault();
                
                const action = this.getAttribute('onclick');
                if (action && action.includes('showAdminPage')) {
                    // Extract page ID from onclick attribute
                    const pageId = action.match(/showAdminPage\(['"](.+)['"]\)/)[1];
                    if (pageId) {
                        showAdminPage(pageId);
                    }
                }
            }
        });
    });
}

// Function to load dashboard stats
function loadDashboardStats() {
    fetch('admin-connector.php?action=dashboard_stats')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update recipe count
            const recipeWidget = document.querySelector('.widget:nth-child(1) .widget-count');
            if (recipeWidget) {
                recipeWidget.textContent = data.data.recipes.total;
            }
            
            // Update comment count
            const commentWidget = document.querySelector('.widget:nth-child(2) .widget-count');
            if (commentWidget) {
                commentWidget.textContent = data.data.comments.total;
            }
            
            // Update media count
            const mediaWidget = document.querySelector('.widget:nth-child(3) .widget-count');
            if (mediaWidget) {
                mediaWidget.textContent = data.data.media.total;
            }
            
            // Update recent recipes table
            updateRecentRecipesTable(data.data.recent_recipes);
            
            // Update recent comments table
            updateRecentCommentsTable(data.data.recent_comments);
        }
    })
    .catch(error => {
        console.error('Error loading dashboard stats:', error);
        showNotification('Error', 'Failed to load dashboard statistics.', 'error');
    });
}

// Function to update recent recipes table
function updateRecentRecipesTable(recipes) {
    const tableBody = document.querySelector('#page-dashboard .admin-section:first-of-type .admin-table tbody');
    if (!tableBody || !recipes || !recipes.length) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add new rows
    recipes.forEach(recipe => {
        const row = document.createElement('tr');
        
        // Format date
        let formattedDate = '';
        if (recipe.created_at) {
            const date = new Date(recipe.created_at);
            formattedDate = date.toLocaleDateString('lt-LT', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
        
        row.innerHTML = `
            <td>${recipe.title}</td>
            <td>${recipe.categories ? recipe.categories[0] : ''}</td>
            <td>${formattedDate}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view-btn" title="View" onclick="viewRecipe('${recipe.id}')"><i class="fas fa-eye"></i></button>
                    <button class="action-btn edit-btn" title="Edit" onclick="editRecipe('${recipe.id}')"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" title="Delete" onclick="showDeleteConfirmation('${recipe.id}', 'recipe')"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Function to update recent comments table
function updateRecentCommentsTable(comments) {
    const tableBody = document.querySelector('#page-dashboard .admin-section:last-of-type .admin-table tbody');
    if (!tableBody || !comments || !comments.length) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add new rows
    comments.forEach(comment => {
        const row = document.createElement('tr');
        
        // Format date
        let formattedDate = '';
        if (comment.created_at) {
            const date = new Date(comment.created_at);
            formattedDate = date.toLocaleDateString('lt-LT', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
        
        // Truncate comment content if too long
        const truncatedContent = comment.content.length > 50 
            ? comment.content.substring(0, 50) + '...' 
            : comment.content;
        
        row.innerHTML = `
            <td>${comment.author}</td>
            <td>${truncatedContent}</td>
            <td>${comment.recipe_title || 'Unknown Recipe'}</td>
            <td>${formattedDate}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view-btn" title="View" onclick="viewComment('${comment.id}')"><i class="fas fa-eye"></i></button>
                    <button class="action-btn edit-btn" title="Edit" onclick="editComment('${comment.id}')"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" title="Delete" onclick="showDeleteConfirmation('${comment.id}', 'comment')"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
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
        
        // Load page-specific data
        if (pageId === 'dashboard') {
            loadDashboardStats();
        } else if (pageId === 'recipes') {
            loadRecipes();
        } else if (pageId === 'comments') {
            loadComments();
        } else if (pageId === 'about') {
            loadAboutPage();
        } else if (pageId === 'media') {
            loadMedia();
        }
    }
}

/**
 * Recipe Management Functions
 */

// Function to view recipe
function viewRecipe(recipeId) {
    // Open recipe in new tab (frontend site)
    window.open(`index.html?recipe=${recipeId}`, '_blank');
}

// Function to edit recipe
function editRecipe(recipeId) {
    // Load recipe data from API
    fetch(`admin-connector.php?action=get_recipe&id=${recipeId}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Populate edit recipe form
            populateEditRecipeForm(data.data);
            // Show edit recipe page
            showAdminPage('edit-recipe');
        } else {
            showNotification('Error', data.error || 'Failed to load recipe.', 'error');
        }
    })
    .catch(error => {
        console.error('Error loading recipe:', error);
        showNotification('Error', 'Failed to connect to server.', 'error');
    });
}

// Function to populate edit recipe form
function populateEditRecipeForm(recipe) {
    // Set recipe ID in a hidden field or data attribute
    const form = document.querySelector('#page-edit-recipe form');
    if (!form) return;
    
    form.dataset.recipeId = recipe.id;
    
    // Set form fields
    document.getElementById('edit-recipe-title').value = recipe.title || '';
    document.getElementById('edit-recipe-intro').value = recipe.intro || '';
    
    // Set image if exists
    if (recipe.image) {
        const imagePreview = document.getElementById('edit-image-preview');
        if (imagePreview) {
            const placeholderDiv = imagePreview.querySelector('.local-placeholder');
            
            if (placeholderDiv) {
                // Replace placeholder with image
                const img = document.createElement('img');
                img.src = 'img/' + recipe.image;
                img.alt = recipe.title;
                
                imagePreview.replaceChild(img, placeholderDiv);
            } else {
                // Update existing image
                const previewImg = imagePreview.querySelector('img');
                if (previewImg) {
                    previewImg.src = 'img/' + recipe.image;
                }
            }
            
            imagePreview.style.display = 'block';
        }
    }
    
    // Set categories
    const categoryCheckboxes = document.querySelectorAll('#page-edit-recipe input[name="categories[]"]');
    categoryCheckboxes.forEach(checkbox => {
        checkbox.checked = recipe.categories && recipe.categories.includes(checkbox.value);
    });
    
    // Set tags
    const tagsContainer = document.getElementById('edit-tags-container');
    if (tagsContainer) {
        const tagsInput = document.getElementById('edit-tags-input');
        
        // Clear existing tags
        const existingTags = tagsContainer.querySelectorAll('.tag');
        existingTags.forEach(tag => {
            if (tagsInput && !tag.contains(tagsInput)) {
                tagsContainer.removeChild(tag);
            }
        });
        
        // Add new tags
        if (recipe.tags && recipe.tags.length && tagsInput) {
            recipe.tags.forEach(tag => {
                const tagElement = document.createElement('div');
                tagElement.className = 'tag';
                
                const tagText = document.createElement('span');
                tagText.className = 'tag-text';
                tagText.textContent = tag;
                
                const tagRemove = document.createElement('button');
                tagRemove.className = 'tag-remove';
                tagRemove.type = 'button';
                tagRemove.innerHTML = '<i class="fas fa-times"></i>';
                tagRemove.addEventListener('click', function() {
                    tagsContainer.removeChild(tagElement);
                });
                
                tagElement.appendChild(tagText);
                tagElement.appendChild(tagRemove);
                
                tagsContainer.insertBefore(tagElement, tagsInput);
            });
        }
    }
    
    // Set recipe information
    document.getElementById('edit-prep-time').value = recipe.prep_time || '';
    document.getElementById('edit-cook-time').value = recipe.cook_time || '';
    document.getElementById('edit-servings').value = recipe.servings || '';
    
    // Set ingredients
    const ingredientList = document.getElementById('edit-ingredient-list');
    if (ingredientList) {
        ingredientList.innerHTML = ''; // Clear existing ingredients
        
        if (recipe.ingredients && recipe.ingredients.length) {
            recipe.ingredients.forEach(ingredient => {
                const ingredientItem = document.createElement('div');
                ingredientItem.className = 'ingredient-item';
                ingredientItem.innerHTML = `
                    <input type="text" name="ingredients[]" class="form-control" value="${ingredient}">
                    <button type="button" class="remove-ingredient-btn"><i class="fas fa-times"></i></button>
                `;
                
                ingredientList.appendChild(ingredientItem);
                
                // Add event listener for remove button
                const removeBtn = ingredientItem.querySelector('.remove-ingredient-btn');
                if (removeBtn) {
                    removeBtn.addEventListener('click', function() {
                        ingredientList.removeChild(ingredientItem);
                    });
                }
            });
        }
    }
    
    // Set steps
    const stepList = document.getElementById('edit-step-list');
    if (stepList) {
        stepList.innerHTML = ''; // Clear existing steps
        
        if (recipe.steps && recipe.steps.length) {
            recipe.steps.forEach((step, index) => {
                const stepItem = document.createElement('div');
                stepItem.className = 'step-item';
                stepItem.innerHTML = `
                    <div class="step-number">${index + 1}</div>
                    <div class="step-content">
                        <textarea name="steps[]" class="form-control">${step}</textarea>
                    </div>
                    <div class="step-actions">
                        <button type="button" class="remove-ingredient-btn"><i class="fas fa-times"></i></button>
                    </div>
                `;
                
                stepList.appendChild(stepItem);
                
                // Add event listener for remove button
                const removeBtn = stepItem.querySelector('.remove-ingredient-btn');
                if (removeBtn) {
                    removeBtn.addEventListener('click', function() {
                        stepList.removeChild(stepItem);
                        updateStepNumbersEdit();
                    });
                }
            });
        }
    }
    
    // Set notes
    document.getElementById('edit-recipe-notes').value = recipe.notes || '';
    
    // Set status
    document.getElementById('edit-recipe-status').value = recipe.status || 'draft';
}

// Function to save recipe
function saveRecipe() {
    // Get form data
    const form = document.querySelector('#page-add-recipe form');
    if (!form) return;
    
    const formData = new FormData(form);
    
    // Get tags
    const tags = [];
    const tagElements = document.querySelectorAll('#tags-container .tag .tag-text');
    tagElements.forEach(tagElement => {
        tags.push(tagElement.textContent);
    });
    formData.append('tags', JSON.stringify(tags));
    
    // Send form data to API
    fetch('admin-connector.php?action=add_recipe', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Success', 'Recipe saved successfully!', 'success');
            showAdminPage('recipes');
        } else {
            showNotification('Error', data.error || 'Failed to save recipe.', 'error');
        }
    })
    .catch(error => {
        console.error('Error saving recipe:', error);
        showNotification('Error', 'Failed to connect to server.', 'error');
    });
}

// Function to update recipe
function updateRecipe() {
    // Get form data
    const form = document.querySelector('#page-edit-recipe form');
    if (!form) return;
    
    const formData = new FormData(form);
    
    // Add recipe ID
    formData.append('id', form.dataset.recipeId);
    
    // Get tags
    const tags = [];
    const tagElements = document.querySelectorAll('#edit-tags-container .tag .tag-text');
    tagElements.forEach(tagElement => {
        tags.push(tagElement.textContent);
    });
    formData.append('tags', JSON.stringify(tags));
    
    // Send form data to API
    fetch('admin-connector.php?action=update_recipe', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Success', 'Recipe updated successfully!', 'success');
            showAdminPage('recipes');
        } else {
            showNotification('Error', data.error || 'Failed to update recipe.', 'error');
        }
    })
    .catch(error => {
        console.error('Error updating recipe:', error);
        showNotification('Error', 'Failed to connect to server.', 'error');
    });
}

// Function to load recipes
function loadRecipes(status = 'all') {
    // Build query string
    let queryString = 'action=get_recipes';
    if (status && status !== 'all') {
        queryString += `&status=${status}`;
    }
    
    // Fetch recipes from API
    fetch(`admin-connector.php?${queryString}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update recipes table
            updateRecipesTable(data.data);
            // Update pagination
            updatePagination(data.meta);
        } else {
            showNotification('Error', data.error || 'Failed to load recipes.', 'error');
        }
    })
    .catch(error => {
        console.error('Error loading recipes:', error);
        showNotification('Error', 'Failed to connect to server.', 'error');
    });
}

// Function to update recipes table
function updateRecipesTable(recipes) {
    const tableBody = document.querySelector('#page-recipes .admin-table tbody');
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add new rows
    recipes.forEach(recipe => {
        const row = document.createElement('tr');
        
        // Format date
        let formattedDate = '-';
        if (recipe.created_at) {
            const date = new Date(recipe.created_at);
            formattedDate = date.toLocaleDateString('lt-LT', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
        
        row.innerHTML = `
            <td>${recipe.title}</td>
            <td>${recipe.categories ? recipe.categories[0] : ''}</td>
            <td>${formattedDate}</td>
            <td>${recipe.status || 'Draft'}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view-btn" title="View" onclick="viewRecipe('${recipe.id}')"><i class="fas fa-eye"></i></button>
                    <button class="action-btn edit-btn" title="Edit" onclick="editRecipe('${recipe.id}')"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" title="Delete" onclick="showDeleteConfirmation('${recipe.id}', 'recipe')"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Show "No recipes found" message if no recipes
    if (!recipes || recipes.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="5" style="text-align: center;">No recipes found.</td>
        `;
        tableBody.appendChild(row);
    }
}

// Function to update pagination
function updatePagination(meta) {
    if (!meta) return;
    
    const pagination = document.querySelector('#page-recipes .pagination');
    if (!pagination) return;
    
    // Clear existing pagination
    pagination.innerHTML = '';
    
    // Add previous page button
    const prevItem = document.createElement('div');
    prevItem.className = 'pagination-item' + (meta.page <= 1 ? ' disabled' : '');
    prevItem.innerHTML = '<i class="fas fa-chevron-left"></i>';
    if (meta.page > 1) {
        prevItem.addEventListener('click', function() {
            // Load previous page
            loadRecipes(undefined, meta.page - 1);
        });
    }
    pagination.appendChild(prevItem);
    
    // Add page numbers
    for (let i = 1; i <= meta.pages; i++) {
        const pageItem = document.createElement('div');
        pageItem.className = 'pagination-item' + (i === meta.page ? ' active' : '');
        pageItem.textContent = i;
        if (i !== meta.page) {
            pageItem.addEventListener('click', function() {
                // Load specific page
                loadRecipes(undefined, i);
            });
        }
        pagination.appendChild(pageItem);
    }
    
    // Add next page button
    const nextItem = document.createElement('div');
    nextItem.className = 'pagination-item' + (meta.page >= meta.pages ? ' disabled' : '');
    nextItem.innerHTML = '<i class="fas fa-chevron-right"></i>';
    if (meta.page < meta.pages) {
        nextItem.addEventListener('click', function() {
            // Load next page
            loadRecipes(undefined, meta.page + 1);
        });
    }
    pagination.appendChild(nextItem);
}

/**
 * Comment Management Functions
 */

// Function to view comment
function viewComment(commentId) {
    fetch(`admin-connector.php?action=get_comment&id=${commentId}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Populate comment view
            populateCommentView(data.data);
            // Show comment modal
            showCommentModal();
        } else {
            showNotification('Error', data.error || 'Failed to load comment.', 'error');
        }
    })
    .catch(error => {
        console.error('Error loading comment:', error);
        showNotification('Error', 'Failed to connect to server.', 'error');
    });
}

// Function to edit comment
function editComment(commentId) {
    fetch(`admin-connector.php?action=get_comment&id=${commentId}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Populate comment edit form
            populateCommentEdit(data.data);
            // Show comment modal in edit mode
            showCommentModal(true);
        } else {
            showNotification('Error', data.error || 'Failed to load comment.', 'error');
        }
    })
    .catch(error => {
        console.error('Error loading comment:', error);
        showNotification('Error', 'Failed to connect to server.', 'error');
    });
}

// Function to populate comment view
function populateCommentView(comment) {
    const commentView = document.getElementById('comment-view');
    if (!commentView) return;
    
    // Format date
    let formattedDate = '-';
    if (comment.created_at) {
        const date = new Date(comment.created_at);
        formattedDate = date.toLocaleDateString('lt-LT', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
    
    // Set comment data
    commentView.innerHTML = `
        <div class="form-group">
            <label>Author</label>
            <div class="form-control" style="background-color: #f9f6f1;">${comment.author}</div>
        </div>
        
        <div class="form-group">
            <label>Email</label>
            <div class="form-control" style="background-color: #f9f6f1;">${comment.email}</div>
        </div>
        
        <div class="form-group">
            <label>Comment</label>
            <div class="form-control" style="background-color: #f9f6f1; min-height: 100px;">${comment.content}</div>
        </div>
        
        <div class="form-group">
            <label>Recipe</label>
            <div class="form-control" style="background-color: #f9f6f1;">${comment.recipe_title || 'Unknown Recipe'}</div>
        </div>
        
        <div class="form-group">
            <label>Date</label>
            <div class="form-control" style="background-color: #f9f6f1;">${formattedDate}</div>
        </div>
        
        <div class="form-group">
            <label>Status</label>
            <div class="form-control" style="background-color: #f9f6f1;">${comment.status || 'Pending'}</div>
        </div>
    `;
    
    // Store comment ID in modal
    const commentModal = document.getElementById('comment-modal');
    if (commentModal) {
        commentModal.dataset.commentId = comment.id;
    }
}

// Function to populate comment edit form
function populateCommentEdit(comment) {
    // Set form fields
    document.getElementById('edit-comment-author').value = comment.author || '';
    document.getElementById('edit-comment-email').value = comment.email || '';
    document.getElementById('edit-comment-content').value = comment.content || '';
    document.getElementById('edit-comment-status').value = comment.status || 'pending';
    
    // Store comment ID in modal
    const commentModal = document.getElementById('comment-modal');
    if (commentModal) {
        commentModal.dataset.commentId = comment.id;
    }
}

// Function to show comment modal
function showCommentModal(isEdit = false) {
    const modal = document.getElementById('comment-modal');
    if (!modal) return;
    
    const modalTitle = document.getElementById('comment-modal-title');
    const viewContent = document.getElementById('comment-view');
    const editContent = document.getElementById('comment-edit');
    const saveBtn = document.getElementById('comment-save-btn');
    
    if (modalTitle && viewContent && editContent && saveBtn) {
        if (isEdit) {
            modalTitle.textContent = 'Edit Comment';
            viewContent.style.display = 'none';
            editContent.style.display = 'block';
            saveBtn.style.display = 'block';
        } else {
            modalTitle.textContent = 'View Comment';
            viewContent.style.display = 'block';
            editContent.style.display = 'none';
            saveBtn.style.display = 'none';
        }
    }
    
    modal.classList.add('show');
}

// Function to save comment
function saveComment() {
    // Get comment ID from modal
    const commentModal = document.getElementById('comment-modal');
    if (!commentModal) return;
    
    const commentId = commentModal.dataset.commentId;
    
    // Get form data
    const author = document.getElementById('edit-comment-author').value;
    const email = document.getElementById('edit-comment-email').value;
    const content = document.getElementById('edit-comment-content').value;
    const status = document.getElementById('edit-comment-status').value;
    
    // Validate input
    if (!author || !email || !content) {
        showNotification('Error', 'Please fill in all required fields.', 'error');
        return;
    }
    
    // Prepare data
    const formData = {
        id: commentId,
        author: author,
        email: email,
        content: content,
        status: status
    };
    
    // Send data to API
    fetch('admin-connector.php?action=update_comment', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeModal('comment-modal');
            showNotification('Success', 'Comment updated successfully!', 'success');
            // Reload comments
            loadComments();
        } else {
            showNotification('Error', data.error || 'Failed to update comment.', 'error');
        }
    })
    .catch(error => {
        console.error('Error updating comment:', error);
        showNotification('Error', 'Failed to connect to server.', 'error');
    });
}

// Function to load comments
function loadComments(status = 'all') {
    // Build query string
    let queryString = 'action=get_comments';
    if (status && status !== 'all') {
        queryString += `&status=${status}`;
    }
    
    // Fetch comments from API
    fetch(`admin-connector.php?${queryString}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update comments table
            updateCommentsTable(data.data);
            // Update pagination
            updateCommentsPagination(data.meta);
        } else {
            showNotification('Error', data.error || 'Failed to load comments.', 'error');
        }
    })
    .catch(error => {
        console.error('Error loading comments:', error);
        showNotification('Error', 'Failed to connect to server.', 'error');
    });
}

// Function to update comments table
function updateCommentsTable(comments) {
    const tableBody = document.querySelector('#page-comments .admin-table tbody');
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add new rows
    if (comments && comments.length) {
        comments.forEach(comment => {
            const row = document.createElement('tr');
            
            // Format date
            let formattedDate = '-';
            if (comment.created_at) {
                const date = new Date(comment.created_at);
                formattedDate = date.toLocaleDateString('lt-LT', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
            }
            
            // Truncate comment content if too long
            const truncatedContent = comment.content.length > 50 
                ? comment.content.substring(0, 50) + '...' 
                : comment.content;
            
            row.innerHTML = `
                <td>${comment.author}</td>
                <td>${truncatedContent}</td>
                <td>${comment.recipe_title || 'Unknown Recipe'}</td>
                <td>${formattedDate}</td>
                <td>${comment.status || 'Pending'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view-btn" title="View" onclick="viewComment('${comment.id}')"><i class="fas fa-eye"></i></button>
                        <button class="action-btn edit-btn" title="Edit" onclick="editComment('${comment.id}')"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete-btn" title="Delete" onclick="showDeleteConfirmation('${comment.id}', 'comment')"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    } else {
        // Show "No comments found" message if no comments
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" style="text-align: center;">No comments found.</td>
        `;
        tableBody.appendChild(row);
    }
}

// Function to update comments pagination
function updateCommentsPagination(meta) {
    // Similar to updatePagination for recipes
    if (!meta) return;
    
    const pagination = document.querySelector('#page-comments .pagination');
    if (!pagination) return;
    
    // Clear existing pagination
    pagination.innerHTML = '';
    
    // Implementation similar to updatePagination
    // ...
}

/**
 * About Page Management Functions
 */

// Function to load about page content
function loadAboutPage() {
    fetch('admin-connector.php?action=get_about')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Populate about page form
            populateAboutPageForm(data.data);
        } else {
            showNotification('Error', data.error || 'Failed to load about page content.', 'error');
        }
    })
    .catch(error => {
        console.error('Error loading about page:', error);
        showNotification('Error', 'Failed to connect to server.', 'error');
    });
}

// Function to populate about page form
function populateAboutPageForm(aboutData) {
    if (!aboutData) return;
    
    // Implementation details...
}

// Function to save about page
function saveAboutPage() {
    // Get form data
    const form = document.querySelector('#page-about form');
    if (!form) return;
    
    const formData = new FormData(form);
    
    // Implementation details...
    
    // Send form data to API
    fetch('admin-connector.php?action=update_about', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Success', 'About page updated successfully!', 'success');
        } else {
            showNotification('Error', data.error || 'Failed to update about page.', 'error');
        }
    })
    .catch(error => {
        console.error('Error updating about page:', error);
        showNotification('Error', 'Failed to connect to server.', 'error');
    });
}

/**
 * Media Management Functions
 */

// Function to load media
function loadMedia(type = 'all') {
    // Build query string
    let queryString = 'action=get_media';
    if (type && type !== 'all') {
        queryString += `&type=${type}`;
    }
    
    // Implementation details...
}

// Function to update media grid
function updateMediaGrid(mediaFiles) {
    // Implementation details...
}

/**
 * Utility Functions
 */

// Function to logout
function logout() {
    fetch('admin-connector.php?action=logout')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('login-page').style.display = 'block';
            document.getElementById('admin-dashboard').style.display = 'none';
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            showNotification('Success', 'Logged out successfully!', 'success');
        }
    })
    .catch(error => {
        console.error('Logout error:', error);
    });
}

// Function to close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

// Function to show delete confirmation modal
function showDeleteConfirmation(itemId, itemType) {
    currentItemId = itemId;
    currentItemType = itemType;
    const modal = document.getElementById('delete-modal');
    if (modal) {
        modal.classList.add('show');
    }
}

// Function to delete item
function deleteItem() {
    // Implementation details...
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