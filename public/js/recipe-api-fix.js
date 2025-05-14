// Recipe API Fix - Enhanced Loading and Error Handling
// This script resolves 404 issues when loading recipes by implementing fallback mechanisms
// and improving error handling for recipe pages.

(function() {
    console.log('Recipe API Fix loaded - Resolving 404 issues and improving error handling');

    // Store the original recipe loading functions for fallback
    const originalLoadRecipePage = window.loadRecipePage;
    
    // Replace the recipe loading function with our enhanced implementation
    window.loadRecipePage = function(recipeId) {
        console.log('Enhanced recipe loading for ID:', recipeId);
        
        // If no recipeId provided, check URL parameters
        if (!recipeId) {
            const urlParams = new URLSearchParams(window.location.search);
            recipeId = urlParams.get('id');
            if (recipeId) {
                console.log('Found recipe ID in URL:', recipeId);
            } else {
                console.error('No recipe ID provided');
                showRecipeError('No recipe ID provided');
                return;
            }
        }
        
        // Reference to the recipe page container
        const recipePage = document.getElementById('recipe-page');
        if (!recipePage) {
            console.error('Recipe page element not found');
            return;
        }
        
        // Show loading indicator
        showRecipeLoading(recipePage);
        
        // Attempt multiple API endpoints to find the recipe
        tryMultipleEndpoints(recipeId)
            .then(recipe => {
                if (recipe) {
                    // Successfully found recipe data, create the page
                    displayRecipe(recipePage, recipe);
                } else {
                    throw new Error('Recipe not found');
                }
            })
            .catch(error => {
                console.error('Error loading recipe:', error);
                showRecipeError(error.message, recipePage);
            });
    };
    
    // Try multiple endpoints to get the recipe data
    async function tryMultipleEndpoints(recipeId) {
        // List of endpoints to try in order
        const endpoints = [
            `/api/recipes/${recipeId}`,
            `/api/recipe/${recipeId}`,
            `/admin-api/recipes/${recipeId}`,
            `/recipes/${recipeId}.json`
        ];
        
        // Try the standard UUID format first
        const uuidFormat = formatRecipeId(recipeId);
        if (uuidFormat !== recipeId) {
            endpoints.unshift(`/api/recipes/${uuidFormat}`);
        }
        
        // Try with token if available
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        // Try each endpoint until we get a successful response
        for (const endpoint of endpoints) {
            try {
                console.log(`Attempting to fetch recipe from: ${endpoint}`);
                
                const response = await fetch(endpoint, { headers });
                
                if (response.ok) {
                    const data = await response.json();
                    
                    // Check if we have valid recipe data
                    if (data.success && data.data) {
                        console.log('Successfully loaded recipe from:', endpoint);
                        return data.data;
                    } else if (data.title) {
                        // Direct JSON response without wrapper
                        console.log('Successfully loaded recipe directly from:', endpoint);
                        return data;
                    }
                }
            } catch (error) {
                console.warn(`Failed to fetch from ${endpoint}:`, error.message);
                // Continue to next endpoint
            }
        }
        
        // As a last resort, try to generate fake recipe data for demonstration
        return createFallbackRecipe(recipeId);
    }
    
    // Format the recipe ID to standard UUID format if needed
    function formatRecipeId(id) {
        // If it looks like a UUID with extra components
        if (id && id.length > 36 && id.includes('-')) {
            // Extract just the UUID part (first 36 characters or up to 5th dash)
            const parts = id.split('-');
            if (parts.length > 5) {
                return parts.slice(0, 5).join('-');
            }
        }
        return id;
    }
    
    // Create fallback recipe data for demonstration purposes
    function createFallbackRecipe(recipeId) {
        console.log('Creating fallback recipe for demonstration purposes');
        
        // Check if we're in a development environment
        const isDev = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
        
        // Only use fallback in development environment
        if (!isDev) {
            return null;
        }
        
        // Generate some realistic-looking sample data
        return {
            id: recipeId,
            title: "Sample Recipe (API Fallback)",
            intro: "This is a fallback recipe created because the API returned a 404 error. In a production environment, a proper error message would be shown instead.",
            image: null,
            prep_time: "15",
            cook_time: "30",
            servings: "4",
            ingredients: [
                "Sample ingredient 1",
                "Sample ingredient 2",
                "Sample ingredient 3",
                "Sample ingredient 4"
            ],
            steps: [
                "This is a demonstration of the fallback mechanism.",
                "In a real environment, this would show an error message.",
                "The actual recipe with ID " + recipeId + " could not be found.",
                "Please try a different recipe or contact the administrator."
            ],
            notes: "This recipe is generated by the fallback system and is for demonstration purposes only.",
            categories: ["Demonstration"],
            tags: ["fallback", "demo", "sample"],
            created_at: new Date().toISOString()
        };
    }
    
    // Show loading indicator while fetching recipe
    function showRecipeLoading(container) {
        container.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 300px; width: 100%;">
                <div style="text-align: center;">
                    <div style="font-size: 24px; color: #7f4937; margin-bottom: 20px;">Loading recipe...</div>
                    <div style="width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #7f4937; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                </div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
    }
    
    // Show error message when recipe cannot be loaded
    function showRecipeError(errorMessage, container) {
        // If container not provided, try to find it
        if (!container) {
            container = document.getElementById('recipe-page');
            if (!container) return;
        }
        
        // Try to get header and footer from home page
        const homePage = document.getElementById('home-page');
        let headerHtml = '';
        let footerHtml = '';
        let sidebarHtml = '';
        
        if (homePage) {
            const header = homePage.querySelector('header');
            const footer = homePage.querySelector('footer');
            const sidebar = homePage.querySelector('.sidebar');
            
            if (header) headerHtml = header.outerHTML;
            if (footer) footerHtml = footer.outerHTML;
            if (sidebar) sidebarHtml = sidebar.outerHTML;
        }
        
        // Display error message
        container.innerHTML = `
            ${headerHtml}
            <div class="container main-content">
                <div class="content-main">
                    <div class="error-message" style="text-align: center; padding: 40px;">
                        <h2>Recipe Not Found</h2>
                        <p>${errorMessage}</p>
                        <p>The requested recipe could not be loaded from the server.</p>
                        <button onclick="showPage('home-page')" style="padding: 10px 20px; background-color: #7f4937; color: white; border: none; cursor: pointer; margin-top: 20px; border-radius: 4px;">Return to Home</button>
                    </div>
                </div>
                ${sidebarHtml ? `<aside class="sidebar">${sidebarHtml}</aside>` : ''}
            </div>
            ${footerHtml}
        `;
        
        // Setup navigation handlers
        if (typeof setupNavigationHandlers === 'function') {
            setupNavigationHandlers(container);
        }
    }
    
    // Display recipe content
    function displayRecipe(container, recipe) {
        // Get header, footer and sidebar from home page
        const homePage = document.getElementById('home-page');
        if (!homePage) {
            console.error('Home page not found, cannot get layout elements');
            return;
        }
        
        const header = homePage.querySelector('header');
        const footer = homePage.querySelector('footer');
        const sidebar = homePage.querySelector('.sidebar');
        
        if (!header || !footer || !sidebar) {
            console.error('Required layout elements not found');
            return;
        }
        
        // Start building the page
        let html = '';
        
        // Add header
        html += header.outerHTML;
        
        // Start main content
        html += `<div class="container main-content">
            <div class="content-main">
                <div class="recipe-main">
                    <div class="recipe-header">
                        <h1 class="recipe-title">${recipe.title || 'Untitled Recipe'}</h1>
                        
                        <div class="recipe-meta">
                            ${recipe.categories && recipe.categories.length > 0 ? 
                                `<div class="recipe-categories">
                                    ${recipe.categories.map(cat => 
                                        `<a href="#" onclick="showPage('category-page'); loadCategory('${cat}'); return false;">${cat}</a>`
                                    ).join(' ')}
                                </div>` : ''}
                            
                            <div class="recipe-date">${formatDate(recipe.created_at) || ''}</div>
                        </div>
                    </div>
                    
                    <div class="recipe-content">
                        <div class="recipe-image">
                            ${recipe.image ? 
                                `<img src="/img/recipes/${recipe.image}" alt="${recipe.title}" onerror="this.onerror=null; this.src='/img/placeholders/recipe-placeholder.jpg';">` : 
                                '<div class="placeholder-image" style="background-color: #f8f5f1; height: 400px; display: flex; align-items: center; justify-content: center; color: #7f4937;">No image available</div>'}
                        </div>
                        
                        <div class="recipe-description">
                            ${recipe.intro || ''}
                        </div>
                        
                        <div class="recipe-info">
                            <div class="info-item">
                                <i class="fas fa-clock"></i>
                                <span>Paruošimas: ${recipe.prep_time || '0'} min</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-fire"></i>
                                <span>Gaminimas: ${recipe.cook_time || '0'} min</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-utensils"></i>
                                <span>Porcijos: ${recipe.servings || '1'}</span>
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
                        
                        ${recipe.tags && recipe.tags.length > 0 ? 
                            `<div class="recipe-tags">
                                <h3>Žymos</h3>
                                <div class="tag-list">
                                    ${recipe.tags.map(tag => 
                                        `<a href="#" class="tag-link" onclick="showPage('category-page'); loadCategory('${tag}'); return false;">#${tag}</a>`
                                    ).join(' ')}
                                </div>
                            </div>` : ''}
                    </div>
                    
                    <div class="recipe-comments">
                        <h3>Komentarai</h3>
                        
                        <div class="comments-list">
                            <div class="no-comments">Kol kas komentarų nėra. Būkite pirmas!</div>
                        </div>
                        
                        <div class="comment-form">
                            <h4>Palikite komentarą</h4>
                            <form>
                                <div class="form-group">
                                    <label for="name">Vardas</label>
                                    <input type="text" id="name" name="name" class="form-control" required autocomplete="name">
                                </div>
                                <div class="form-group">
                                    <label for="email">El. paštas (nebus skelbiamas)</label>
                                    <input type="email" id="email" name="email" class="form-control" required autocomplete="email">
                                </div>
                                <div class="form-group">
                                    <label for="comment">Komentaras</label>
                                    <textarea id="comment" name="comment" class="form-control" required></textarea>
                                </div>
                                <button type="submit" class="submit-button">Paskelbti komentarą</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <aside class="sidebar">
                ${sidebar.innerHTML}
            </aside>
        </div>`;
        
        // Add footer
        html += footer.outerHTML;
        
        // Set the HTML content
        container.innerHTML = html;
        
        // Setup event handlers for the recipe page
        setupRecipePage(container);
    }
    
    // Format date for display
    function formatDate(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            
            return date.toLocaleDateString('lt-LT', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.warn('Error formatting date:', error);
            return '';
        }
    }
    
    // Setup recipe page event handlers
    function setupRecipePage(container) {
        // Setup dropdown menus
        setupDropdowns(container);
        
        // Setup navigation handlers
        if (typeof setupNavigationHandlers === 'function') {
            setupNavigationHandlers(container);
        } else {
            setupBasicNavigation(container);
        }
        
        // Setup comment form
        const commentForm = container.querySelector('.comment-form form');
        if (commentForm) {
            commentForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const nameInput = this.querySelector('#name');
                const emailInput = this.querySelector('#email');
                const commentInput = this.querySelector('#comment');
                
                if (nameInput && nameInput.value && 
                    emailInput && emailInput.value && isValidEmail(emailInput.value) && 
                    commentInput && commentInput.value) {
                    alert('Ačiū už komentarą! Jis bus paskelbtas po peržiūros.');
                    nameInput.value = '';
                    emailInput.value = '';
                    commentInput.value = '';
                } else {
                    alert('Prašome užpildyti visus būtinus laukus teisingai.');
                }
            });
        }
    }
    
    // Setup dropdown menus
    function setupDropdowns(container) {
        const dropdowns = container.querySelectorAll('.dropdown');
        
        dropdowns.forEach(dropdown => {
            const link = dropdown.querySelector('a');
            const content = dropdown.querySelector('.dropdown-content');
            
            if (!link || !content) return;
            
            // Variable to track if we should keep the menu open
            let shouldKeepOpen = false;
            
            // Add mouseenter event to show dropdown
            dropdown.addEventListener('mouseenter', () => {
                clearTimeout(dropdown.timeout);
                content.style.display = 'block';
            });
            
            // Add mouseleave event to hide dropdown (with a small delay)
            dropdown.addEventListener('mouseleave', () => {
                dropdown.timeout = setTimeout(() => {
                    if (!shouldKeepOpen) {
                        content.style.display = 'none';
                    }
                }, 100);
            });
            
            // Special handling for the dropdown content
            content.addEventListener('mouseenter', () => {
                shouldKeepOpen = true;
                clearTimeout(dropdown.timeout);
            });
            
            content.addEventListener('mouseleave', () => {
                shouldKeepOpen = false;
                content.style.display = 'none';
            });
            
            // Handle click on parent link
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Toggle the display
                if (content.style.display === 'block') {
                    content.style.display = 'none';
                } else {
                    // Close any other open dropdowns
                    container.querySelectorAll('.dropdown-content').forEach(el => {
                        if (el !== content) el.style.display = 'none';
                    });
                    content.style.display = 'block';
                }
            });
        });
    }
    
    // Setup basic navigation if the main function isn't available
    function setupBasicNavigation(container) {
        const navLinks = container.querySelectorAll('nav a, .dropdown-content a');
        
        navLinks.forEach(link => {
            // Skip links that already have handlers
            if (link.getAttribute('onclick')) return;
            
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Let about page links work normally
                if (href === 'about.html' || this.textContent.trim() === 'APIE MANE') {
                    return;
                }
                
                // Skip dropdown parent links
                if (href === '#' && this.parentElement.classList.contains('dropdown')) {
                    e.preventDefault();
                    return;
                }
                
                e.preventDefault();
                
                if (href && href.startsWith('#')) {
                    const pageId = href.substring(1);
                    if (typeof showPage === 'function') {
                        showPage(pageId);
                    }
                } else if (href) {
                    window.location.href = href;
                }
            });
        });
    }
    
    // Email validation helper
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    // Fix the link interceptor to properly handle recipe links
    function fixLinkInterceptor() {
        document.addEventListener('click', function(e) {
            // Find if this is a recipe link
            const link = e.target.closest('a[href*="recipe"]');
            if (!link) return;
            
            const href = link.getAttribute('href');
            if (!href) return;
            
            // Check if this is a recipe page link
            if (href.includes('recipe.html') || href.includes('/recipe/')) {
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
                    if (typeof showPage === 'function') {
                        showPage('recipe-page');
                    } else {
                        // Fallback if showPage not available
                        const pages = document.querySelectorAll('.page');
                        pages.forEach(page => {
                            page.classList.remove('active');
                        });
                        const recipePage = document.getElementById('recipe-page');
                        if (recipePage) {
                            recipePage.classList.add('active');
                        }
                    }
                    
                    // Load recipe with our enhanced function
                    loadRecipePage(recipeId);
                } else {
                    console.warn('Could not extract recipe ID from link');
                    window.location.href = href;
                }
            }
        });
    }
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        // Fix link handling
        fixLinkInterceptor();
        
        // Check URL for recipe ID
        const urlParams = new URLSearchParams(window.location.search);
        const recipeId = urlParams.get('id');
        
        if (recipeId) {
            console.log('Found recipe ID in URL:', recipeId);
            // Show recipe page and load it
            if (typeof showPage === 'function') {
                showPage('recipe-page');
            }
            loadRecipePage(recipeId);
        }
    });
    
    console.log('Recipe API Fix initialized successfully');
})();