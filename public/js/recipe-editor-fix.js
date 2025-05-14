// Recipe Editor Fix for Admin Panel
// Place this code in a new file called "recipe-editor-fix.js" and include it in admin.html after complete-recipe-editor.js

(function() {
    console.log('Recipe Editor Fix loaded - Fixing edit recipe functionality');
    
    // Wait for DOM to be fully loaded before initializing
    document.addEventListener('DOMContentLoaded', function() {
        // Replace the original editRecipe function
        window.editRecipe = function(recipeId) {
            console.log('Opening recipe for editing with fixed function:', recipeId);
            
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
                if (!data.success) {
                    throw new Error(data.error || 'Failed to get recipe');
                }
                
                const recipe = data.data;
                console.log('Recipe data loaded successfully:', recipe);
                
                // Create edit form and populate it with data
                createEditForm(recipe);
                
                // Show the edit page
                showAdminPage('edit-recipe');
                
                // Show success notification
                showNotification('Sėkmė', 'Receptas paruoštas redagavimui', 'success');
            })
            .catch(error => {
                console.error('Recipe edit error:', error);
                showNotification('Klaida', `Nepavyko įkelti recepto: ${error.message}`, 'error');
            });
        };
        
        // Also replace the updateRecipe function
        window.updateRecipe = function() {
            // Create a complete standalone function to avoid any ID conflicts
            updateRecipeImplementation();
        };
    });
    
    // Create and properly initialize the edit form
    function createEditForm(recipe) {
        // Get the add recipe container to use as base template
        const addPage = document.getElementById('page-add-recipe');
        if (!addPage) {
            console.error('Add recipe page not found');
            showNotification('Klaida', 'Negalima sukurti redagavimo formos', 'error');
            return;
        }
        
        // Create or get the edit page container
        let editPage = document.getElementById('page-edit-recipe');
        if (!editPage) {
            editPage = document.createElement('div');
            editPage.id = 'page-edit-recipe';
            editPage.className = 'admin-page';
            editPage.style.display = 'none';
            addPage.parentNode.appendChild(editPage);
        }
        
        // Copy content from add page
        editPage.innerHTML = addPage.innerHTML;
        
        // Change page title
        const pageTitle = editPage.querySelector('.admin-section-title');
        if (pageTitle) {
            pageTitle.innerText = 'Redaguoti receptą';
        }
        
        // Add recipe ID field
        const form = editPage.querySelector('form');
        if (form) {
            // Check if ID field already exists
            let idField = editPage.querySelector('input[id="recipe-id"]');
            if (!idField) {
                idField = document.createElement('input');
                idField.type = 'hidden';
                idField.id = 'recipe-id';
                idField.name = 'id';
                form.appendChild(idField);
            }
            
            // Update submit button
            const submitButton = form.querySelector('.submit-button');
            if (submitButton) {
                submitButton.textContent = 'Atnaujinti receptą';
                submitButton.onclick = function(e) {
                    e.preventDefault();
                    updateRecipeImplementation();
                    return false;
                };
            }
        }
        
        // Find all form elements and populate with recipe data
        populateFormWithRecipeData(editPage, recipe);
        
        // Add event handlers for the edit form
        initFormEventHandlers(editPage);
    }
    
    // Populate the form with recipe data
    function populateFormWithRecipeData(editPage, recipe) {
        try {
            // Setup basic text fields
            const fields = [
                {id: 'recipe-id', value: recipe.id},
                {id: 'recipe-title', value: recipe.title},
                {id: 'recipe-intro', value: recipe.intro},
                {id: 'prep-time', value: recipe.prep_time},
                {id: 'cook-time', value: recipe.cook_time},
                {id: 'servings', value: recipe.servings},
                {id: 'recipe-notes', value: recipe.notes},
                {id: 'recipe-status', value: recipe.status}
            ];
            
            fields.forEach(field => {
                const element = editPage.querySelector(`#${field.id}`);
                if (element) {
                    element.value = field.value || '';
                } else {
                    console.warn(`Element not found: #${field.id}`);
                }
            });
            
            // Clear and setup ingredients
            const ingredientList = editPage.querySelector('#ingredient-list');
            if (ingredientList) {
                ingredientList.innerHTML = '';
                
                if (recipe.ingredients && recipe.ingredients.length > 0) {
                    recipe.ingredients.forEach(ingredient => {
                        addIngredientToForm(ingredientList, ingredient);
                    });
                } else {
                    // Add an empty ingredient field if none exist
                    addIngredientToForm(ingredientList, '');
                }
            }
            
            // Clear and setup steps
            const stepList = editPage.querySelector('#step-list');
            if (stepList) {
                stepList.innerHTML = '';
                
                if (recipe.steps && recipe.steps.length > 0) {
                    recipe.steps.forEach((step, index) => {
                        addStepToForm(stepList, step, index + 1);
                    });
                } else {
                    // Add an empty step field if none exist
                    addStepToForm(stepList, '', 1);
                }
            }
            
            // Clear and setup categories
            if (recipe.categories && Array.isArray(recipe.categories)) {
                const categoryCheckboxes = editPage.querySelectorAll('.category-checkbox input[type="checkbox"]');
                categoryCheckboxes.forEach(checkbox => {
                    checkbox.checked = recipe.categories.includes(checkbox.value);
                });
            }
            
            // Clear and setup tags
            const tagsContainer = editPage.querySelector('#tags-container');
            const tagsInput = editPage.querySelector('#tags-input');
            if (tagsContainer && tagsInput) {
                // Remove all existing tags (except the input)
                Array.from(tagsContainer.children).forEach(child => {
                    if (child !== tagsInput) {
                        tagsContainer.removeChild(child);
                    }
                });
                
                // Add recipe tags
                if (recipe.tags && Array.isArray(recipe.tags)) {
                    recipe.tags.forEach(tag => {
                        addTagToForm(tagsContainer, tagsInput, tag);
                    });
                }
            }
            
            // Setup image preview if recipe has an image
            if (recipe.image) {
                const imagePreview = editPage.querySelector('#image-preview');
                if (imagePreview) {
                    imagePreview.innerHTML = `
                        <button type="button" class="remove-image"><i class="fas fa-times"></i></button>
                        <img src="/img/recipes/${recipe.image}" alt="${recipe.title || 'Recipe Image'}" style="max-width: 100%; height: auto;">
                    `;
                    imagePreview.style.display = 'block';
                    
                    // Setup remove button
                    const removeBtn = imagePreview.querySelector('.remove-image');
                    if (removeBtn) {
                        removeBtn.addEventListener('click', function() {
                            imagePreview.innerHTML = '<button type="button" class="remove-image"><i class="fas fa-times"></i></button>';
                            imagePreview.style.display = 'none';
                            
                            // Reset file input
                            const fileInput = editPage.querySelector('#recipe-image');
                            if (fileInput) fileInput.value = '';
                        });
                    }
                }
            }
            
            console.log('Recipe form populated successfully');
        } catch (error) {
            console.error('Error populating recipe form:', error);
            showNotification('Klaida', `Klaida užpildant formos laukus: ${error.message}`, 'error');
        }
    }
    
    // Initialize event handlers for the form elements
    function initFormEventHandlers(editPage) {
        // Add ingredient button
        const addIngredientBtn = editPage.querySelector('#add-ingredient-btn');
        if (addIngredientBtn) {
            addIngredientBtn.onclick = function() {
                const ingredientList = editPage.querySelector('#ingredient-list');
                if (ingredientList) {
                    addIngredientToForm(ingredientList, '');
                }
            };
        }
        
        // Add step button
        const addStepBtn = editPage.querySelector('#add-step-btn');
        if (addStepBtn) {
            addStepBtn.onclick = function() {
                const stepList = editPage.querySelector('#step-list');
                if (stepList) {
                    const steps = stepList.querySelectorAll('.step-item');
                    addStepToForm(stepList, '', steps.length + 1);
                }
            };
        }
        
        // Setup tag input
        const tagsInput = editPage.querySelector('#tags-input');
        if (tagsInput) {
            tagsInput.onkeydown = function(e) {
                if (e.key === 'Enter' && this.value.trim() !== '') {
                    e.preventDefault();
                    
                    const tagsContainer = editPage.querySelector('#tags-container');
                    if (tagsContainer) {
                        addTagToForm(tagsContainer, this, this.value.trim());
                        this.value = '';
                    }
                }
            };
        }
        
        // Setup file input for image preview
        const imageInput = editPage.querySelector('#recipe-image');
        if (imageInput) {
            imageInput.onchange = function() {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    const preview = editPage.querySelector('#image-preview');
                    
                    reader.onload = function(e) {
                        preview.innerHTML = `
                            <button type="button" class="remove-image"><i class="fas fa-times"></i></button>
                            <img src="${e.target.result}" alt="Image preview" style="max-width: 100%; height: auto;">
                        `;
                        preview.style.display = 'block';
                        
                        // Setup remove button
                        const removeBtn = preview.querySelector('.remove-image');
                        if (removeBtn) {
                            removeBtn.onclick = function() {
                                preview.innerHTML = '<button type="button" class="remove-image"><i class="fas fa-times"></i></button>';
                                preview.style.display = 'none';
                                imageInput.value = '';
                            };
                        }
                    };
                    
                    reader.readAsDataURL(this.files[0]);
                }
            };
        }
        
        // Setup existing remove buttons for ingredients
        editPage.querySelectorAll('#ingredient-list .remove-ingredient-btn').forEach(button => {
            button.onclick = function() {
                const item = this.closest('.ingredient-item');
                const list = item.parentNode;
                if (item && list) {
                    list.removeChild(item);
                }
            };
        });
        
        // Setup existing remove buttons for steps
        editPage.querySelectorAll('#step-list .remove-ingredient-btn').forEach(button => {
            button.onclick = function() {
                const item = this.closest('.step-item');
                const list = item.parentNode;
                if (item && list) {
                    list.removeChild(item);
                    updateStepNumbers(list);
                }
            };
        });
    }
    
    // Add ingredient field to the form
    function addIngredientToForm(container, value) {
        const item = document.createElement('div');
        item.className = 'ingredient-item';
        item.innerHTML = `
            <input type="text" name="ingredients[]" class="form-control" placeholder="Įveskite ingredientą" value="${value || ''}">
            <button type="button" class="remove-ingredient-btn"><i class="fas fa-times"></i></button>
        `;
        container.appendChild(item);
        
        // Setup remove button
        const removeBtn = item.querySelector('.remove-ingredient-btn');
        if (removeBtn) {
            removeBtn.onclick = function() {
                container.removeChild(item);
            };
        }
    }
    
    // Add step field to the form
    function addStepToForm(container, value, number) {
        const item = document.createElement('div');
        item.className = 'step-item';
        item.innerHTML = `
            <div class="step-number">${number}</div>
            <div class="step-content">
                <textarea name="steps[]" class="form-control" placeholder="Įveskite žingsnio aprašymą">${value || ''}</textarea>
            </div>
            <div class="step-actions">
                <button type="button" class="remove-ingredient-btn"><i class="fas fa-times"></i></button>
            </div>
        `;
        container.appendChild(item);
        
        // Setup remove button
        const removeBtn = item.querySelector('.remove-ingredient-btn');
        if (removeBtn) {
            removeBtn.onclick = function() {
                container.removeChild(item);
                updateStepNumbers(container);
            };
        }
    }
    
    // Add tag to the form
    function addTagToForm(container, inputElement, tagText) {
        if (!tagText || tagText.trim() === '') return;
        
        const tag = document.createElement('div');
        tag.className = 'tag';
        
        const tagTextEl = document.createElement('span');
        tagTextEl.className = 'tag-text';
        tagTextEl.textContent = tagText;
        
        const tagRemove = document.createElement('button');
        tagRemove.className = 'tag-remove';
        tagRemove.type = 'button';
        tagRemove.innerHTML = '<i class="fas fa-times"></i>';
        tagRemove.onclick = function() {
            container.removeChild(tag);
        };
        
        tag.appendChild(tagTextEl);
        tag.appendChild(tagRemove);
        
        container.insertBefore(tag, inputElement);
    }
    
    // Update step numbers after removing a step
    function updateStepNumbers(container) {
        const steps = container.querySelectorAll('.step-item');
        steps.forEach((step, index) => {
            const numberElement = step.querySelector('.step-number');
            if (numberElement) {
                numberElement.textContent = index + 1;
            }
        });
    }
    
    // Implementation of the recipe update function
    function updateRecipeImplementation() {
        console.log('Running updateRecipeImplementation...');
        
        // Get the edit page
        const editPage = document.getElementById('page-edit-recipe');
        if (!editPage) {
            console.error('Edit page not found');
            showNotification('Klaida', 'Redagavimo puslapis nerastas', 'error');
            return;
        }
        
        // Get the form
        const form = editPage.querySelector('form');
        if (!form) {
            console.error('Form not found');
            showNotification('Klaida', 'Forma nerasta', 'error');
            return;
        }
        
        // Get key fields for validation
        const titleInput = editPage.querySelector('#recipe-title');
        const idInput = editPage.querySelector('#recipe-id');
        
        if (!titleInput || !titleInput.value.trim()) {
            console.error('Recipe title is missing');
            showNotification('Klaida', 'Recepto pavadinimas yra būtinas', 'error');
            return;
        }
        
        if (!idInput || !idInput.value.trim()) {
            console.error('Recipe ID is missing');
            showNotification('Klaida', 'Recepto ID nerastas', 'error');
            return;
        }
        
        const recipeTitle = titleInput.value.trim();
        const recipeId = idInput.value.trim();
        
        console.log('Updating recipe:', { id: recipeId, title: recipeTitle });
        
        // Create form data object from form
        const formData = new FormData(form);
        
        // Collect tags and add to form data
        const tags = [];
        editPage.querySelectorAll('#tags-container .tag-text').forEach(tag => {
            tags.push(tag.textContent);
        });
        formData.append('tags', JSON.stringify(tags));
        
        // Get auth token
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Klaida', 'Nėra autentifikacijos. Prašome prisijungti iš naujo.', 'error');
            return;
        }
        
        // Show loading notification
        showNotification('Informacija', 'Atnaujinamas receptas...', 'success');
        
        // Send update request
        fetch(`/admin-api/recipes/${recipeId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    try {
                        const data = JSON.parse(text);
                        throw new Error(data.error || `Failed to update recipe: ${response.status}`);
                    } catch (e) {
                        throw new Error(`Failed to update recipe: ${response.status} - ${text || 'Unknown error'}`);
                    }
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                console.log('Recipe updated successfully:', data);
                showNotification('Sėkmė', 'Receptas atnaujintas sėkmingai!', 'success');
                
                // Navigate to recipes page after a short delay
                setTimeout(() => {
                    showAdminPage('recipes');
                }, 1500);
            } else {
                throw new Error(data.error || 'Unknown error');
            }
        })
        .catch(error => {
            console.error('Update recipe error:', error);
            showNotification('Klaida', `Klaida atnaujinant receptą: ${error.message}`, 'error');
        });
    }
})();