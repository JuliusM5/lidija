/**
 * Updated version of admin-core.js with fixes for the showDeleteConfirmation error
 * 
 * The main changes are:
 * 1. Explicitly expose key functions to window object
 * 2. Fix function references
 * 3. Ensure proper event delegation for delete buttons
 * 
 * Replace the content of your existing public/js/admin-core.js with this code
 */

(function() {
    // Global variables for tracking current selected items
    let currentItemId = null;
    let currentItemType = null;

    // =====================================================
    // INITIALIZATION
    // =====================================================
    
    // Document ready function
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Admin Core initialized');
        
        // Set up login form handling
        setupLoginForm();
        
        // Check login status
        checkLoginStatus();
        
        // Initialize UI components
        initUI();
        
        // Fix favicon
        addFaviconLink();
        
        // Fix delete confirmation buttons
        fixDeleteConfirmationButtons();
    });

    // =====================================================
    // AUTHENTICATION
    // =====================================================
    
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
                
                // Validate inputs
                if (!username || !password) {
                    showNotification('Error', 'Please enter username and password', 'error');
                    return;
                }
                
                // Show loading notification
                showNotification('Please wait', 'Authenticating...', 'success');
                
                // Make API call to login
                loginUser(username, password);
            });
        }
    }
    
    /**
     * Check login status on page load
     */
    function checkLoginStatus() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const token = localStorage.getItem('token');
        
        if (isLoggedIn && token) {
            // Verify token with server
            fetch('/admin-api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Token verification failed');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Token is valid, show dashboard
                    document.getElementById('login-page').style.display = 'none';
                    document.getElementById('admin-dashboard').style.display = 'block';
                    showAdminPage('dashboard');
                } else {
                    // Token is invalid, show login page
                    logout();
                }
            })
            .catch(error => {
                console.error('Token verification error:', error);
                logout();
            });
        } else {
            // No token, show login page
            document.getElementById('login-page').style.display = 'block';
            document.getElementById('admin-dashboard').style.display = 'none';
        }
    }

    /**
     * Get authentication headers for API requests
     */
    function getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        };
    }

    /**
     * Log out the user
     */
    function logout() {
        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        
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
    }

    // =====================================================
    // UI COMPONENTS
    // =====================================================
    
    /**
     * Initialize UI components
     */
    function initUI() {
        initTabs();
        initRemoveButtons();
        initIngredientList();
        initStepList();
        initTagsInput();
        initFileUploads();
        addEventListeners();
    }
    
    /**
     * Add various event listeners for UI interactions
     */
    function addEventListeners() {
        // Close modal when clicking outside of it
        document.addEventListener('click', function(event) {
            const modals = document.querySelectorAll('.modal-backdrop');
            modals.forEach(modal => {
                if (event.target === modal) {
                    closeModal(modal.id);
                }
            });
        });
        
        // Add event delegation for delete buttons
        document.addEventListener('click', function(event) {
            const deleteBtn = event.target.closest('.action-btn.delete-btn');
            if (deleteBtn) {
                const itemId = deleteBtn.getAttribute('data-item-id');
                const itemType = deleteBtn.getAttribute('data-item-type');
                
                if (itemId && itemType) {
                    showDeleteConfirmation(itemId, itemType);
                }
            }
        });
    }
    
    /**
     * Fix any existing inline onclick attributes for delete confirmation
     */
    function fixDeleteConfirmationButtons() {
        // Find delete buttons with inline onclick
        const deleteButtons = document.querySelectorAll('.action-btn.delete-btn[onclick*="showDeleteConfirmation"]');
        
        deleteButtons.forEach(button => {
            const onclickAttr = button.getAttribute('onclick');
            if (onclickAttr && onclickAttr.includes('showDeleteConfirmation')) {
                // Extract parameters
                const match = onclickAttr.match(/showDeleteConfirmation\s*\(\s*['"](.+?)['"],\s*['"](.+?)['"]\s*\)/);
                
                if (match && match.length === 3) {
                    const itemId = match[1];
                    const itemType = match[2];
                    
                    // Remove the onclick attribute
                    button.removeAttribute('onclick');
                    
                    // Add data attributes
                    button.setAttribute('data-item-id', itemId);
                    button.setAttribute('data-item-type', itemType);
                    
                    console.log(`Fixed delete button for ${itemType} with ID: ${itemId}`);
                }
            }
        });
    }

    /**
     * Initialize tabs functionality
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
                
                // Handle tab-specific actions
                const tabType = this.getAttribute('data-tab');
                if (tabType) {
                    // Handle tab change events
                    const pageId = tabContainer.closest('.admin-page').id.replace('page-', '');
                    
                    // Refresh content based on tab type
                    if (pageId === 'recipes') {
                        if (typeof window.fetchRecipes === 'function') {
                            window.fetchRecipes(1, tabType);
                        } else {
                            console.warn('fetchRecipes function not found');
                        }
                    } else if (pageId === 'comments') {
                        if (typeof window.fetchComments === 'function') {
                            window.fetchComments(1, tabType);
                        } else {
                            console.warn('fetchComments function not found');
                        }
                    } else if (pageId === 'media') {
                        if (typeof window.fetchMedia === 'function') {
                            window.fetchMedia(1, tabType);
                        } else {
                            console.warn('fetchMedia function not found');
                        }
                    }
                }
            });
        });
    }

    /**
     * Initialize ingredients list functionality
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
        
        // Media upload
        const mediaUpload = document.getElementById('media-upload');
        if (mediaUpload) {
            mediaUpload.addEventListener('change', function() {
                if (this.files && this.files.length > 0) {
                    // Show loading notification
                    showNotification('Information', 'Preparing to upload files...', 'success');
                    
                    // Create form data for upload
                    const formData = new FormData();
                    for (let i = 0; i < this.files.length; i++) {
                        formData.append('files[]', this.files[i]);
                    }
                    
                    // Get upload type (from active tab)
                    const activeTab = document.querySelector('#page-media .tab.active');
                    const type = activeTab ? activeTab.getAttribute('data-tab') : 'gallery';
                    if (type !== 'all') {
                        formData.append('type', type);
                    }
                    
                    // Upload files
                    if (typeof uploadMedia === 'function') {
                        uploadMedia(formData);
                    } else {
                        console.warn('uploadMedia function not found');
                        showNotification('Error', 'Upload functionality not available', 'error');
                    }
                }
            });
        }
    }

    /**
     * Initialize remove buttons
     */
    function initRemoveButtons() {
        // Image remove button
        const removeImageBtns = document.querySelectorAll('.remove-image');
        if (removeImageBtns.length > 0) {
            removeImageBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const imagePreview = this.closest('.image-preview');
                    if (!imagePreview) return;
                    
                    // Clear image preview
                    imagePreview.innerHTML = '<button type="button" class="remove-image"><i class="fas fa-times"></i></button>';
                    imagePreview.style.display = 'none';
                    
                    // Reset file input
                    const fileInput = this.closest('form').querySelector('input[type="file"]');
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
            });
        }
    }

    // =====================================================
    // PAGE NAVIGATION & DISPLAY
    // =====================================================
    
    /**
     * Show a specific admin page and hide others
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
            
            // Load page-specific data if needed
            if (pageId === 'dashboard') {
                if (typeof loadDashboardStats === 'function') {
                    loadDashboardStats();
                } else {
                    console.warn('loadDashboardStats function not found, using fallback');
                    loadDashboardStatsFallback();
                }
            } else if (pageId === 'recipes') {
                // Use the global fetchRecipes function if it exists
                if (typeof window.fetchRecipes === 'function') {
                    window.fetchRecipes();
                } else {
                    console.warn('fetchRecipes function not found, using fallback');
                    fetchRecipesFallback();
                }
            } else if (pageId === 'comments') {
                if (typeof window.fetchComments === 'function') {
                    window.fetchComments();
                } else {
                    console.warn('fetchComments function not found');
                    fetchCommentsFallback();
                }
            } else if (pageId === 'media') {
                if (typeof window.fetchMedia === 'function') {
                    window.fetchMedia();
                } else {
                    console.warn('fetchMedia function not found');
                    fetchMediaFallback();
                }
            } else if (pageId === 'about') {
                if (typeof window.fetchAboutData === 'function') {
                    window.fetchAboutData();
                } else {
                    console.warn('fetchAboutData function not found');
                    fetchAboutDataFallback();
                }
            }
            
            // Fix any delete confirmation buttons that might have been added
            setTimeout(fixDeleteConfirmationButtons, 100);
        }
    }

    /**
     * Fallback implementation of loadDashboardStats
     */
    function loadDashboardStatsFallback() {
        // Show loading in widgets
        document.querySelectorAll('.widget-count').forEach(widget => {
            widget.textContent = '...';
        });
        
        // Show loading in tables
        const recipeTable = document.querySelector('#page-dashboard .admin-section:nth-child(2) tbody');
        const commentTable = document.querySelector('#page-dashboard .admin-section:nth-child(3) tbody');
        
        if (recipeTable) {
            recipeTable.innerHTML = '<tr><td colspan="4" style="text-align: center;">Loading recipes...</td></tr>';
        }
        
        if (commentTable) {
            commentTable.innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading comments...</td></tr>';
        }
        
        // Try to fetch data from server
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
                throw new Error(data.error || 'Failed to load dashboard stats');
            }
        })
        .catch(error => {
            console.error('Dashboard stats error:', error);
            
            // Fallback to mock data when API fails
            provideMockDashboardData();
        });
    }
    
    /**
     * Fallback for fetchRecipes
     */
    function fetchRecipesFallback(page = 1, status = 'all') {
        console.log('Using fetchRecipes fallback with:', page, status);
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
                                <button type="button" class="action-btn edit-btn" data-recipe-id="${recipe.id}"><i class="fas fa-edit"></i></button>
                                <button type="button" class="action-btn delete-btn" data-item-id="${recipe.id}" data-item-type="recipe"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    `;
                    
                    // Add event listener for edit button
                    const editBtn = row.querySelector('.edit-btn');
                    if (editBtn) {
                        editBtn.addEventListener('click', function() {
                            const recipeId = this.getAttribute('data-recipe-id');
                            editRecipe(recipeId);
                        });
                    }
                    
                    recipesTable.appendChild(row);
                });
                
                // Update pagination
                if (typeof updatePagination === 'function') {
                    updatePagination(data.meta);
                }
                
                // Fix delete buttons
                fixDeleteConfirmationButtons();
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
     * Fallback for fetchComments
     */
    function fetchCommentsFallback(page = 1, status = 'all') {
        console.log('Using fetchComments fallback');
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
                                <button type="button" class="action-btn view-btn" data-comment-id="${comment.id}"><i class="fas fa-eye"></i></button>
                                <button type="button" class="action-btn edit-btn" data-comment-id="${comment.id}"><i class="fas fa-edit"></i></button>
                                <button type="button" class="action-btn delete-btn" data-item-id="${comment.id}" data-item-type="comment"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    `;
                    
                    // Add event listeners
                    const viewBtn = row.querySelector('.view-btn');
                    if (viewBtn) {
                        viewBtn.addEventListener('click', function() {
                            const commentId = this.getAttribute('data-comment-id');
                            viewComment(commentId);
                        });
                    }
                    
                    const editBtn = row.querySelector('.edit-btn');
                    if (editBtn) {
                        editBtn.addEventListener('click', function() {
                            const commentId = this.getAttribute('data-comment-id');
                            editComment(commentId);
                        });
                    }
                    
                    commentsTable.appendChild(row);
                });
                
                // Update pagination
                if (typeof updatePagination === 'function') {
                    updatePagination(data.meta);
                }
                
                // Fix delete buttons
                fixDeleteConfirmationButtons();
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
     * Fallback for fetchMedia
     */
    function fetchMediaFallback(page = 1, type = 'all') {
        console.log('Using fetchMedia fallback');
        const mediaGrid = document.querySelector('#page-media .gallery-grid');
        if (!mediaGrid) return;
        
        // Show loading message
        mediaGrid.innerHTML = '<div class="loading-message">Loading media files...</div>';
        
        // Get active tab if type is not specified
        if (type === 'all') {
            const activeTab = document.querySelector('#page-media .tab.active');
            if (activeTab) {
                type = activeTab.getAttribute('data-tab');
            }
        }
        
        fetch(`/admin-api/media?type=${type}&page=${page}`, {
            headers: getAuthHeaders()
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch media: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                if (data.data.length === 0) {
                    // No media
                    mediaGrid.innerHTML = '<div class="empty-message">No media files found</div>';
                    return;
                }
                
                // Clear loading message
                mediaGrid.innerHTML = '';
                
                // Add media to the grid
                data.data.forEach(media => {
                    const item = document.createElement('div');
                    item.className = 'gallery-item';
                    
                    const mediaId = media.directory ? `${media.directory}/${media.id}` : media.id;
                    
                    item.innerHTML = `
                        <img src="${media.url}" alt="${media.name}">
                        <div class="gallery-item-actions">
                            <button type="button" class="gallery-item-action delete-btn" data-item-id="${mediaId}" data-item-type="media">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                    
                    mediaGrid.appendChild(item);
                });
                
                // Update pagination
                if (typeof updatePagination === 'function') {
                    updatePagination(data.meta);
                }
                
                // Fix delete buttons
                fixDeleteConfirmationButtons();
            } else {
                showNotification('Error', data.error || 'Unknown error', 'error');
            }
        })
        .catch(error => {
            console.error('Fetch media error:', error);
            mediaGrid.innerHTML = '<div class="error-message">Failed to load media files. Please try again.</div>';
            showNotification('Error', 'Failed to load media files', 'error');
        });
    }
    
    /**
     * Fallback for fetchAboutData
     */
    function fetchAboutDataFallback() {
        console.log('Using fetchAboutData fallback');
        fetch('/admin-api/about', {
            headers: getAuthHeaders()
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch about data: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Populate form fields if we have a populateAboutForm function
                if (typeof populateAboutForm === 'function') {
                    populateAboutForm(data.data);
                } else {
                    console.warn('populateAboutForm function not found, using basic field population');
                    populateAboutFormBasic(data.data);
                }
            } else {
                showNotification('Error', data.error || 'Unknown error', 'error');
            }
        })
        .catch(error => {
            console.error('Fetch about data error:', error);
            showNotification('Error', 'Failed to load "About me" page data', 'error');
        });
    }
    
    /**
     * Basic field population for about page
     */
    function populateAboutFormBasic(aboutData) {
        // Set basic form fields if they exist
        const fields = [
            {id: 'about-title', value: aboutData.title},
            {id: 'about-subtitle', value: aboutData.subtitle},
            {id: 'about-intro', value: aboutData.intro},
            {id: 'about-email', value: aboutData.email},
            {id: 'facebook-url', value: aboutData.social?.facebook},
            {id: 'instagram-url', value: aboutData.social?.instagram},
            {id: 'pinterest-url', value: aboutData.social?.pinterest}
        ];
        
        fields.forEach(field => {
            const element = document.getElementById(field.id);
            if (element && field.value) {
                element.value = field.value;
            }
        });
        
        // Set section fields if they exist
        if (aboutData.sections && aboutData.sections.length > 0) {
            if (aboutData.sections.length >= 1 && aboutData.sections[0]) {
                const title1 = document.getElementById('section-1-title');
                const content1 = document.getElementById('section-1-content');
                if (title1) title1.value = aboutData.sections[0].title || '';
                if (content1) content1.value = aboutData.sections[0].content || '';
            }
            
            if (aboutData.sections.length >= 2 && aboutData.sections[1]) {
                const title2 = document.getElementById('section-2-title');
                const content2 = document.getElementById('section-2-content');
                if (title2) title2.value = aboutData.sections[1].title || '';
                if (content2) content2.value = aboutData.sections[1].content || '';
            }
        }
        
        // Show image preview if available
        if (aboutData.image) {
            const imagePreview = document.getElementById('about-image-preview');
            if (imagePreview) {
                const existingImg = imagePreview.querySelector('img');
                if (existingImg) {
                    existingImg.src = `/img/about/${aboutData.image}`;
                } else {
                    const img = document.createElement('img');
                    img.src = `/img/about/${aboutData.image}`;
                    img.alt = 'About page image preview';
                    imagePreview.appendChild(img);
                }
                imagePreview.style.display = 'block';
            }
        }
    }

    /**
     * Update dashboard widgets with statistics
     */
    function updateDashboardWidgets(data) {
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
     * Update recent recipes table - FIXED FUNCTION
     */
    function updateRecentRecipes(recipes) {
        const table = document.querySelector('#page-dashboard .admin-section:nth-child(2) tbody');
        if (!table) return;
        
        if (!recipes || recipes.length === 0) {
            table.innerHTML = '<tr><td colspan="4" style="text-align: center;">No recipes</td></tr>';
            return;
        }
        
        table.innerHTML = '';
        
        recipes.forEach(recipe => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${recipe.title || 'Untitled'}</td>
                <td>${recipe.categories && recipe.categories.length ? recipe.categories.join(', ') : '-'}</td>
                <td>${formatDate(recipe.created_at) || '-'}</td>
                <td>
                    <div class="action-buttons">
                        <button type="button" class="action-btn edit-btn" data-recipe-id="${recipe.id}"><i class="fas fa-edit"></i></button>
                        <button type="button" class="action-btn delete-btn" data-item-id="${recipe.id}" data-item-type="recipe"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            
            // Add event listener for edit button
            const editBtn = row.querySelector('.edit-btn');
            if (editBtn) {
                editBtn.addEventListener('click', function() {
                    const recipeId = this.getAttribute('data-recipe-id');
                    editRecipe(recipeId);
                });
            }
            
            table.appendChild(row);
        });
        
        // Fix delete buttons
        fixDeleteConfirmationButtons();
    }

    /**
     * Update recent comments table - FIXED FUNCTION
     */
    function updateRecentComments(comments) {
        const table = document.querySelector('#page-dashboard .admin-section:nth-child(3) tbody');
        if (!table) return;
        
        if (!comments || comments.length === 0) {
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
                <td>${formatDate(comment.created_at) || '-'}</td>
                <td>
                    <div class="action-buttons">
                        <button type="button" class="action-btn view-btn" data-comment-id="${comment.id}"><i class="fas fa-eye"></i></button>
                        <button type="button" class="action-btn delete-btn" data-item-id="${comment.id}" data-item-type="comment"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            
            // Add event listener for view button
            const viewBtn = row.querySelector('.view-btn');
            if (viewBtn) {
                viewBtn.addEventListener('click', function() {
                    const commentId = this.getAttribute('data-comment-id');
                    viewComment(commentId);
                });
            }
            
            table.appendChild(row);
        });
        
        // Fix delete buttons
        fixDeleteConfirmationButtons();
    }

    /**
     * Load dashboard statistics
     */
    function loadDashboardStats() {
        // Show loading in widgets
        document.querySelectorAll('.widget-count').forEach(widget => {
            widget.textContent = '...';
        });
        
        // Show loading in tables
        document.querySelector('#page-dashboard .admin-section:nth-child(2) tbody')
            .innerHTML = '<tr><td colspan="4" style="text-align: center;">Loading recipes...</td></tr>';
        document.querySelector('#page-dashboard .admin-section:nth-child(3) tbody')
            .innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading comments...</td></tr>';
        
        // Try to fetch data from server
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
                throw new Error(data.error || 'Failed to load dashboard stats');
            }
        })
        .catch(error => {
            console.error('Dashboard stats error:', error);
            
            // Fallback to mock data when API fails
            provideMockDashboardData();
        });
    }

    /**
     * Provide mock dashboard data when API fails
     * This ensures the dashboard always shows something useful
     */
    function provideMockDashboardData() {
        console.log('Providing mock dashboard data since API failed');
        
        // Update dashboard widgets with mock data
        const recipeWidget = document.querySelector('.widget:nth-child(1) .widget-count');
        const commentWidget = document.querySelector('.widget:nth-child(2) .widget-count');
        const mediaWidget = document.querySelector('.widget:nth-child(3) .widget-count');
        
        if (recipeWidget) recipeWidget.textContent = '5';
        if (commentWidget) commentWidget.textContent = '3';
        if (mediaWidget) mediaWidget.textContent = '12';
        
        // Provide mock recipe data
        const mockRecipes = [
            {
                id: 'sample-recipe-1',
                title: 'Bulvių košė su grietine',
                categories: ['Daržovės', 'Bulvės'],
                created_at: new Date().toISOString()
            },
            {
                id: 'sample-recipe-2',
                title: 'Lietuviški cepelinai',
                categories: ['Bulvės', 'Mėsa', 'Iš močiutės virtuvės'],
                created_at: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: 'sample-recipe-3',
                title: 'Šaltibarščiai',
                categories: ['Sriubos', 'Iš močiutės virtuvės'],
                created_at: new Date(Date.now() - 172800000).toISOString()
            }
        ];
        
        // Update recent recipes table
        updateRecentRecipes(mockRecipes);
        
        // Provide mock comments data
        const mockComments = [
            {
                id: 'sample-comment-1',
                author: 'Jonas Petraitis',
                content: 'Labai skanus receptas, ačiū!',
                recipe_title: 'Bulvių košė su grietine',
                created_at: new Date().toISOString()
            },
            {
                id: 'sample-comment-2',
                author: 'Ona Kazlauskienė',
                content: 'Išbandžiau šį receptą vakar, visiems labai patiko!',
                recipe_title: 'Lietuviški cepelinai',
                created_at: new Date(Date.now() - 86400000).toISOString()
            }
        ];
        
        // Update recent comments table
        updateRecentComments(mockComments);
        
        // Show notification
        showNotification('Information', 'Using demo data since server is unavailable', 'error');
    }

    // =====================================================
    // NOTIFICATIONS
    // =====================================================
    
    /**
     * Show a notification
     * FIXED: Added recursion prevention
     */
    function showNotification(title, message, type = 'success') {
        // Prevent recursion
        if (window._isShowingNotification) {
            console.log('Preventing recursive showNotification call', title, message);
            return;
        }
        
        window._isShowingNotification = true;
        
        const notification = document.getElementById('notification');
        if (!notification) {
            window._isShowingNotification = false;
            return;
        }
        
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
                window._isShowingNotification = false;
            }, 5000);
        } else {
            window._isShowingNotification = false;
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
     * Close a modal dialog
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
                document.getElementById('comment-modal-title').textContent = 'Comment Preview';
            }
        }
    }

    // =====================================================
    // UTILITY FUNCTIONS
    // =====================================================
    
    /**
     * Show delete confirmation dialog
     */
    function showDeleteConfirmation(itemId, itemType) {
        console.log(`Showing delete confirmation for ${itemType}: ${itemId}`);
        
        // Store current item information
        setCurrentItem(itemId, itemType);
        
        // Show confirmation dialog
        const modal = document.getElementById('delete-modal');
        if (modal) {
            // Update title if needed
            const modalBody = modal.querySelector('.modal-body p');
            if (modalBody) {
                const itemTypeName = getItemTypeLabel(itemType);
                modalBody.textContent = `Ar tikrai norite ištrinti šį ${itemTypeName.toLowerCase()}? Šio veiksmo nebus galima atšaukti.`;
            }
            
            modal.classList.add('show');
        }
    }
    
    /**
     * Delete the current item
     */
    function deleteItem() {
        // Close the modal
        closeModal('delete-modal');
        
        if (!currentItemId || !currentItemType) {
            showNotification('Error', 'No item selected', 'error');
            return;
        }
        
        // Prepare request URL and method
        let url, method, body;
        
        switch (currentItemType) {
            case 'recipe':
                url = `/admin-api/recipes/${currentItemId}`;
                method = 'DELETE';
                body = null;
                break;
            case 'comment':
                url = `/admin-api/comments/${currentItemId}`;
                method = 'DELETE';
                body = null;
                break;
            case 'media':
                // For media, the ID is in format "directory/filename"
                const parts = currentItemId.split('/');
                if (parts.length !== 2) {
                    showNotification('Error', 'Invalid media ID', 'error');
                    return;
                }
                url = `/admin-api/media/${parts[0]}/${parts[1]}`;
                method = 'DELETE';
                body = null;
                break;
            default:
                showNotification('Error', 'Unknown item type', 'error');
                return;
        }
        
        // Show loading notification
        showNotification('Information', 'Deleting...', 'success');
        
        // Send delete request
        fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: body
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to delete item: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const itemTypeText = getItemTypeLabel(currentItemType);
                
                // Show success notification
                showNotification('Success', `${itemTypeText} deleted successfully!`, 'success');
                
                // Reload data based on item type
                if (currentItemType === 'recipe') {
                    if (typeof window.fetchRecipes === 'function') {
                        window.fetchRecipes();
                    } else {
                        fetchRecipesFallback();
                    }
                } else if (currentItemType === 'comment') {
                    if (typeof window.fetchComments === 'function') {
                        window.fetchComments();
                    } else {
                        fetchCommentsFallback();
                    }
                } else if (currentItemType === 'media') {
                    if (typeof window.fetchMedia === 'function') {
                        window.fetchMedia();
                    } else {
                        fetchMediaFallback();
                    }
                }
                
                // Clear current item
                clearCurrentItem();
            } else {
                showNotification('Error', data.error || 'Unknown error', 'error');
            }
        })
        .catch(error => {
            console.error('Delete item error:', error);
            showNotification('Error', `Error deleting item: ${error.message}`, 'error');
        });
    }

    /**
     * Store information about the currently selected item
     */
    function setCurrentItem(itemId, itemType) {
        currentItemId = itemId;
        currentItemType = itemType;
    }

    /**
     * Get information about the currently selected item
     */
    function getCurrentItem() {
        return {
            id: currentItemId,
            type: currentItemType
        };
    }

    /**
     * Clear the current item selection
     */
    function clearCurrentItem() {
        currentItemId = null;
        currentItemType = null;
    }
    
    /**
     * Get a human readable label for an item type
     */
    function getItemTypeLabel(itemType) {
        switch (itemType) {
            case 'recipe':
                return 'Receptas';
            case 'comment':
                return 'Komentaras';
            case 'media':
                return 'Medijos failas';
            default:
                return 'Elementas';
        }
    }

    /**
     * Format date string
     */
    function formatDate(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            
            return date.toLocaleDateString('lt-LT', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            console.warn('Error formatting date:', error);
            return dateString;
        }
    }

    /**
     * Add favicon link to prevent 404 errors
     */
    function addFaviconLink() {
        // Check if favicon link already exists
        let faviconLink = document.querySelector('link[rel="icon"]');
        
        if (!faviconLink) {
            // Create a new favicon link with a data URI for a simple icon
            faviconLink = document.createElement('link');
            faviconLink.rel = 'icon';
            faviconLink.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="90">🍲</text></svg>';
            document.head.appendChild(faviconLink);
            console.log('Added favicon to prevent 404');
        }
    }
    
    /**
     * Get readable status label for comments
     */
    function getCommentStatusLabel(status) {
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

    // =====================================================
    // EXPOSE PUBLIC FUNCTIONS
    // =====================================================
    
    // Explicitly expose key functions to the global scope
    window.showAdminPage = showAdminPage;
    window.logout = logout;
    window.getAuthHeaders = getAuthHeaders;
    window.closeModal = closeModal;
    window.showNotification = showNotification;
    window.hideNotification = hideNotification;
    window.setCurrentItem = setCurrentItem;
    window.getCurrentItem = getCurrentItem;
    window.formatDate = formatDate;
    window.updateRecentRecipes = updateRecentRecipes;
    window.updateRecentComments = updateRecentComments;
    window.showDeleteConfirmation = showDeleteConfirmation;  // Important! This fixes the main issue
    window.deleteItem = deleteItem;  // Also expose deleteItem
    window.fetchRecipes = window.fetchRecipes || fetchRecipesFallback;
    window.fetchComments = window.fetchComments || fetchCommentsFallback;
    window.fetchMedia = window.fetchMedia || fetchMediaFallback;
    window.fetchAboutData = window.fetchAboutData || fetchAboutDataFallback;

})();