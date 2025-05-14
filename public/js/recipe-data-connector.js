// Recipe Data Connector - Focused on connecting to your actual recipe database
// This script prioritizes finding and displaying your real recipes

(function() {
    console.log('Recipe Data Connector loaded - Focusing on real recipe data');

    // Store original functions for reference
    const originalShowPage = window.showPage;
    const originalLoadRecipePage = window.loadRecipePage;
    
    // Enhanced showPage function that ensures recipe page exists
    window.showPage = function(pageId, extraData) {
        console.log(`Showing page: ${pageId}`, extraData ? `with data: ${extraData}` : '');
        
        // If showing recipe page, ensure it exists
        if (pageId === 'recipe-page') {
            const recipePage = document.getElementById('recipe-page');
            if (!recipePage) {
                console.log('Recipe page not found, creating it');
                createRecipePage();
            }
        }
        
        // Try to use the original showPage function
        if (typeof originalShowPage === 'function') {
            originalShowPage(pageId);
        } else {
            // Basic page switching if original not available
            const pages = document.querySelectorAll('.page');
            pages.forEach(page => {
                page.classList.remove('active');
            });
            
            const selectedPage = document.getElementById(pageId);
            if (selectedPage) {
                selectedPage.classList.add('active');
                window.scrollTo(0, 0);
            } else {
                console.error(`Page with ID '${pageId}' not found`);
            }
        }
        
        // Load recipe if provided
        if (pageId === 'recipe-page' && extraData && typeof window.loadRecipePage === 'function') {
            window.loadRecipePage(extraData);
        }
    };
    
    // Create recipe page if needed
    function createRecipePage() {
        if (document.getElementById('recipe-page')) {
            return; // Already exists
        }
        
        // Create page element
        const recipePage = document.createElement('div');
        recipePage.id = 'recipe-page';
        recipePage.className = 'page';
        
        recipePage.innerHTML = `
            <div style="text-align: center; padding: 100px 20px;">
                <h2>Kraunamas receptas...</h2>
                <div style="margin: 20px auto; width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #7f4937; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </div>
        `;
        
        // Add to document
        const homePage = document.getElementById('home-page');
        if (homePage && homePage.parentNode) {
            homePage.parentNode.appendChild(recipePage);
        } else {
            document.body.appendChild(recipePage);
        }
        
        console.log('Recipe page created successfully');
        return recipePage;
    }
    
    // Enhanced recipe loading function focused on real data
    window.loadRecipePage = function(recipeId) {
        console.log('Loading recipe with ID:', recipeId);
        
        // If no recipeId provided, check URL
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
        
        // Ensure recipe page exists
        let recipePage = document.getElementById('recipe-page');
        if (!recipePage) {
            recipePage = createRecipePage();
        }
        
        // Format the recipe ID if needed
        const formattedId = formatRecipeId(recipeId);
        if (formattedId !== recipeId) {
            console.log('Original ID:', recipeId);
            console.log('Formatted ID for API call:', formattedId);
            recipeId = formattedId;
        }
        
        // Show loading indicator
        showRecipeLoading(recipePage);
        
        // Focus on finding the actual recipe data
        loadRealRecipeData(recipeId)
            .then(recipe => {
                if (recipe) {
                    // Successfully found recipe data, display it
                    displayRecipe(recipePage, recipe);
                } else {
                    throw new Error('Receptas nerastas. Patikrinkite ID.');
                }
            })
            .catch(error => {
                console.error('Error loading recipe:', error);
                showRecipeError(error.message, recipePage);
            });
    };
    
    // Format recipe ID to standard format
    function formatRecipeId(id) {
        // Handle UUIDs with suffix
        if (id && id.includes('-')) {
            // Check if ID has more parts than a standard UUID
            const parts = id.split('-');
            if (parts.length > 5) {
                // Extract just the UUID part (first 5 segments)
                return parts.slice(0, 5).join('-');
            }
        }
        return id;
    }
    
    // Function specifically focused on loading real recipe data
    async function loadRealRecipeData(recipeId) {
        // Define API endpoints to try, prioritizing your main endpoint
        const endpoints = [
            `/api/recipes/${recipeId}`,         // Main public API endpoint
            `/recipes/${recipeId}`,             // Alternative public endpoint
            `/admin-api/recipes/${recipeId}`    // Admin API endpoint (if authorized)
        ];
        
        // Add endpoint for the UUID part only (if ID has suffix)
        if (recipeId.includes('-')) {
            const uuidPart = recipeId.split('-').slice(0, 5).join('-');
            if (uuidPart !== recipeId) {
                // Try the clean UUID version first
                endpoints.unshift(`/api/recipes/${uuidPart}`);
            }
        }
        
        // Add authentication token if available
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        console.log('Attempting to load recipe using endpoints:', endpoints);
        
        // Try each endpoint in sequence
        for (const endpoint of endpoints) {
            try {
                console.log(`Trying to fetch recipe from: ${endpoint}`);
                
                const response = await fetch(endpoint, { headers });
                
                if (response.ok) {
                    const data = await response.json();
                    
                    // Check for valid recipe data
                    if (data.success && data.data) {
                        console.log('Successfully loaded recipe from:', endpoint);
                        return data.data;
                    } else if (data.title) {
                        // Direct recipe data
                        console.log('Found recipe data directly from:', endpoint);
                        return data;
                    } else {
                        console.log('Response from endpoint did not contain valid recipe data:', data);
                    }
                } else {
                    console.warn(`Endpoint ${endpoint} returned status ${response.status}`);
                }
            } catch (error) {
                console.warn(`Error fetching from ${endpoint}:`, error.message);
            }
        }
        
        // If we still couldn't find the recipe, try local storage as last resort
        console.log('Attempting to find recipe in local storage');
        try {
            // Check if we have recipes in localStorage (admin panel might store them)
            const localRecipes = localStorage.getItem('recipes');
            if (localRecipes) {
                const recipes = JSON.parse(localRecipes);
                const recipe = recipes.find(r => r.id === recipeId || 
                                                r.id === recipeId.split('-').slice(0, 5).join('-'));
                if (recipe) {
                    console.log('Found recipe in local storage:', recipe);
                    return recipe;
                }
            }
        } catch (e) {
            console.warn('Error checking local storage:', e);
        }
        
        // If all attempts failed, return null (no recipe found)
        console.error('Failed to find recipe data for ID:', recipeId);
        return null;
    }
    
    // Show loading indicator
    function showRecipeLoading(container) {
        container.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; min-height: 400px; width: 100%;">
                <div style="text-align: center;">
                    <div style="font-size: 24px; color: #7f4937; margin-bottom: 20px;">Įkeliamas receptas...</div>
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
    
    // Show error message
    function showRecipeError(errorMessage, container) {
        // Ensure we have a container
        if (!container) {
            container = document.getElementById('recipe-page');
            if (!container) {
                console.error('Recipe page container not found');
                return;
            }
        }
        
        // Try to get layout elements from home page
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
        
        // Create error message with layout
        container.innerHTML = `
            ${headerHtml}
            <div class="container main-content">
                <div class="content-main">
                    <div class="error-message" style="text-align: center; padding: 40px;">
                        <h2>Receptas nerastas</h2>
                        <p>${errorMessage}</p>
                        <p>Nepavyko rasti recepto. Galimos priežastys:</p>
                        <ul style="text-align: left; max-width: 500px; margin: 20px auto;">
                            <li>Receptas gali būti ištrintas</li>
                            <li>Recepto ID gali būti neteisingas</li>
                            <li>Gali būti laikina serverio klaida</li>
                        </ul>
                        <button onclick="showPage('home-page')" style="padding: 10px 20px; background-color: #7f4937; color: white; border: none; cursor: pointer; margin-top: 20px; border-radius: 4px;">Grįžti į pagrindinį puslapį</button>
                    </div>
                </div>
                ${sidebarHtml ? `<aside class="sidebar">${sidebarHtml}</aside>` : ''}
            </div>
            ${footerHtml}
        `;
        
        // Set up navigation
        setupNavigationHandlers(container);
    }
    
    // Display recipe
    function displayRecipe(container, recipe) {
        // Get layout elements from home page
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
        
        // Format recipe content HTML
        const recipeContent = `
            <div class="recipe-header">
                <h1 class="recipe-title">${recipe.title || 'Nepavadintas receptas'}</h1>
                
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
                        `<img src="/img/recipes/${recipe.image}" alt="${recipe.title}" onerror="this.onerror=null; this.src='img/placeholders/recipe-placeholder.jpg';">` : 
                        '<div class="placeholder-image" style="background-color: #f8f5f1; height: 400px; display: flex; align-items: center; justify-content: center; color: #7f4937; font-style: italic;">Nuotrauka nepateikta</div>'}
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
                            '<li>Nėra pateiktų ingredientų</li>'}
                    </ul>
                </div>
                
                <div class="recipe-steps">
                    <h3>Gaminimo eiga</h3>
                    <ol>
                        ${recipe.steps && recipe.steps.length > 0 ? 
                            recipe.steps.map(step => 
                                `<li>${step}</li>`
                            ).join('') : 
                            '<li>Nėra pateiktų gaminimo žingsnių</li>'}
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
        `;
        
        // Assemble the full page
        container.innerHTML = `
            ${header.outerHTML}
            <div class="container main-content">
                <div class="content-main">
                    <div class="recipe-main">
                        ${recipeContent}
                    </div>
                </div>
                <aside class="sidebar">
                    ${sidebar.innerHTML}
                </aside>
            </div>
            ${footer.outerHTML}
        `;
        
        // Setup event handlers
        setupRecipePage(container);
    }
    
    // Setup recipe page event handlers
    function setupRecipePage(container) {
        // Setup dropdown menus
        setupDropdowns(container);
        
        // Setup navigation handlers
        setupNavigationHandlers(container);
        
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
            
            // Add mouseleave event to hide dropdown (with a delay)
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
    
    // Setup navigation handlers
    function setupNavigationHandlers(container) {
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
    
    // Format date helper
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
    
    // Email validation helper
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    // Fix recipe link handling
    function fixRecipeLinks() {
        document.addEventListener('click', function(e) {
            // Find if this is a recipe link
            const link = e.target.closest('a[href*="recipe"]');
            if (!link) return;
            
            const href = link.getAttribute('href');
            if (!href) return;
            
            // Check if this is a recipe link
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
                    
                    // Show the recipe page
                    showPage('recipe-page', recipeId);
                } else {
                    console.warn('Could not extract recipe ID from link');
                    window.location.href = href;
                }
            }
        });
    }
    
    // Add debugging function to find and display all recipes
    window.debugListAllRecipes = function() {
        console.log('Attempting to list all available recipes');
        
        // Try the API endpoint for all recipes
        fetch('/api/recipes')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.data) {
                    console.log('Available recipes from API:', data.data);
                    alert(`Found ${data.data.length} recipes. See console for details.`);
                } else {
                    console.log('Response from /api/recipes:', data);
                    alert('Recipe API returned data but not in the expected format. See console for details.');
                }
            })
            .catch(error => {
                console.error('Error fetching all recipes:', error);
                alert('Error fetching recipes. See console for details.');
            });
    };
    
    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Ensure recipe page exists
        createRecipePage();
        
        // Fix recipe links
        fixRecipeLinks();
        
        // Check for recipe ID in URL
        const urlParams = new URLSearchParams(window.location.search);
        const recipeId = urlParams.get('id');
        
        if (recipeId) {
            console.log('Found recipe ID in URL:', recipeId);
            showPage('recipe-page', recipeId);
        }
        
        console.log('Recipe Data Connector initialized successfully');
        console.log('Use debugListAllRecipes() to see all available recipes');
    });
})();