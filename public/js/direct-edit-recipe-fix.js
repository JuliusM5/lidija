// Direct fix for recipe editing issues
// This script directly addresses the "Cannot set properties of null" error

// Execute this script immediately
(function() {
    console.log('Direct recipe edit fix loaded!');
    
    // Replace both the edit recipe and update recipe functions
    window.editRecipe = function(recipeId) {
        console.log('Loading recipe for editing (direct fix):', recipeId);
        
        // Show loading notification
        showNotification('Informacija', 'Įkeliamas receptas...', 'success');
        
        // Get the auth token
        const token = localStorage.getItem('token');
        
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
            
            // =========== STEP 1: CREATE THE EDIT PAGE ===========
            // Clone the add recipe page content
            const addRecipePage = document.getElementById('page-add-recipe');
            let editRecipePage = document.getElementById('page-edit-recipe');
            
            // If the edit page doesn't exist already, create it
            if (!editRecipePage) {
                console.log('Creating edit recipe page');
                
                // Create a new div for the edit page
                editRecipePage = document.createElement('div');
                editRecipePage.id = 'page-edit-recipe';
                editRecipePage.className = 'admin-page';
                editRecipePage.style.display = 'none';
                
                // Clone the content from the add page
                editRecipePage.innerHTML = addRecipePage.innerHTML;
                
                // Change the title
                const title = editRecipePage.querySelector('.admin-section-title');
                if (title) {
                    title.textContent = 'Redaguoti receptą';
                }
                
                // Add hidden ID field
                const idField = document.createElement('input');
                idField.type = 'hidden';
                idField.id = 'recipe-id';
                idField.name = 'id';
                
                // Find the form and add the ID field
                const form = editRecipePage.querySelector('form');
                if (form) {
                    form.appendChild(idField);
                    
                    // Change the submit button text and onclick handler
                    const submitButton = form.querySelector('.submit-button');
                    if (submitButton) {
                        submitButton.textContent = 'Atnaujinti receptą';
                        submitButton.onclick = function() {
                            window.directUpdateRecipe();
                        };
                    }
                }
                
                // Add the edit page to the document
                const mainContent = addRecipePage.parentNode;
                mainContent.appendChild(editRecipePage);
            }
            
            // =========== STEP 2: POPULATE THE FORM ===========
            // We'll now directly access each field without relying on a separate function
            
            // Set basic fields
            try {
                // ID field
                const idField = editRecipePage.querySelector('#recipe-id');
                if (idField) {
                    idField.value = recipe.id;
                } else {
                    console.error('ID field not found');
                }
                
                // Title field
                const titleField = editRecipePage.querySelector('#recipe-title');
                if (titleField) {
                    titleField.value = recipe.title || '';
                } else {
                    console.error('Title field not found');
                }
                
                // Intro field
                const introField = editRecipePage.querySelector('#recipe-intro');
                if (introField) {
                    introField.value = recipe.intro || '';
                } else {
                    console.error('Intro field not found');
                }
                
                // Prep time field
                const prepTimeField = editRecipePage.querySelector('#prep-time');
                if (prepTimeField) {
                    prepTimeField.value = recipe.prep_time || '';
                } else {
                    console.error('Prep time field not found');
                }
                
                // Cook time field
                const cookTimeField = editRecipePage.querySelector('#cook-time');
                if (cookTimeField) {
                    cookTimeField.value = recipe.cook_time || '';
                } else {
                    console.error('Cook time field not found');
                }
                
                // Servings field
                const servingsField = editRecipePage.querySelector('#servings');
                if (servingsField) {
                    servingsField.value = recipe.servings || '';
                } else {
                    console.error('Servings field not found');
                }
                
                // Notes field
                const notesField = editRecipePage.querySelector('#recipe-notes');
                if (notesField) {
                    notesField.value = recipe.notes || '';
                } else {
                    console.error('Notes field not found');
                }
                
                // Status field
                const statusField = editRecipePage.querySelector('#recipe-status');
                if (statusField) {
                    statusField.value = recipe.status || 'draft';
                } else {
                    console.error('Status field not found');
                }
                
                // Set checkboxes for categories
                if (recipe.categories && Array.isArray(recipe.categories)) {
                    const checkboxes = editRecipePage.querySelectorAll('.category-checkbox input[type="checkbox"]');
                    checkboxes.forEach(checkbox => {
                        checkbox.checked = recipe.categories.includes(checkbox.value);
                    });
                }
                
                // Handle ingredients
                const ingredientList = editRecipePage.querySelector('#ingredient-list');
                if (ingredientList) {
                    // Clear existing ingredients
                    ingredientList.innerHTML = '';
                    
                    // Add ingredients from recipe
                    if (recipe.ingredients && recipe.ingredients.length > 0) {
                        recipe.ingredients.forEach(ingredient => {
                            const item = document.createElement('div');
                            item.className = 'ingredient-item';
                            item.innerHTML = `
                                <input type="text" name="ingredients[]" class="form-control" placeholder="Įveskite ingredientą" value="${ingredient || ''}">
                                <button type="button" class="remove-ingredient-btn"><i class="fas fa-times"></i></button>
                            `;
                            ingredientList.appendChild(item);
                            
                            // Add remove handler
                            const removeBtn = item.querySelector('.remove-ingredient-btn');
                            if (removeBtn) {
                                removeBtn.addEventListener('click', function() {
                                    ingredientList.removeChild(item);
                                });
                            }
                        });
                    } else {
                        // Add empty ingredient
                        const item = document.createElement('div');
                        item.className = 'ingredient-item';
                        item.innerHTML = `
                            <input type="text" name="ingredients[]" class="form-control" placeholder="Įveskite ingredientą">
                            <button type="button" class="remove-ingredient-btn"><i class="fas fa-times"></i></button>
                        `;
                        ingredientList.appendChild(item);
                        
                        // Add remove handler
                        const removeBtn = item.querySelector('.remove-ingredient-btn');
                        if (removeBtn) {
                            removeBtn.addEventListener('click', function() {
                                ingredientList.removeChild(item);
                            });
                        }
                    }
                    
                    // Re-bind add ingredient button
                    const addIngredientBtn = editRecipePage.querySelector('#add-ingredient-btn');
                    if (addIngredientBtn) {
                        addIngredientBtn.onclick = function() {
                            const item = document.createElement('div');
                            item.className = 'ingredient-item';
                            item.innerHTML = `
                                <input type="text" name="ingredients[]" class="form-control" placeholder="Įveskite ingredientą">
                                <button type="button" class="remove-ingredient-btn"><i class="fas fa-times"></i></button>
                            `;
                            ingredientList.appendChild(item);
                            
                            // Add remove handler
                            const removeBtn = item.querySelector('.remove-ingredient-btn');
                            if (removeBtn) {
                                removeBtn.addEventListener('click', function() {
                                    ingredientList.removeChild(item);
                                });
                            }
                        };
                    }
                }
                
                // Handle steps
                const stepList = editRecipePage.querySelector('#step-list');
                if (stepList) {
                    // Clear existing steps
                    stepList.innerHTML = '';
                    
                    // Add steps from recipe
                    if (recipe.steps && recipe.steps.length > 0) {
                        recipe.steps.forEach((step, index) => {
                            const item = document.createElement('div');
                            item.className = 'step-item';
                            item.innerHTML = `
                                <div class="step-number">${index + 1}</div>
                                <div class="step-content">
                                    <textarea name="steps[]" class="form-control" placeholder="Įveskite žingsnio aprašymą">${step || ''}</textarea>
                                </div>
                                <div class="step-actions">
                                    <button type="button" class="remove-ingredient-btn"><i class="fas fa-times"></i></button>
                                </div>
                            `;
                            stepList.appendChild(item);
                            
                            // Add remove handler
                            const removeBtn = item.querySelector('.remove-ingredient-btn');
                            if (removeBtn) {
                                removeBtn.addEventListener('click', function() {
                                    stepList.removeChild(item);
                                    updateStepNumbers(stepList);
                                });
                            }
                        });
                    } else {
                        // Add empty step
                        const item = document.createElement('div');
                        item.className = 'step-item';
                        item.innerHTML = `
                            <div class="step-number">1</div>
                            <div class="step-content">
                                <textarea name="steps[]" class="form-control" placeholder="Įveskite žingsnio aprašymą"></textarea>
                            </div>
                            <div class="step-actions">
                                <button type="button" class="remove-ingredient-btn"><i class="fas fa-times"></i></button>
                            </div>
                        `;
                        stepList.appendChild(item);
                        
                        // Add remove handler
                        const removeBtn = item.querySelector('.remove-ingredient-btn');
                        if (removeBtn) {
                            removeBtn.addEventListener('click', function() {
                                stepList.removeChild(item);
                                updateStepNumbers(stepList);
                            });
                        }
                    }
                    
                    // Re-bind add step button
                    const addStepBtn = editRecipePage.querySelector('#add-step-btn');
                    if (addStepBtn) {
                        addStepBtn.onclick = function() {
                            const stepCount = stepList.querySelectorAll('.step-item').length;
                            const item = document.createElement('div');
                            item.className = 'step-item';
                            item.innerHTML = `
                                <div class="step-number">${stepCount + 1}</div>
                                <div class="step-content">
                                    <textarea name="steps[]" class="form-control" placeholder="Įveskite žingsnio aprašymą"></textarea>
                                </div>
                                <div class="step-actions">
                                    <button type="button" class="remove-ingredient-btn"><i class="fas fa-times"></i></button>
                                </div>
                            `;
                            stepList.appendChild(item);
                            
                            // Add remove handler
                            const removeBtn = item.querySelector('.remove-ingredient-btn');
                            if (removeBtn) {
                                removeBtn.addEventListener('click', function() {
                                    stepList.removeChild(item);
                                    updateStepNumbers(stepList);
                                });
                            }
                        };
                    }
                }
                
                // Handle tags
                const tagsContainer = editRecipePage.querySelector('#tags-container');
                const tagsInput = editRecipePage.querySelector('#tags-input');
                
                if (tagsContainer && tagsInput) {
                    // Clear existing tags
                    const existingTags = tagsContainer.querySelectorAll('.tag');
                    existingTags.forEach(tag => {
                        if (!tag.contains(tagsInput)) {
                            tagsContainer.removeChild(tag);
                        }
                    });
                    
                    // Add tags from recipe
                    if (recipe.tags && Array.isArray(recipe.tags)) {
                        recipe.tags.forEach(tag => {
                            const tagEl = document.createElement('div');
                            tagEl.className = 'tag';
                            
                            const tagText = document.createElement('span');
                            tagText.className = 'tag-text';
                            tagText.textContent = tag;
                            
                            const removeBtn = document.createElement('button');
                            removeBtn.className = 'tag-remove';
                            removeBtn.type = 'button';
                            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                            
                            tagEl.appendChild(tagText);
                            tagEl.appendChild(removeBtn);
                            
                            tagsContainer.insertBefore(tagEl, tagsInput);
                            
                            // Add remove handler
                            removeBtn.addEventListener('click', function() {
                                tagsContainer.removeChild(tagEl);
                            });
                        });
                    }
                    
                    // Set up tags input
                    tagsInput.onkeydown = function(e) {
                        if (e.key === 'Enter' && this.value.trim() !== '') {
                            e.preventDefault();
                            
                            const tagEl = document.createElement('div');
                            tagEl.className = 'tag';
                            
                            const tagText = document.createElement('span');
                            tagText.className = 'tag-text';
                            tagText.textContent = this.value.trim();
                            
                            const removeBtn = document.createElement('button');
                            removeBtn.className = 'tag-remove';
                            removeBtn.type = 'button';
                            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                            
                            tagEl.appendChild(tagText);
                            tagEl.appendChild(removeBtn);
                            
                            tagsContainer.insertBefore(tagEl, tagsInput);
                            
                            // Add remove handler
                            removeBtn.addEventListener('click', function() {
                                tagsContainer.removeChild(tagEl);
                            });
                            
                            // Clear input
                            this.value = '';
                        }
                    };
                }
                
                // Handle image preview
                if (recipe.image) {
                    const imagePreview = editRecipePage.querySelector('#image-preview');
                    if (imagePreview) {
                        // Show image preview
                        imagePreview.innerHTML = `
                            <button type="button" class="remove-image"><i class="fas fa-times"></i></button>
                            <img src="/img/recipes/${recipe.image}" alt="${recipe.title}" style="max-width: 100%; height: auto;">
                        `;
                        imagePreview.style.display = 'block';
                        
                        // Add event listener to remove button
                        const removeBtn = imagePreview.querySelector('.remove-image');
                        if (removeBtn) {
                            removeBtn.addEventListener('click', function() {
                                imagePreview.innerHTML = '<button type="button" class="remove-image"><i class="fas fa-times"></i></button>';
                                imagePreview.style.display = 'none';
                            });
                        }
                    }
                }
                
                // Setup file upload preview
                const recipeImage = editRecipePage.querySelector('#recipe-image');
                if (recipeImage) {
                    recipeImage.addEventListener('change', function() {
                        if (this.files && this.files[0]) {
                            const reader = new FileReader();
                            const imagePreview = editRecipePage.querySelector('#image-preview');
                            
                            reader.onload = function(e) {
                                if (imagePreview) {
                                    imagePreview.innerHTML = `
                                        <button type="button" class="remove-image"><i class="fas fa-times"></i></button>
                                        <img src="${e.target.result}" alt="Preview" style="max-width: 100%; height: auto;">
                                    `;
                                    imagePreview.style.display = 'block';
                                    
                                    // Add event listener to remove button
                                    const removeBtn = imagePreview.querySelector('.remove-image');
                                    if (removeBtn) {
                                        removeBtn.addEventListener('click', function() {
                                            imagePreview.innerHTML = '<button type="button" class="remove-image"><i class="fas fa-times"></i></button>';
                                            imagePreview.style.display = 'none';
                                            recipeImage.value = '';
                                        });
                                    }
                                }
                            };
                            
                            reader.readAsDataURL(this.files[0]);
                        }
                    });
                }
                
                // Setup cancel button
                const cancelButton = editRecipePage.querySelector('.cancel-button');
                if (cancelButton) {
                    cancelButton.addEventListener('click', function() {
                        showAdminPage('recipes');
                    });
                }
                
                console.log('Form populated successfully');
            } catch (err) {
                console.error('Error populating form:', err);
                showNotification('Klaida', 'Įvyko klaida užpildant formą: ' + err.message, 'error');
            }
            
            // =========== STEP 3: SHOW THE EDIT PAGE ===========
            showAdminPage('edit-recipe');
            showNotification('Sėkmė', 'Receptas paruoštas redagavimui', 'success');
        })
        .catch(error => {
            console.error('Fetch recipe details error:', error);
            showNotification('Klaida', `Nepavyko įkelti recepto: ${error.message}`, 'error');
        });
    };
    
    // Utility function to update step numbers
    function updateStepNumbers(stepList) {
        const steps = stepList.querySelectorAll('.step-item');
        steps.forEach((step, index) => {
            const numberEl = step.querySelector('.step-number');
            if (numberEl) {
                numberEl.textContent = index + 1;
            }
        });
    }
    
    // Implementation for updating a recipe
    window.directUpdateRecipe = function() {
        console.log('Updating recipe (direct fix)');
        
        // Show loading notification
        showNotification('Informacija', 'Atnaujinamas receptas...', 'success');
        
        // Get form and recipe ID
        const form = document.querySelector('#page-edit-recipe form');
        const recipeId = document.querySelector('#page-edit-recipe #recipe-id')?.value;
        
        if (!form) {
            showNotification('Klaida', 'Forma nerasta', 'error');
            return;
        }
        
        if (!recipeId) {
            showNotification('Klaida', 'Recepto ID nerastas', 'error');
            return;
        }
        
        // Create FormData from form
        const formData = new FormData(form);
        
        // Add tags
        const tags = [];
        document.querySelectorAll('#page-edit-recipe #tags-container .tag-text').forEach(tag => {
            tags.push(tag.textContent);
        });
        formData.append('tags', JSON.stringify(tags));
        
        // Get auth token
        const token = localStorage.getItem('token');
        
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
                
                // Navigate to recipes page after success
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
    };
})();