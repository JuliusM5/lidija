/**
 * Navigation functionality for Šaukštas Meilės food blog
 */

// Function to handle page switching
function showPage(pageId) {
    console.log(`Showing page: ${pageId}`);
    
    // Handle "about-page" specially, since it's in a different file
    if (pageId === 'about-page') {
        window.location.href = 'about.html';
        return;
    }
    
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.add('active');
        // Scroll to top when changing pages
        window.scrollTo(0, 0);
        
        // If showing recipe page, load recipe content
        if (pageId === 'recipe-page') {
            loadRecipePage();
        }
        
        // If showing category page, prepare the structure
        if (pageId === 'category-page') {
            prepareCategoryPage();
        }
        
        // Close any open dropdowns
        closeAllDropdowns();
    } else {
        console.error(`Page with ID '${pageId}' not found`);
    }
}

// Function to close all dropdown menus
function closeAllDropdowns() {
    const dropdownContents = document.querySelectorAll('.dropdown-content');
    dropdownContents.forEach(dropdown => {
        dropdown.style.display = 'none';
    });
}

// Function to prepare the category page structure
function prepareCategoryPage() {
    let categoryPage = document.getElementById('category-page');
    
    // If category page doesn't exist, create it
    if (!categoryPage) {
        categoryPage = document.createElement('div');
        categoryPage.id = 'category-page';
        categoryPage.className = 'page';
        document.body.appendChild(categoryPage);
    }
    
    // If the page doesn't have the right structure, set it up
    if (!categoryPage.querySelector('.content-main')) {
        console.log('Setting up category page structure');
        
        // Copy header and footer from home page
        const homePage = document.getElementById('home-page');
        if (!homePage) {
            console.error('Home page not found');
            return;
        }
        
        // Create main content structure
        const header = homePage.querySelector('header').cloneNode(true);
        const footer = homePage.querySelector('footer').cloneNode(true);
        
        const mainContent = document.createElement('div');
        mainContent.className = 'container main-content';
        
        // Add content main
        const contentMain = document.createElement('div');
        contentMain.className = 'content-main';
        contentMain.innerHTML = `
            <div class="category-header">
                <h1 class="category-title"></h1>
                <p class="category-description"></p>
            </div>
            <div class="recipe-grid">
                <!-- Recipe cards will be loaded here -->
            </div>
            <div class="load-more-container">
                <a href="#" class="load-more-button">DAUGIAU RECEPTŲ</a>
            </div>
        `;
        
        // Add sidebar clone from home page
        const sidebar = homePage.querySelector('.sidebar').cloneNode(true);
        
        // Assemble the page
        mainContent.appendChild(contentMain);
        mainContent.appendChild(sidebar);
        
        // Clear the page and add our structure
        categoryPage.innerHTML = '';
        categoryPage.appendChild(header);
        categoryPage.appendChild(mainContent);
        categoryPage.appendChild(footer);
        
        // Set up the dropdown menu behavior for the newly created page
        setupDropdownMenus(categoryPage);
        setupNavigationHandlers(categoryPage);
        
        console.log('Category page structure prepared successfully');
    }
}

// Function to set up dropdown menu behavior
function setupDropdownMenus(container) {
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
                closeAllDropdowns(); // Close any other open dropdowns
                content.style.display = 'block';
            }
        });
        
        // Handle direct clicks on category links in the dropdown
        const categoryLinks = content.querySelectorAll('a');
        categoryLinks.forEach(catLink => {
            catLink.addEventListener('click', () => {
                // Close the dropdown after a category is selected
                setTimeout(() => {
                    content.style.display = 'none';
                }, 50);
            });
        });
    });
}

