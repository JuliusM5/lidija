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
    
    // Fetch category data from server
    fetch(`api/categories.php?name=${encodeURIComponent(categoryName)}`)
        .then(response => response.json())
        .then(categoryData => {
            updateCategoryPageContent(categoryPage, categoryName, categoryData);
        })
        .catch(error => {
            console.error('Error loading category data:', error);
            contentMain.innerHTML = `
                <div class="error-message">
                    <h2>Klaida!</h2>
                    <p>Nepavyko užkrauti kategorijos: ${categoryName}</p>
                    <p>Prašome bandyti vėliau.</p>
                </div>
            `;
        });
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
function updateCategoryPageContent(categoryPage, categoryName, categoryData) {
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
        <h1 class="category-title">${categoryData.title || categoryName}</h1>
        <p class="category-description">${categoryData.description || ''}</p>
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
    
    // Check if we have recipes
    if (!categoryData.recipes || categoryData.recipes.length === 0) {
        recipeGrid.innerHTML = '<p class="no-recipes">Šioje kategorijoje receptų nerasta.</p>';
        return;
    }
    
    // Add recipes to the grid
    categoryData.recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        
        // Create card content
        const cardContent = document.createElement('a');
        cardContent.href = `recipe.php?id=${recipe.id}`;
        cardContent.onclick = function(e) {
            e.preventDefault();
            loadRecipe(recipe.id);
            showPage('recipe-page');
            return false;
        };
        
        // Create image container
        const cardImageContainer = document.createElement('div');
        cardImageContainer.className = 'recipe-card-image';
        
        // Create image element
        const imgElement = document.createElement('img');
        imgElement.src = recipe.image ? `img/recipes/${recipe.image}` : 'img/recipe-placeholder.jpg';
        imgElement.alt = recipe.title;
        cardImageContainer.appendChild(imgElement);
        
        // Create title element
        const cardTitle = document.createElement('div');
        cardTitle.className = 'recipe-card-title';
        cardTitle.textContent = recipe.title.toUpperCase();
        
        // Assemble card
        cardContent.appendChild(cardImageContainer);
        cardContent.appendChild(cardTitle);
        recipeCard.appendChild(cardContent);
        
        // Add to grid
        recipeGrid.appendChild(recipeCard);
    });
    
    // Add or update load more button
    let loadMoreContainer = contentMain.querySelector('.load-more-container');
    if (!loadMoreContainer) {
        loadMoreContainer = document.createElement('div');
        loadMoreContainer.className = 'load-more-container';
        contentMain.appendChild(loadMoreContainer);
    }
    
    if (categoryData.hasMore) {
        loadMoreContainer.innerHTML = `
            <a href="#" class="load-more-button">DAUGIAU RECEPTŲ</a>
        `;
        
        // Add event listener to load more button
        const loadMoreButton = loadMoreContainer.querySelector('.load-more-button');
        if (loadMoreButton) {
            loadMoreButton.addEventListener('click', function(e) {
                e.preventDefault();
                loadMoreRecipes(categoryName, categoryData.page + 1);
            });
        }
    } else {
        loadMoreContainer.innerHTML = '';
    }
}

