// Category Debug and Fix Script for Admin Panel
// Add this file after your other scripts in admin.html

(function() {
    console.log('Category Debug and Fix script loaded');
    
    // Monitor form submissions to check category handling
    document.addEventListener('DOMContentLoaded', function() {
        setupCategoryDebugging();
    });
    
    function setupCategoryDebugging() {
        // Debug category selection in the add/edit recipe forms
        const forms = document.querySelectorAll('#page-add-recipe form, #page-edit-recipe form');
        
        forms.forEach(form => {
            // Find all category checkboxes
            const categoryCheckboxes = form.querySelectorAll('.category-checkbox input[type="checkbox"]');
            
            // Add change event listeners to log selection
            categoryCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    console.log(`Category ${this.value} ${this.checked ? 'selected' : 'unselected'}`);
                    updateSelectedCategoriesDisplay(form);
                });
            });
            
            // Add form submission debugging
            form.addEventListener('submit', function(e) {
                // This won't actually capture the submission since it's done via button click handler,
                // but it will give us a hook if the form is ever submitted directly
                console.log('Form submitted directly - debugging categories:');
                debugCategoryData(form);
            });
        });
        
        // Override the saveRecipe and updateRecipe functions to debug category handling
        hookSaveAndUpdateFunctions();
        
        // Add a visual display for selected categories
        addCategoryDisplayToForms();
    }
    
    function hookSaveAndUpdateFunctions() {
        // Hook into saveRecipe function
        const originalSaveRecipe = window.saveRecipe;
        window.saveRecipe = function() {
            console.log('Intercepted saveRecipe call - debugging categories:');
            const form = document.querySelector('#page-add-recipe form');
            debugCategoryData(form);
            
            // Fix category data if needed
            fixCategoryData(form);
            
            // Call original function
            return originalSaveRecipe ? originalSaveRecipe() : undefined;
        };
        
        // Hook into updateRecipe function
        const originalUpdateRecipe = window.updateRecipe;
        window.updateRecipe = function() {
            console.log('Intercepted updateRecipe call - debugging categories:');
            const form = document.querySelector('#page-edit-recipe form');
            debugCategoryData(form);
            
            // Fix category data if needed
            fixCategoryData(form);
            
            // Call original function
            return originalUpdateRecipe ? originalUpdateRecipe() : undefined;
        };
    }
    
    function debugCategoryData(form) {
        if (!form) {
            console.warn('Form not found for category debugging');
            return;
        }
        
        // Get all selected categories
        const selectedCategories = [];
        form.querySelectorAll('.category-checkbox input[type="checkbox"]:checked').forEach(checkbox => {
            selectedCategories.push(checkbox.value);
        });
        
        console.log('Selected categories:', selectedCategories);
        
        // Check if FormData will include these categories
        const formData = new FormData(form);
        console.log('Categories in FormData:', formData.getAll('categories[]'));
        
        return {
            selectedCategories,
            formDataCategories: formData.getAll('categories[]')
        };
    }
    
    function fixCategoryData(form) {
        if (!form) return;
        
        // Check if we have a categories[] with no values in FormData
        const formData = new FormData(form);
        const categoriesInFormData = formData.getAll('categories[]');
        
        if (categoriesInFormData.length === 0) {
            console.warn('No categories found in FormData, applying fix...');
            
            // Get selected checkboxes
            const selectedCheckboxes = form.querySelectorAll('.category-checkbox input[type="checkbox"]:checked');
            
            if (selectedCheckboxes.length > 0) {
                console.log(`Found ${selectedCheckboxes.length} selected checkboxes that weren't in FormData`);
                
                // Fix: If no selected checkboxes are in FormData, we may need to ensure they have proper name attribute
                selectedCheckboxes.forEach(checkbox => {
                    if (checkbox.name !== 'categories[]') {
                        console.log(`Fixing checkbox name: ${checkbox.name} -> categories[]`);
                        checkbox.name = 'categories[]';
                    }
                });
            }
        }
    }
    
    function addCategoryDisplayToForms() {
        // Add a visual element to show selected categories for debugging
        const forms = document.querySelectorAll('#page-add-recipe form, #page-edit-recipe form');
        
        forms.forEach(form => {
            // Create a display element for selected categories
            const categoryContainer = form.querySelector('.categories-container');
            if (!categoryContainer) return;
            
            // Add a selected categories display
            const selectedCategoriesDisplay = document.createElement('div');
            selectedCategoriesDisplay.className = 'selected-categories-display';
            selectedCategoriesDisplay.style.marginTop = '10px';
            selectedCategoriesDisplay.style.padding = '10px';
            selectedCategoriesDisplay.style.backgroundColor = '#f9f9f9';
            selectedCategoriesDisplay.style.borderRadius = '4px';
            selectedCategoriesDisplay.style.border = '1px solid #ddd';
            selectedCategoriesDisplay.innerHTML = '<strong>Pasirinktos kategorijos:</strong> <span class="categories-list">Nepasirinkta</span>';
            
            // Add after the categories container
            categoryContainer.parentNode.insertBefore(selectedCategoriesDisplay, categoryContainer.nextSibling);
            
            // Update the display initially
            updateSelectedCategoriesDisplay(form);
        });
    }
    
    function updateSelectedCategoriesDisplay(form) {
        if (!form) return;
        
        const display = form.querySelector('.selected-categories-display .categories-list');
        if (!display) return;
        
        // Get all selected categories
        const selectedCategories = [];
        form.querySelectorAll('.category-checkbox input[type="checkbox"]:checked').forEach(checkbox => {
            selectedCategories.push(checkbox.value);
        });
        
        // Update display
        if (selectedCategories.length > 0) {
            display.textContent = selectedCategories.join(', ');
            display.style.color = '#333';
        } else {
            display.textContent = 'Nepasirinkta';
            display.style.color = '#999';
        }
    }
    
    // Add a form submission interceptor for debugging
    document.addEventListener('click', function(event) {
        // Check if this is a save recipe button
        if (event.target.matches('.submit-button') && 
            (event.target.textContent.includes('Išsaugoti receptą') || 
             event.target.textContent.includes('Atnaujinti receptą'))) {
            
            // Determine which form we're working with
            const formId = event.target.textContent.includes('Atnaujinti receptą') ? 
                '#page-edit-recipe form' : '#page-add-recipe form';
            
            const form = document.querySelector(formId);
            if (form) {
                console.log('Recipe submission clicked - final category data:');
                const categoryData = debugCategoryData(form);
                
                // If no categories in FormData but checkboxes are selected, we have a problem
                if (categoryData.formDataCategories.length === 0 && categoryData.selectedCategories.length > 0) {
                    console.warn('Category data mismatch detected! Applying emergency fix...');
                    
                    // Create hidden inputs for each selected category as a backup method
                    categoryData.selectedCategories.forEach(category => {
                        const hiddenInput = document.createElement('input');
                        hiddenInput.type = 'hidden';
                        hiddenInput.name = 'categories[]';
                        hiddenInput.value = category;
                        hiddenInput.className = 'emergency-category-fix';
                        form.appendChild(hiddenInput);
                    });
                    
                    console.log('Emergency fix applied - added hidden inputs for categories');
                }
            }
        }
    }, true); // Use capture to ensure this runs before the button handler
    
    // Run an initial check for the active forms
    setTimeout(function() {
        console.log('Running initial category check:');
        const addForm = document.querySelector('#page-add-recipe form');
        if (addForm) {
            console.log('Add recipe form:');
            debugCategoryData(addForm);
        }
        
        const editForm = document.querySelector('#page-edit-recipe form');
        if (editForm) {
            console.log('Edit recipe form:');
            debugCategoryData(editForm);
        }
    }, 1000);
})();