// Function to handle category loading
function loadCategory(categoryName) {
    console.log(`Loading category: ${categoryName}`);
    
    // Check if we're on the about page
    if (window.location.pathname.includes('about.html')) {
        // Redirect to index.html with the category parameter
        window.location.href = `index.html?category=${encodeURIComponent(categoryName)}`;
        return;
    }
    
    // First make sure we're on the category page
    const categoryPage = document.getElementById('category-page');
    if (!categoryPage) {
        // Create the category page if it doesn't exist
        createCategoryPage();
        // Try again after creation
        loadCategory(categoryName);
        return;
    }
    
    // Show the category page
    showPage('category-page');
    
    // Now make sure the page has the right structure
    if (!categoryPage.querySelector('.content-main')) {
        prepareCategoryPage();
    }
    
    // Close any open dropdown menus
    closeAllDropdowns();
    
    // Find the content-main container
    const contentMain = categoryPage.querySelector('.content-main');
    if (!contentMain) {
        console.error('Content main not found in category page');
        return;
    }
    
    // Update the category page content
    updateCategoryPageContent(categoryPage, categoryName);
    
    // Make sure any placeholders are properly loaded
    replacePlaceholders();
}

// Function to create a category page
function createCategoryPage() {
    console.log('Creating category page');
    
    const categoryPage = document.createElement('div');
    categoryPage.id = 'category-page';
    categoryPage.className = 'page';
    document.body.appendChild(categoryPage);
    
    return categoryPage;
}