// Function to load more recipes for the current category
function loadMoreRecipes(categoryName, page) {
    fetch(`api/categories.php?name=${encodeURIComponent(categoryName)}&page=${page}`)
        .then(response => response.json())
        .then(moreData => {
            // Get recipe grid
            const recipeGrid = document.querySelector('#category-page .recipe-grid');
            if (!recipeGrid) return;
            
            // Add new recipes to the grid
            moreData.recipes.forEach(recipe => {
                const recipeCard = document.createElement('div');
                recipeCard.className = 'recipe-card';
                
                // Create card content
                const cardContent = document.createElement('a');
                cardContent.href = `recipe.php?id=${recipe.id}`;
                cardContent.onclick = function(e) {
                    e.preventDefault();
                    loadRecipe(recipe.id);
                    showPage('recipe-page');
                    return false;
                };
                
                // Create image container
                const cardImageContainer = document.createElement('div');
                cardImageContainer.className = 'recipe-card-image';
                
                // Create image element
                const imgElement = document.createElement('img');
                imgElement.src = recipe.image ? `img/recipes/${recipe.image}` : 'img/recipe-placeholder.jpg';
                imgElement.alt = recipe.title;
                cardImageContainer.appendChild(imgElement);
                
                // Create title element
                const cardTitle = document.createElement('div');
                cardTitle.className = 'recipe-card-title';
                cardTitle.textContent = recipe.title.toUpperCase();
                
                // Assemble card
                cardContent.appendChild(cardImageContainer);
                cardContent.appendChild(cardTitle);
                recipeCard.appendChild(cardContent);
                
                // Add to grid
                recipeGrid.appendChild(recipeCard);
            });
            
            // Update load more button
            const loadMoreContainer = document.querySelector('#category-page .load-more-container');
            if (loadMoreContainer) {
                if (moreData.hasMore) {
                    loadMoreContainer.innerHTML = `
                        <a href="#" class="load-more-button">DAUGIAU RECEPTŲ</a>
                    `;
                    
                    // Add event listener to the new load more button
                    const loadMoreButton = loadMoreContainer.querySelector('.load-more-button');
                    if (loadMoreButton) {loadMoreButton.addEventListener('click', function(e) {
                            e.preventDefault();
                            loadMoreRecipes(categoryName, moreData.page + 1);
                        });
                    }
                } else {
                    loadMoreContainer.innerHTML = '';
                }
            }
        })
        .catch(error => {
            console.error('Error loading more recipes:', error);
            const loadMoreContainer = document.querySelector('#category-page .load-more-container');
            if (loadMoreContainer) {
                loadMoreContainer.innerHTML = `
                    <p class="error-message">Klaida kraunant daugiau receptų. Prašome bandyti vėliau.</p>
                `;
            }
        });
}

