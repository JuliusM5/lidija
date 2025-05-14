/**
 * Enhanced Main JavaScript - Consolidated Core Functionality
 * 
 * This file combines functionality from:
 * - main.js (original)
 * - index-recipe-display-fix.js
 * 
 * Features:
 * - Core UI initialization
 * - Dropdown menu handling
 * - Placeholder handling
 * - Recipe loading and display on index page
 * - Mobile menu setup
 * - Smooth scrolling
 */

// Initialize app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
    
    // Check for placeholder images and replace with actual placeholders
    replacePlaceholders();
    
    // Initialize index recipe display if on home page
    initIndexRecipeDisplay();
});

// Main initialization function
function initApp() {
    console.log('Šaukštas Meilės - Application initialized');
    
    // Enable dropdown menu functionality for mobile
    setupMobileMenu();
    
    // Add smooth scrolling to all links
    setupSmoothScrolling();
    
    // Initialize enhanced dropdowns
    enhanceDropdownMenus();
}

// =====================================================
// MOBILE MENU & NAVIGATION
// =====================================================

// Function to handle mobile menu
function setupMobileMenu() {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    
    function handleMobileMenu() {
        if (mediaQuery.matches) {
            // Create mobile menu toggle if it doesn't exist
            if (!document.querySelector('.mobile-menu-toggle')) {
                const nav = document.querySelector('nav');
                if (nav) {
                    const toggle = document.createElement('button');
                    toggle.className = 'mobile-menu-toggle';
                    toggle.innerHTML = '<i class="fa fa-bars"></i>';
                    toggle.setAttribute('aria-label', 'Toggle menu');
                    
                    toggle.addEventListener('click', function() {
                        nav.classList.toggle('active');
                    });
                    
                    const header = document.querySelector('header');
                    if (header) {
                        header.insertBefore(toggle, nav);
                    }
                }
            }
        }
    }
    
    // Initial call
    handleMobileMenu();
    
    // Setup listener for screen size changes
    mediaQuery.addEventListener('change', handleMobileMenu);
}

// Function to set up smooth scrolling
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            // Only apply to links that point to an ID on the page
            const href = this.getAttribute('href');
            if (href.length > 1) { // Skip '#' links
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// Function to enhance dropdown menus
function enhanceDropdownMenus() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
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
            }, 50);
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
            // Prevent default only if it's the direct dropdown parent
            if (link.parentNode === dropdown && link.getAttribute('href') === '#') {
                e.preventDefault();
                
                // Toggle the display
                if (content.style.display === 'block') {
                    content.style.display = 'none';
                } else {
                    content.style.display = 'block';
                }
            }
        });
    });
}

// =====================================================
// PLACEHOLDER HANDLING
// =====================================================

// Function to create a styled placeholder that matches the website design
function createPlaceholderElement(width, height, text, isRound = false) {
    // Create a div element instead of using an external image
    const placeholder = document.createElement('div');
    placeholder.className = 'local-placeholder';
    
    // Set dimensions
    placeholder.style.width = width + 'px';
    placeholder.style.height = height + 'px';
    
    // Set border radius if round
    if (isRound) {
        placeholder.style.borderRadius = '50%';
    }
    
    // Base styling to match the website
    placeholder.style.backgroundColor = '#f8f5f1';
    placeholder.style.display = 'flex';
    placeholder.style.alignItems = 'center';
    placeholder.style.justifyContent = 'center';
    placeholder.style.textAlign = 'center';
    placeholder.style.padding = '10px';
    placeholder.style.boxSizing = 'border-box';
    placeholder.style.fontFamily = '"Source Sans Pro", sans-serif';
    placeholder.style.overflow = 'hidden';
    placeholder.style.fontSize = '12px';
    placeholder.style.wordBreak = 'break-word';
    placeholder.style.color = '#7f4937';
    placeholder.style.border = '1px solid #e6ddd6';
    
    // Create an inner span for the text to have better styling control
    const textSpan = document.createElement('span');
    
    // Format the text to look like a HEX code
    textSpan.textContent = text || '#f8f5f1';
    textSpan.style.opacity = '0.7';
    textSpan.style.fontSize = width < 150 ? '10px' : '12px';
    
    placeholder.appendChild(textSpan);
    
    return placeholder;
}