// Function to update category page content
function updateCategoryPageContent(categoryPage, categoryName) {
    // Set up category descriptions
    const descriptions = {
        'Gėrimai ir kokteiliai': 'Gardūs, gaivūs ir įdomūs gėrimai bei kokteiliai kiekvienai progai.',
        'Desertai': 'Saldūs gardumynai, pyragai ir deserai jūsų malonumui.',
        'Sriubos': 'Šiltos, gaivios ir maistingos sriubos visais metų laikais.',
        'Užkandžiai': 'Greiti ir skanūs užkandžiai vakarėliams ar kasdieniam malonumui.',
        'Varškė': 'Įvairūs receptai su varške - nuo desertų iki pagrindinio patiekalo.',
        'Kiaušiniai': 'Kūrybiški ir gardūs patiekalai, kurių pagrindas - kiaušiniai.',
        'Daržovės': 'Gardūs ir sveiki daržovių patiekalai visiems metų laikams.',
        'Bulvės': 'Tradiciniai ir modernūs receptai su bulvėmis - lietuviška klasika.',
        'Mėsa': 'Gardūs ir sodrūs mėsos patiekalai šventėms ir kasdienai.',
        'Žuvis ir jūros gėrybės': 'Šviežios žuvies ir jūros gėrybių receptai jūsų stalui.',
        'Kruopos ir grūdai': 'Maistingi ir skanūs patiekalai iš įvairių kruopų ir grūdų.',
        'Be glitimo': 'Skanūs receptai tiems, kas vengia glitimo.',
        'Be laktozės': 'Gardūs patiekalai be laktozės.',
        'Gamta lėkštėje': 'Receptai su laukiniais augalais ir gamtos dovanomis.',
        'Iš močiutės virtuvės': 'Tradiciniai lietuviški receptai, perduodami iš kartos į kartą.',
        'Vasara': 'Vasaros skoniai ir kvapai jūsų virtuvėje.',
    };
    
    // Get content-main container
    const contentMain = categoryPage.querySelector('.content-main');
    if (!contentMain) {
        console.error('Content main not found in category page');
        return;
    }
    
    // Get or create category header
    let categoryHeader = contentMain.querySelector('.category-header');
    if (!categoryHeader) {
        categoryHeader = document.createElement('div');
        categoryHeader.className = 'category-header';
        contentMain.prepend(categoryHeader);
    }
    
    // Update header content
    categoryHeader.innerHTML = `
        <h1 class="category-title">${categoryName}</h1>
        <p class="category-description">${descriptions[categoryName] || `Atraskite mūsų receptų kolekciją kategorijoje "${categoryName}".`}</p>
    `;
    
    // Get or create recipe grid
    let recipeGrid = contentMain.querySelector('.recipe-grid');
    if (!recipeGrid) {
        recipeGrid = document.createElement('div');
        recipeGrid.className = 'recipe-grid';
        contentMain.appendChild(recipeGrid);
    } else {
        // Clear existing recipes
        recipeGrid.innerHTML = '';
    }
    
    // Define recipe titles for each category
   
    
    // Select recipe titles for this category or use default
    const titles = recipeTitles[categoryName] || recipeTitles['default'];
    
    // Generate a consistent number of recipes based on the category count in the sidebar
    const categoryCountElement = document.querySelector(`.categories-list a[onclick*="${categoryName}"] .category-count`);
    let recipesCount = 6; // Default count
    
    if (categoryCountElement) {
        const count = parseInt(categoryCountElement.textContent);
        if (!isNaN(count)) {
            recipesCount = Math.min(count, titles.length);
        }
    }
    
    // Add recipes to the grid
    for (let i = 0; i < recipesCount; i++) {
        const recipeIndex = i % titles.length;
        const recipeTitle = titles[recipeIndex];
        
        // Create recipe card
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        
        // Create card content
        const cardContent = document.createElement('a');
        cardContent.href = '#';
        cardContent.onclick = function() {
            showPage('recipe-page');
            return false;
        };
        
        // Create image container
        const cardImageContainer = document.createElement('div');
        cardImageContainer.className = 'recipe-card-image';
        
        // Create a placeholder for the image
        const placeholder = createPlaceholderElement(500, 500, recipeTitle);
        placeholder.style.width = '100%';
        placeholder.style.aspectRatio = '1/1';
        cardImageContainer.appendChild(placeholder);
        
        // Create title element
        const cardTitle = document.createElement('div');
        cardTitle.className = 'recipe-card-title';
        cardTitle.textContent = recipeTitle.toUpperCase();
        
        // Assemble card
        cardContent.appendChild(cardImageContainer);
        cardContent.appendChild(cardTitle);
        recipeCard.appendChild(cardContent);
        
        // Add to grid
        recipeGrid.appendChild(recipeCard);
    }
    
    // Add or update load more button
    let loadMoreContainer = contentMain.querySelector('.load-more-container');
    if (!loadMoreContainer) {
        loadMoreContainer = document.createElement('div');
        loadMoreContainer.className = 'load-more-container';
        contentMain.appendChild(loadMoreContainer);
    }
    
    loadMoreContainer.innerHTML = `
        <a href="#" class="load-more-button">DAUGIAU RECEPTŲ</a>
    `;
    
    // Add event listener to load more button
    const loadMoreButton = loadMoreContainer.querySelector('.load-more-button');
    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', function(e) {
            e.preventDefault();
            alert(`Daugiau "${categoryName}" receptų bus įkelta netrukus!`);
        });
    }
}

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
    placeholder.style.wordBreak = 'break-word';
    placeholder.style.color = '#7f4937';
    placeholder.style.border = '1px solid #e6ddd6';
    
    // Create an inner span for the text to have better styling control
    const textSpan = document.createElement('span');
    
    // Format the text
    textSpan.textContent = text || '#f8f5f1';
    textSpan.style.opacity = '0.7';
    textSpan.style.fontSize = width < 150 ? '10px' : '12px';
    
    placeholder.appendChild(textSpan);
    
    return placeholder;
}

