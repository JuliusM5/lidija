/**
 * Admin Core - Consolidated Admin Panel Functionality
 * 
 * This file combines core admin panel functionality from:
 * - admin.js
 * - api-connector.js
 * - modules/auth.js
 * - modules/ui.js
 * - modules/utils.js
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
     * Login user with username and password
     */
    function loginUser(username, password) {
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
                localStorage.setItem('user', JSON.stringify(data.user || {}));
                localStorage.setItem('isLoggedIn', 'true');
                
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
            showNotification('Error', 'Login failed. Please check your credentials and try again.', 'error');
        });
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
                        fetchRecipes(1, tabType);
                    } else if (pageId === 'comments') {
                        fetchComments(1, tabType);
                    } else if (pageId === 'media') {
                        fetchMedia(1, tabType);
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
                    uploadMedia(formData);
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
                loadDashboardStats();
            } else if (pageId === 'recipes') {
                fetchRecipes();
            } else if (pageId === 'comments') {
                fetchComments();
            } else if (pageId === 'media') {
                fetchMedia();
            } else if (pageId === 'about') {
                fetchAboutData();
            }
        }
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

    // =====================================================
    // NOTIFICATIONS
    // =====================================================
    
    /**
     * Show a notification
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
     * Format date string
     */
    function formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        return date.toLocaleDateString('lt-LT', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // =====================================================
    // PUBLIC API (EXPORTS)
    // =====================================================
    
    // Expose public functions
    window.showAdminPage = showAdminPage;
    window.logout = logout;
    window.getAuthHeaders = getAuthHeaders;
    window.closeModal = closeModal;
    window.showNotification = showNotification;
    window.hideNotification = hideNotification;
    window.setCurrentItem = setCurrentItem;
    window.getCurrentItem = getCurrentItem;
    window.formatDate = formatDate;
    
    // Note: Module-specific functions like fetchRecipes, fetchComments, etc. 
    // will be imported from their respective modules

})();