/**
 * Recipe Core - Unified Recipe Handler
 * 
 * A comprehensive solution for recipe page handling that combines functionality from:
 * - recipe-api-fix.js
 * - recipe-data-connector.js
 * - recipe-id-fix.js
 * - recipe-page-handler.js
 * - recipe-view-fix.js
 * - uuid-suffix-fix.js
 * 
 * Features:
 * - UUID format fixing (handles IDs with suffixes)
 * - Multiple API endpoint handling
 * - Recipe page creation and display
 * - Error handling and fallbacks
 * - Navigation handling
 */

(function() {
    console.log('Recipe Core loaded - Unified recipe handling solution');

    // Store original functions for reference/fallback
    const originalShowPage = window.showPage;
    const originalLoadRecipePage = window.loadRecipePage;
    
    /**
     * Format recipe ID to standard UUID format
     * Handles IDs like "4cbcfd2a-324e-479c-a034-292322134796-suffix" 
     * and extracts just the UUID part
     */
    function formatRecipeId(id) {
        if (!id) return id;
        
        // If it looks like a UUID with extra components (more than 5 dashes)
        if (id && id.includes('-')) {
            const parts = id.split('-');
            if (parts.length > 5) {
                const formattedId = parts.slice(0, 5).join('-');
                console.log('Formatted recipe ID:', id, '→', formattedId);
                return formattedId;
            }
        }
        return id;
    }
    
    /**
     * Enhanced showPage function that creates recipe page if needed
     * and handles loading recipes
     */
    window.showPage = function(pageId, extraData) {
        console.log(`Showing page: ${pageId}`, extraData ? `with data: ${extraData}` : '');
        
        // If showing recipe page, make sure it exists
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
        
        // If showing recipe page with provided ID, load the recipe
        if (pageId === 'recipe-page' && extraData) {
            window.loadRecipePage(extraData);
        }
    };
    
    /**
     * Create recipe page element if it doesn't exist
     */
    function createRecipePage() {
        if (document.getElementById('recipe-page')) {
            return; // Already exists
        }
        
        const recipePage = document.createElement('div');
        recipePage.id = 'recipe-page';
        recipePage.className = 'page';
        
        // Initialize with loading indicator
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
    
    /**
     * Enhanced recipe loading function
     */
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
        
        // Try multiple endpoints to fetch the recipe
        tryMultipleEndpoints(recipeId)
            .then(recipe => {
                if (recipe) {
                    // Successfully found recipe data, display it
                    displayRecipe(recipePage, recipe);
                } else {
                    // If we created sample recipes, use them as fallback
                    const sampleRecipe = getSampleRecipe(recipeId);
                    if (sampleRecipe) {
                        console.log('Using sample recipe data for demonstration');
                        displayRecipe(recipePage, sampleRecipe);
                    } else {
                        throw new Error('Receptas nerastas');
                    }
                }
            })
            .catch(error => {
                console.error('Error loading recipe:', error);
                showRecipeError(error.message, recipePage);
            });
    };
    
    /**
     * Show loading indicator
     */
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
    
    /**
     * Try multiple API endpoints to find the recipe
     */
    async function tryMultipleEndpoints(recipeId) {
        // Define endpoints to try in order
        const endpoints = [
            `/api/recipes/${recipeId}`,
            `/api/recipe/${recipeId}`
        ];
        
        // Add endpoint for UUID only if different from recipeId
        const uuidFormat = formatRecipeId(recipeId);
        if (uuidFormat !== recipeId) {
            endpoints.unshift(`/api/recipes/${uuidFormat}`);
        }
        
        // Check if we're in development mode
        const isDev = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
                     
        // In development mode, we'll try testing endpoints
        if (isDev) {
            endpoints.push(`/admin-api/recipes/${recipeId}`);
            
            // Only try this if we're in development mode
            // This endpoint often 404s and creates console errors
            // endpoints.push(`/recipes/${recipeId}.json`);
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
                } else {
                    console.warn(`Endpoint ${endpoint} returned status ${response.status}`);
                }
            } catch (error) {
                console.warn(`Failed to fetch from ${endpoint}:`, error.message);
                // Continue to next endpoint
            }
        }
        
        // Try localStorage as last resort (admin panel might store recipes there)
        try {
            const localRecipes = localStorage.getItem('recipes');
            if (localRecipes) {
                const recipes = JSON.parse(localRecipes);
                const recipe = recipes.find(r => r.id === recipeId || 
                                                r.id === formatRecipeId(recipeId));
                if (recipe) {
                    console.log('Found recipe in local storage:', recipe);
                    return recipe;
                }
            }
        } catch (e) {
            console.warn('Error checking local storage:', e);
        }
        
        // If we couldn't find the recipe from any source, return null
        return null;
    }
    
    /**
     * Get a sample recipe for demonstration purposes
     * This is only used when in development mode and no real recipes exist
     */
    function getSampleRecipe(recipeId) {
        // Check if we're in a development environment
        const isDev = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
                     
        // Only provide sample recipes in development mode
        if (!isDev) {
            return null;
        }
        
        // Create some sample recipes
        const sampleRecipes = [
            {
                id: "sample-recipe-1",
                title: "Bulvių košė su grietine",
                intro: "Tradicinis lietuviškas patiekalas, kuris puikiai tinka prie mėsos ar žuvies patiekalų. Švelnaus skonio ir kreminės tekstūros bulvių košė su grietine.",
                image: null,
                prep_time: "10",
                cook_time: "25",
                servings: "4",
                ingredients: [
                    "1 kg bulvių",
                    "100 ml pieno",
                    "50 g sviesto",
                    "2 šaukštai grietinės",
                    "Druskos pagal skonį",
                    "Žiupsnelis maltų juodųjų pipirų"
                ],
                steps: [
                    "Nulupkite bulves ir supjaustykite jas vidutinio dydžio kubeliais.",
                    "Sudėkite bulves į puodą, užpilkite šaltu vandeniu, įberkite truputį druskos ir virkite apie 20 minučių, kol bulvės suminkštės.",
                    "Nupilkite vandenį ir sugrūskite bulves.",
                    "Kaitinkite pieną atskirame puodelyje, kol jis bus šiltas, bet ne verdantis.",
                    "Į bulves įdėkite sviestą, supilkite šiltą pieną ir gerai išmaišykite.",
                    "Įmaišykite grietinę, pagardinkite druska ir pipirais.",
                    "Patiekite karštą, papuoštą šviežiomis žalumynais."
                ],
                notes: "Galite pagardinti bulvių košę smulkintais svogūnlaiškiais arba krapais. Jei norite tirštos košės, pilkite mažiau pieno.",
                categories: ["Daržovės", "Bulvės", "Iš močiutės virtuvės"],
                tags: ["bulvės", "košė", "pagrindinis", "garnyras"],
                created_at: new Date().toISOString()
            },
            {
                id: "sample-recipe-2",
                title: "Šaltibarščiai",
                intro: "Gaivus, vasariškas burokėlių sriubos patiekalas, kuris yra vienas populiariausių lietuviškos virtuvės patiekalų karštomis vasaros dienomis.",
                image: null,
                prep_time: "20",
                cook_time: "0",
                servings: "4",
                ingredients: [
                    "500 g virtų burokėlių",
                    "1 l kefyro",
                    "1 agurkas",
                    "3 kiaušiniai",
                    "100 g svogūnlaiškių",
                    "100 g krapų",
                    "Druskos pagal skonį"
                ],
                steps: [
                    "Išvirkite kiaušinius (apie 8-10 min), atvėsinkite ir nulupkite.",
                    "Burokėlius sutarkuokite burokine tarka.",
                    "Agurką sutarkuokite ar supjaustykite mažais kubeliais.",
                    "Smulkiai supjaustykite svogūnlaiškius ir krapus.",
                    "Dubenyje sumaišykite burokėlius, agurkus, žalumynus.",
                    "Supilkite kefyrą, įberkite druskos, gerai išmaišykite.",
                    "Prieš patiekimą palaikykite šaldytuve bent 30 minučių.",
                    "Patiekite su virtais kiaušiniais ir karštomis bulvėmis."
                ],
                notes: "Galite pagardinti šaltibarščius grietine. Jei mėgstate rūgštesnį skonį, įspauskite šiek tiek citrinos sulčių.",
                categories: ["Sriubos", "Gamta lėkštėje", "Iš močiutės virtuvės"],
                tags: ["šalta sriuba", "burokėliai", "vasara", "gaiva"],
                created_at: new Date().toISOString()
            },
            {
                id: "sample-recipe-3",
                title: "Varškėčiai su uogiene",
                intro: "Purus ir minkšti varškėčiai – tradicinis lietuviškas patiekalas, kurį galima patiekti tiek pusryčiams, tiek desertui.",
                image: null,
                prep_time: "15",
                cook_time: "15",
                servings: "4",
                ingredients: [
                    "500 g varškės",
                    "2 kiaušiniai",
                    "3-4 šaukštai miltų",
                    "2 šaukštai cukraus",
                    "Žiupsnelis druskos",
                    "Šaukštelis vanilinio cukraus",
                    "Aliejaus kepimui",
                    "Grietinės patiekimui",
                    "Uogienės patiekimui"
                ],
                steps: [
                    "Varškę pertrinkite per sietelį arba sutrinkite šakute.",
                    "Įmuškite kiaušinius, įberkite cukrų, vanilinį cukrų, druską ir gerai išmaišykite.",
                    "Pamažu įmaišykite miltus, kol gausite lipnią, bet formuojamą tešlą.",
                    "Jei tešla per skysta, įdėkite dar šiek tiek miltų.",
                    "Šlapiomis rankomis formuokite nedidelius paplotėlius.",
                    "Keptuvėje įkaitinkite aliejų ir kepkite varškėčius iš abiejų pusių, kol gražiai paruduos.",
                    "Patiekite su grietine ir uogiene."
                ],
                notes: "Galite į tešlą įmaišyti razinų arba patiekti su šviežiomis uogomis.",
                categories: ["Varškė", "Desertai", "Iš močiutės virtuvės"],
                tags: ["varškė", "desertas", "pusryčiai", "saldumynai"],
                created_at: new Date().toISOString()
            }
        ];
        
        // If recipeId matches one of our samples, return it
        const matchingSample = sampleRecipes.find(r => r.id === recipeId);
        if (matchingSample) {
            return matchingSample;
        }
        
        // If there's no match but recipeId contains "sample", return the first one
        if (recipeId.includes("sample")) {
            return sampleRecipes[0];
        }
        
        // Otherwise, return null
        return null;
    }
    
    /**
     * Show error message when recipe cannot be loaded
     */
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
                        <h2>Receptas nerastas</h2>
                        <p>${errorMessage}</p>
                        <p>Nepavyko rasti recepto. Galimos priežastys:</p>
                        <ul style="text-align: left; max-width: 500px; margin: 20px auto;">
                            <li>Receptas gali būti ištrintas</li>
                            <li>Recepto ID gali būti neteisingas</li>
                            <li>Gali būti laikina serverio klaida</li>
                        </ul>
                        <p style="margin-top: 20px;">Bandykite apžiūrėti recepto sąrašą pagrindiniame puslapyje.</p>
                        <button onclick="showPage('home-page')" style="padding: 10px 20px; background-color: #7f4937; color: white; border: none; cursor: pointer; margin-top: 20px; border-radius: 4px;">Grįžti į pagrindinį puslapį</button>
                    </div>
                </div>
                ${sidebarHtml ? `<aside class="sidebar">${sidebarHtml}</aside>` : ''}
            </div>
            ${footerHtml}
        `;
        
        // Setup navigation handlers
        setupNavigationHandlers(container);
    }
    
    /**
     * Display recipe content
     */
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
                        `<img src="/img/recipes/${recipe.image}" alt="${recipe.title}" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'500\\' height=\\'300\\' viewBox=\\'0 0 500 300\\'><rect fill=\\'%23f8f5f1\\' width=\\'500\\' height=\\'300\\'/><text fill=\\'%237f4937\\' font-family=\\'sans-serif\\' font-size=\\'30\\' opacity=\\'0.5\\' x=\\'50%\\' y=\\'50%\\' text-anchor=\\'middle\\'>${recipe.title}</text></svg>';">` : 
                        `<div class="placeholder-image" style="background-color: #f8f5f1; height: 400px; display: flex; align-items: center; justify-content: center; color: #7f4937; font-style: italic;">
                            <div style="text-align: center;">
                                <div style="font-size: 18px;">Nuotrauka nepateikta</div>
                                <div style="font-size: 14px; margin-top: 10px;">${recipe.title}</div>
                            </div>
                        </div>`}
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
    
    /**
     * Setup recipe page event handlers
     */
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
    
    /**
     * Setup dropdown menus
     */
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
    
    /**
     * Setup navigation handlers
     */
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
    
    /**
     * Fix recipe link handling
     */
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
    
    /**
     * Format date helper
     */
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
    
    /**
     * Email validation helper
     */
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    /**
     * Debugging function to list all recipes
     */
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
    
    /**
     * Initialize when DOM is loaded
     */
    document.addEventListener('DOMContentLoaded', function() {
        // Create recipe page if needed
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
        
        console.log('Recipe Core initialized successfully');
        console.log('Use debugListAllRecipes() to see all available recipes');
    });
})();