// Function to load recipe page content
function loadRecipePage() {
    console.log('Loading recipe page content');
    
    const recipePage = document.getElementById('recipe-page');
    if (!recipePage) {
        console.error('Recipe page element not found');
        return;
    }
    
    // Check if the page is already loaded
    if (recipePage.querySelector('.recipe-main')) {
        console.log('Recipe page already loaded');
        return;
    }
    
    // Clone header from home page
    const homePage = document.getElementById('home-page');
    if (!homePage) {
        console.error('Home page not found');
        return;
    }
    
    const header = homePage.querySelector('header').cloneNode(true);
    
    // Create the recipe page layout
    const mainContent = document.createElement('div');
    mainContent.className = 'container main-content';
    
    // Add content main
    const contentMain = document.createElement('div');
    contentMain.className = 'content-main';
    
    // Try to load the recipe template from the server
    fetch('pages/recipe-template.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load recipe template');
            }
            return response.text();
        })
        .then(html => {
            contentMain.innerHTML = html;
            
            // Replace any placeholders with local placeholders
            replaceExternalPlaceholders(contentMain);
            
            // Create sidebar
            const sidebar = homePage.querySelector('.sidebar').cloneNode(true);
            mainContent.appendChild(contentMain);
            mainContent.appendChild(sidebar);
            
            // Add footer clone
            const footer = homePage.querySelector('footer').cloneNode(true);
            
            // Clear page and add elements
            recipePage.innerHTML = '';
            recipePage.appendChild(header);
            recipePage.appendChild(mainContent);
            recipePage.appendChild(footer);
            
            // Set up dropdown menus
            setupDropdownMenus(recipePage);
            
            // Set up event listeners on the new elements
            setupRecipePageEventListeners(recipePage);
            
            console.log('Recipe page loaded successfully');
        })
        .catch(error => {
            console.error('Error loading recipe template:', error);
            // Fallback content if fetch fails
            contentMain.innerHTML = createFallbackRecipeContent();
            
            // Create sidebar
            const sidebar = homePage.querySelector('.sidebar').cloneNode(true);
            mainContent.appendChild(contentMain);
            mainContent.appendChild(sidebar);
            
            // Add footer clone
            const footer = homePage.querySelector('footer').cloneNode(true);
            
            // Clear page and add elements
            recipePage.innerHTML = '';
            recipePage.appendChild(header);
            recipePage.appendChild(mainContent);
            recipePage.appendChild(footer);
            
            // Set up dropdown menus
            setupDropdownMenus(recipePage);
            
            // Set up event listeners
            setupRecipePageEventListeners(recipePage);
        });
}

// Function to set up event listeners on the recipe page
function setupRecipePageEventListeners(recipePage) {
    // Set up comment form submissions
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
    
    // Set up reply links
    const replyLinks = recipePage.querySelectorAll('.comment-reply-link');
    replyLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const comment = this.closest('.comment');
            let replyForm = comment.querySelector('.reply-form');
            
            // If reply form already exists, toggle its visibility
            if (replyForm) {
                replyForm.style.display = replyForm.style.display === 'none' ? 'block' : 'none';
                return;
            }
            
            // Otherwise, create a new reply form
            replyForm = document.createElement('div');
            replyForm.className = 'reply-form';
            replyForm.innerHTML = `
                <form class="comment-form">
                    <h4>Atsakyti į komentarą</h4>
                    <div class="form-group">
                        <label for="reply-name">Vardas</label>
                        <input type="text" id="reply-name" name="name" class="form-control" required autocomplete="name">
                    </div>
                    <div class="form-group">
                        <label for="reply-email">El. paštas (nebus skelbiamas)</label>
                        <input type="email" id="reply-email" name="email" class="form-control" required autocomplete="email">
                    </div>
                    <div class="form-group">
                        <label for="reply-comment">Komentaras</label>
                        <textarea id="reply-comment" name="comment" class="form-control" required></textarea>
                    </div>
                    <button type="submit" class="submit-button">Atsakyti</button>
                    <button type="button" class="cancel-button">Atšaukti</button>
                </form>
            `;
            
            // Insert the form
            comment.appendChild(replyForm);
            
            // Add submit handler
            const form = replyForm.querySelector('form');
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                alert('Ačiū už komentarą! Jis bus paskelbtas po peržiūros.');
                replyForm.style.display = 'none';
            });
            
            // Add cancel handler
            const cancelButton = replyForm.querySelector('.cancel-button');
            cancelButton.addEventListener('click', function() {
                replyForm.style.display = 'none';
            });
        });
    });
    
    // Set up category links
    const categoryLinks = recipePage.querySelectorAll('.recipe-tags a, .recipe-meta a');
    categoryLinks.forEach(link => {
        // Check if onclick already set
        if (!link.getAttribute('onclick')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const categoryName = this.textContent.replace('#', '');
                showPage('category-page');
                loadCategory(categoryName);
            });
        }
    });
}

