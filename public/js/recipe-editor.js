/**
 * Recipe Editor - Comprehensive Solution
 * 
 * This script handles recipe creation and editing functionality with fixes for:
 * - Proper category handling during save/update
 * - FormData vs JSON handling to ensure all data is sent correctly
 * - Image upload and preview handling
 * - Form population and validation
 */

(function() {
    console.log('Recipe Editor - Comprehensive Solution loaded');
    
    /**
     * Save Recipe - Creates a new recipe
     */
    window.saveRecipe = function() {
        console.log('Running enhanced saveRecipe...');
        
        // Get the form container
        const addPage = document.getElementById('page-add-recipe');
        if (!addPage) {
            showNotification('Klaida', 'Puslapis nerasta', 'error');
            return;
        }
        
        // Validate required fields
        const title = document.getElementById('recipe-title')?.value;
        if (!title?.trim()) {
            showNotification('Klaida', 'Recepto pavadinimas yra būtinas', 'error');
            return;
        }
        
        // Get authentication token
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Klaida', 'Nėra autentifikacijos. Prašome prisijungti iš naujo.', 'error');
            return;
        }
        
        // Create recipe data object
        const recipeData = collectRecipeData(addPage, false);
        
        // Show loading notification
        showNotification('Informacija', 'Receptas siunčiamas...', 'success');
        
        // First handle the image upload if there is one
        handleImageAndSave(addPage, recipeData, null, token);
    };
    
    /**
     * Update Recipe - Updates an existing recipe
     */
    window.updateRecipe = function() {
        console.log('Running enhanced updateRecipe...');
        
        // Get the edit page
        const editPage = document.getElementById('page-edit-recipe');
        if (!editPage) {
            showNotification('Klaida', 'Redagavimo puslapis nerastas', 'error');
            return;
        }
        
        // Get key fields for validation
        const title = editPage.querySelector('#recipe-title')?.value;
        const recipeId = editPage.querySelector('#recipe-id')?.value;
        
        if (!title?.trim()) {
            showNotification('Klaida', 'Recepto pavadinimas yra būtinas', 'error');
            return;
        }
        
        if (!recipeId?.trim()) {
            showNotification('Klaida', 'Recepto ID nerastas', 'error');
            return;
        }
        
        // Get authentication token
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Klaida', 'Nėra autentifikacijos. Prašome prisijungti iš naujo.', 'error');
            return;
        }
        
        // Create recipe data object
        const recipeData = collectRecipeData(editPage, true);
        
        // Show loading notification
        showNotification('Informacija', 'Receptas atnaujinamas...', 'success');
        
        // First handle the image upload if there is one
        handleImageAndSave(editPage, recipeData, recipeId, token);
    };
    
    // Set updateRecipeImplementation to reference updateRecipe
    window.updateRecipeImplementation = window.updateRecipe;
    
    /**
     * Edit Recipe - Opens a recipe for editing
     * 
     * @param {string} recipeId - The ID of the recipe to edit
     */
    window.editRecipe = function(recipeId) {
        console.log('Opening recipe for editing:', recipeId);
        
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
    
    /**
     * Collect Recipe Data - Gathers all form fields into a structured object
     * 
     * @param {Element} container - The form container element
     * @param {boolean} isUpdate - Whether this is an update operation
     * @returns {Object} The collected recipe data
     */
    function collectRecipeData(container, isUpdate) {
        // Basic information
        const recipeData = {
            title: container.querySelector('#recipe-title')?.value.trim() || '',
            intro: container.querySelector('#recipe-intro')?.value || '',
            prep_time: container.querySelector('#prep-time')?.value || '',
            cook_time: container.querySelector('#cook-time')?.value || '',
            servings: container.querySelector('#servings')?.value || '',
            notes: container.querySelector('#recipe-notes')?.value || '',
            status: container.querySelector('#recipe-status')?.value || 'draft'
        };
        
        // If updating, include the recipe ID
        if (isUpdate) {
            const recipeId = container.querySelector('#recipe-id')?.value;
            if (recipeId) {
                recipeData.id = recipeId;
            }
        }
        
        // Collect categories - this is critical for the fix
        const categories = [];
        container.querySelectorAll('.category-checkbox input[type="checkbox"]:checked').forEach(checkbox => {
            categories.push(checkbox.value);
        });
        recipeData.categories = categories;
        console.log('Selected categories:', categories);
        
        // Collect tags
        const tags = [];
        container.querySelectorAll('#tags-container .tag-text').forEach(tag => {
            tags.push(tag.textContent);
        });
        recipeData.tags = tags;
        
        // Collect ingredients
        const ingredients = [];
        container.querySelectorAll('#ingredient-list input[name="ingredients[]"]').forEach(input => {
            if (input.value.trim()) {
                ingredients.push(input.value.trim());
            }
        });
        recipeData.ingredients = ingredients;
        
        // Collect steps
        const steps = [];
        container.querySelectorAll('#step-list textarea[name="steps[]"]').forEach(textarea => {
            if (textarea.value.trim()) {
                steps.push(textarea.value.trim());
            }
        });
        recipeData.steps = steps;
        
        return recipeData;
    }
    
    /**
     * Handle Image Upload and Save Recipe
     * 
     * @param {Element} container - The form container element
     * @param {Object} recipeData - The recipe data to save
     * @param {string|null} recipeId - The recipe ID for updates, null for new recipes
     * @param {string} token - Auth token
     */
    function handleImageAndSave(container, recipeData, recipeId, token) {
        // Check if we have a new image to upload
        const imageInput = container.querySelector('#recipe-image');
        const hasNewImage = imageInput && imageInput.files && imageInput.files[0];
        
        // Process with image upload if needed, then save recipe
        if (hasNewImage) {
            // Create form data for image upload
            const imageFormData = new FormData();
            imageFormData.append('image', imageInput.files[0]);
            
            // Upload the image first
            fetch('/admin-api/upload/recipe-image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: imageFormData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to upload image');
                }
                return response.json();
            })
            .then(data => {
                if (data.success && data.filename) {
                    // Add the image filename to recipe data
                    recipeData.image = data.filename;
                }
                
                // Now save/update the recipe
                saveRecipeToServer(recipeData, recipeId, token);
            })
            .catch(error => {
                console.error('Image upload error:', error);
                showNotification('Klaida', `Klaida įkeliant nuotrauką: ${error.message}`, 'error');
                
                // Continue without the image
                saveRecipeToServer(recipeData, recipeId, token);
            });
        } else {
            // No new image, save/update recipe directly
            saveRecipeToServer(recipeData, recipeId, token);
        }
    }
    
    /**
     * Save Recipe to Server
     * 
     * @param {Object} recipeData - The recipe data to save
     * @param {string|null} recipeId - The recipe ID for updates, null for new recipes
     * @param {string} token - Auth token
     */
    function saveRecipeToServer(recipeData, recipeId, token) {
        // Determine if this is a create or update operation
        const isUpdate = recipeId !== null;
        const url = isUpdate ? `/admin-api/recipes/${recipeId}` : '/admin-api/recipes';
        const method = isUpdate ? 'PUT' : 'POST';
        
        console.log(`${isUpdate ? 'Updating' : 'Creating'} recipe:`, recipeData);
        
        // Send the recipe data as JSON
        fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(recipeData)
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    try {
                        const data = JSON.parse(text);
                        throw new Error(data.error || `Failed to ${isUpdate ? 'update' : 'add'} recipe: ${response.status}`);
                    } catch (e) {
                        throw new Error(`Failed to ${isUpdate ? 'update' : 'add'} recipe: ${response.status} - ${text || 'Unknown error'}`);
                    }
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                console.log(`Recipe ${isUpdate ? 'updated' : 'saved'} successfully:`, data);
                
                // Check if categories were saved correctly
                if (data.data && Array.isArray(data.data.categories)) {
                    console.log('Categories saved to server:', data.data.categories);
                    
                    // Compare with what we sent
                    const missingCategories = recipeData.categories.filter(
                        cat => !data.data.categories.includes(cat)
                    );
                    
                    if (missingCategories.length > 0) {
                        console.warn('Some categories were not saved correctly:', missingCategories);
                        
                        // Try to update the categories directly as a backup method
                        updateCategoriesDirectly(isUpdate ? recipeId : data.data.id, recipeData.categories, token)
                            .then(() => {
                                showSuccessAndRedirect(isUpdate);
                            })
                            .catch(catError => {
                                console.error('Category direct update error:', catError);
                                showSuccessAndRedirect(isUpdate);
                            });
                    } else {
                        showSuccessAndRedirect(isUpdate);
                    }
                } else {
                    showSuccessAndRedirect(isUpdate);
                }
            } else {
                throw new Error(data.error || 'Unknown error');
            }
        })
        .catch(error => {
            console.error(`${isUpdate ? 'Update' : 'Save'} recipe error:`, error);
            showNotification('Klaida', `Klaida ${isUpdate ? 'atnaujinant' : 'išsaugant'} receptą: ${error.message}`, 'error');
        });
    }
    
    /**
     * Update Categories Directly
     * Fallback method if categories aren't saved correctly with the main request
     * 
     * @param {string} recipeId - The recipe ID
     * @param {Array} categories - The categories to save
     * @param {string} token - Auth token
     * @returns {Promise} - The fetch promise
     */
    function updateCategoriesDirectly(recipeId, categories, token) {
        return fetch(`/admin-api/recipes/${recipeId}/categories`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ categories: categories })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Direct category update result:', data);
            return data;
        });
    }
    
    /**
     * Show Success Notification and Redirect
     * 
     * @param {boolean} isUpdate - Whether this was an update operation
     */
    function showSuccessAndRedirect(isUpdate) {
        showNotification('Sėkmė', `Receptas ${isUpdate ? 'atnaujintas' : 'išsaugotas'} sėkmingai!`, 'success');
        
        // Set flag to reset form when navigating back to add recipe
        if (!isUpdate) {
            window.shouldResetAddRecipeForm = true;
        }
        
        // Navigate to recipes page after a short delay
        setTimeout(() => {
            showAdminPage('recipes');
        }, 1500);
    }
    
    /**
     * Create Edit Form
     * Creates or updates the edit form with recipe data
     * 
     * @param {Object} recipe - The recipe data
     */
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
                    updateRecipe();
                    return false;
                };
            }
        }
        
        // Find all form elements and populate with recipe data
        populateFormWithRecipeData(editPage, recipe);
        
        // Add event handlers for the edit form
        initFormEventHandlers(editPage);
    }
    
    /**
     * Populate Form With Recipe Data
     * 
     * @param {Element} editPage - The edit page container
     * @param {Object} recipe - The recipe data
     */
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
                            imagePreview.innerHTML = '';
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
    
    /**
     * Initialize Form Event Handlers
     * Sets up event handlers for the form elements
     * 
     * @param {Element} container - The form container
     */
    function initFormEventHandlers(container) {
        // Add ingredient button
        const addIngredientBtn = container.querySelector('#add-ingredient-btn');
        if (addIngredientBtn) {
            addIngredientBtn.onclick = function() {
                const ingredientList = container.querySelector('#ingredient-list');
                if (ingredientList) {
                    addIngredientToForm(ingredientList, '');
                }
            };
        }
        
        // Add step button
        const addStepBtn = container.querySelector('#add-step-btn');
        if (addStepBtn) {
            addStepBtn.onclick = function() {
                const stepList = container.querySelector('#step-list');
                if (stepList) {
                    const steps = stepList.querySelectorAll('.step-item');
                    addStepToForm(stepList, '', steps.length + 1);
                }
            };
        }
        
        // Setup tag input
        const tagsInput = container.querySelector('#tags-input');
        if (tagsInput) {
            tagsInput.onkeydown = function(e) {
                if (e.key === 'Enter' && this.value.trim() !== '') {
                    e.preventDefault();
                    
                    const tagsContainer = container.querySelector('#tags-container');
                    if (tagsContainer) {
                        addTagToForm(tagsContainer, this, this.value.trim());
                        this.value = '';
                    }
                }
            };
        }
        
        // Setup file input for image preview
        const imageInput = container.querySelector('#recipe-image');
        if (imageInput) {
            imageInput.onchange = function() {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    const preview = container.querySelector('#image-preview');
                    
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
                                preview.innerHTML = '';
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
        container.querySelectorAll('#ingredient-list .remove-ingredient-btn').forEach(button => {
            button.onclick = function() {
                const item = this.closest('.ingredient-item');
                const list = item.parentNode;
                if (item && list) {
                    list.removeChild(item);
                }
            };
        });
        
        // Setup existing remove buttons for steps
        container.querySelectorAll('#step-list .remove-ingredient-btn').forEach(button => {
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
    
    /**
     * Add Ingredient To Form
     * 
     * @param {Element} container - The ingredients container
     * @param {string} value - The ingredient value
     */
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
    
    /**
     * Add Step To Form
     * 
     * @param {Element} container - The steps container
     * @param {string} value - The step value
     * @param {number} number - The step number
     */
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
    
    /**
     * Add Tag To Form
     * 
     * @param {Element} container - The tags container
     * @param {Element} inputElement - The input element reference
     * @param {string} tagText - The tag text
     */
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
    
    /**
     * Update Step Numbers
     * Updates the numbering of steps after a step is removed
     * 
     * @param {Element} container - The steps container
     */
    function updateStepNumbers(container) {
        const steps = container.querySelectorAll('.step-item');
        steps.forEach((step, index) => {
            const numberElement = step.querySelector('.step-number');
            if (numberElement) {
                numberElement.textContent = index + 1;
            }
        });
    }
    
    console.log('Recipe Editor - Comprehensive Solution successfully initialized');
})();