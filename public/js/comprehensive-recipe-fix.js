// Comprehensive Recipe Fix
// This script fixes two main issues:
// 1. Recipe ID format discrepancy between admin and frontend
// 2. Categories not being saved properly

(function() {
  console.log('🔧 Comprehensive Recipe Fix loaded');
  
  // ========== RECIPE ID FORMAT FIX ==========
  
  // Match IDs with format like "8d2f25bb-d6aa-4499-89d9-aeb1fc951177-f5ai" and extract just UUID part
  function fixRecipeId(id) {
    if (!id) return id;
    
    // If ID has more than 5 dashes (standard UUID format has 4 dashes = 5 segments)
    const parts = id.split('-');
    if (parts.length > 5) {
      const uuidPart = parts.slice(0, 5).join('-');
      console.log(`📝 Fixing ID format: ${id} → ${uuidPart}`);
      return uuidPart;
    }
    
    return id;
  }
  
  // ========== RECIPE DATA FETCHING FIX ==========
  
  // Try multiple endpoints to find the recipe
  async function fetchRecipeFromMultipleEndpoints(recipeId) {
    // Always fix the ID format first
    const fixedId = fixRecipeId(recipeId);
    
    // Define endpoints to try
    const endpoints = [
      `/api/recipes/${fixedId}`,
      `/admin-api/recipes/${fixedId}`,
      `/api/recipes/${recipeId}`, // Try with original ID too, just in case
      `/admin-api/recipes/${recipeId}`,
      `/recipe/${fixedId}.json`
    ];
    
    // Get auth token if available
    const token = localStorage.getItem('token');
    const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    console.log(`🔍 Searching for recipe with ID: ${recipeId} (fixed: ${fixedId})`);
    
    // Try each endpoint
    for (const endpoint of endpoints) {
      try {
        console.log(`⏳ Trying endpoint: ${endpoint}`);
        
        const response = await fetch(endpoint, { 
          headers: authHeaders,
          // Add cache busting to avoid stale data
          cache: 'no-cache'
        });
        
        if (!response.ok) {
          console.log(`❌ Endpoint ${endpoint} returned status ${response.status}`);
          continue;
        }
        
        const data = await response.json();
        
        // Check for valid recipe data
        if (data.success && data.data) {
          console.log(`✅ Successfully loaded recipe from: ${endpoint}`);
          
          // Store the ID mapping for future reference
          if (recipeId !== fixedId) {
            try {
              const idMappings = JSON.parse(localStorage.getItem('recipeIdMappings') || '{}');
              idMappings[fixedId] = recipeId;
              localStorage.setItem('recipeIdMappings', JSON.stringify(idMappings));
            } catch (e) {
              console.error('Failed to store ID mapping:', e);
            }
          }
          
          return data.data;
        } else if (data.title) {
          // Direct recipe object
          console.log(`✅ Found direct recipe data from: ${endpoint}`);
          return data;
        }
      } catch (error) {
        console.warn(`❌ Failed to fetch from ${endpoint}:`, error.message);
        // Continue to next endpoint
      }
    }
    
    // If all endpoints failed, create a fallback recipe for development
    console.error(`❌ All endpoints failed for recipe ID: ${recipeId}`);
    
    // Check if we're in development mode
    const isDev = window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1';
                 
    if (isDev) {
      return createFallbackRecipe(recipeId);
    }
    
    return null;
  }
  
  // Create a fallback recipe for development purposes
  function createFallbackRecipe(recipeId) {
    console.log(`⚠️ Creating fallback recipe for development: ${recipeId}`);
    
    return {
      id: recipeId,
      title: "Demonstracinis receptas (Fallback)",
      intro: "Šis demonstracinis receptas sukurtas automatiškai, nes serveris negalėjo rasti recepto duomenų. ID formatas gali būti neteisingas.",
      image: null,
      prep_time: "15",
      cook_time: "30",
      servings: "4",
      categories: ["Demo"],
      tags: ["fallback", "demo"],
      ingredients: [
        "400 g miltų",
        "2 kiaušiniai",
        "200 ml pieno",
        "50 g sviesto",
        "Žiupsnelis druskos"
      ],
      steps: [
        "Šis receptas yra sugeneruotas automatiškai, nes tikrasis receptas nebuvo rastas.",
        "Problemos priežastis gali būti ID formato neatitikimas tarp admin panelės ir frontend.",
        "Galimi ID: " + recipeId,
        "Ištaisytas ID: " + fixRecipeId(recipeId)
      ],
      notes: "Ši žinutė rodoma, nes svetainėje yra problemų. Prašome pranešti administratoriui.",
      created_at: new Date().toISOString()
    };
  }
  
  // ========== CATEGORY SAVING FIX ==========
  
  // Override the updateRecipe function in admin panel
  if (typeof window.updateRecipeImplementation === 'function') {
    console.log('🔄 Enhancing updateRecipeImplementation function');
    
    const originalUpdateRecipeImplementation = window.updateRecipeImplementation;
    
    window.updateRecipeImplementation = async function() {
      console.log('🔄 Running enhanced updateRecipeImplementation with category fix');
      
      const editPage = document.getElementById('page-edit-recipe');
      if (!editPage) {
        console.error('❌ Edit page not found');
        return originalUpdateRecipeImplementation();
      }
      
      // Get key fields
      const titleInput = editPage.querySelector('#recipe-title');
      const idInput = editPage.querySelector('#recipe-id');
      
      if (!titleInput || !titleInput.value.trim() || !idInput || !idInput.value.trim()) {
        console.error('❌ Missing required fields');
        return originalUpdateRecipeImplementation();
      }
      
      const recipeId = idInput.value.trim();
      
      // Get categories - THIS IS THE CRITICAL PART
      const selectedCategories = [];
      editPage.querySelectorAll('.category-checkbox input[type="checkbox"]:checked').forEach(checkbox => {
        selectedCategories.push(checkbox.value);
      });
      
      console.log('📋 Selected categories:', selectedCategories);
      
      // Show loading notification
      showNotification('Informacija', 'Atnaujinamas receptas...', 'success');
      
      try {
        // Get token
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        // Step 1: Update the recipe normally using FormData
        const form = editPage.querySelector('form');
        const formData = new FormData(form);
        
        // Ensure categories[] are properly included
        // First remove any existing categories[] to avoid duplicates
        const existingCategories = [];
        for (const pair of formData.entries()) {
          if (pair[0] === 'categories[]') {
            existingCategories.push(pair[1]);
            formData.delete('categories[]');
          }
        }
        
        // Add categories in multiple formats to ensure they're picked up
        selectedCategories.forEach(category => {
          formData.append('categories[]', category);
        });
        
        // Add tags as JSON string
        const tags = [];
        editPage.querySelectorAll('#tags-container .tag-text').forEach(tag => {
          tags.push(tag.textContent);
        });
        formData.append('tags', JSON.stringify(tags));
        
        console.log('📤 Sending recipe update with categories');
        
        // Update recipe
        const response = await fetch(`/admin-api/recipes/${recipeId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Unknown error');
        }
        
        console.log('✅ Recipe updated successfully:', data);
        
        // Step 2: Check if categories were saved correctly
        if (data.data && (!data.data.categories || data.data.categories.length === 0) && selectedCategories.length > 0) {
          console.warn('⚠️ Categories were not saved properly, trying direct update');
          
          // Make a direct categories update
          try {
            // Try using JSON format
            const categoryResponse = await fetch(`/admin-api/recipes/${recipeId}/categories`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ categories: selectedCategories })
            });
            
            if (categoryResponse.ok) {
              const categoryData = await categoryResponse.json();
              console.log('✅ Categories directly updated:', categoryData);
            } else {
              throw new Error('Direct JSON update failed');
            }
          } catch (categoryError) {
            console.warn('⚠️ JSON category update failed, trying FormData');
            
            // Try with FormData as fallback
            try {
              const categoryFormData = new FormData();
              selectedCategories.forEach(cat => {
                categoryFormData.append('categories[]', cat);
              });
              
              const categoryResponse = await fetch(`/admin-api/recipes/${recipeId}/categories`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`
                },
                body: categoryFormData
              });
              
              if (categoryResponse.ok) {
                console.log('✅ Categories updated with FormData');
              } else {
                console.error('❌ Failed to update categories with FormData too');
              }
            } catch (formDataError) {
              console.error('❌ All category update methods failed');
            }
          }
        }
        
        showNotification('Sėkmė', 'Receptas atnaujintas sėkmingai!', 'success');
        
        // Navigate to recipes page after success
        setTimeout(() => {
          showAdminPage('recipes');
        }, 1500);
        
      } catch (error) {
        console.error('❌ Update recipe error:', error);
        showNotification('Klaida', `Klaida atnaujinant receptą: ${error.message}`, 'error');
      }
    };
    
    // Make sure updateRecipe function also uses our implementation
    window.updateRecipe = function() {
      window.updateRecipeImplementation();
    };
  }
  
  // ========== FRONTEND RECIPE LOADING FIX ==========
  
  // Override the recipe loading function on the frontend
  if (typeof window.loadRecipePage === 'function') {
    console.log('🔄 Enhancing loadRecipePage function');
    
    const originalLoadRecipePage = window.loadRecipePage;
    
    window.loadRecipePage = async function(recipeId) {
      console.log('📝 Enhanced loadRecipePage called with ID:', recipeId);
      
      // If no ID provided, check URL
      if (!recipeId) {
        const urlParams = new URLSearchParams(window.location.search);
        recipeId = urlParams.get('id');
        if (recipeId) {
          console.log('📝 Found recipe ID in URL:', recipeId);
        } else {
          console.error('❌ No recipe ID provided');
          showRecipeError('No recipe ID provided');
          return;
        }
      }
      
      // Make sure we have a recipe page
      let recipePage = document.getElementById('recipe-page');
      if (!recipePage) {
        console.log('Creating recipe page element');
        recipePage = document.createElement('div');
        recipePage.id = 'recipe-page';
        recipePage.className = 'page';
        document.body.appendChild(recipePage);
      }
      
      // Show the page
      const pages = document.querySelectorAll('.page');
      pages.forEach(page => {
        page.classList.remove('active');
      });
      recipePage.classList.add('active');
      
      // Show loading indicator
      showRecipeLoading(recipePage);
      
      // Try to fetch the recipe with our enhanced method
      try {
        const recipe = await fetchRecipeFromMultipleEndpoints(recipeId);
        
        if (recipe) {
          // Success! Display the recipe
          displayRecipe(recipePage, recipe);
        } else {
          throw new Error('Recipe not found');
        }
      } catch (error) {
        console.error('❌ Error loading recipe:', error);
        showRecipeError(error.message, recipePage);
      }
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
  function showRecipeError(message, container) {
    // Ensure we have a container
    if (!container) {
      container = document.getElementById('recipe-page');
      if (!container) {
        console.error('❌ Recipe page container not found');
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
      if (sidebar) sidebarHtml = sidebar.innerHTML;
    }
    
    // Create error message with layout
    container.innerHTML = `
      ${headerHtml}
      <div class="container main-content">
        <div class="content-main">
          <div class="error-message" style="text-align: center; padding: 40px;">
            <h2>Receptas nerastas</h2>
            <p>${message}</p>
            <p>Galimos priežastys:</p>
            <ul style="text-align: left; max-width: 500px; margin: 20px auto;">
              <li>Receptas neegzistuoja</li>
              <li>Recepto ID formatas yra neteisingas</li>
              <li>Serveris nepasiekiamas</li>
            </ul>
            <button onclick="showPage('home-page')" style="padding: 10px 20px; background-color: #7f4937; color: white; border: none; cursor: pointer; margin-top: 20px; border-radius: 4px;">Grįžti į pagrindinį puslapį</button>
          </div>
        </div>
        ${sidebarHtml ? `<aside class="sidebar">${sidebarHtml}</aside>` : ''}
      </div>
      ${footerHtml}
    `;
  }
  
  // Display recipe
  function displayRecipe(container, recipe) {
    // Get layout elements from home page
    const homePage = document.getElementById('home-page');
    if (!homePage) {
      console.error('❌ Home page not found, cannot get layout elements');
      return;
    }
    
    const header = homePage.querySelector('header');
    const footer = homePage.querySelector('footer');
    const sidebar = homePage.querySelector('.sidebar');
    
    if (!header || !footer || !sidebar) {
      console.error('❌ Required layout elements not found');
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
  
  // ========== RECIPE LINK INTERCEPTION ==========
  
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
        
        console.log('🔗 Intercepted recipe link click:', href);
        
        // Extract recipe ID
        let recipeId = null;
        
        if (href.includes('?id=')) {
          recipeId = href.split('?id=')[1].split('&')[0];
        } else if (href.includes('/recipe/')) {
          recipeId = href.split('/recipe/')[1].split('/')[0];
        }
        
        if (recipeId) {
          console.log('📝 Extracted recipe ID:', recipeId);
          
          // Show the recipe page with fixed ID
          if (typeof showPage === 'function') {
            showPage('recipe-page');
            loadRecipePage(recipeId);
          } else {
            // Fallback if showPage not available
            window.location.href = `recipe.html?id=${recipeId}`;
          }
        } else {
          console.warn('⚠️ Could not extract recipe ID from link');
          window.location.href = href;
        }
      }
    });
  }
  
  // ========== HELPER FUNCTIONS ==========
  
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
      console.warn('⚠️ Error formatting date:', error);
      return '';
    }
  }
  
  // Email validation helper
  function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
  
  // ========== INITIALIZATION ==========
  
  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Comprehensive Recipe Fix initializing...');
    
    // Fix recipe links
    fixRecipeLinks();
    
    // Check for recipe ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');
    
    if (recipeId) {
      console.log('📝 Found recipe ID in URL:', recipeId);
      
      // Show recipe page
      if (typeof showPage === 'function') {
        showPage('recipe-page');
      }
      
      // Load the recipe
      if (typeof loadRecipePage === 'function') {
        loadRecipePage(recipeId);
      }
    }
    
    console.log('✅ Comprehensive Recipe Fix initialized successfully');
  });
})();