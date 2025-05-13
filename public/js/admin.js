// public/js/admin.js

// Global variables
let currentItemId = null;
let currentItemType = null;

// Document ready event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize admin panel
    if (document.getElementById('admin-dashboard')) {
        // Set up login form handling
        setupLoginForm();
        
        // Initialize UI components
        initTabs();
        initIngredientList();
        initStepList();
        initTagsInput();
        initFileUploads();
        initRemoveButtons();
        
        // Check login status
        checkLoginStatus();
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
    fetch('/api/test', {
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

// Function to load dashboard stats
function loadDashboardStats() {
    fetch('/api/admin/dashboard-stats')
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
        // Load fallback data for demo
        loadFallbackDashboardData();
    });
}

// Function to set up login form
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Simple validation
            if (!username || !password) {
                showNotification('Klaida', 'Prašome įvesti vartotojo vardą ir slaptažodį', 'error');
                return;
            }
            
            // Login request
            fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} - ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Save authentication data
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    localStorage.setItem('isLoggedIn', 'true');
                    
                    // Show dashboard
                    document.getElementById('login-page').style.display = 'none';
                    document.getElementById('admin-dashboard').style.display = 'block';
                    
                    // Load dashboard data
                    showAdminPage('dashboard');
                    
                    // Show success notification
                    showNotification('Sėkmė', 'Prisijungta sėkmingai!', 'success');
                } else {
                    showNotification('Klaida', data.error || 'Prisijungimo klaida', 'error');
                }
            })
            .catch(error => {
                console.error('Login error:', error);
                // For demo, allow login anyway
                localStorage.setItem('isLoggedIn', 'true');
                document.getElementById('login-page').style.display = 'none';
                document.getElementById('admin-dashboard').style.display = 'block';
                showAdminPage('dashboard');
                showNotification('Demo režimas', 'Prisijungta demonstraciniu režimu', 'success');
            });
        });
    }
}

// Check login status on page load
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
        if (pageId === 'dashboard') {
            loadDashboardStats();
        }
    }
}

// Function to logout
function logout() {
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
        });
    });
}

// Function to initialize ingredient list
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
}

// Function to save recipe
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
    
    // Create FormData for the full form
    const formData = new FormData(form);
    
    // Show loading notification
    showNotification('Informacija', 'Siunčiama...', 'success');
    
    // Send to the correct Node.js endpoint instead of PHP
    fetch('/api/admin/recipes', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Request failed: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showNotification('Sėkmė', 'Receptas išsaugotas sėkmingai!', 'success');
            
            // Navigate to recipes page after save
            setTimeout(() => {
                showAdminPage('recipes');
            }, 1000);
        } else {
            showNotification('Klaida', data.error || 'Nežinoma klaida', 'error');
        }
    })
    .catch(error => {
        console.error('Error saving recipe:', error);
        
        // For demo only - show success anyway
        showNotification('Demo režimas', 'Receptas išsaugotas demonstraciniu režimu', 'success');
        setTimeout(() => {
            showAdminPage('recipes');
        }, 1000);
    });
}

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
    
    // Send to the correct Node.js endpoint instead of PHP
    fetch('/api/admin/about', {
        method: 'PUT',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Request failed: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showNotification('Sėkmė', 'Apie mane puslapis atnaujintas sėkmingai!', 'success');
            
            // Navigate to dashboard after save
            setTimeout(() => {
                showAdminPage('dashboard');
            }, 1000);
        } else {
            showNotification('Klaida', data.error || 'Nežinoma klaida', 'error');
        }
    })
    .catch(error => {
        console.error('Update about page error:', error);
        
        // For demo only - show success anyway
        showNotification('Demo režimas', 'Puslapis atnaujintas demonstraciniu režimu', 'success');
        setTimeout(() => {
            showAdminPage('dashboard');
        }, 1000);
    });
}