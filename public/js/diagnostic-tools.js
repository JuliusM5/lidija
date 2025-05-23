/**
 * Diagnostic Tools - Comprehensive Debugging and Diagnostic Utilities
 * 
 * This file consolidates diagnostic functionality from:
 * - recipe-diagnostic-tool.js
 * - auth-debugger.js
 * 
 * Features:
 * - Recipe system diagnostics
 * - Authentication debugging
 * - API endpoint testing
 * - Performance monitoring
 * - Error logging
 */

(function() {
    console.log('Diagnostic Tools loaded - Comprehensive debugging utilities');

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

    // =====================================================
    // RECIPE DIAGNOSTIC PANEL
    // =====================================================
    
    // Create the recipe diagnostic panel
    function createRecipeDiagnosticPanel() {
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
        
        // Debug authentication button
        const debugAuthBtn = document.createElement('button');
        debugAuthBtn.textContent = 'Debug Authentication';
        debugAuthBtn.className = 'diagnostic-btn';
        debugAuthBtn.style.marginLeft = '10px';
        debugAuthBtn.onclick = function() {
            showAuthDiagnosticPanel();
        };
        
        // Fix categories directly button
        const fixCategoriesBtn = document.createElement('button');
        fixCategoriesBtn.textContent = 'Fix Categories';
        fixCategoriesBtn.className = 'diagnostic-btn';
        fixCategoriesBtn.style.marginLeft = '10px';
        fixCategoriesBtn.onclick = function() {
            directCategoryFix();
        };
        
        actionButtons.appendChild(testApiBtn);
        actionButtons.appendChild(checkRecipeBtn);
        actionButtons.appendChild(debugAuthBtn);
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

    // =====================================================
    // AUTHENTICATION DEBUGGING
    // =====================================================
    
    // Create authentication diagnostic panel
    function createAuthDiagnosticPanel() {
        // Create the panel container
        const panel = document.createElement('div');
        panel.id = 'auth-debug-panel';
        panel.style.position = 'fixed';
        panel.style.width = '80%';
        panel.style.maxWidth = '800px';
        panel.style.height = '80%';
        panel.style.top = '10%';
        panel.style.left = '10%';
        panel.style.backgroundColor = '#fff';
        panel.style.boxShadow = '0 0 20px rgba(0,0,0,0.3)';
        panel.style.zIndex = '9999';
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
        header.innerHTML = '<span>Authentication Diagnostics</span>';
        
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
        
        // Authentication status section
        const authStatus = document.createElement('div');
        authStatus.innerHTML = '<h3>Authentication Status</h3>';
        
        // Token Information
        const tokenInfo = document.createElement('div');
        tokenInfo.style.marginBottom = '20px';
        tokenInfo.innerHTML = '<h4>Token Information</h4>';
        
        const tokenSection = document.createElement('div');
        tokenSection.style.backgroundColor = '#f8f9fa';
        tokenSection.style.padding = '10px';
        tokenSection.style.borderRadius = '4px';
        tokenSection.style.marginBottom = '15px';
        tokenSection.id = 'token-info-section';
        
        // Action buttons
        const actionButtons = document.createElement('div');
        actionButtons.style.marginBottom = '20px';
        
        // Test authentication button
        const testAuthBtn = document.createElement('button');
        testAuthBtn.textContent = 'Test Authentication';
        testAuthBtn.className = 'diagnostic-btn';
        testAuthBtn.onclick = function() {
            testAuthentication();
        };
        
        // Clear token button
        const clearTokenBtn = document.createElement('button');
        clearTokenBtn.textContent = 'Clear Token & Logout';
        clearTokenBtn.className = 'diagnostic-btn';
        clearTokenBtn.style.marginLeft = '10px';
        clearTokenBtn.onclick = function() {
            clearAuthenticationData();
        };
        
        // Force login button
        const forceLoginBtn = document.createElement('button');
        forceLoginBtn.textContent = 'Force Login';
        forceLoginBtn.className = 'diagnostic-btn';
        forceLoginBtn.style.marginLeft = '10px';
        forceLoginBtn.onclick = function() {
            showLoginHelp();
        };
        
        actionButtons.appendChild(testAuthBtn);
        actionButtons.appendChild(clearTokenBtn);
        actionButtons.appendChild(forceLoginBtn);
        
        // Console log section
        const logSection = document.createElement('div');
        logSection.innerHTML = '<h3>Authentication Logs</h3>';
        
        const authLogsContainer = document.createElement('div');
        authLogsContainer.id = 'auth-logs-container';
        authLogsContainer.style.backgroundColor = '#f8f9fa';
        authLogsContainer.style.padding = '10px';
        authLogsContainer.style.borderRadius = '4px';
        authLogsContainer.style.fontFamily = 'monospace';
        authLogsContainer.style.fontSize = '12px';
        authLogsContainer.style.maxHeight = '200px';
        authLogsContainer.style.overflowY = 'auto';
        
        // Assemble the panel
        authStatus.appendChild(tokenInfo);
        tokenInfo.appendChild(tokenSection);
        authStatus.appendChild(actionButtons);
        logSection.appendChild(authLogsContainer);
        
        content.appendChild(authStatus);
        content.appendChild(logSection);
        
        panel.appendChild(header);
        panel.appendChild(content);
        
        // Add to document
        document.body.appendChild(panel);
        
        return panel;
    }
    
    // Show the authentication diagnostics panel
    function showAuthDiagnosticPanel() {
        // Create panel if it doesn't exist
        let panel = document.getElementById('auth-debug-panel');
        if (!panel) {
            panel = createAuthDiagnosticPanel();
        }
        
        // Show panel
        panel.style.display = 'flex';
        
        // Update token info
        updateTokenInfo();
        
        // Update logs
        updateAuthLogsDisplay();
    }
    
    // Update token information display
    function updateTokenInfo() {
        const tokenSection = document.getElementById('token-info-section');
        if (!tokenSection) return;
        
        const token = localStorage.getItem('token');
        const userJson = localStorage.getItem('user');
        
        if (token) {
            // Try to decode the JWT token
            try {
                const payload = decodeJWT(token);
                
                let expiryInfo = 'Unknown expiry';
                if (payload.exp) {
                    const expiryDate = new Date(payload.exp * 1000);
                    const now = new Date();
                    const isExpired = expiryDate < now;
                    expiryInfo = `Expires: ${expiryDate.toLocaleString()} (${isExpired ? 'EXPIRED' : 'valid'})`;
                }
                
                tokenSection.innerHTML = `
                    <div style="color: green; margin-bottom: 10px;">✓ Token found in localStorage</div>
                    <div><strong>Issued at:</strong> ${payload.iat ? new Date(payload.iat * 1000).toLocaleString() : 'Unknown'}</div>
                    <div><strong>${expiryInfo}</strong></div>
                    <div><strong>Subject:</strong> ${payload.sub || 'Not specified'}</div>
                    <div style="margin-top: 10px;"><strong>User:</strong> ${userJson ? JSON.parse(userJson).username || 'Unknown' : 'Not found'}</div>
                    <div style="margin-top: 10px;"><strong>Role:</strong> ${payload.role || 'Not specified'}</div>
                    <div style="font-size: 10px; margin-top: 15px; word-break: break-all;">
                        <strong>Token:</strong> ${token}
                    </div>
                `;
            } catch (e) {
                tokenSection.innerHTML = `
                    <div style="color: orange; margin-bottom: 10px;">⚠ Token found but could not be decoded</div>
                    <div style="color: red;">${e.message}</div>
                    <div style="font-size: 10px; margin-top: 15px; word-break: break-all;">
                        <strong>Token:</strong> ${token}
                    </div>
                `;
            }
        } else {
            tokenSection.innerHTML = `
                <div style="color: red; margin-bottom: 10px;">✗ No authentication token found</div>
                <div>You are not currently logged in. Authentication will fail for protected routes.</div>
            `;
        }
    }
    
    // Update authentication logs display
    function updateAuthLogsDisplay() {
        const logsContainer = document.getElementById('auth-logs-container');
        if (!logsContainer) return;
        
        // Clear existing logs
        logsContainer.innerHTML = '';
        
        // Filter authentication related logs
        const authLogs = diagnosticLogs.filter(log => {
            const message = log.args.join(' ');
            return message.includes('auth') || 
                   message.includes('login') || 
                   message.includes('token') || 
                   message.includes('Authentication');
        });
        
        // Get the last 20 logs
        const recentLogs = authLogs.slice(-20);
        
        if (recentLogs.length === 0) {
            logsContainer.innerHTML = '<div>No authentication related logs found.</div>';
            return;
        }
        
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
    
    // Function to decode JWT token
    function decodeJWT(token) {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid token format');
        }
        
        const payload = parts[1];
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decoded);
    }
    
    // Function to test authentication
    function testAuthentication() {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No authentication token found');
            updateAuthLogsDisplay();
            return;
        }
        
        console.log('Testing authentication with server...');
        
        // Make a request to the server to verify the token
        fetch('/admin-api/auth/verify', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                console.log('Authentication successful:', data);
            } else {
                console.error('Authentication failed:', data);
            }
        })
        .catch(error => {
            console.error('Authentication error:', error.message);
        })
        .finally(() => {
            updateTokenInfo();
            updateAuthLogsDisplay();
        });
    }
    
    // Function to clear authentication data
    function clearAuthenticationData() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        console.log('Authentication data cleared');
        updateTokenInfo();
        updateAuthLogsDisplay();
        
        // Reload the page to show login screen
        if (confirm('Authentication data cleared. Reload page to show login screen?')) {
            window.location.reload();
        }
    }
    
    // Function to show login help
    function showLoginHelp() {
        // Create login help modal
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.backgroundColor = 'white';
        modal.style.padding = '20px';
        modal.style.boxShadow = '0 0 20px rgba(0,0,0,0.3)';
        modal.style.zIndex = '10000';
        modal.style.borderRadius = '8px';
        modal.style.width = '400px';
        
        // Create modal content
        modal.innerHTML = `
            <h3 style="margin-top: 0;">Force Login</h3>
            <p>Enter credentials to attempt a direct login:</p>
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px;">Username:</label>
                <input type="text" id="debug-username" value="admin" style="width: 100%; padding: 8px; box-sizing: border-box;">
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px;">Password:</label>
                <input type="password" id="debug-password" style="width: 100%; padding: 8px; box-sizing: border-box;">
            </div>
            <div style="text-align: right;">
                <button id="debug-login-cancel" style="padding: 8px 15px; margin-right: 10px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
                <button id="debug-login-submit" style="padding: 8px 15px; background-color: #7f4937; color: white; border: none; border-radius: 4px; cursor: pointer;">Login</button>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(modal);
        
        // Add event listeners
        document.getElementById('debug-login-cancel').onclick = function() {
            document.body.removeChild(modal);
        };
        
        document.getElementById('debug-login-submit').onclick = function() {
            const username = document.getElementById('debug-username').value;
            const password = document.getElementById('debug-password').value;
            
            if (!username || !password) {
                alert('Please enter both username and password');
                return;
            }
            
            console.log(`Attempting force login with username: ${username}`);
            
            // Send login request
            fetch('/admin-api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        try {
                            const data = JSON.parse(text);
                            throw new Error(data.error || `Login failed: ${response.status}`);
                        } catch (e) {
                            throw new Error(`Login failed: ${response.status} - ${text}`);
                        }
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    console.log('Login successful:', data);
                    
                    // Store token and user data
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    localStorage.setItem('isLoggedIn', 'true');
                    
                    // Remove modal
                    document.body.removeChild(modal);
                    
                    // Update token info
                    updateTokenInfo();
                    updateAuthLogsDisplay();
                    
                    // Reload the page
                    if (confirm('Login successful! Reload page to apply changes?')) {
                        window.location.reload();
                    }
                } else {
                    throw new Error(data.error || 'Unknown error');
                }
            })
            .catch(error => {
                console.error('Login error:', error.message);
                alert(`Login failed: ${error.message}`);
                updateAuthLogsDisplay();
            });
        };
    }

    // =====================================================
    // UTILITY FUNCTIONS
    // =====================================================
    
    // Fix recipe link handling
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

    // =====================================================
    // UI COMPONENTS
    // =====================================================

    // Add a button to open the diagnostic panel
    function addRecipeDiagnosticButton() {
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
                panel = createRecipeDiagnosticPanel();
            }
            
            // Show panel
            panel.style.display = 'flex';
            
            // Update logs
            updateLogsDisplay();
        };
        
        document.body.appendChild(button);
    }

    // =====================================================
    // INITIALIZATION
    // =====================================================
    
    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Diagnostic tools initializing...');
        
        // Add the diagnostic buttons after a short delay
        setTimeout(function() {
            addRecipeDiagnosticButton();
        }, 1000);
        
        // Set up link interceptor to fix 404 issues
        setupLinkInterceptor();
    });

    // Make key functions available globally
    window.debugAuth = showAuthDiagnosticPanel;
    window.debugRecipes = function() {
        let panel = document.getElementById('recipe-diagnostic-panel');
        if (!panel) {
            panel = createRecipeDiagnosticPanel();
        }
        panel.style.display = 'flex';
        updateLogsDisplay();
    };
    window.fixCategories = directCategoryFix;
    window.testEndpoints = testApiEndpoints;
    window.checkRecipes = checkRecipeData;

})();