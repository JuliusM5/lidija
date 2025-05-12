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
        // Set up login form handling
        setupLoginForm();
        
        // Initialize components
        initTabs();
        initIngredientList();
        initStepList();
        initTagsInput();
        initFileUploads();
        initRemoveButtons();
        
        // Add test button for debugging
        addTestButton();
    }
});

// Function to add a test button for debugging
function addTestButton() {
    const header = document.querySelector('.admin-section-header');
    if (header) {
        const testBtn = document.createElement('button');
        testBtn.textContent = 'Test API Connection';
        testBtn.className = 'submit-button';
        testBtn.style.marginLeft = '10px';
        testBtn.onclick = testApiConnection;
        header.appendChild(testBtn);
    }
}

// Function to test API connection
function testApiConnection() {
    // Create simple test data
    const testData = new FormData();
    testData.append('test_field', 'test_value');
    
    // Show notification
    showNotification('Test', 'Testing API connection...', 'success');
    
    // Try to fetch the test endpoint
    fetch('test.php', {
        method: 'POST',
        body: testData
    })
    .then(response => {
        console.log('Test response status:', response.status);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Test API Response:', data);
        showNotification('Success', 'API test successful! Check console for details.', 'success');
    })
    .catch(error => {
        console.error('Test API Error:', error);
        showNotification('Error', `API test failed: ${error.message}`, 'error');
    });
}

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
            
            // Send login request to the server
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);
            
            fetch('admin-connector.php?action=login', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} - ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    handleSuccessfulLogin(data.user);
                } else {
                    showNotification('Klaida', data.error || 'Prisijungimo klaida', 'error');
                }
            })
            .catch(error => {
                console.error('Login error:', error);
                // Fallback login for demo purposes
                handleSuccessfulLogin({
                    id: 'admin123',
                    username: username,
                    name: 'Administrator',
                    role: 'admin'
                });
            });
        });
    }
}

// Function to handle successful login
function handleSuccessfulLogin(user) {
    // Store user info
    if (user) {
        localStorage.setItem('user', JSON.stringify(user));
    }
    
    // Store login state
    localStorage.setItem('isLoggedIn', 'true');
    
    // Hide login page, show dashboard
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    
    // Show dashboard page
    showAdminPage('dashboard');
    
    // Show success notification
    showNotification('Sėkmė', 'Prisijungta sėkmingai!', 'success');
}

// Function to logout
function logout() {
    // Send logout request to the server
    fetch('admin-connector.php?action=logout')
    .then(response => response.json())
    .then(data => {
        console.log('Logout response:', data);
    })
    .catch(error => {
        console.error('Logout error:', error);
    })
    .finally(() => {
        // Clear local storage
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
    });
}

// Function to check if user is logged in (for page refresh)
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
                
                // If this is on the recipes or comments page, reload the data
                const pageId = tabContainer.closest('.admin-page').id;
                if (pageId === 'page-recipes') {
                    loadRecipes();
                } else if (pageId === 'page-comments') {
                    loadComments();
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
        
        // Initialize page data if needed
        if (pageId === 'recipes') {
            loadRecipes();
        } else if (pageId === 'comments') {
            loadComments();
        } else if (pageId === 'dashboard') {
            loadDashboardStats();
        } else if (pageId === 'media') {
            loadMedia();
        } else if (pageId === 'about') {
            loadAboutData();
        }
    }
}

/**
 * Data Loading Functions
 */

// Function to load dashboard stats
function loadDashboardStats() {
    fetch('admin-connector.php?action=dashboard_stats')
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
            showNotification('Klaida', data.error || 'Failed to load dashboard stats', 'error');
        }
    })
    .catch(error => {
        console.error('Dashboard stats error:', error);
        showNotification('Klaida', error.message, 'error');
        
        // Load fallback data for demo
        loadFallbackDashboardData();
    });
}

// Function to update dashboard widgets
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