// Function to load recipe page content
function loadRecipePage() {
    console.log('Loading recipe page content');
    
    // Get recipe ID from URL if available
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');
    
    if (!recipeId) {
        console.error('Recipe ID not provided');
        return;
    }
    
    const recipePage = document.getElementById('recipe-page');
    if (!recipePage) {
        console.error('Recipe page element not found');
        return;
    }
    
    // Check if the page is already loaded with the correct recipe
    if (recipePage.dataset.recipeId === recipeId) {
        console.log('Recipe already loaded');
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
    contentMain.innerHTML = '<div class="loading">Kraunama...</div>';
    
    // Fetch recipe data
    fetch(`api/recipes.php?id=${recipeId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load recipe');
            }
            return response.json();
        })
        .then(recipeData => {
            // Update content with recipe data
            contentMain.innerHTML = generateRecipeHTML(recipeData);
            
            // Mark the page with the loaded recipe ID
            recipePage.dataset.recipeId = recipeId;
            
            // Set up event listeners on the new elements
            setupRecipePageEventListeners(recipePage);
            
            console.log('Recipe page loaded successfully');
        })
        .catch(error => {
            console.error('Error loading recipe:', error);
            contentMain.innerHTML = `
                <div class="error-message">
                    <h2>Klaida!</h2>
                    <p>Nepavyko užkrauti recepto.</p>
                    <p>Prašome bandyti vėliau.</p>
                </div>
            `;
        });
    
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
}

// Function to generate recipe HTML from data
function generateRecipeHTML(recipe) {
    // Format date
    const date = new Date(recipe.created_at);
    const formattedDate = `${date.toLocaleDateString('lt-LT', { month: 'long', day: 'numeric', year: 'numeric' })}`;
    
    // Generate categories HTML
    const categoriesHTML = recipe.categories.map(category => 
        `<a href="#" onclick="showPage('category-page'); loadCategory('${category}'); return false;">${category}</a>`
    ).join(' • ');
    
    // Generate tags HTML
    const tagsHTML = recipe.tags.map(tag => 
        `<a href="#" onclick="showPage('category-page'); loadCategory('${tag}'); return false;">&#8203;#${tag}</a>`
    ).join(' ');
    
    // Generate ingredients HTML
    const ingredientsHTML = recipe.ingredients.map(ingredient => 
        `<li>${ingredient}</li>`
    ).join('');
    
    // Generate steps HTML
    const stepsHTML = recipe.steps.map(step => 
        `<li>${step}</li>`
    ).join('');
    
    // Generate comments HTML
    let commentsHTML = '';
    if (recipe.comments && recipe.comments.length > 0) {
        commentsHTML = recipe.comments.map(comment => {
            let replyHTML = '';
            if (comment.replies && comment.replies.length > 0) {
                replyHTML = comment.replies.map(reply => {
                    return `
                        <div class="comment-reply">
                            <div class="comment">
                                <div class="comment-header">
                                    <img src="${reply.author_image || 'img/default-avatar.jpg'}" alt="${reply.author}" class="comment-avatar">
                                    <div class="comment-info">
                                        <div class="comment-author">${reply.author}</div>
                                        <div class="comment-date">${new Date(reply.created_at).toLocaleDateString('lt-LT', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                                    </div>
                                </div>
                                <div class="comment-content">
                                    <p>${reply.content}</p>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
            
            return `
                <div class="comment">
                    <div class="comment-header">
                        <img src="${comment.author_image || 'img/default-avatar.jpg'}" alt="${comment.author}" class="comment-avatar">
                        <div class="comment-info">
                            <div class="comment-author">${comment.author}</div>
                            <div class="comment-date">${new Date(comment.created_at).toLocaleDateString('lt-LT', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                        </div>
                    </div>
                    <div class="comment-content">
                        <p>${comment.content}</p>
                    </div>
                    <a href="#" class="comment-reply-link">Atsakyti</a>
                    ${replyHTML}
                </div>
            `;
        }).join('');
    } else {
        commentsHTML = '<p>Komentarų dar nėra. Būk pirmas!</p>';
    }
    
    // Create full HTML
    return `
        <div class="recipe-main">
            <div class="recipe-header">
                <h1 class="recipe-title">${recipe.title}</h1>
                <div class="recipe-meta">
                    <span>${formattedDate}</span>
                    <span>•</span>
                    <span>${categoriesHTML}</span>
                </div>
            </div>
            
            <div class="recipe-image">
                <img src="${recipe.image ? `img/recipes/${recipe.image}` : 'img/recipe-placeholder.jpg'}" alt="${recipe.title}">
            </div>
            
            <p class="recipe-intro">${recipe.intro}</p>
            
            <div class="recipe-content">
                ${recipe.content || ''}
                
                <div class="recipe-box">
                    <h3>${recipe.title}</h3>
                    
                    <div class="recipe-time">
                        <div class="recipe-time-item">
                            <span class="time-label">Paruošimas</span>
                            <span class="time-value">${recipe.prep_time} min</span>
                        </div>
                        <div class="recipe-time-item">
                            <span class="time-label">Gaminimas</span>
                            <span class="time-value">${recipe.cook_time} min</span>
                        </div>
                        <div class="recipe-time-item">
                            <span class="time-label">Porcijos</span>
                            <span class="time-value">${recipe.servings}</span>
                        </div>
                    </div>
                    
                    <h4>Ingredientai</h4>
                    <ul>
                        ${ingredientsHTML}
                    </ul>
                    
                    <h4>Gaminimo būdas</h4>
                    <ol>
                        ${stepsHTML}
                    </ol>
                    
                    ${recipe.notes ? `<h4>Pastabos</h4><p>${recipe.notes}</p>` : ''}
                </div>
            </div>
            
            <div class="recipe-footer">
                <div class="recipe-tags">
                    ${tagsHTML}
                </div>
                <div class="recipe-share">
                    <span>Dalintis:</span>
                    <a href="https://facebook.com/share?url=${encodeURIComponent(window.location.href)}" target="_blank"><i class="fa fa-facebook"></i></a>
                    <a href="https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&media=${encodeURIComponent(recipe.image ? window.location.origin + '/img/recipes/' + recipe.image : '')}&description=${encodeURIComponent(recipe.title)}" target="_blank"><i class="fa fa-pinterest"></i></a>
                    <a href="mailto:?subject=${encodeURIComponent(recipe.title)}&body=${encodeURIComponent(window.location.href)}" target="_blank"><i class="fa fa-envelope"></i></a>
                </div>
            </div>
        </div>
        
        <!-- Comments Section -->
        <div class="comments-section">
            <h3 class="comments-title">Komentarai (${recipe.comments ? recipe.comments.length : 0})</h3>
            
            ${commentsHTML}
            
            <!-- Comment Form -->
            <div class="comment-form">
                <h3 class="comment-form-title">Palikite komentarą</h3>
                <form id="recipe-comment-form" data-recipe-id="${recipe.id}">
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
}

// Function to set up event listeners on the recipe page
function setupRecipePageEventListeners(recipePage) {
    // Set up comment form submissions
    const commentForm = recipePage.querySelector('#recipe-comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const recipeId = this.getAttribute('data-recipe-id');
            const nameInput = this.querySelector('#name');
            const emailInput = this.querySelector('#email');
            const commentInput = this.querySelector('#comment');
            
            if (nameInput && nameInput.value && 
                emailInput && emailInput.value && isValidEmail(emailInput.value) && 
                commentInput && commentInput.value) {
                
                // Submit comment to server
                const formData = new FormData();
                formData.append('recipe_id', recipeId);
                formData.append('author', nameInput.value);
                formData.append('email', emailInput.value);
                formData.append('content', commentInput.value);
                
                fetch('api/comments.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Ačiū už komentarą! Jis bus paskelbtas po peržiūros.');
                        nameInput.value = '';
                        emailInput.value = '';
                        commentInput.value = '';
                    } else {
                        alert('Klaida siunčiant komentarą: ' + data.error);
                    }
                })
                .catch(error => {
                    console.error('Error posting comment:', error);
                    alert('Klaida siunčiant komentarą. Prašome bandyti vėliau.');
                });
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
            const recipeId = recipePage.dataset.recipeId;
            const commentId = comment.dataset.commentId; // Need to add data-comment-id to comments
            
            replyForm = document.createElement('div');
            replyForm.className = 'reply-form';
            replyForm.innerHTML = `
                <form class="comment-form" data-recipe-id="${recipeId}" data-parent-id="${commentId}">
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
                const recipeId = this.getAttribute('data-recipe-id');
                const parentId = this.getAttribute('data-parent-id');
                const nameInput = this.querySelector('#reply-name');
                const emailInput = this.querySelector('#reply-email');
                const commentInput = this.querySelector('#reply-comment');
                
                if (nameInput && nameInput.value && 
                    emailInput && emailInput.value && isValidEmail(emailInput.value) && 
                    commentInput && commentInput.value) {
                    
                    // Submit reply to server
                    const formData = new FormData();
                    formData.append('recipe_id', recipeId);
                    formData.append('parent_id', parentId);
                    formData.append('author', nameInput.value);
                    formData.append('email', emailInput.value);
                    formData.append('content', commentInput.value);
                    
                    fetch('api/comments.php', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert('Ačiū už komentarą! Jis bus paskelbtas po peržiūros.');
                            replyForm.style.display = 'none';
                        } else {
                            alert('Klaida siunčiant komentarą: ' + data.error);
                        }
                    })
                    .catch(error => {
                        console.error('Error posting reply:', error);
                        alert('Klaida siunčiant komentarą. Prašome bandyti vėliau.');
                    });
                } else {
                    alert('Prašome užpildyti visus būtinus laukus teisingai.');
                }
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

// Helper function to validate email
function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Check for URL parameters on page load
function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const recipeId = urlParams.get('id');
    
    if (recipeId) {
        // If there's a recipe ID, load that recipe
        loadRecipe(recipeId);
        showPage('recipe-page');
    } else if (category) {
        // If there's a category parameter, load that category
        loadCategory(category);
    }
}

// Function to load a specific recipe by ID
function loadRecipe(recipeId) {
    // Redirect to the recipe page with the recipe ID as a parameter
    // This will be handled by the loadRecipePage function
    recipePage = document.getElementById('recipe-page');
    if (recipePage) {
        recipePage.dataset.recipeId = recipeId;
    }
    showPage('recipe-page');
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
    
    // Check for URL parameters
    checkUrlParameters();
});