// Function to replace any external placeholder images with local placeholders
function replaceExternalPlaceholders(container) {
    const images = container.querySelectorAll('img');
    images.forEach(img => {
        const src = img.getAttribute('src');
        if (src && (src.includes('placeholder.com') || src.includes('via.placeholder.com'))) {
            // Extract dimensions from placeholder URL
            let width = 500;
            let height = 300;
            const text = img.alt || '';
            
            // Try to extract dimensions from src
            const dimensionsMatch = src.match(/(\d+)x(\d+)/);
            if (dimensionsMatch && dimensionsMatch.length === 3) {
                width = parseInt(dimensionsMatch[1]);
                height = parseInt(dimensionsMatch[2]);
            }
            
            // Create local placeholder
            const placeholder = createPlaceholderElement(width, height, text);
            placeholder.style.width = '100%';
            
            // Replace image with placeholder
            if (img.parentNode) {
                img.parentNode.replaceChild(placeholder, img);
            }
        }
    });
}

// Function to replace placeholder images
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
        
        // Extract alt text
        const altText = img.alt || filename;
        
        // Try to load actual images
        img.addEventListener('error', function() {
            // Image failed to load, replace with local placeholder div
            const placeholder = createPlaceholderElement(width, height, altText, isRound);
            
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
            const altText = img.alt || '';
            
            // Replace with placeholder div
            const placeholder = createPlaceholderElement(width, height, altText);
            if (img.className) {
                placeholder.className += ' ' + img.className;
            }
            
            img.parentNode.replaceChild(placeholder, img);
        }
    });
}

// Helper function to validate email
function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// 

// Function to set up navigation handlers
function setupNavigationHandlers(container = document) {
    // Initialize event listeners for navigation links
    const navLinks = container.querySelectorAll('nav a:not(.dropdown > a), .dropdown-content a');
    navLinks.forEach(link => {
        if (link.hasAttribute('onclick')) {
            // Skip links with onclick already set
            return;
        }
        
        link.addEventListener('click', function(e) {
            // Handle special cases
            if (this.textContent.trim() === 'APIE MANE' || this.getAttribute('href') === 'about.html') {
                // Don't prevent default, let it navigate to about.html
                return;
            }
            
            const href = this.getAttribute('href');
            if (href === '#') {
                // Dropdown parent link, do nothing
                return;
            }
            
            e.preventDefault(); // Prevent default for non-about links
            
            if (href && href.startsWith('#')) {
                const pageId = href.substring(1);
                showPage(pageId);
            } else if (href) {
                window.location.href = href;
            }
        });
    });
}

// Check for URL parameters on page load
function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    if (category) {
        // If there's a category parameter, load that category
        loadCategory(category);
    }
}

// Execute on page load
document.addEventListener('DOMContentLoaded', function() {
    // Find the About Me link in the navigation
    const aboutLinks = document.querySelectorAll('a[onclick*="alert(\'Apie mane puslapis ruošiamas\')"]');
    
    // Update the links to use the About page
    aboutLinks.forEach(link => {
        link.removeAttribute('onclick');
        link.setAttribute('href', 'about.html');
    });
    
    // Set up the dropdown menus
    setupDropdownMenus(document);
    
    // Set up navigation handlers
    setupNavigationHandlers();
    
    // Check for and replace any placeholder images
    replacePlaceholders();
    
    // Check for URL parameters
    checkUrlParameters();
});
