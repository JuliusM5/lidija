// Form Reset Fix for Admin Panel
// Place this file after recipe-editor-fix.js in your admin.html

(function() {
    console.log('Form Reset Fix loaded - Ensuring form is cleared when adding new recipe');
    
    // Override the original saveRecipe function to clear the form after saving
    const originalSaveRecipe = window.saveRecipe;
    
    window.saveRecipe = function() {
        // Call the original save function
        if (originalSaveRecipe) {
            originalSaveRecipe();
            
            // After a successful save, we'll handle form cleaning in the appropriate callback
            // Instead of modifying the original save function further, we'll set up a direct
            // event listener to clear the form when the page changes
        }
    };
    
    // Add a direct reset handler after a new recipe is saved
    document.addEventListener('DOMContentLoaded', function() {
        // Find all "Pridėti naują" buttons that navigate to the add-recipe page
        const addNewButtons = document.querySelectorAll('a[onclick*="showAdminPage(\'add-recipe\')"]');
        
        addNewButtons.forEach(button => {
            // Clone the button
            const newButton = button.cloneNode(true);
            
            // Replace the original button with our new one
            button.parentNode.replaceChild(newButton, button);
            
            // Add our custom handler
            newButton.addEventListener('click', function(e) {
                // Allow the default onclick to execute first
                setTimeout(function() {
                    // Then clear the form
                    resetAddRecipeForm();
                }, 100);
            });
        });
        
        // Clear the form on initial page load
        setTimeout(resetAddRecipeForm, 500);
    });
    
    // Function to reset the add recipe form
    function resetAddRecipeForm() {
        console.log('Resetting add recipe form...');
        const addPage = document.getElementById('page-add-recipe');
        if (!addPage) {
            console.warn('Add recipe page not found');
            return;
        }
        
        try {
            // Reset basic form fields
            const form = addPage.querySelector('form');
            if (form) {
                form.reset();
            }
            
            // Clear text inputs manually
            const textInputs = [
                'recipe-title', 'recipe-intro', 'recipe-notes'
            ];
            textInputs.forEach(id => {
                const field = addPage.querySelector(`#${id}`);
                if (field) {
                    field.value = '';
                }
            });
            
            // Clear number inputs
            const numberInputs = ['prep-time', 'cook-time', 'servings'];
            numberInputs.forEach(id => {
                const field = addPage.querySelector(`#${id}`);
                if (field) {
                    field.value = '';
                }
            });
            
            // Set status back to draft
            const statusField = addPage.querySelector('#recipe-status');
            if (statusField) {
                statusField.value = 'draft';
            }
            
            // Reset ingredient list
            const ingredientList = addPage.querySelector('#ingredient-list');
            if (ingredientList) {
                // Keep only one empty ingredient
                ingredientList.innerHTML = `
                    <div class="ingredient-item">
                        <input type="text" name="ingredients[]" class="form-control" placeholder="Įveskite ingredientą">
                        <button type="button" class="remove-ingredient-btn"><i class="fas fa-times"></i></button>
                    </div>
                `;
                
                // Set up event handler for the remove button
                const removeBtn = ingredientList.querySelector('.remove-ingredient-btn');
                if (removeBtn) {
                    removeBtn.onclick = function() {
                        this.closest('.ingredient-item').remove();
                    };
                }
            }
            
            // Reset step list
            const stepList = addPage.querySelector('#step-list');
            if (stepList) {
                // Keep only one empty step
                stepList.innerHTML = `
                    <div class="step-item">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <textarea name="steps[]" class="form-control" placeholder="Įveskite žingsnio aprašymą"></textarea>
                        </div>
                        <div class="step-actions">
                            <button type="button" class="remove-ingredient-btn"><i class="fas fa-times"></i></button>
                        </div>
                    </div>
                `;
                
                // Set up event handler for the remove button
                const removeBtn = stepList.querySelector('.remove-ingredient-btn');
                if (removeBtn) {
                    removeBtn.onclick = function() {
                        this.closest('.step-item').remove();
                    };
                }
            }
            
            // Uncheck all categories
            const categoryCheckboxes = addPage.querySelectorAll('.category-checkbox input[type="checkbox"]');
            categoryCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            
            // Clear tags
            const tagsContainer = addPage.querySelector('#tags-container');
            const tagsInput = addPage.querySelector('#tags-input');
            if (tagsContainer && tagsInput) {
                // Keep only the input
                Array.from(tagsContainer.children).forEach(child => {
                    if (child !== tagsInput) {
                        tagsContainer.removeChild(child);
                    }
                });
            }
            
            // Clear image preview
            const imagePreview = addPage.querySelector('#image-preview');
            if (imagePreview) {
                imagePreview.innerHTML = '<button type="button" class="remove-image"><i class="fas fa-times"></i></button>';
                imagePreview.style.display = 'none';
                
                // Set up event handler for the remove button
                const removeBtn = imagePreview.querySelector('.remove-image');
                if (removeBtn) {
                    removeBtn.onclick = function() {
                        imagePreview.style.display = 'none';
                    };
                }
            }
            
            // Reset file input
            const fileInput = addPage.querySelector('#recipe-image');
            if (fileInput) {
                fileInput.value = '';
            }
            
            console.log('Add recipe form has been reset');
        } catch (error) {
            console.error('Error resetting add recipe form:', error);
        }
    }
    
    // Also add event listener for when recipes are successfully saved
    document.addEventListener('click', function(event) {
        // Check if this is the save recipe button
        if (event.target.matches('.submit-button') && 
            event.target.textContent.includes('Išsaugoti receptą')) {
            
            // Set a timeout to check for success notification and then clear the form
            setTimeout(function() {
                const notification = document.querySelector('.notification');
                if (notification && 
                    notification.classList.contains('show') && 
                    notification.querySelector('.notification-title').textContent.includes('Sėkmė')) {
                    
                    console.log('Recipe saved successfully, will reset form when navigating back to add-recipe');
                    
                    // Set a flag to clear the form next time the add recipe page is shown
                    window.shouldResetAddRecipeForm = true;
                }
            }, 1000);
        }
    });
    
    // Add a listener to the original showAdminPage function
    const originalShowAdminPage = window.showAdminPage;
    window.showAdminPage = function(pageId) {
        // Call the original function
        originalShowAdminPage(pageId);
        
        // If we're showing the add recipe page and we have a flag to reset it
        if (pageId === 'add-recipe' && window.shouldResetAddRecipeForm) {
            setTimeout(function() {
                resetAddRecipeForm();
                window.shouldResetAddRecipeForm = false;
            }, 100);
        }
    };
})();