// Recipe Page Handler - Complete Fix for Recipe Display Issues
// This script handles all aspects of recipe page loading and creation

(function() {
    console.log('Recipe Page Handler loaded - Complete solution for recipe display issues');

    // Store original functions for fallback
    const originalShowPage = window.showPage;
    const originalLoadRecipePage = window.loadRecipePage;
    
    // Enhanced showPage function that can create the recipe page if it doesn't exist
    window.showPage = function(pageId, extraData) {
        console.log(`Showing page: ${pageId}`, extraData ? `with data: ${extraData}` : '');
        
        // If trying to show recipe page, make sure it exists first
        if (pageId === 'recipe-page') {
            const recipePage = document.getElementById('recipe-page');
            if (!recipePage) {
                console.log('Recipe page not found, creating it');
                createRecipePage();
            }
        }
        
        // Try to use the original showPage function
        if (typeof originalShowPage === 'function') {
            // Call original function
            originalShowPage(pageId);
        } else {
            // Implement basic page switching if original not available
            const pages = document.querySelectorAll('.page');
            pages.forEach(page => {
                page.classList.remove('active');
            });
            
            const selectedPage = document.getElementById(pageId);
            if (selectedPage) {
                selectedPage.classList.add('active');
                // Scroll to top when changing pages
                window.scrollTo(0, 0);
                
                // If showing recipe page and we have a recipe ID, load it
                if (pageId === 'recipe-page' && extraData) {
                    if (typeof window.loadRecipePage === 'function') {
                        window.loadRecipePage(extraData);
                    }
                }
            } else {
                console.error(`Page with ID '${pageId}' not found`);
            }
        }
        
        // If we're showing the recipe page and we have extraData (recipe ID), load it
        if (pageId === 'recipe-page' && extraData && typeof window.loadRecipePage === 'function') {
            window.loadRecipePage(extraData);
        }
    };
    
    // Create recipe page element if it doesn't exist
    function createRecipePage() {
        // Check if page already exists
        if (document.getElementById('recipe-page')) {
            return; // Page already exists
        }
        
        // Create recipe page element
        const recipePage = document.createElement('div');
        recipePage.id = 'recipe-page';
        recipePage.className = 'page';
        
        // Initialize with a loading message
        recipePage.innerHTML = `
            <div style="text-align: center; padding: 100px 20px;">
                <h2>Loading Recipe...</h2>
                <div style="margin: 20px auto; width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #7f4937; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </div>
        `;
        
        // Add to body after the other pages
        const homePage = document.getElementById('home-page');
        if (homePage && homePage.parentNode) {
            homePage.parentNode.appendChild(recipePage);
        } else {
            document.body.appendChild(recipePage);
        }
        
        console.log('Recipe page created successfully');
        return recipePage;
    }
    
    // Enhanced recipe loading function
    window.loadRecipePage = function(recipeId) {
        console.log('Enhanced recipe loading for ID:', recipeId);
        
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
        
        // Try multiple endpoints to fetch the recipe
        tryMultipleEndpoints(recipeId)
            .then(recipe => {
                if (recipe) {
                    // Successfully found recipe data, display it
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
    
    // Format recipe ID to handle various formats
    function formatRecipeId(id) {
        // Handle UUIDs with suffix
        if (id && id.includes('-')) {
            // Remove any suffix after 5 dashes
            const parts = id.split('-');
            if (parts.length > 5) {
                return parts.slice(0, 5).join('-');
            }
        }
        return id;
    }
    
    // Try multiple API endpoints to find the recipe
    async function tryMultipleEndpoints(recipeId) {
        // Define endpoints to try
        const endpoints = [
            `/api/recipes/${recipeId}`,
            `/api/recipe/${recipeId}`,
            `/admin-api/recipes/${recipeId}`,
            `/recipes/${recipeId}.json`
        ];
        
        // Add endpoint for the UUID part only
        if (recipeId.includes('-')) {
            const uuidPart = recipeId.split('-').slice(0, 5).join('-');
            endpoints.unshift(`/api/recipes/${uuidPart}`);
        }
        
        // Add token to headers if available
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        // Try each endpoint
        for (const endpoint of endpoints) {
            try {
                console.log(`Attempting to fetch recipe from: ${endpoint}`);
                
                const response = await fetch(endpoint, { headers });
                
                if (response.ok) {
                    const data = await response.json();
                    
                    // Check for valid data
                    if (data.success && data.data) {
                        console.log('Successfully loaded recipe from:', endpoint);
                        return data.data;
                    } else if (data.title) {
                        // Direct JSON response
                        console.log('Successfully loaded recipe directly from:', endpoint);
                        return data;
                    }
                }
            } catch (error) {
                console.warn(`Failed to fetch from ${endpoint}:`, error.message);
                // Continue to next endpoint
            }
        }
        
        // If no endpoints worked, try to create fallback data for demo purposes
        console.log('All API endpoints failed, creating fallback recipe');
        return createFallbackRecipe(recipeId);
    }
    
    // Create fallback recipe data for demonstration
    function createFallbackRecipe(recipeId) {
        console.log('Creating fallback recipe for: ' + recipeId);
        
        // Only create fallback in development mode
        const isDev = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
                     
        if (!isDev) {
            return null;
        }
        
        // Generate demo recipe data
        return {
            id: recipeId,
            title: "Demonstracinis receptas",
            intro: "Šis demonstracinis receptas sukurtas automatiškai, nes serveris negalėjo rasti recepto duomenų. Tai padeda parodyti, kaip puslapis atrodytų su tikru receptu.",
            image: null,
            prep_time: "15",
            cook_time: "30",
            servings: "4",
            ingredients: [
                "400 g miltų",
                "2 kiaušiniai",
                "200 ml pieno",
                "50 g sviesto",
                "Žiupsnelis druskos",
                "2 šaukštai cukraus"
            ],
            steps: [
                "Dubenyje sumaišykite visus sausus ingredientus.",
                "Įmuškite kiaušinius ir pamažu supilkite pieną, nuolat maišydami.",
                "Ištirpinkite sviestą ir supilkite į tešlą.",
                "Palikite tešlą pastovėti 30 minučių.",
                "Kepkite vidutinio karštumo keptuvėje, kol gražiai apskrus."
            ],
            notes: "Šis receptas yra sugeneruotas automatiškai, nes tikrasis receptas (ID: " + recipeId + ") nebuvo rastas serverio duomenų bazėje.",
            categories: ["Demonstracija"],
            tags: ["demo", "pavyzdys", "automatinis"],
            created_at: new Date().toISOString()
        };
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
                        <p>Receptas nebuvo rastas serveryje.</p>
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
    
    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Fix recipe links
        fixRecipeLinks();
        
        // Check for recipe ID in URL
        const urlParams = new URLSearchParams(window.location.search);
        const recipeId = urlParams.get('id');
        
        if (recipeId) {
            console.log('Found recipe ID in URL:', recipeId);
            showPage('recipe-page', recipeId);
        }
    });
    
    console.log('Recipe Page Handler initialized successfully');
})();