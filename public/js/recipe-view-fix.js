// Recipe View Fix - Ensures recipe pages load correctly with proper ID passing
(function() {
    console.log('Recipe View Fix loaded (Revised)');
    
    // Original recipe page loading function that might be failing
    const originalLoadRecipePage = window.loadRecipePage;
    
    // Override the loadRecipePage function with a more robust implementation
    window.loadRecipePage = function(recipeId) {
        console.log('Enhanced recipe page loading for ID:', recipeId);
        
        // If no recipeId provided, check if there's one in URL
        if (!recipeId) {
            const urlParams = new URLSearchParams(window.location.search);
            recipeId = urlParams.get('id');
            if (recipeId) {
                console.log('Found recipe ID in URL:', recipeId);
            } else {
                console.error('No recipe ID provided');
                showErrorMessage('No recipe ID provided');
                return;
            }
        }
        
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
        
        // Clone header from home page
        const homePage = document.getElementById('home-page');
        if (!homePage) {
            console.error('Home page not found');
            return;
        }
        
        // Try to fetch the recipe data first
        fetch(`/api/recipes/${recipeId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch recipe: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (!data.success || !data.data) {
                    throw new Error('Recipe data not found');
                }
                
                // We have the recipe data, now build the page
                const recipe = data.data;
                createRecipePage(recipePage, recipe);
            })
            .catch(error => {
                console.error('Error loading recipe:', error);
                showErrorMessage(error.message);
            });
    };
    
    // Function to show error message
    function showErrorMessage(errorMessage) {
        const recipePage = document.getElementById('recipe-page');
        if (!recipePage) return;
        
        const homePage = document.getElementById('home-page');
        if (!homePage) return;
        
        recipePage.innerHTML = `
            <header>
                ${homePage.querySelector('header').innerHTML}
            </header>
            <div class="container main-content">
                <div class="content-main">
                    <div class="error-message" style="text-align: center; padding: 40px;">
                        <h2>Error Loading Recipe</h2>
                        <p>${errorMessage}</p>
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
        
        // Make sure the header navigation works
        setupNavigationHandlers(recipePage);
    }
    
    // Function to create a full recipe page from recipe data
    function createRecipePage(recipePage, recipe) {
        // Clone header and footer from home page
        const homePage = document.getElementById('home-page');
        const header = homePage.querySelector('header').cloneNode(true);
        const footer = homePage.querySelector('footer').cloneNode(true);
        
        // Create sidebar
        const sidebar = homePage.querySelector('.sidebar').cloneNode(true);
        
        // Create recipe content
        const recipeContent = document.createElement('div');
        recipeContent.className = 'recipe-main';
        
        // Format recipe HTML
        recipeContent.innerHTML = `
            <div class="recipe-header">
                <h1 class="recipe-title">${recipe.title || 'Untitled Recipe'}</h1>
                <div class="recipe-meta">
                    ${recipe.categories && recipe.categories.length > 0 ? 
                        `<div class="recipe-categories">
                            ${recipe.categories.map(cat => `<a href="#" onclick="showPage('category-page'); loadCategory('${cat}'); return false;">${cat}</a>`).join(' ')}
                        </div>` : ''}
                    <div class="recipe-date">${formatDate(recipe.created_at) || 'Unknown date'}</div>
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
                            ${recipe.tags.map(tag => `<a href="#" class="tag-link">#${tag}</a>`).join(' ')}
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
        `;
        
        // Assemble page
        const contentMain = document.createElement('div');
        contentMain.className = 'content-main';
        contentMain.appendChild(recipeContent);
        
        const mainContent = document.createElement('div');
        mainContent.className = 'container main-content';
        mainContent.appendChild(contentMain);
        mainContent.appendChild(sidebar);
        
        // Clear page and add elements
        recipePage.innerHTML = '';
        recipePage.appendChild(header);
        recipePage.appendChild(mainContent);
        recipePage.appendChild(footer);
        
        // Setup dropdown menus and navigation
        setupRecipePage(recipePage);
    }
    
    // Setup dropdown menus
    function setupRecipePage(recipePage) {
        // Setup dropdown menus
        const dropdowns = recipePage.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            const link = dropdown.querySelector('a');
            const content = dropdown.querySelector('.dropdown-content');
            
            if (!link || !content) return;
            
            // Handle hover
            dropdown.addEventListener('mouseenter', () => {
                content.style.display = 'block';
            });
            
            dropdown.addEventListener('mouseleave', () => {
                content.style.display = 'none';
            });
            
            // Handle click
            link.addEventListener('click', (e) => {
                e.preventDefault();
                content.style.display = content.style.display === 'block' ? 'none' : 'block';
            });
        });
        
        // Setup navigation
        setupNavigationHandlers(recipePage);
        
        // Setup comment form
        const commentForm = recipePage.querySelector('.comment-form form');
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
    
    // Setup navigation handlers
    function setupNavigationHandlers(container) {
        // Find all navigation links
        const navLinks = container.querySelectorAll('nav a, .dropdown-content a');
        
        navLinks.forEach(link => {
            // Skip links that already have an onclick handler
            if (link.hasAttribute('onclick')) {
                return;
            }
            
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Handle about page separately
                if (this.textContent.trim() === 'APIE MANE' || href === 'about.html') {
                    return; // Let the default navigation happen
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
    
    // Helper function to format dates
    function formatDate(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            
            return date.toLocaleDateString('lt-LT', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    }
    
    // Email validation function
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    // Fix the linkInterceptor function
    function fixLinkInterceptor() {
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
                    
                    // Show recipe page and pass the ID correctly
                    showPage('recipe-page');
                    loadRecipePage(recipeId);
                } else {
                    console.warn('Could not extract recipe ID from link, allowing default navigation');
                    window.location.href = href;
                }
            }
        });
    }
    
    // Check URL for recipe ID
    function checkUrlForRecipe() {
        const urlParams = new URLSearchParams(window.location.search);
        const recipeId = urlParams.get('id');
        
        if (recipeId) {
            console.log('Found recipe ID in URL:', recipeId);
            // Show recipe page and load it with the ID
            showPage('recipe-page');
            loadRecipePage(recipeId);
        }
    }
    
    // Initialize the fix
    document.addEventListener('DOMContentLoaded', function() {
        // Apply our fixed link interceptor
        fixLinkInterceptor();
        
        // Check URL for recipe ID
        checkUrlForRecipe();
    });
    
    console.log('Recipe View Fix initialized successfully');
})();