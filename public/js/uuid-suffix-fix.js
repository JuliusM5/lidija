/**
 * Recipe ID Format Fix (uuid-suffix-fix.js)
 * 
 * This script resolves the issue where recipes with suffixed IDs work in admin panel
 * but fail to load on the frontend. The problem occurs because recipe IDs in the admin
 * have a format like "4cbcfd2a-324e-479c-a034-292322134796-xnm3" but the API only 
 * recognizes the UUID part "4cbcfd2a-324e-479c-a034-292322134796".
 * 
 * Place this file in your /public/js/ directory and include it in index.html
 * after your other script tags but before the closing </body> tag:
 * 
 * <script src="js/uuid-suffix-fix.js"></script>
 */

(function() {
  console.log('Recipe ID Format Fix: Loaded');
  
  // Store original functions we'll be enhancing
  const originalLoadRecipePage = window.loadRecipePage;
  const originalShowPage = window.showPage;
  
  /**
   * Format recipe ID to extract just the UUID part
   * Fixes IDs like "4cbcfd2a-324e-479c-a034-292322134796-xnm3" -> "4cbcfd2a-324e-479c-a034-292322134796"
   */
  function formatRecipeId(id) {
    if (!id) return id;
    
    // Standard UUID has 5 sections with dashes
    const parts = id.split('-');
    if (parts.length > 5) {
      console.log('Formatting recipe ID:', id, '→', parts.slice(0, 5).join('-'));
      return parts.slice(0, 5).join('-');
    }
    
    return id;
  }
  
  /**
   * Enhanced showPage function that can handle recipe IDs
   */
  window.showPage = function(pageId, extraData) {
    console.log(`Showing page: ${pageId}`, extraData ? `with data: ${extraData}` : '');
    
    // Call original function first
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
      }
    }
    
    // If showing recipe page and we have recipe ID, load it
    if (pageId === 'recipe-page' && extraData) {
      window.loadRecipePage(extraData);
    }
  };
  
  /**
   * Enhanced recipe loading function that handles ID formatting
   */
  window.loadRecipePage = function(recipeId) {
    console.log('Enhanced loadRecipePage called with ID:', recipeId);
    
    // If no ID provided, check URL
    if (!recipeId) {
      const urlParams = new URLSearchParams(window.location.search);
      recipeId = urlParams.get('id');
      if (recipeId) {
        console.log('Found recipe ID in URL:', recipeId);
      } else {
        console.error('No recipe ID provided');
        return;
      }
    }
    
    // Format the ID to extract just the UUID part
    const formattedId = formatRecipeId(recipeId);
    
    // Make sure we have a recipe page
    const recipePage = document.getElementById('recipe-page');
    if (!recipePage) {
      console.error('Recipe page not found');
      return;
    }
    
    // Show loading indicator
    recipePage.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; min-height: 400px;">
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
    
    // Try to load recipe using multiple endpoints
    tryMultipleEndpoints(formattedId)
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
        showRecipeError(recipePage, error.message);
      });
  };
  
  /**
   * Try multiple endpoints to find the recipe
   */
  async function tryMultipleEndpoints(recipeId) {
    // Define endpoints to try in order of preference
    const endpoints = [
      `/api/recipes/${recipeId}`,
      `/api/recipe/${recipeId}`,
      `/admin-api/recipes/${recipeId}`,
      `/recipes/${recipeId}.json`
    ];
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    // Try each endpoint
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        
        const response = await fetch(endpoint, { headers });
        
        if (response.ok) {
          const data = await response.json();
          
          // Check for valid recipe data
          if (data.success && data.data) {
            console.log('Successfully loaded recipe from:', endpoint);
            return data.data;
          } else if (data.title) {
            // Direct recipe object without wrapper
            console.log('Found direct recipe data from:', endpoint);
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
    
    // If we get here, all endpoints failed
    return null;
  }
  
  /**
   * Show recipe error message
   */
  function showRecipeError(container, message) {
    // Try to get header and footer from home page
    const homePage = document.getElementById('home-page');
    let headerHtml = '';
    let footerHtml = '';
    
    if (homePage) {
      const header = homePage.querySelector('header');
      const footer = homePage.querySelector('footer');
      
      if (header) headerHtml = header.outerHTML;
      if (footer) footerHtml = footer.outerHTML;
    }
    
    container.innerHTML = `
      ${headerHtml}
      <div class="container main-content">
        <div class="content-main">
          <div class="error-message" style="text-align: center; padding: 40px;">
            <h2>Recipe Not Found</h2>
            <p>${message}</p>
            <p>This could be due to an ID format issue or the recipe may not exist.</p>
            <button onclick="showPage('home-page')" 
              style="padding: 10px 20px; background-color: #7f4937; color: white; 
                    border: none; cursor: pointer; margin-top: 20px; border-radius: 4px;">
              Return to Home
            </button>
          </div>
        </div>
      </div>
      ${footerHtml}
    `;
  }
  
  /**
   * Display recipe content
   */
  function displayRecipe(container, recipe) {
    // Get layout elements from home page
    const homePage = document.getElementById('home-page');
    if (!homePage) {
      console.error('Home page not found, cannot get layout elements');
      // Create basic recipe display without layout
      createBasicRecipeDisplay(container, recipe);
      return;
    }
    
    const header = homePage.querySelector('header');
    const footer = homePage.querySelector('footer');
    const sidebar = homePage.querySelector('.sidebar');
    
    if (!header || !footer) {
      console.error('Required layout elements not found');
      // Create basic recipe display without layout
      createBasicRecipeDisplay(container, recipe);
      return;
    }
    
    // Format recipe content HTML
    const recipeContent = `
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
            `<img src="/img/recipes/${recipe.image}" alt="${recipe.title}" onerror="this.onerror=null; this.src='img/placeholders/recipe-placeholder.jpg';">` : 
            '<div class="placeholder-image" style="background-color: #f8f5f1; height: 400px; display: flex; align-items: center; justify-content: center; color: #7f4937; font-style: italic;">No image available</div>'}
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
        ${sidebar ? `<aside class="sidebar">${sidebar.innerHTML}</aside>` : ''}
      </div>
      ${footer.outerHTML}
    `;
    
    // Setup event handlers
    setupRecipePage(container);
  }
  
  /**
   * Create a basic recipe display without full layout
   */
  function createBasicRecipeDisplay(container, recipe) {
    container.innerHTML = `
      <div class="recipe-main" style="padding: 20px;">
        <h1 class="recipe-title" style="margin-bottom: 20px;">${recipe.title || 'Untitled Recipe'}</h1>
        
        <div class="recipe-content">
          ${recipe.image ? 
            `<div class="recipe-image">
              <img src="/img/recipes/${recipe.image}" alt="${recipe.title}" 
                   style="max-width: 100%; height: auto; margin-bottom: 20px;">
            </div>` : ''}
          
          <div class="recipe-description" style="margin-bottom: 20px;">
            ${recipe.intro || ''}
          </div>
          
          <div class="recipe-info" style="display: flex; margin-bottom: 20px;">
            <div style="margin-right: 20px;">
              <strong>Prep:</strong> ${recipe.prep_time || '0'} min
            </div>
            <div style="margin-right: 20px;">
              <strong>Cook:</strong> ${recipe.cook_time || '0'} min
            </div>
            <div>
              <strong>Servings:</strong> ${recipe.servings || '1'}
            </div>
          </div>
          
          <div class="recipe-ingredients" style="margin-bottom: 20px;">
            <h3>Ingredients</h3>
            <ul>
              ${recipe.ingredients && recipe.ingredients.length > 0 ? 
                recipe.ingredients.map(ingredient => 
                  `<li>${ingredient}</li>`
                ).join('') : 
                '<li>No ingredients listed</li>'}
            </ul>
          </div>
          
          <div class="recipe-steps" style="margin-bottom: 20px;">
            <h3>Instructions</h3>
            <ol>
              ${recipe.steps && recipe.steps.length > 0 ? 
                recipe.steps.map(step => 
                  `<li>${step}</li>`
                ).join('') : 
                '<li>No instructions listed</li>'}
            </ol>
          </div>
          
          ${recipe.notes ? 
            `<div class="recipe-notes" style="margin-bottom: 20px;">
              <h3>Notes</h3>
              <p>${recipe.notes}</p>
            </div>` : ''}
            
          <div style="margin-top: 20px;">
            <button onclick="showPage('home-page')" 
              style="padding: 10px 20px; background-color: #7f4937; color: white; 
                    border: none; cursor: pointer; border-radius: 4px;">
              Return to Home
            </button>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Setup event handlers for the recipe page
   */
  function setupRecipePage(container) {
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
    
    // Setup navigation handlers
    setupNavigationHandlers(container);
  }
  
  /**
   * Setup navigation handlers
   */
  function setupNavigationHandlers(container) {
    const navLinks = container.querySelectorAll('a');
    
    navLinks.forEach(link => {
      // Skip links that already have handlers
      if (link.getAttribute('onclick')) return;
      
      const href = link.getAttribute('href');
      if (!href) return;
      
      // Fix recipe links
      if (href.includes('recipe.html') || href.includes('/recipe/')) {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          
          let recipeId = null;
          if (href.includes('?id=')) {
            recipeId = href.split('?id=')[1].split('&')[0];
          } else if (href.includes('/recipe/')) {
            recipeId = href.split('/recipe/')[1].split('/')[0];
          }
          
          if (recipeId) {
            console.log('Loading recipe from link:', recipeId);
            window.showPage('recipe-page', formatRecipeId(recipeId));
          } else {
            window.location.href = href;
          }
        });
      }
      // Handle page navigation
      else if (href === '#' || href.startsWith('#')) {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          
          if (href === '#') return;
          
          const pageId = href.substring(1);
          if (typeof window.showPage === 'function') {
            window.showPage(pageId);
          }
        });
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
   * Initialize when DOM is loaded
   */
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Recipe ID Format Fix: Initializing...');
    
    // Check for recipe ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');
    
    if (recipeId) {
      console.log('Found recipe ID in URL, loading recipe:', recipeId);
      // Format the ID and load the recipe
      if (typeof window.showPage === 'function') {
        window.showPage('recipe-page', formatRecipeId(recipeId));
      } else {
        console.warn('showPage function not found');
        window.loadRecipePage(formatRecipeId(recipeId));
      }
    }
    
    // Find all recipe links and enhance them
    document.querySelectorAll('a[href*="recipe"]').forEach(link => {
      const href = link.getAttribute('href');
      
      if (href && (href.includes('recipe.html') || href.includes('/recipe/'))) {
        link.addEventListener('click', function(e) {
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
            // Format the ID and load the recipe
            const formattedId = formatRecipeId(recipeId);
            if (typeof window.showPage === 'function') {
              window.showPage('recipe-page', formattedId);
            } else {
              console.warn('showPage function not found');
              window.loadRecipePage(formattedId);
            }
          } else {
            console.warn('Could not extract recipe ID from link');
            window.location.href = href;
          }
        });
      }
    });
    
    console.log('Recipe ID Format Fix: Ready');
  });
})();