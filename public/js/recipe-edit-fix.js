// Recipe Edit Functionality Fix
// This script fixes the recipe editing functionality in the admin panel

(function() {
    console.log('Recipe edit functionality fix loaded');
    
    // Override the editRecipe function
    window.editRecipe = function(recipeId) {
        console.log('Loading recipe for editing:', recipeId);
        
        // Show loading notification
        showNotification('Informacija', 'Įkeliamas receptas...', 'success');
        
        // Get authentication token
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Klaida', 'Nėra autentifikacijos. Prašome prisijungti iš naujo.', 'error');
            return;
        }
        
        // Fetch the recipe data
        fetch(`/admin-api/recipes/${recipeId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch recipe: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                console.log('Recipe loaded successfully:', data.data);
                
                // Create edit recipe page based on add recipe page
                const addRecipePage = document.getElementById('page-add-recipe');
                let editRecipePage = document.getElementById('page-edit-recipe');
                
                if (!editRecipePage) {
                    // Create edit recipe page
                    editRecipePage = document.createElement('div');
                    editRecipePage.id = 'page-edit-recipe';
                    editRecipePage.className = 'admin-page';
                    editRecipePage.style.display = 'none';
                    
                    // Clone the add recipe page content
                    editRecipePage.innerHTML = addRecipePage.innerHTML;
                    
                    // Change title
                    const title = editRecipePage.querySelector('.admin-section-title');
                    if (title) {
                        title.textContent = 'Redaguoti receptą';
                    }
                    
                    // Change submit button
                    const submitButton = editRecipePage.querySelector('.submit-button');
                    if (submitButton) {
                        submitButton.textContent = 'Atnaujinti receptą';
                        submitButton.onclick = function() {
                            updateRecipe();
                        };
                    }
                    
                    // Add ID field
                    const form = editRecipePage.querySelector('form');
                    if (form) {
                        const idField = document.createElement('input');
                        idField.type = 'hidden';
                        idField.id = 'recipe-id';
                        idField.name = 'id';
                        form.appendChild(idField);
                    }
                    
                    // Add to the page
                    addRecipePage.parentNode.appendChild(editRecipePage);
                }
                
                // Now populate the form
                populateEditForm(data.data);
                
                // Show the edit page
                showAdminPage('edit-recipe');
                
                // Success notification
                showNotification('Sėkmė', 'Receptas įkeltas redagavimui', 'success');
            } else {
                showNotification('Klaida', data.error || 'Nepavyko gauti recepto duomenų', 'error');
            }
        })
        .catch(error => {
            console.error('Fetch recipe details error:', error);
            showNotification('Klaida', 'Nepavyko gauti recepto duomenų', 'error');
        });
    };
    
    // Function to populate the edit form
    function populateEditForm(recipe) {
        console.log('Populating edit form with recipe data:', recipe);
        
        // Get form elements
        try {
            // Set basic field values
            setFieldValue('recipe-id', recipe.id);
            setFieldValue('recipe-title', recipe.title);
            setFieldValue('recipe-intro', recipe.intro);
            setFieldValue('prep-time', recipe.prep_time);
            setFieldValue('cook-time', recipe.cook_time);
            setFieldValue('servings', recipe.servings);
            setFieldValue('recipe-notes', recipe.notes);
            setFieldValue('recipe-status', recipe.status);
            
            // Set categories
            if (recipe.categories && Array.isArray(recipe.categories)) {
                document.querySelectorAll('.category-checkbox input[type="checkbox"]').forEach(checkbox => {
                    checkbox.checked = recipe.categories.includes(checkbox.value);
                });
            }
            
            // Clear existing ingredients
            const ingredientList = document.querySelector('#page-edit-recipe #ingredient-list');
            if (ingredientList) {
                ingredientList.innerHTML = '';
                
                // Add ingredients
                if (recipe.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
                    recipe.ingredients.forEach(ingredient => {
                        addIngredientToForm(ingredient, ingredientList);
                    });
                } else {
                    // Add an empty ingredient field
                    addIngredientToForm('', ingredientList);
                }
            }
            
            // Clear existing steps
            const stepList = document.querySelector('#page-edit-recipe #step-list');
            if (stepList) {
                stepList.innerHTML = '';
                
                // Add steps
                if (recipe.steps && Array.isArray(recipe.steps) && recipe.steps.length > 0) {
                    recipe.steps.forEach((step, index) => {
                        addStepToForm(step, index + 1, stepList);
                    });
                } else {
                    // Add an empty step
                    addStepToForm('', 1, stepList);
                }
            }
            
            // Clear existing tags
            const tagsContainer = document.querySelector('#page-edit-recipe #tags-container');
            const tagsInput = document.querySelector('#page-edit-recipe #tags-input');
            
            if (tagsContainer && tagsInput) {
                // Remove existing tags
                const existingTags = tagsContainer.querySelectorAll('.tag');
                existingTags.forEach(tag => {
                    if (tag !== tagsInput) {
                        tagsContainer.removeChild(tag);
                    }
                });
                
                // Add tags
                if (recipe.tags && Array.isArray(recipe.tags)) {
                    recipe.tags.forEach(tag => {
                        addTagToForm(tag, tagsContainer, tagsInput);
                    });
                }
            }
            
            // Show image preview if available
            if (recipe.image) {
                const imagePreview = document.querySelector('#page-edit-recipe #image-preview');
                if (imagePreview) {
                    // Clear existing preview
                    imagePreview.innerHTML = `
                        <button type="button" class="remove-image"><i class="fas fa-times"></i></button>
                        <img src="/img/recipes/${recipe.image}" alt="${recipe.title}" style="max-width: 100%; height: auto;">
                    `;
                    imagePreview.style.display = 'block';
                    
                    // Add event listener to remove button
                    const removeButton = imagePreview.querySelector('.remove-image');
                    if (removeButton) {
                        removeButton.addEventListener('click', function() {
                            imagePreview.innerHTML = '<button type="button" class="remove-image"><i class="fas fa-times"></i></button>';
                            imagePreview.style.display = 'none';
                        });
                    }
                }
            }
            
            console.log('Form populated successfully');
        } catch (error) {
            console.error('Error populating form:', error);
            showNotification('Klaida', 'Klaida užpildant formą', 'error');
        }
    }
    
    // Helper function to safely set field values
    function setFieldValue(fieldId, value) {
        const field = document.querySelector(`#page-edit-recipe #${fieldId}`);
        if (field) {
            field.value = value || '';
        } else {
            console.warn(`Field not found: #${fieldId}`);
        }
    }
    
    // Helper function to add an ingredient to the form
    function addIngredientToForm(value, container) {
        const ingredientItem = document.createElement('div');
        ingredientItem.className = 'ingredient-item';
        ingredientItem.innerHTML = `
            <input type="text" name="ingredients[]" class="form-control" placeholder="Įveskite ingredientą" value="${value || ''}">
            <button type="button" class="remove-ingredient-btn"><i class="fas fa-times"></i></button>
        `;
        
        container.appendChild(ingredientItem);
        
        // Add event listener for remove button
        const removeBtn = ingredientItem.querySelector('.remove-ingredient-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                container.removeChild(ingredientItem);
            });
        }
    }
    
    // Helper function to add a step to the form
    function addStepToForm(value, number, container) {
        const stepItem = document.createElement('div');
        stepItem.className = 'step-item';
        stepItem.innerHTML = `
            <div class="step-number">${number}</div>
            <div class="step-content">
                <textarea name="steps[]" class="form-control" placeholder="Įveskite žingsnio aprašymą">${value || ''}</textarea>
            </div>
            <div class="step-actions">
                <button type="button" class="remove-ingredient-btn"><i class="fas fa-times"></i></button>
            </div>
        `;
        
        container.appendChild(stepItem);
        
        // Add event listener for remove button
        const removeBtn = stepItem.querySelector('.remove-ingredient-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                container.removeChild(stepItem);
                updateStepNumbers();
            });
        }
    }
    
    // Helper function to add a tag to the form
    function addTagToForm(tagText, container, inputElement) {
        const tag = document.createElement('div');
        tag.className = 'tag';
        
        const tagTextEl = document.createElement('span');
        tagTextEl.className = 'tag-text';
        tagTextEl.textContent = tagText;
        
        const tagRemove = document.createElement('button');
        tagRemove.className = 'tag-remove';
        tagRemove.type = 'button';
        tagRemove.innerHTML = '<i class="fas fa-times"></i>';
        tagRemove.addEventListener('click', function() {
            container.removeChild(tag);
        });
        
        tag.appendChild(tagTextEl);
        tag.appendChild(tagRemove);
        
        container.insertBefore(tag, inputElement);
    }
    
    // Helper function to update step numbers
    function updateStepNumbers() {
        const stepItems = document.querySelectorAll('#page-edit-recipe .step-item');
        stepItems.forEach((item, index) => {
            const stepNumber = item.querySelector('.step-number');
            if (stepNumber) {
                stepNumber.textContent = index + 1;
            }
        });
    }
    
    // Initialize event listeners for the edit page
    function initEditPageEvents() {
        // For Add Ingredient button
        document.addEventListener('click', function(e) {
            if (e.target.matches('#page-edit-recipe #add-ingredient-btn') || 
                e.target.closest('#page-edit-recipe #add-ingredient-btn')) {
                e.preventDefault();
                
                const ingredientList = document.querySelector('#page-edit-recipe #ingredient-list');
                if (ingredientList) {
                    addIngredientToForm('', ingredientList);
                }
            }
        });
        
        // For Add Step button
        document.addEventListener('click', function(e) {
            if (e.target.matches('#page-edit-recipe #add-step-btn') || 
                e.target.closest('#page-edit-recipe #add-step-btn')) {
                e.preventDefault();
                
                const stepList = document.querySelector('#page-edit-recipe #step-list');
                if (stepList) {
                    const stepItems = stepList.querySelectorAll('.step-item');
                    const newStepNumber = stepItems.length + 1;
                    addStepToForm('', newStepNumber, stepList);
                }
            }
        });
        
        // For Tags input
        document.addEventListener('keydown', function(e) {
            if (e.target.matches('#page-edit-recipe #tags-input')) {
                if (e.key === 'Enter' && e.target.value.trim() !== '') {
                    e.preventDefault();
                    const tagsContainer = document.querySelector('#page-edit-recipe #tags-container');
                    if (tagsContainer) {
                        addTagToForm(e.target.value.trim(), tagsContainer, e.target);
                        e.target.value = '';
                    }
                }
            }
        });
        
        // For image upload preview
        document.addEventListener('change', function(e) {
            if (e.target.matches('#page-edit-recipe #recipe-image')) {
                if (e.target.files && e.target.files[0]) {
                    const imagePreview = document.querySelector('#page-edit-recipe #image-preview');
                    if (imagePreview) {
                        const reader = new FileReader();
                        
                        reader.onload = function(event) {
                            imagePreview.innerHTML = `
                                <button type="button" class="remove-image"><i class="fas fa-times"></i></button>
                                <img src="${event.target.result}" alt="Recipe preview" style="max-width: 100%; height: auto;">
                            `;
                            imagePreview.style.display = 'block';
                            
                            // Add event listener to remove button
                            const removeButton = imagePreview.querySelector('.remove-image');
                            if (removeButton) {
                                removeButton.addEventListener('click', function() {
                                    imagePreview.innerHTML = '<button type="button" class="remove-image"><i class="fas fa-times"></i></button>';
                                    imagePreview.style.display = 'none';
                                    e.target.value = '';
                                });
                            }
                        };
                        
                        reader.readAsDataURL(e.target.files[0]);
                    }
                }
            }
        });
    }
    
    // Initialize when the page loads
    document.addEventListener('DOMContentLoaded', function() {
        initEditPageEvents();
    });
})();