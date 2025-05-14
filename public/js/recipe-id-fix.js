// Fix for recipe ID format issue
(function() {
    console.log('Recipe ID Fix loaded');
    
    // Override the loadRecipePage function
    const originalLoadRecipePage = window.loadRecipePage;
    
    window.loadRecipePage = function(recipeId) {
        // If we have an ID with a suffix (containing more than 5 dashes), extract just the UUID part
        if (recipeId && recipeId.split('-').length > 5) {
            const uuidPart = recipeId.split('-').slice(0, 5).join('-');
            console.log('Original ID:', recipeId);
            console.log('Modified ID for API call:', uuidPart);
            
            // Call the original function with the UUID part only
            if (typeof originalLoadRecipePage === 'function') {
                return originalLoadRecipePage(uuidPart);
            }
            
            // If no original function, implement basic functionality
            return fetchRecipeWithId(uuidPart);
        }
        
        // If the ID doesn't have the expected format, use it as is
        if (typeof originalLoadRecipePage === 'function') {
            return originalLoadRecipePage(recipeId);
        } else {
            return fetchRecipeWithId(recipeId);
        }
    };
    
    // Basic recipe loading function if the original is missing
    function fetchRecipeWithId(recipeId) {
        console.log('Fetching recipe with ID:', recipeId);
        
        const recipePage = document.getElementById('recipe-page');
        if (!recipePage) {
            console.error('Recipe page element not found');
            return;
        }
        
        // Show loading indicator
        recipePage.innerHTML = `
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
        
        // Try to fetch the recipe data
        fetch(`/api/recipes/${recipeId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch recipe: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Recipe data received:', data);
                
                if (!data.success || !data.data) {
                    throw new Error('Recipe data not found or invalid format');
                }
                
                // Create basic recipe display
                displayRecipe(recipePage, data.data);
            })
            .catch(error => {
                console.error('Error loading recipe:', error);
                
                // Show error message
                const homePage = document.getElementById('home-page');
                if (homePage) {
                    recipePage.innerHTML = `
                        <header>
                            ${homePage.querySelector('header').innerHTML}
                        </header>
                        <div class="container main-content">
                            <div class="content-main">
                                <div class="error-message" style="text-align: center; padding: 40px;">
                                    <h2>Error Loading Recipe</h2>
                                    <p>${error.message}</p>
                                    <p>Recipe ID: ${recipeId}</p>
                                    <button onclick="showPage('home-page')" style="padding: 10px 20px; background-color: #7f4937; color: white; border: none; cursor: pointer; margin-top: 20px; border-radius: 4px;">Return to Home</button>
                                </div>
                            </div>
                            <aside class="sidebar">
                                ${homePage.querySelector('.sidebar').innerHTML}
                            </aside>
                        </div>
                        <footer>
                            ${homePage.querySelector('footer').innerHTML}
                        </footer>
                    `;
                    
                    // Make sure navigation works
                    setupNavigationHandlers(recipePage);
                }
            });
    }
    
    // Basic recipe display function
    function displayRecipe(container, recipe) {
        const homePage = document.getElementById('home-page');
        if (!homePage) return;
        
        container.innerHTML = `
            <header>
                ${homePage.querySelector('header').innerHTML}
            </header>
            <div class="container main-content">
                <div class="content-main">
                    <div class="recipe-main">
                        <div class="recipe-header">
                            <h1 class="recipe-title">${recipe.title || 'Untitled Recipe'}</h1>
                        </div>
                        
                        <div class="recipe-content">
                            ${recipe.image ? 
                                `<div class="recipe-image">
                                    <img src="/img/recipes/${recipe.image}" alt="${recipe.title}" onerror="this.onerror=null; this.src='/img/placeholders/recipe-placeholder.jpg';">
                                </div>` : ''}
                            
                            ${recipe.intro ? 
                                `<div class="recipe-description">
                                    ${recipe.intro}
                                </div>` : ''}
                            
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
                            
                            ${recipe.ingredients && recipe.ingredients.length > 0 ? 
                                `<div class="recipe-ingredients">
                                    <h3>Ingredientai</h3>
                                    <ul>
                                        ${recipe.ingredients.map(ingredient => 
                                            `<li>${ingredient}</li>`
                                        ).join('')}
                                    </ul>
                                </div>` : ''}
                            
                            ${recipe.steps && recipe.steps.length > 0 ? 
                                `<div class="recipe-steps">
                                    <h3>Gaminimo eiga</h3>
                                    <ol>
                                        ${recipe.steps.map(step => 
                                            `<li>${step}</li>`
                                        ).join('')}
                                    </ol>
                                </div>` : ''}
                        </div>
                    </div>
                </div>
                <aside class="sidebar">
                    ${homePage.querySelector('.sidebar').innerHTML}
                </aside>
            </div>
            <footer>
                ${homePage.querySelector('footer').innerHTML}
            </footer>
        `;
        
        // Make sure navigation works
        setupNavigationHandlers(container);
    }
    
    // Setup navigation handlers
    function setupNavigationHandlers(container) {
        const navLinks = container.querySelectorAll('nav a, .dropdown-content a');
        
        navLinks.forEach(link => {
            // Skip links that already have onclick
            if (link.hasAttribute('onclick')) return;
            
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Regular links
                if (href === 'about.html') return;
                
                // Dropdown parent links
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
    
    // Fix link interceptor
    function fixLinkInterceptor() {
        document.addEventListener('click', function(e) {
            // Find recipe link
            const link = e.target.closest('a[href*="recipe"]');
            if (!link) return;
            
            const href = link.getAttribute('href');
            if (!href) return;
            
            // Check if recipe link
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
                    
                    // Show recipe page with correct ID
                    showPage('recipe-page');
                    loadRecipePage(recipeId);
                } else {
                    console.warn('Could not extract recipe ID');
                    window.location.href = href;
                }
            }
        });
    }
    
    // Run the fixes on page load
    document.addEventListener('DOMContentLoaded', function() {
        fixLinkInterceptor();
        
        // Check URL for recipe ID
        const urlParams = new URLSearchParams(window.location.search);
        const recipeId = urlParams.get('id');
        
        if (recipeId) {
            console.log('Found recipe ID in URL:', recipeId);
            showPage('recipe-page');
            loadRecipePage(recipeId);
        }
    });
    
    console.log('Recipe ID Fix initialized');
})();