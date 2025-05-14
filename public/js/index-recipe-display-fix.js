// Recipe Display Fix for Index Page
// This script helps ensure recipes are loaded and displayed correctly on the main page

(function() {
    // Function to load recipes from the server
    function loadRecipes() {
        console.log('Loading recipes from server...');
        
        // Make a request to the API
        fetch('/api/recipes?limit=12')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load recipes: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success && data.recipes) {
                    console.log(`Loaded ${data.recipes.length} recipes from server`);
                    displayRecipes(data.recipes);
                } else {
                    console.error('No recipes found in response:', data);
                    displayEmptyMessage();
                }
            })
            .catch(error => {
                console.error('Error loading recipes:', error);
                displayErrorMessage(error.message);
            });
    }
    
    // Function to display recipes on the page
    function displayRecipes(recipes) {
        // Find the recipe grid container
        const recipeGrid = document.querySelector('.recipe-grid');
        if (!recipeGrid) {
            console.error('Recipe grid container not found');
            return;
        }
        
        if (recipes.length === 0) {
            displayEmptyMessage();
            return;
        }
        
        // Clear existing content
        recipeGrid.innerHTML = '';
        
        // Create recipe cards
        recipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'recipe-card';
            
            const recipeLink = document.createElement('a');
            
            // If recipe has a slug, use it, otherwise use ID
            const recipeUrl = recipe.slug 
                ? `/recipe/${recipe.slug}` 
                : `/recipe.html?id=${recipe.id}`;
                
            recipeLink.href = recipeUrl;
            
            // Create image container
            const imageContainer = document.createElement('div');
            imageContainer.className = 'recipe-card-image';
            
            // Add image or placeholder
            const imgSrc = recipe.image 
                ? `/img/recipes/${recipe.image}` 
                : `img/placeholders/recipe-placeholder.jpg`;
            
            imageContainer.innerHTML = `<img src="${imgSrc}" alt="${recipe.title}" loading="lazy">`;
            
            // Create title
            const titleContainer = document.createElement('div');
            titleContainer.className = 'recipe-card-title';
            titleContainer.textContent = recipe.title.toUpperCase();
            
            // Assemble card
            recipeLink.appendChild(imageContainer);
            recipeLink.appendChild(titleContainer);
            recipeCard.appendChild(recipeLink);
            
            // Add card to grid
            recipeGrid.appendChild(recipeCard);
        });
        
        // Show load more button if there are more recipes
        const loadMoreContainer = document.querySelector('.load-more-container');
        if (loadMoreContainer) {
            loadMoreContainer.style.display = recipes.length >= 12 ? 'block' : 'none';
        }
        
        // Update latest recipes section
        updateLatestRecipes(recipes.slice(0, 3));
    }
    
    // Update the latest recipes section
    function updateLatestRecipes(latestRecipes) {
        const latestContainer = document.querySelector('.latest-post');
        if (!latestContainer) return;
        
        latestContainer.innerHTML = '';
        
        latestRecipes.forEach(recipe => {
            const latestPost = document.createElement('div');
            latestPost.className = 'latest-post-item';
            
            const imgSrc = recipe.image 
                ? `/img/recipes/${recipe.image}` 
                : `img/placeholders/recipe-placeholder.jpg`;
            
            latestPost.innerHTML = `
                <div class="latest-post-image">
                    <a href="/recipe.html?id=${recipe.id}">
                        <img src="${imgSrc}" alt="${recipe.title}" loading="lazy">
                    </a>
                </div>
                <div class="latest-post-content">
                    <h3><a href="/recipe.html?id=${recipe.id}">${recipe.title}</a></h3>
                    <p>${recipe.intro ? recipe.intro.substring(0, 100) + '...' : ''}</p>
                </div>
            `;
            
            latestContainer.appendChild(latestPost);
        });
    }
    
    // Display empty message
    function displayEmptyMessage() {
        const recipeGrid = document.querySelector('.recipe-grid');
        if (!recipeGrid) return;
        
        recipeGrid.innerHTML = `
            <div class="empty-message" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #7f4937;">
                <h3>Dar nėra receptų</h3>
                <p>Greitai čia atsiras gardžių receptų!</p>
            </div>
        `;
        
        // Hide load more button
        const loadMoreContainer = document.querySelector('.load-more-container');
        if (loadMoreContainer) {
            loadMoreContainer.style.display = 'none';
        }
    }
    
    // Display error message
    function displayErrorMessage(message) {
        const recipeGrid = document.querySelector('.recipe-grid');
        if (!recipeGrid) return;
        
        recipeGrid.innerHTML = `
            <div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #cc5555;">
                <h3>Klaida įkeliant receptus</h3>
                <p>${message}</p>
                <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 15px; background-color: #7f4937; color: white; border: none; cursor: pointer; border-radius: 4px;">Bandyti dar kartą</button>
            </div>
        `;
    }
    
    // Update category counts in the sidebar
    function updateCategoryCounts() {
        // Fetch categories with counts
        fetch('/api/categories')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.categories) {
                    // Update counts in the sidebar
                    data.categories.forEach(category => {
                        const countElement = document.querySelector(`.categories-list a[onclick*="${category.name}"] .category-count`);
                        if (countElement) {
                            countElement.textContent = category.count;
                        }
                    });
                }
            })
            .catch(error => {
                console.error('Error loading categories:', error);
            });
    }
    
    // Function to load popular recipes
    function loadPopularRecipes() {
        fetch('/api/recipes?popular=1&limit=5')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.recipes) {
                    updatePopularRecipes(data.recipes);
                }
            })
            .catch(error => {
                console.error('Error loading popular recipes:', error);
            });
    }
    
    // Update popular recipes in sidebar
    function updatePopularRecipes(recipes) {
        const popularList = document.querySelector('.popular-posts-list');
        if (!popularList) return;
        
        popularList.innerHTML = '';
        
        if (recipes.length === 0) {
            popularList.innerHTML = '<li>Nėra populiarių receptų</li>';
            return;
        }
        
        recipes.forEach(recipe => {
            const listItem = document.createElement('li');
            
            const imgSrc = recipe.image 
                ? `/img/recipes/${recipe.image}` 
                : `img/placeholders/popular-placeholder.jpg`;
            
            listItem.innerHTML = `
                <div class="popular-post">
                    <div class="popular-post-img">
                        <a href="/recipe.html?id=${recipe.id}">
                            <img src="${imgSrc}" alt="${recipe.title}" loading="lazy">
                        </a>
                    </div>
                    <div class="popular-post-content">
                        <a href="/recipe.html?id=${recipe.id}">${recipe.title}</a>
                    </div>
                </div>
            `;
            
            popularList.appendChild(listItem);
        });
    }
    
    // Initialize - Load everything when the page loads
    if (document.getElementById('home-page')) {
        console.log('Home page detected, initializing recipe display');
        
        // Load recipes
        loadRecipes();
        
        // Update category counts
        updateCategoryCounts();
        
        // Load popular recipes
        loadPopularRecipes();
        
        // Add event listener for load more button
        const loadMoreButton = document.querySelector('.load-more-button');
        if (loadMoreButton) {
            let page = 1;
            
            loadMoreButton.addEventListener('click', function(e) {
                e.preventDefault();
                page++;
                
                // Load more recipes
                fetch(`/api/recipes?offset=${page * 12}&limit=12`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success && data.recipes && data.recipes.length > 0) {
                            // Add these recipes to the grid
                            const recipeGrid = document.querySelector('.recipe-grid');
                            
                            data.recipes.forEach(recipe => {
                                const recipeCard = document.createElement('div');
                                recipeCard.className = 'recipe-card';
                                
                                const recipeLink = document.createElement('a');
                                const recipeUrl = recipe.slug 
                                    ? `/recipe/${recipe.slug}` 
                                    : `/recipe.html?id=${recipe.id}`;
                                    
                                recipeLink.href = recipeUrl;
                                
                                const imageContainer = document.createElement('div');
                                imageContainer.className = 'recipe-card-image';
                                
                                const imgSrc = recipe.image 
                                    ? `/img/recipes/${recipe.image}` 
                                    : `img/placeholders/recipe-placeholder.jpg`;
                                
                                imageContainer.innerHTML = `<img src="${imgSrc}" alt="${recipe.title}" loading="lazy">`;
                                
                                const titleContainer = document.createElement('div');
                                titleContainer.className = 'recipe-card-title';
                                titleContainer.textContent = recipe.title.toUpperCase();
                                
                                recipeLink.appendChild(imageContainer);
                                recipeLink.appendChild(titleContainer);
                                recipeCard.appendChild(recipeLink);
                                
                                recipeGrid.appendChild(recipeCard);
                            });
                            
                            // Hide load more button if no more recipes
                            if (data.recipes.length < 12 || !data.hasMore) {
                                loadMoreButton.style.display = 'none';
                            }
                        } else {
                            // No more recipes
                            loadMoreButton.style.display = 'none';
                        }
                    })
                    .catch(error => {
                        console.error('Error loading more recipes:', error);
                        showNotification('Klaida', 'Nepavyko įkelti daugiau receptų', 'error');
                    });
            });
        }
    }
})();