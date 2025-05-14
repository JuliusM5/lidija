// Diagnostic Tool for Recipe System
// This script helps diagnose issues with the recipe system

(function() {
    console.log('Recipe System Diagnostic Tool loaded');
    
    // Store original console functions
    const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn
    };
    
    // Create a log collection
    const diagnosticLogs = [];
    
    // Override console methods to capture logs
    console.log = function() {
        diagnosticLogs.push({type: 'log', args: Array.from(arguments), time: new Date()});
        originalConsole.log.apply(console, arguments);
    };
    
    console.error = function() {
        diagnosticLogs.push({type: 'error', args: Array.from(arguments), time: new Date()});
        originalConsole.error.apply(console, arguments);
    };
    
    console.warn = function() {
        diagnosticLogs.push({type: 'warn', args: Array.from(arguments), time: new Date()});
        originalConsole.warn.apply(console, arguments);
    };
    
    // Create a diagnostic panel
    function createDiagnosticPanel() {
        // Create the panel container
        const panel = document.createElement('div');
        panel.id = 'recipe-diagnostic-panel';
        panel.style.position = 'fixed';
        panel.style.width = '80%';
        panel.style.maxWidth = '800px';
        panel.style.height = '80%';
        panel.style.top = '10%';
        panel.style.left = '10%';
        panel.style.backgroundColor = '#fff';
        panel.style.boxShadow = '0 0 20px rgba(0,0,0,0.3)';
        panel.style.zIndex = '10000';
        panel.style.display = 'none';
        panel.style.borderRadius = '8px';
        panel.style.overflow = 'hidden';
        panel.style.display = 'flex';
        panel.style.flexDirection = 'column';
        
        // Create header
        const header = document.createElement('div');
        header.style.padding = '15px';
        header.style.backgroundColor = '#7f4937';
        header.style.color = 'white';
        header.style.fontWeight = 'bold';
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.innerHTML = '<span>Recipe System Diagnostics</span>';
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.background = 'none';
        closeBtn.style.border = 'none';
        closeBtn.style.color = 'white';
        closeBtn.style.fontSize = '24px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.onclick = function() {
            panel.style.display = 'none';
        };
        header.appendChild(closeBtn);
        
        // Create content area
        const content = document.createElement('div');
        content.style.padding = '20px';
        content.style.overflowY = 'auto';
        content.style.flex = '1';
        
        // API Status section
        const apiStatus = document.createElement('div');
        apiStatus.innerHTML = '<h3>Recipe API Status</h3>';
        
        // API tests container
        const apiTests = document.createElement('div');
        apiTests.id = 'api-tests';
        apiTests.style.backgroundColor = '#f8f9fa';
        apiTests.style.padding = '10px';
        apiTests.style.borderRadius = '4px';
        apiTests.style.marginBottom = '15px';
        apiTests.innerHTML = '<p>Click "Test API Endpoints" to check API functionality</p>';
        
        // Recipe data section
        const recipeData = document.createElement('div');
        recipeData.innerHTML = '<h3>Recipe Data</h3>';
        
        const recipeDataContainer = document.createElement('div');
        recipeDataContainer.id = 'recipe-data-container';
        recipeDataContainer.style.backgroundColor = '#f8f9fa';
        recipeDataContainer.style.padding = '10px';
        recipeDataContainer.style.borderRadius = '4px';
        recipeDataContainer.style.marginBottom = '15px';
        recipeDataContainer.innerHTML = '<p>Click "Check Recipe Data" to examine recipe data</p>';
        
        // Action buttons
        const actionButtons = document.createElement('div');
        actionButtons.style.marginBottom = '20px';
        
        // Test API endpoints button
        const testApiBtn = document.createElement('button');
        testApiBtn.textContent = 'Test API Endpoints';
        testApiBtn.className = 'diagnostic-btn';
        testApiBtn.onclick = function() {
            testApiEndpoints();
        };
        
        // Check recipe data button
        const checkRecipeBtn = document.createElement('button');
        checkRecipeBtn.textContent = 'Check Recipe Data';
        checkRecipeBtn.className = 'diagnostic-btn';
        checkRecipeBtn.style.marginLeft = '10px';
        checkRecipeBtn.onclick = function() {
            checkRecipeData();
        };
        
        // Fix categories directly button
        const fixCategoriesBtn = document.createElement('button');
        fixCategoriesBtn.textContent = 'Fix Categories Directly';
        fixCategoriesBtn.className = 'diagnostic-btn';
        fixCategoriesBtn.style.marginLeft = '10px';
        fixCategoriesBtn.onclick = function() {
            directCategoryFix();
        };
        
        actionButtons.appendChild(testApiBtn);
        actionButtons.appendChild(checkRecipeBtn);
        actionButtons.appendChild(fixCategoriesBtn);
        
        // Console log section
        const logSection = document.createElement('div');
        logSection.innerHTML = '<h3>Diagnostic Logs</h3>';
        
        const logsContainer = document.createElement('div');
        logsContainer.id = 'diagnostic-logs-container';
        logsContainer.style.backgroundColor = '#f8f9fa';
        logsContainer.style.padding = '10px';
        logsContainer.style.borderRadius = '4px';
        logsContainer.style.fontFamily = 'monospace';
        logsContainer.style.fontSize = '12px';
        logsContainer.style.maxHeight = '200px';
        logsContainer.style.overflowY = 'auto';
        
        // Assemble the panel
        apiStatus.appendChild(apiTests);
        recipeData.appendChild(recipeDataContainer);
        
        content.appendChild(apiStatus);
        content.appendChild(actionButtons);
        content.appendChild(recipeData);
        content.appendChild(logSection);
        logSection.appendChild(logsContainer);
        
        panel.appendChild(header);
        panel.appendChild(content);
        
        // Add styles for buttons
        const style = document.createElement('style');
        style.textContent = `
            .diagnostic-btn {
                padding: 8px 15px;
                background-color: #7f4937;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            .diagnostic-btn:hover {
                background-color: #aa5f44;
            }
            .log-entry {
                margin-bottom: 5px;
                border-bottom: 1px solid #e5e5e5;
                padding-bottom: 5px;
            }
            .log-entry.error {
                color: #dc3545;
            }
            .log-entry.warn {
                color: #ffc107;
            }
            .api-test-result {
                margin-bottom: 10px;
                padding: 8px;
                border-radius: 4px;
            }
            .api-test-success {
                background-color: #d4edda;
                color: #155724;
            }
            .api-test-failure {
                background-color: #f8d7da;
                color: #721c24;
            }
            .recipe-item {
                margin-bottom: 10px;
                padding: 8px;
                border: 1px solid #dee2e6;
                border-radius: 4px;
            }
            .recipe-categories {
                margin-top: 5px;
                color: #6c757d;
            }
        `;
        document.head.appendChild(style);
        
        // Add to document
        document.body.appendChild(panel);
        
        return panel;
    }
    
    // Test API endpoints
    async function testApiEndpoints() {
        const apiTests = document.getElementById('api-tests');
        apiTests.innerHTML = '<p>Testing API endpoints...</p>';
        
        const token = localStorage.getItem('token');
        if (!token) {
            apiTests.innerHTML = '<p class="api-test-failure">No authentication token found. Please log in first.</p>';
            return;
        }
        
        const endpoints = [
            { method: 'GET', path: '/admin-api/recipes', description: 'Get recipes list' },
            { method: 'GET', path: '/admin-api/categories', description: 'Get categories list' },
            { method: 'GET', path: '/api/recipes', description: 'Public recipes API' },
            { method: 'GET', path: '/api/categories', description: 'Public categories API' }
        ];
        
        let results = '';
        
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint.path, {
                    method: endpoint.method,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    results += `
                        <div class="api-test-result api-test-success">
                            <strong>${endpoint.method} ${endpoint.path}</strong>: Success
                            <div>${endpoint.description}</div>
                            <details>
                                <summary>Response data</summary>
                                <pre>${JSON.stringify(data, null, 2)}</pre>
                            </details>
                        </div>
                    `;
                } else {
                    results += `
                        <div class="api-test-result api-test-failure">
                            <strong>${endpoint.method} ${endpoint.path}</strong>: Failed (${response.status})
                            <div>${endpoint.description}</div>
                        </div>
                    `;
                }
            } catch (error) {
                results += `
                    <div class="api-test-result api-test-failure">
                        <strong>${endpoint.method} ${endpoint.path}</strong>: Error
                        <div>${error.message}</div>
                    </div>
                `;
            }
        }
        
        apiTests.innerHTML = results;
    }
    
    // Check recipe data
    async function checkRecipeData() {
        const recipeDataContainer = document.getElementById('recipe-data-container');
        recipeDataContainer.innerHTML = '<p>Loading recipe data...</p>';
        
        const token = localStorage.getItem('token');
        if (!token) {
            recipeDataContainer.innerHTML = '<p>No authentication token found. Please log in first.</p>';
            return;
        }
        
        try {
            // Get recipes
            const response = await fetch('/admin-api/recipes', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch recipes: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.success || !data.data || !Array.isArray(data.data)) {
                recipeDataContainer.innerHTML = '<p>No recipe data found or unexpected format.</p>';
                return;
            }
            
            // Count categories
            let totalCategories = 0;
            let recipesWithCategories = 0;
            let recipesList = '';
            
            data.data.forEach(recipe => {
                const categoryCount = recipe.categories ? recipe.categories.length : 0;
                totalCategories += categoryCount;
                
                if (categoryCount > 0) {
                    recipesWithCategories++;
                }
                
                recipesList += `
                    <div class="recipe-item">
                        <strong>${recipe.title || 'Untitled'}</strong> (ID: ${recipe.id})
                        <div class="recipe-categories">
                            Categories: ${categoryCount > 0 ? recipe.categories.join(', ') : 'None'}
                        </div>
                    </div>
                `;
            });
            
            // Summary
            let summary = `
                <h4>Recipe Data Summary</h4>
                <p>Total recipes: ${data.data.length}</p>
                <p>Recipes with categories: ${recipesWithCategories} (${Math.round(recipesWithCategories / data.data.length * 100)}%)</p>
                <p>Total categories assigned: ${totalCategories}</p>
                <hr>
                <h4>Recipe List</h4>
            `;
            
            recipeDataContainer.innerHTML = summary + recipesList;
        } catch (error) {
            recipeDataContainer.innerHTML = `<p>Error checking recipe data: ${error.message}</p>`;
        }
    }
    
    // Direct category fix
    async function directCategoryFix() {
        const recipeDataContainer = document.getElementById('recipe-data-container');
        recipeDataContainer.innerHTML = '<p>Attempting direct category fix...</p>';
        
        const token = localStorage.getItem('token');
        if (!token) {
            recipeDataContainer.innerHTML = '<p>No authentication token found. Please log in first.</p>';
            return;
        }
        
        try {
            // First get all recipes
            const recipesResponse = await fetch('/admin-api/recipes', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!recipesResponse.ok) {
                throw new Error(`Failed to fetch recipes: ${recipesResponse.status}`);
            }
            
            const recipesData = await recipesResponse.json();
            
            if (!recipesData.success || !recipesData.data || !Array.isArray(recipesData.data)) {
                throw new Error('No recipe data found or unexpected format.');
            }
            
            // Get categories - assume there is a categories endpoint
            const categoriesResponse = await fetch('/admin-api/categories', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            let availableCategories = [];
            
            if (categoriesResponse.ok) {
                const categoriesData = await categoriesResponse.json();
                if (categoriesData.success && categoriesData.data && Array.isArray(categoriesData.data)) {
                    availableCategories = categoriesData.data.map(cat => cat.name || cat.title || cat);
                }
            } else {
                // Fallback to hard-coded categories from the form
                availableCategories = [
                    'Gėrimai ir kokteiliai', 'Desertai', 'Sriubos', 'Užkandžiai',
                    'Varškė', 'Kiaušiniai', 'Daržovės', 'Bulvės',
                    'Mėsa', 'Žuvis ir jūros gėrybės', 'Kruopos ir grūdai',
                    'Be glitimo', 'Be laktozės', 'Gamta lėkštėje', 'Iš močiutės virtuvės'
                ];
            }
            
            // Check which recipes need category fixes
            const recipesToFix = recipesData.data.filter(recipe => 
                !recipe.categories || recipe.categories.length === 0
            );
            
            recipeDataContainer.innerHTML = `
                <p>Found ${recipesToFix.length} recipes without categories out of ${recipesData.data.length} total.</p>
                <p>Available categories: ${availableCategories.join(', ')}</p>
                <p>Attempting to fix recipes...</p>
            `;
            
            // Try to fix each recipe by assigning random categories
            let fixResults = '';
            let successCount = 0;
            
            for (const recipe of recipesToFix) {
                // Select 1-3 random categories for this recipe
                const numCategories = Math.floor(Math.random() * 3) + 1;
                const selectedCategories = [];
                
                for (let i = 0; i < numCategories; i++) {
                    const randomIndex = Math.floor(Math.random() * availableCategories.length);
                    const category = availableCategories[randomIndex];
                    
                    if (!selectedCategories.includes(category)) {
                        selectedCategories.push(category);
                    }
                }
                
                try {
                    // Try multiple methods to update categories
                    const updateMethods = [
                        // Method 1: JSON with categories array
                        async () => {
                            return fetch(`/admin-api/recipes/${recipe.id}`, {
                                method: 'PATCH',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ categories: selectedCategories })
                            });
                        },
                        
                        // Method 2: FormData with categories[]
                        async () => {
                            const formData = new FormData();
                            selectedCategories.forEach(cat => {
                                formData.append('categories[]', cat);
                            });
                            
                            return fetch(`/admin-api/recipes/${recipe.id}`, {
                                method: 'PUT',
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                },
                                body: formData
                            });
                        },
                        
                        // Method 3: Specific categories endpoint
                        async () => {
                            return fetch(`/admin-api/recipes/${recipe.id}/categories`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ categories: selectedCategories })
                            });
                        },
                        
                        // Method 4: Specific categories with FormData
                        async () => {
                            const formData = new FormData();
                            selectedCategories.forEach(cat => {
                                formData.append('categories[]', cat);
                            });
                            
                            return fetch(`/admin-api/recipes/${recipe.id}/categories`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                },
                                body: formData
                            });
                        },
                        
                        // Method 5: Full recipe update with all fields
                        async () => {
                            // First get full recipe details
                            const recipeDetailResponse = await fetch(`/admin-api/recipes/${recipe.id}`, {
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            });
                            
                            if (!recipeDetailResponse.ok) {
                                throw new Error('Failed to get recipe details');
                            }
                            
                            const recipeDetail = await recipeDetailResponse.json();
                            if (!recipeDetail.success || !recipeDetail.data) {
                                throw new Error('Invalid recipe detail data');
                            }
                            
                            // Update the recipe with categories
                            const fullRecipe = recipeDetail.data;
                            fullRecipe.categories = selectedCategories;
                            
                            return fetch(`/admin-api/recipes/${recipe.id}`, {
                                method: 'PUT',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(fullRecipe)
                            });
                        }
                    ];
                    
                    let succeeded = false;
                    
                    // Try each method until one works
                    for (const method of updateMethods) {
                        try {
                            const response = await method();
                            
                            if (response.ok) {
                                // Check if categories were actually saved
                                const data = await response.json();
                                
                                if (data.success && data.data && 
                                    data.data.categories && 
                                    data.data.categories.length > 0) {
                                    succeeded = true;
                                    successCount++;
                                    break;
                                }
                            }
                        } catch (methodError) {
                            // Continue to next method
                            console.warn(`Method failed for recipe ${recipe.id}:`, methodError);
                        }
                    }
                    
                    fixResults += `
                        <div class="api-test-result ${succeeded ? 'api-test-success' : 'api-test-failure'}">
                            <strong>${recipe.title || 'Untitled'}</strong> (ID: ${recipe.id}): 
                            ${succeeded ? 'Fixed' : 'Failed to fix'}
                            <div>Attempted categories: ${selectedCategories.join(', ')}</div>
                        </div>
                    `;
                } catch (error) {
                    fixResults += `
                        <div class="api-test-result api-test-failure">
                            <strong>${recipe.title || 'Untitled'}</strong> (ID: ${recipe.id}): Error
                            <div>${error.message}</div>
                        </div>
                    `;
                }
            }
            
            recipeDataContainer.innerHTML = `
                <h4>Category Fix Results</h4>
                <p>Successfully fixed ${successCount} out of ${recipesToFix.length} recipes.</p>
                ${fixResults}
            `;
        } catch (error) {
            recipeDataContainer.innerHTML = `<p>Error fixing categories: ${error.message}</p>`;
        }
    }
    
    // Update log display
    function updateLogsDisplay() {
        const logsContainer = document.getElementById('diagnostic-logs-container');
        if (!logsContainer) return;
        
        // Clear existing logs
        logsContainer.innerHTML = '';
        
        // Get the last 20 logs
        const recentLogs = diagnosticLogs.slice(-20);
        
        // Add logs to container
        recentLogs.forEach(log => {
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry ${log.type}`;
            
            const time = log.time.toLocaleTimeString();
            const message = log.args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : arg
            ).join(' ');
            
            logEntry.textContent = `[${time}] ${message}`;
            logsContainer.appendChild(logEntry);
        });
        
        // Scroll to bottom
        logsContainer.scrollTop = logsContainer.scrollHeight;
    }
    
    // Add a button to open the diagnostic panel
    function addDiagnosticButton() {
        const button = document.createElement('button');
        button.textContent = '🔧';
        button.id = 'recipe-diagnostic-button';
        button.style.position = 'fixed';
        button.style.bottom = '20px';
        button.style.right = '20px';
        button.style.zIndex = '9999';
        button.style.width = '40px';
        button.style.height = '40px';
        button.style.backgroundColor = '#7f4937';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '50%';
        button.style.cursor = 'pointer';
        button.style.fontSize = '20px';
        button.style.display = 'flex';
        button.style.justifyContent = 'center';
        button.style.alignItems = 'center';
        button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        
        // Add hover effect
        button.onmouseover = function() {
            this.style.backgroundColor = '#aa5f44';
        };
        button.onmouseout = function() {
            this.style.backgroundColor = '#7f4937';
        };
        
        // Add click handler
        button.onclick = function() {
            // Create panel if it doesn't exist
            let panel = document.getElementById('recipe-diagnostic-panel');
            if (!panel) {
                panel = createDiagnosticPanel();
            }
            
            // Show panel
            panel.style.display = 'flex';
            
            // Update logs
            updateLogsDisplay();
        };
        
        document.body.appendChild(button);
    }
    
    // Automatically fix 404 issues by intercepting link clicks
    function setupLinkInterceptor() {
        document.addEventListener('click', function(e) {
            // Check if this is a recipe link
            const link = e.target.closest('a[href*="recipe"]');
            if (!link) return;
            
            // Get the href
            const href = link.getAttribute('href');
            
            // Check if this is a recipe link that might cause a 404
            if (href && (href.includes('recipe.html') || href.includes('/recipe/') || href.startsWith('recipe/'))) {
                e.preventDefault();
                
                console.log('Intercepted recipe link click:', href);
                
                // Extract recipe ID
                let recipeId = null;
                
                if (href.includes('?id=')) {
                    recipeId = href.split('?id=')[1].split('&')[0];
                } else if (href.includes('/recipe/')) {
                    recipeId = href.split('/recipe/')[1].split('/')[0];
                }
                
                if (recipeId) {
                    console.log('Extracted recipe ID:', recipeId);
                    
                    // Show recipe page
                    const showRecipePage = window.showPage || window.loadRecipe;
                    if (typeof showRecipePage === 'function') {
                        showRecipePage('recipe-page', recipeId);
                        console.log('Called showPage with recipe-page and ID');
                    } else {
                        console.warn('showPage function not found, falling back to loading recipe directly');
                        // Try to load recipe directly
                        loadRecipeDirectly(recipeId);
                    }
                } else {
                    console.warn('Could not extract recipe ID from link, allowing default navigation');
                    window.location.href = href;
                }
            }
        });
    }
    
    // Load recipe directly
    function loadRecipeDirectly(recipeId) {
        console.log('Loading recipe directly:', recipeId);
        
        // Try to find recipe page
        const recipePage = document.getElementById('recipe-page');
        if (!recipePage) {
            console.error('Recipe page not found');
            return;
        }
        
        // Show the recipe page
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.classList.remove('active');
        });
        recipePage.classList.add('active');
        
        // Try to load the recipe content
        fetch(`/api/recipes/${recipeId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch recipe: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success && data.data) {
                    const recipe = data.data;
                    
                    // Create a basic recipe display
                    recipePage.innerHTML = `
                        <div class="container">
                            <div class="recipe-header">
                                <h1 class="recipe-title">${recipe.title || 'Untitled Recipe'}</h1>
                                <div class="recipe-meta">
                                    ${recipe.categories && recipe.categories.length > 0 ? 
                                        `<div class="recipe-categories">
                                            ${recipe.categories.map(cat => `<span class="recipe-category">${cat}</span>`).join(' ')}
                                        </div>` : ''}
                                </div>
                            </div>
                            
                            <div class="recipe-content">
                                <div class="recipe-image">
                                    ${recipe.image ? 
                                        `<img src="/img/recipes/${recipe.image}" alt="${recipe.title}">` : 
                                        '<div class="no-image">No image available</div>'}
                                </div>
                                
                                <div class="recipe-description">
                                    ${recipe.intro || ''}
                                </div>
                                
                                <div class="recipe-info">
                                    <div class="info-item">
                                        <i class="fas fa-clock"></i>
                                        <span>Prep: ${recipe.prep_time || '0'} min</span>
                                    </div>
                                    <div class="info-item">
                                        <i class="fas fa-fire"></i>
                                        <span>Cook: ${recipe.cook_time || '0'} min</span>
                                    </div>
                                    <div class="info-item">
                                        <i class="fas fa-utensils"></i>
                                        <span>Servings: ${recipe.servings || '1'}</span>
                                    </div>
                                </div>
                                
                                <div class="recipe-ingredients">
                                    <h3>Ingredientai</h3>
                                    <ul>
                                        ${recipe.ingredients && recipe.ingredients.length > 0 ? 
                                            recipe.ingredients.map(ingredient => 
                                                `<li>${ingredient}</li>`
                                            ).join('') : 
                                            '<li>No ingredients listed</li>'}
                                    </ul>
                                </div>
                                
                                <div class="recipe-steps">
                                    <h3>Gaminimo eiga</h3>
                                    <ol>
                                        ${recipe.steps && recipe.steps.length > 0 ? 
                                            recipe.steps.map(step => 
                                                `<li>${step}</li>`
                                            ).join('') : 
                                            '<li>No steps listed</li>'}
                                    </ol>
                                </div>
                                
                                ${recipe.notes ? 
                                    `<div class="recipe-notes">
                                        <h3>Pastabos</h3>
                                        <p>${recipe.notes}</p>
                                    </div>` : ''}
                            </div>
                        </div>
                    `;
                    
                    console.log('Recipe loaded successfully');
                } else {
                    recipePage.innerHTML = `
                        <div class="container">
                            <div class="error-message">
                                <h2>Recipe Not Found</h2>
                                <p>Sorry, the requested recipe could not be loaded.</p>
                                <a href="#" onclick="showPage('home-page'); return false;">Return to Home</a>
                            </div>
                        </div>
                    `;
                    
                    console.error('Failed to load recipe data');
                }
            })
            .catch(error => {
                recipePage.innerHTML = `
                    <div class="container">
                        <div class="error-message">
                            <h2>Error Loading Recipe</h2>
                            <p>${error.message}</p>
                            <a href="#" onclick="showPage('home-page'); return false;">Return to Home</a>
                        </div>
                    </div>
                `;
                
                console.error('Error loading recipe:', error);
            });
    }
    
    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
        // Add the diagnostic button
        setTimeout(addDiagnosticButton, 1000);
        
        // Set up link interceptor to fix 404 issues
        setupLinkInterceptor();
        
        console.log('Recipe System Diagnostic Tool initialized');
    });
})();