// Function to replace placeholder image paths with actual placeholders
function replacePlaceholders() {
    // First handle images with src starting with img/placeholders/
    const placeholderImages = document.querySelectorAll('img[src^="img/placeholders/"]');
    
    placeholderImages.forEach(img => {
        // Extract filename from path
        const filename = img.src.split('/').pop();
        
        // Set dimensions based on image type and class
        let width, height, isRound = false;
        
        if (img.classList.contains('popular-post-img')) {
            width = 60;
            height = 60;
            isRound = true; // Popular posts are round
        } else if (img.classList.contains('about-me-img')) {
            width = 120;
            height = 120;
            isRound = true;
        } else if (img.parentElement && img.parentElement.classList.contains('latest-post-image')) {
            width = 200;
            height = 200;
        } else if (filename.startsWith('recipe')) {
            width = 500;
            height = 500;
        } else if (filename.startsWith('popular')) {
            width = 60;
            height = 60;
            isRound = true;
        } else if (filename.startsWith('profile')) {
            width = 200;
            height = 200;
            isRound = true;
        } else {
            width = 200;
            height = 200;
        }
        
        // Try to load actual images
        img.addEventListener('error', function() {
            // Image failed to load, replace with local placeholder div
            const placeholder = createPlaceholderElement(width, height, '#f8f5f1', isRound);
            
            // Add the same classes as the image to maintain styling
            if (this.className) {
                placeholder.className += ' ' + this.className;
            }
            
            if (this.parentNode) {
                this.parentNode.replaceChild(placeholder, this);
            }
        });
        
        // Force error if image is already broken
        if (img.complete && img.naturalWidth === 0) {
            img.dispatchEvent(new Event('error'));
        }
    });
    
    // Also handle any API placeholders (if present)
    const apiPlaceholders = document.querySelectorAll('img[src^="/api/placeholder/"]');
    
    apiPlaceholders.forEach(img => {
        const src = img.getAttribute('src');
        const dimensions = src.match(/\/(\d+)\/(\d+)/);
        
        if (dimensions && dimensions.length === 3) {
            const width = dimensions[1];
            const height = dimensions[2];
            
            // Replace with placeholder div
            const placeholder = createPlaceholderElement(width, height, '#f8f5f1');
            if (img.className) {
                placeholder.className += ' ' + img.className;
            }
            
            img.parentNode.replaceChild(placeholder, img);
        }
    });
}

// =====================================================
// INDEX RECIPE DISPLAY
// =====================================================

// Function to initialize recipe display on index page
function initIndexRecipeDisplay() {
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
                                addRecipeCard(recipeGrid, recipe);
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
}

// Function to load recipes from server
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

// Function to display recipes on the index page
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
        addRecipeCard(recipeGrid, recipe);
    });
    
    // Show load more button if there are more recipes
    const loadMoreContainer = document.querySelector('.load-more-container');
    if (loadMoreContainer) {
        loadMoreContainer.style.display = recipes.length >= 12 ? 'block' : 'none';
    }
    
    // Update latest recipes section
    updateLatestRecipes(recipes.slice(0, 3));
}

// Function to add a recipe card to grid
function addRecipeCard(container, recipe) {
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
    container.appendChild(recipeCard);
}

// Display empty message when no recipes found
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

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

// Function to handle recipe searching
function searchRecipes(query) {
    console.log(`Searching for: ${query}`);
    // This would be implemented with actual search functionality
    alert(`Paieška bus įdiegta netrukus! Jūs ieškojote: ${query}`);
    return false;
}

// Show notification if function exists
function showNotification(title, message, type = 'success') {
    // Use a flag to prevent recursive calls
    if (window._isShowingNotification) {
        console.warn("Preventing recursive showNotification call");
        return;
    }
    
    window._isShowingNotification = true;
    
    const notification = document.getElementById('notification');
    if (!notification) {
        window._isShowingNotification = false;
        return;
    }
    
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
            window._isShowingNotification = false;
        }, 5000);
    } else {
        window._isShowingNotification = false;
    }
}

// Make key functions available globally
window.searchRecipes = searchRecipes;
window.loadRecipes = loadRecipes;