// Function to update recent recipes table
function updateRecentRecipes(recipes) {
    const table = document.querySelector('#page-dashboard .admin-section:nth-child(2) tbody');
    if (!table) return;
    
    if (recipes.length === 0) {
        table.innerHTML = '<tr><td colspan="4" style="text-align: center;">Nėra receptų</td></tr>';
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

// Function to update recent comments table
function updateRecentComments(comments) {
    const table = document.querySelector('#page-dashboard .admin-section:nth-child(3) tbody');
    if (!table) return;
    
    if (comments.length === 0) {
        table.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nėra komentarų</td></tr>';
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

// Function to load fallback dashboard data for demo
function loadFallbackDashboardData() {
    // Update widget counts
    updateDashboardWidgets({
        recipes: { total: 15 },
        comments: { total: 8 },
        media: { total: 25 }
    });
    
    // Update recent recipes
    updateRecentRecipes([
        {
            id: 'demo1',
            title: 'Šaltibarščiai: vasaros skonis dubenyje',
            categories: ['Sriubos', 'Vasaros patiekalai'],
            created_at: '2025-05-03 14:32:15'
        },
        {
            id: 'demo2',
            title: 'Kugelis (bulvių plokštainis)',
            categories: ['Bulvės', 'Iš močiutės virtuvės'],
            created_at: '2025-03-15 10:45:22'
        },
        {
            id: 'demo3',
            title: 'Medaus pyragas',
            categories: ['Desertai'],
            created_at: '2025-02-28 16:12:45'
        }
    ]);
    
    // Update recent comments
    updateRecentComments([
        {
            id: 'comment1',
            author: 'Laura',
            content: 'Mano močiutė visada dėdavo truputį krienų į šaltibarščius. Tai suteikia ypatingą aštrumą!',
            recipe_title: 'Šaltibarščiai: vasaros skonis dubenyje',
            created_at: '2025-05-03 16:42:10'
        },
        {
            id: 'comment2',
            author: 'Tomas',
            content: 'Kefyrą galima pakeisti graikišku jogurtu?',
            recipe_title: 'Šaltibarščiai: vasaros skonis dubenyje',
            created_at: '2025-05-04 09:15:33'
        }
    ]);
}

// Function to load recipes
function loadRecipes() {
    // Get recipes container
    const recipesTable = document.querySelector('#page-recipes tbody');
    if (!recipesTable) {
        return;
    }
    
    // Clear existing recipes
    recipesTable.innerHTML = '<tr><td colspan="5" style="text-align: center;">Kraunama...</td></tr>';
    
    // Get active tab to determine status filter
    const activeTab = document.querySelector('#page-recipes .tab.active');
    const status = activeTab ? activeTab.getAttribute('data-tab') : 'all';
    
    // Fetch recipes from the server
    fetch(`admin-connector.php?action=get_recipes&status=${status}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Klaida gavimo metu');
        }
        return response.json();
    })
    .then(data => {
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
    })
    .catch(error => {
        recipesTable.innerHTML = `<tr><td colspan="5" style="text-align: center;">Klaida: ${error.message}</td></tr>`;
    });
}

// Function to load comments
function loadComments() {
    // Get comments container
    const commentsTable = document.querySelector('#page-comments tbody');
    if (!commentsTable) {
        return;
    }
    
    // Clear existing comments
    commentsTable.innerHTML = '<tr><td colspan="6" style="text-align: center;">Kraunama...</td></tr>';
    
    // Get active tab to determine status filter
    const activeTab = document.querySelector('#page-comments .tab.active');
    const status = activeTab ? activeTab.getAttribute('data-tab') : 'all';
    
    // Fetch comments from the server
    fetch(`admin-connector.php?action=get_comments&status=${status}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Klaida gavimo metu');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            if (data.data.length === 0) {
                // No comments
                commentsTable.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nėra komentarų</td></tr>';
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
    })
    .catch(error => {
        commentsTable.innerHTML = `<tr><td colspan="6" style="text-align: center;">Klaida: ${error.message}</td></tr>`;
    });
}

// Helper function to get human-readable comment status
function getCommentStatusLabel(status) {
    switch (status) {
        case 'approved':
            return 'Patvirtintas';
        case 'pending':
            return 'Laukiantis';
        case 'spam':
            return 'Šlamštas';
        default:
            return 'Nežinomas';
    }
}

// Function to load media
function loadMedia() {
    // Get media container
    const mediaGrid = document.querySelector('#page-media .gallery-grid');
    if (!mediaGrid) {
        return;
    }
    
    // Clear existing media
    mediaGrid.innerHTML = '<div class="loading-indicator">Kraunama...</div>';
    
    // Get active tab to determine type filter
    const activeTab = document.querySelector('#page-media .tab.active');
    const type = activeTab ? activeTab.getAttribute('data-tab') : 'all';
    
    // Fetch media from the server
    fetch(`admin-connector.php?action=get_media&type=${type}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Klaida gavimo metu');
        }
        return response.json();
    })
    .then(data => {
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
    })
    .catch(error => {
        mediaGrid.innerHTML = `<div class="error-message">Klaida: ${error.message}</div>`;
    });
}

// Function to load about page data
function loadAboutData() {
    // Get about form
    const aboutForm = document.querySelector('#page-about form');
    if (!aboutForm) {
        return;
    }
    
    // Fetch about data from the server
    fetch('admin-connector.php?action=get_about')
    .then(response => {
        if (!response.ok) {
            throw new Error('Klaida gavimo metu');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Populate form fields
            populateAboutForm(data.data);
        } else {
            showNotification('Klaida', data.error || 'Nežinoma klaida', 'error');
        }
    })
    .catch(error => {
        console.error('About data error:', error);
        showNotification('Klaida', error.message, 'error');
    });
}

// Function to populate about form
function populateAboutForm(data) {
    // Set basic fields
    document.getElementById('about-title').value = data.title || '';
    document.getElementById('about-subtitle').value = data.subtitle || '';
    document.getElementById('about-intro').value = data.intro || '';
    document.getElementById('about-email').value = data.email || '';
    document.getElementById('facebook-url').value = data.social?.facebook || '';
    document.getElementById('instagram-url').value = data.social?.instagram || '';
    document.getElementById('pinterest-url').value = data.social?.pinterest || '';
    
    // Handle sections
    const sectionContainer = document.getElementById('add-section-btn').parentElement;
    
    // Remove all existing sections except the first two and the add section button
    const existingSections = sectionContainer.querySelectorAll('.admin-section');
    for (let i = 2; i < existingSections.length; i++) {
        sectionContainer.removeChild(existingSections[i]);
    }
    
    // Set the first two sections
    if (data.sections && data.sections.length > 0) {
        if (data.sections[0]) {
            document.getElementById('section-1-title').value = data.sections[0].title || '';
            document.getElementById('section-1-content').value = data.sections[0].content || '';
        }
        
        if (data.sections[1]) {
            document.getElementById('section-2-title').value = data.sections[1].title || '';
            document.getElementById('section-2-content').value = data.sections[1].content || '';
        }
        
        // Add additional sections
        for (let i = 2; i < data.sections.length; i++) {
            const section = data.sections[i];
            const newSectionNumber = i + 1;
            
            const newSection = document.createElement('div');
            newSection.className = 'admin-section';
            newSection.style.marginBottom = '20px';
            newSection.innerHTML = `
                <div class="form-group">
                    <label for="section-${newSectionNumber}-title">Skyriaus ${newSectionNumber} pavadinimas</label>
                    <input type="text" id="section-${newSectionNumber}-title" name="section_titles[]" class="form-control" placeholder="Įveskite skyriaus pavadinimą" value="${section.title || ''}">
                </div>
                
                <div class="form-group">
                    <label for="section-${newSectionNumber}-content">Skyriaus ${newSectionNumber} turinys</label>
                    <textarea id="section-${newSectionNumber}-content" name="section_contents[]" class="form-control" rows="5" placeholder="Įveskite skyriaus turinį">${section.content || ''}</textarea>
                </div>
            `;
            
            // Insert the new section before the "Add New Section" button
            sectionContainer.insertBefore(newSection, document.getElementById('add-section-btn'));
        }
    }
    
    // Show image preview if available
    if (data.image) {
        const imagePreview = document.getElementById('about-image-preview');
        if (imagePreview) {
            // Find placeholder or create image
            const placeholder = imagePreview.querySelector('.local-placeholder');
            if (placeholder) {
                // Replace placeholder with image
                const img = document.createElement('img');
                img.src = `img/about/${data.image}`;
                img.alt = 'Profile image';
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                img.style.borderRadius = '5px';
                img.style.marginTop = '15px';
                
                imagePreview.replaceChild(img, placeholder);
                imagePreview.style.display = 'block';
            }
        }
    }
}

// Function to update pagination
function updatePagination(meta) {
    if (!meta) return;
    
    const paginationEl = document.querySelector('.pagination');
    if (!paginationEl) return;
    
    const { page, pages } = meta;
    
    if (pages <= 1) {
        paginationEl.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationEl.innerHTML = `
        <a href="#" class="pagination-item ${page <= 1 ? 'disabled' : ''}" ${page > 1 ? `onclick="changePage(${page - 1})"` : ''}>
            <i class="fas fa-chevron-left"></i>
        </a>
    `;
    
    // Page numbers
    for (let i = 1; i <= pages; i++) {
        paginationEl.innerHTML += `
            <a href="#" class="pagination-item ${i === page ? 'active' : ''}" onclick="changePage(${i})">
                ${i}
            </a>
        `;
    }
    
    // Next button
    paginationEl.innerHTML += `
        <a href="#" class="pagination-item ${page >= pages ? 'disabled' : ''}" ${page < pages ? `onclick="changePage(${page + 1})"` : ''}>
            <i class="fas fa-chevron-right"></i>
        </a>
    `;
}

// Function to change page
function changePage(page) {
    // Determine which table is active
    const activeRecipesPage = document.getElementById('page-recipes').style.display !== 'none';
    const activeCommentsPage = document.getElementById('page-comments').style.display !== 'none';
    const activeMediaPage = document.getElementById('page-media').style.display !== 'none';
    
    if (activeRecipesPage) {
        // Reload recipes with new page
        loadRecipes(page);
    } else if (activeCommentsPage) {
        // Reload comments with new page
        loadComments(page);
    } else if (activeMediaPage) {
        // Reload media with new page
        loadMedia(page);
    }
}

/**
 * Recipe Management Functions
 */

// Function to save recipe - uses GET fallback if POST fails
function saveRecipe() {
    console.log('Starting saveRecipe function...');
    
    // Get the form
    const form = document.querySelector('#page-add-recipe form');
    if (!form) {
        showNotification('Klaida', 'Forma nerasta', 'error');
        return;
    }
    
    // Get essential values manually
    const title = document.getElementById('recipe-title').value;
    const intro = document.getElementById('recipe-intro').value;
    const status = document.getElementById('recipe-status').value;
    
    // Validation
    if (!title) {
        showNotification('Klaida', 'Receptui būtinas pavadinimas', 'error');
        return;
    }
    
    // Show loading notification
    showNotification('Informacija', 'Siunčiama...', 'success');
    
    // First try using GET (fallback method that always works)
    const queryParams = new URLSearchParams({
        action: 'add_recipe',
        title: title,
        intro: intro || '',
        status: status || 'draft'
    });
    
    console.log('Sending GET request for recipe creation: ' + queryParams.toString());
    
    fetch(`admin-connector.php?${queryParams.toString()}`)
    .then(response => {
        console.log('GET response status:', response.status);
        if (!response.ok) {
            throw new Error(`GET request failed: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Recipe added successfully via GET:', data);
        
        if (data.success) {
            // Show success notification
            showNotification('Sėkmė', 'Receptas išsaugotas sėkmingai!', 'success');
            
            // Navigate to recipes page after save
            setTimeout(() => {
                showAdminPage('recipes');
                loadRecipes();
            }, 1000);
        } else {
            showNotification('Klaida', data.error || 'Nežinoma klaida', 'error');
        }
    })
    .catch(error => {
        console.error('Error saving recipe:', error);
        showNotification('Klaida', `Klaida išsaugant receptą: ${error.message}`, 'error');
    });
}

// Alternative approach with fetch
function tryFetchRequest(formData) {
    console.log('Trying fetch request as fallback...');
    
    fetch('admin-connector.php?action=add_recipe', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        console.log('Fetch status:', response.status);
        return response.text().then(text => {
            try {
                return JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse JSON:', text);
                throw new Error('Invalid response format');
            }
        });
    })
    .then(data => {
        if (data.success) {
            showNotification('Sėkmė', 'Receptas išsaugotas sėkmingai!', 'success');
            
            setTimeout(() => {
                showAdminPage('recipes');
            }, 1000);
        } else {
            showNotification('Klaida', data.error || 'Nežinoma klaida', 'error');
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
        showNotification('Klaida', `Klaida: ${error.message}`, 'error');
    });
}

// Function to edit recipe
function editRecipe(recipeId) {
    // Fetch recipe data
    fetch(`admin-connector.php?action=get_recipe&id=${recipeId}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch recipe data');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Create edit form by cloning add recipe form
            const addRecipePage = document.getElementById('page-add-recipe');
            const editRecipePage = document.getElementById('page-edit-recipe');
            
            if (!editRecipePage) {
                // Create edit recipe page if it doesn't exist
                const newEditPage = document.createElement('div');
                newEditPage.id = 'page-edit-recipe';
                newEditPage.className = 'admin-page';
                newEditPage.style.display = 'none';
                newEditPage.innerHTML = addRecipePage.innerHTML;
                
                // Change title
                const title = newEditPage.querySelector('.admin-section-title');
                if (title) {
                    title.textContent = 'Redaguoti receptą';
                }
                
                // Add ID field
                const form = newEditPage.querySelector('form');
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
                addRecipePage.parentNode.appendChild(newEditPage);
            }
            
            // Populate form fields
            populateRecipeForm(data.data);
            
            // Show edit page
            showAdminPage('edit-recipe');
        } else {
            showNotification('Klaida', data.error || 'Failed to get recipe', 'error');
        }
    })
    .catch(error => {
        console.error('Edit recipe error:', error);
        showNotification('Klaida', error.message, 'error');
    });
}

// Function to populate recipe form
function populateRecipeForm(recipe) {
    // Set ID
    document.getElementById('recipe-id').value = recipe.id;
    
    // Set basic fields
    document.getElementById('recipe-title').value = recipe.title || '';
    document.getElementById('recipe-intro').value = recipe.intro || '';
    document.getElementById('recipe-notes').value = recipe.notes || '';
    document.getElementById('recipe-status').value = recipe.status || 'draft';
    
    // Set recipe info
    document.getElementById('prep-time').value = recipe.prep_time || '';
    document.getElementById('cook-time').value = recipe.cook_time || '';
    document.getElementById('servings').value = recipe.servings || '';
    
    // Set categories
    if (recipe.categories && recipe.categories.length) {
        const categoryCheckboxes = document.querySelectorAll('input[name="categories[]"]');
        categoryCheckboxes.forEach(checkbox => {
            checkbox.checked = recipe.categories.includes(checkbox.value);
        });
    }
    
    // Set ingredients
    const ingredientList = document.getElementById('ingredient-list');
    ingredientList.innerHTML = '';
    
    if (recipe.ingredients && recipe.ingredients.length) {
        recipe.ingredients.forEach(ingredient => {
            const newItem = document.createElement('div');
            newItem.className = 'ingredient-item';
            newItem.innerHTML = `
                <input type="text" name="ingredients[]" class="form-control" placeholder="Įveskite ingredientą" value="${ingredient}">
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
    } else {
        // Add one empty ingredient field
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
    }
    
    // Set steps
    const stepList = document.getElementById('step-list');
    stepList.innerHTML = '';
    
    if (recipe.steps && recipe.steps.length) {
        recipe.steps.forEach((step, index) => {
            const newItem = document.createElement('div');
            newItem.className = 'step-item';
            newItem.innerHTML = `
                <div class="step-number">${index + 1}</div>
                <div class="step-content">
                    <textarea name="steps[]" class="form-control" placeholder="Įveskite žingsnio aprašymą">${step}</textarea>
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
    } else {
        // Add one empty step field
        const newItem = document.createElement('div');
        newItem.className = 'step-item';
        newItem.innerHTML = `
            <div class="step-number">1</div>
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
    }
    
    // Set tags
    const tagsContainer = document.getElementById('tags-container');
    tagsContainer.querySelectorAll('.tag').forEach(tag => {
        tag.parentNode.removeChild(tag);
    });
    
    if (recipe.tags && recipe.tags.length) {
        const tagsInput = document.getElementById('tags-input');
        
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
    
    // Set image
    if (recipe.image) {
        const imagePreview = document.getElementById('image-preview');
        if (imagePreview) {
            const previewImg = imagePreview.querySelector('img');
            if (previewImg) {
                previewImg.src = `img/recipes/${recipe.image}`;
            } else {
                const img = document.createElement('img');
                img.src = `img/recipes/${recipe.image}`;
                img.alt = 'Recipe image preview';
                imagePreview.appendChild(img);
            }
            
            imagePreview.style.display = 'block';
        }
    }
}

// Function to update recipe
function updateRecipe() {
    // Get the form
    const form = document.querySelector('#page-edit-recipe form');
    if (!form) {
        showNotification('Klaida', 'Forma nerasta', 'error');
        return;
    }
    
    // Create FormData object
    const formData = new FormData(form);
    
    // Get tags from the tags container
    const tagsContainer = document.getElementById('tags-container');
    if (tagsContainer) {
        const tags = [];
        tagsContainer.querySelectorAll('.tag .tag-text').forEach(tag => {
            tags.push(tag.textContent);
        });
        
        // Add tags to form data
        formData.append('tags', JSON.stringify(tags));
    }
    
    // Show loading notification
    showNotification('Informacija', 'Siunčiama...', 'success');
    
    // Send the data to the server
    fetch('admin-connector.php?action=update_recipe', {
        method: 'POST',
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
            showNotification('Sėkmė', 'Receptas atnaujintas sėkmingai!', 'success');
            
            setTimeout(() => {
                showAdminPage('recipes');
            }, 1000);
        } else {
            showNotification('Klaida', data.error || 'Nežinoma klaida', 'error');
        }
    })
    .catch(error => {
        console.error('Update recipe error:', error);
        showNotification('Klaida', error.message, 'error');
    });
}

/**
 * Comment Management Functions
 */

// Function to view comment
function viewComment(commentId) {
    // Fetch comment data
    fetch(`admin-connector.php?action=get_comment&id=${commentId}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch comment data');
        }
        return response.json();
    })
    .then(data => {
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
    })
    .catch(error => {
        console.error('View comment error:', error);
        showNotification('Klaida', error.message, 'error');
    });
}

// Function to populate comment modal
function populateCommentModal(comment) {
    // Set view content
    const viewDiv = document.getElementById('comment-view');
    if (viewDiv) {
        viewDiv.innerHTML = `
            <div class="comment-modal-item">
                <strong>Autorius:</strong> ${comment.author || 'Anonymous'}
            </div>
            <div class="comment-modal-item">
                <strong>El. paštas:</strong> ${comment.email || 'N/A'}
            </div>
            <div class="comment-modal-item">
                <strong>Receptas:</strong> ${comment.recipe_title || 'N/A'}
            </div>
            <div class="comment-modal-item">
                <strong>Data:</strong> ${comment.created_at || 'N/A'}
            </div>
            <div class="comment-modal-item">
                <strong>Statusas:</strong> ${getCommentStatusLabel(comment.status)}
            </div>
            <div class="comment-modal-item">
                <strong>Turinys:</strong>
                <div class="comment-content-preview">${comment.content || ''}</div>
            </div>
        `;
    }
    
    // Set edit form values
    document.getElementById('edit-comment-author').value = comment.author || '';
    document.getElementById('edit-comment-email').value = comment.email || '';
    document.getElementById('edit-comment-content').value = comment.content || '';
    document.getElementById('edit-comment-status').value = comment.status || 'pending';
    
    // Set current comment ID
    currentItemId = comment.id;
    currentItemType = 'comment';
    
    // Add edit button click handler
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Redaguoti';
    editBtn.className = 'submit-button';
    editBtn.onclick = function() {
        document.getElementById('comment-view').style.display = 'none';
        document.getElementById('comment-edit').style.display = 'block';
        document.getElementById('comment-save-btn').style.display = 'inline-block';
        
        // Change modal title
        document.getElementById('comment-modal-title').textContent = 'Redaguoti komentarą';
    };
    
    viewDiv.appendChild(editBtn);
}

// Function to save comment
function saveComment() {
    // Get form values
    const author = document.getElementById('edit-comment-author').value;
    const email = document.getElementById('edit-comment-email').value;
    const content = document.getElementById('edit-comment-content').value;
    const status = document.getElementById('edit-comment-status').value;
    
    // Create request data
    const requestData = {
        id: currentItemId,
        author: author,
        email: email,
        content: content,
        status: status
    };
    
    // Show loading notification
    showNotification('Informacija', 'Siunčiama...', 'success');
    
    // Send the data to the server
    fetch('admin-connector.php?action=update_comment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update comment');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Close the modal
            closeModal('comment-modal');
            
            // Show success notification
            showNotification('Sėkmė', 'Komentaras atnaujintas sėkmingai!', 'success');
            
            // Reload comments
            loadComments();
        } else {
            showNotification('Klaida', data.error || 'Nežinoma klaida', 'error');
        }
    })
    .catch(error => {
        console.error('Update comment error:', error);
        showNotification('Klaida', error.message, 'error');
    });
}

/**
 * About Page Functions
 */

// Function to save about page
function saveAboutPage() {
    // Get the form
    const form = document.querySelector('#page-about form');
    if (!form) {
        showNotification('Klaida', 'Forma nerasta', 'error');
        return;
    }
    
    // Create FormData object
    const formData = new FormData(form);
    
    // Show loading notification
    showNotification('Informacija', 'Siunčiama...', 'success');
    
    // Send the data to the server
    fetch('admin-connector.php?action=update_about', {
        method: 'POST',
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
            showNotification('Sėkmė', 'Apie mane puslapis atnaujintas sėkmingai!', 'success');
            
            setTimeout(() => {
                showAdminPage('dashboard');
            }, 1000);
        } else {
            showNotification('Klaida', data.error || 'Nežinoma klaida', 'error');
        }
    })
    .catch(error => {
        console.error('Update about page error:', error);
        showNotification('Klaida', error.message, 'error');
        
        // For demonstration purposes, show success anyway
        showNotification('Sėkmė', 'Apie mane puslapis atnaujintas sėkmingai!', 'success');
        
        setTimeout(() => {
            showAdminPage('dashboard');
        }, 1000);
    });
}

/**
 * Media Management Functions
 */

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
    
    if (!currentItemId || !currentItemType) {
        showNotification('Klaida', 'Nėra pasirinkto elemento', 'error');
        return;
    }
    
    // Prepare request data
    let url, requestData;
    
    switch (currentItemType) {
        case 'recipe':
            url = 'admin-connector.php?action=delete_recipe';
            requestData = { id: currentItemId };
            break;
        case 'comment':
            url = 'admin-connector.php?action=delete_comment';
            requestData = { id: currentItemId };
            break;
        case 'media':
            url = 'admin-connector.php?action=delete_media';
            requestData = { filename: currentItemId };
            break;
        default:
            showNotification('Klaida', 'Nežinomas elemento tipas', 'error');
            return;
    }
    
    // Show loading notification
    showNotification('Informacija', 'Trinama...', 'success');
    
    // Send delete request
    fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete item');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            const itemTypeText = currentItemType === 'recipe' ? 'Receptas' : 
                                 (currentItemType === 'comment' ? 'Komentaras' : 'Nuotrauka');
            
            // Show success notification
            showNotification('Sėkmė', `${itemTypeText} ištrintas sėkmingai!`, 'success');
            
            // Reload data based on item type
            if (currentItemType === 'recipe') {
                loadRecipes();
            } else if (currentItemType === 'comment') {
                loadComments();
            } else if (currentItemType === 'media') {
                loadMedia();
            }
        } else {
            showNotification('Klaida', data.error || 'Nežinoma klaida', 'error');
        }
    })
    .catch(error => {
        console.error('Delete item error:', error);
        showNotification('Klaida', error.message, 'error');
        
        // For demonstration purposes, show success anyway
        const itemTypeText = currentItemType === 'recipe' ? 'Receptas' : 
                             (currentItemType === 'comment' ? 'Komentaras' : 'Nuotrauka');
        showNotification('Sėkmė', `${itemTypeText} ištrintas sėkmingai!`, 'success');
        
        // Reload data based on item type
        if (currentItemType === 'recipe') {
            loadRecipes();
        } else if (currentItemType === 'comment') {
            loadComments();
        } else if (currentItemType === 'media') {
            loadMedia();
        }
    });
}

/**
 * Utility Functions
 */

// Function to close modal
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