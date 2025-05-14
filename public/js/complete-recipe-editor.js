// Complete Recipe Editor Implementation
// This file provides a complete replacement for both the recipe edit and recipe submit functions
// Save this as complete-recipe-editor.js in your public/js directory

(function() {
    console.log('Complete recipe editor loaded');
    
    // When the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Recipe editor initializing...');
        
        // First, let's fix the Add Recipe functionality
        setupAddRecipePage();
        
        // Then, let's implement a proper edit recipe function
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
                
                // Create and show the edit form
                createEditRecipePage(recipe);
                
                // Show success notification
                showNotification('Sėkmė', 'Receptas paruoštas redagavimui', 'success');
            })
            .catch(error => {
                console.error('Recipe edit error:', error);
                showNotification('Klaida', `Nepavyko įkelti recepto: ${error.message}`, 'error');
            });
        };
    });
    
    // Setup the Add Recipe page functionality
    function setupAddRecipePage() {
        // First, set up the saveRecipe function that gets called when the user clicks the save button
        window.saveRecipe = function() {
            console.log('Saving new recipe...');
            
            // Get the form
            const form = document.querySelector('#page-add-recipe form');
            if (!form) {
                showNotification('Klaida', 'Forma nerasta', 'error');
                return;
            }
            
            // Validate form
            const title = document.getElementById('recipe-title')?.value;
            if (!title) {
                showNotification('Klaida', 'Recepto pavadinimas yra būtinas', 'error');
                return;
            }
            
            // Create FormData object
            const formData = new FormData(form);
            
            // Get tags
            const tags = [];
            document.querySelectorAll('#tags-container .tag-text').forEach(tag => {
                tags.push(tag.textContent);
            });
            
            // Add tags to FormData as a JSON string
            formData.append('tags', JSON.stringify(tags));
            
            // Get authentication token
            const token = localStorage.getItem('token');
            if (!token) {
                showNotification('Klaida', 'Nėra autentifikacijos. Prašome prisijungti iš naujo.', 'error');
                return;
            }
            
            // Show loading notification
            showNotification('Informacija', 'Siunčiamas receptas...', 'success');
            
            // Send the request
            fetch('/admin-api/recipes', {
                method: 'POST',
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
                            throw new Error(data.error || `Failed to add recipe: ${response.status}`);
                        } catch (e) {
                            throw new Error(`Failed to add recipe: ${response.status} - ${text || 'Unknown error'}`);
                        }
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    console.log('Recipe saved successfully:', data);
                    showNotification('Sėkmė', 'Receptas išsaugotas sėkmingai!', 'success');
                    
                    // Navigate to recipes page after a short delay
                    setTimeout(() => {
                        showAdminPage('recipes');
                    }, 1500);
                } else {
                    throw new Error(data.error || 'Unknown error');
                }
            })
            .catch(error => {
                console.error('Save recipe error:', error);
                showNotification('Klaida', `Klaida išsaugant receptą: ${error.message}`, 'error');
            });
        };
        
        // Initialize the add recipe page elements
        initRecipePageElements('page-add-recipe');
    }
    
    // Create and set up the Edit Recipe page
    function createEditRecipePage(recipe) {
        // Get the add recipe page as a template
        const addRecipePage = document.getElementById('page-add-recipe');
        if (!addRecipePage) {
            showNotification('Klaida', 'Nėra šablono puslapio', 'error');
            return;
        }
        
        // Get or create the edit recipe page
        let editPage = document.getElementById('page-edit-recipe');
        
        // If the edit page doesn't exist, create it
        if (!editPage) {
            editPage = document.createElement('div');
            editPage.id = 'page-edit-recipe';
            editPage.className = 'admin-page';
            editPage.style.display = 'none';
            
            // Clone the add recipe page content
            editPage.innerHTML = addRecipePage.innerHTML;
            
            // Change the title
            const title = editPage.querySelector('.admin-section-title');
            if (title) {
                title.textContent = 'Redaguoti receptą';
            }
            
            // Add hidden ID field
            const form = editPage.querySelector('form');
            if (form) {
                const idField = document.createElement('input');
                idField.type = 'hidden';
                idField.id = 'recipe-id';
                idField.name = 'id';
                form.appendChild(idField);
                
                // Change the submit button action
                const submitButton = form.querySelector('.submit-button');
                if (submitButton) {
                    submitButton.textContent = 'Atnaujinti receptą';
                    submitButton.onclick = function() {
                        updateRecipe();
                    };
                }
            }
            
            // Add to the page
            addRecipePage.parentNode.appendChild(editPage);
            
            // Initialize the form elements
            initRecipePageElements('page-edit-recipe');
        }
        
        // Now populate the form with recipe data
        populateRecipeForm(recipe);
        
        // Show the edit page
        showAdminPage('edit-recipe');
    }
    
    // Initialize the form elements and event handlers
    function initRecipePageElements(pageId) {
        const page = document.getElementById(pageId);
        if (!page) return;
        
        // Setup ingredient list functionality
        const addIngredientBtn = page.querySelector('#add-ingredient-btn');
        if (addIngredientBtn) {
            addIngredientBtn.onclick = function() {
                const ingredientList = page.querySelector('#ingredient-list');
                if (ingredientList) {
                    const newItem = document.createElement('div');
                    newItem.className = 'ingredient-item';
                    newItem.innerHTML = `
                        <input type="text" name="ingredients[]" class="form-control" placeholder="Įveskite ingredientą">
                        <button type="button" class="remove-ingredient-btn"><i class="fas fa-times"></i></button>
                    `;
                    ingredientList.appendChild(newItem);
                    
                    // Add remove button handler
                    const removeBtn = newItem.querySelector('.remove-ingredient-btn');
                    if (removeBtn) {
                        removeBtn.onclick = function() {
                            ingredientList.removeChild(newItem);
                        };
                    }
                }
            };
        }
        
        // Setup step list functionality
        const addStepBtn = page.querySelector('#add-step-btn');
        if (addStepBtn) {
            addStepBtn.onclick = function() {
                const stepList = page.querySelector('#step-list');
                if (stepList) {
                    const steps = stepList.querySelectorAll('.step-item');
                    const nextNumber = steps.length + 1;
                    
                    const newItem = document.createElement('div');
                    newItem.className = 'step-item';
                    newItem.innerHTML = `
                        <div class="step-number">${nextNumber}</div>
                        <div class="step-content">
                            <textarea name="steps[]" class="form-control" placeholder="Įveskite žingsnio aprašymą"></textarea>
                        </div>
                        <div class="step-actions">
                            <button type="button" class="remove-ingredient-btn"><i class="fas fa-times"></i></button>
                        </div>
                    `;
                    stepList.appendChild(newItem);
                    
                    // Add remove button handler
                    const removeBtn = newItem.querySelector('.remove-ingredient-btn');
                    if (removeBtn) {
                        removeBtn.onclick = function() {
                            stepList.removeChild(newItem);
                            updateStepNumbers(stepList);
                        };
                    }
                }
            };
        }
        
        // Setup tags input
        const tagsInput = page.querySelector('#tags-input');
        if (tagsInput) {
            tagsInput.onkeydown = function(e) {
                if (e.key === 'Enter' && this.value.trim() !== '') {
                    e.preventDefault();
                    
                    const tagsContainer = page.querySelector('#tags-container');
                    if (tagsContainer) {
                        const tag = document.createElement('div');
                        tag.className = 'tag';
                        
                        const tagText = document.createElement('span');
                        tagText.className = 'tag-text';
                        tagText.textContent = this.value.trim();
                        
                        const tagRemove = document.createElement('button');
                        tagRemove.className = 'tag-remove';
                        tagRemove.type = 'button';
                        tagRemove.innerHTML = '<i class="fas fa-times"></i>';
                        tagRemove.onclick = function() {
                            tagsContainer.removeChild(tag);
                        };
                        
                        tag.appendChild(tagText);
                        tag.appendChild(tagRemove);
                        
                        tagsContainer.insertBefore(tag, this);
                        this.value = '';
                    }
                }
            };
        }
        
        // Setup image preview
        const imageInput = page.querySelector('#recipe-image');
        if (imageInput) {
            imageInput.onchange = function() {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    const preview = page.querySelector('#image-preview');
                    
                    reader.onload = function(e) {
                        preview.innerHTML = `
                            <button type="button" class="remove-image"><i class="fas fa-times"></i></button>
                            <img src="${e.target.result}" alt="Image preview" style="max-width: 100%; height: auto;">
                        `;
                        preview.style.display = 'block';
                        
                        // Add remove button handler
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
        
        // Add handlers for existing remove buttons
        page.querySelectorAll('.ingredient-item .remove-ingredient-btn').forEach(button => {
            button.onclick = function() {
                const item = this.closest('.ingredient-item');
                if (item && item.parentNode) {
                    item.parentNode.removeChild(item);
                }
            };
        });
        
        page.querySelectorAll('.step-item .remove-ingredient-btn').forEach(button => {
            button.onclick = function() {
                const item = this.closest('.step-item');
                if (item && item.parentNode) {
                    item.parentNode.removeChild(item);
                    updateStepNumbers(item.parentNode);
                }
            };
        });
        
        // Set up remove image button
        const removeImageBtn = page.querySelector('#image-preview .remove-image');
        if (removeImageBtn) {
            removeImageBtn.onclick = function() {
                const preview = page.querySelector('#image-preview');
                preview.innerHTML = '<button type="button" class="remove-image"><i class="fas fa-times"></i></button>';
                preview.style.display = 'none';
                
                const imageInput = page.querySelector('#recipe-image');
                if (imageInput) {
                    imageInput.value = '';
                }
            };
        }
    }
    
    // Populate the edit form with recipe data
    function populateRecipeForm(recipe) {
        // Get the edit page
        const editPage = document.getElementById('page-edit-recipe');
        if (!editPage) {
            console.error('Edit page not found');
            return;
        }
        
        try {
            // Set basic fields
            safeSetValue(editPage, 'recipe-id', recipe.id);
            safeSetValue(editPage, 'recipe-title', recipe.title);
            safeSetValue(editPage, 'recipe-intro', recipe.intro);
            safeSetValue(editPage, 'prep-time', recipe.prep_time);
            safeSetValue(editPage, 'cook-time', recipe.cook_time);
            safeSetValue(editPage, 'servings', recipe.servings);
            safeSetValue(editPage, 'recipe-notes', recipe.notes);
            safeSetValue(editPage, 'recipe-status', recipe.status);
            
            // Set categories
            if (recipe.categories && Array.isArray(recipe.categories)) {
                const checkboxes = editPage.querySelectorAll('.category-checkbox input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = recipe.categories.includes(checkbox.value);
                });
            }
            
            // Handle ingredients
            const ingredientList = editPage.querySelector('#ingredient-list');
            if (ingredientList) {
                // Clear existing ingredients
                ingredientList.innerHTML = '';
                
                // Add ingredients
                if (recipe.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
                    recipe.ingredients.forEach(ingredient => {
                        addIngredientToForm(ingredient, ingredientList);
                    });
                } else {
                    // Add empty ingredient
                    addIngredientToForm('', ingredientList);
                }
            }
            
            // Handle steps
            const stepList = editPage.querySelector('#step-list');
            if (stepList) {
                // Clear existing steps
                stepList.innerHTML = '';
                
                // Add steps
                if (recipe.steps && Array.isArray(recipe.steps) && recipe.steps.length > 0) {
                    recipe.steps.forEach((step, index) => {
                        addStepToForm(step, index + 1, stepList);
                    });
                } else {
                    // Add empty step
                    addStepToForm('', 1, stepList);
                }
            }
            
            // Handle tags
            const tagsContainer = editPage.querySelector('#tags-container');
            const tagsInput = editPage.querySelector('#tags-input');
            if (tagsContainer && tagsInput) {
                // Clear existing tags
                Array.from(tagsContainer.children).forEach(child => {
                    if (child !== tagsInput) {
                        tagsContainer.removeChild(child);
                    }
                });
                
                // Add tags
                if (recipe.tags && Array.isArray(recipe.tags)) {
                    recipe.tags.forEach(tag => {
                        addTagToForm(tag, tagsContainer, tagsInput);
                    });
                }
            }
            
            // Handle image preview
            if (recipe.image) {
                const imagePreview = editPage.querySelector('#image-preview');
                if (imagePreview) {
                    imagePreview.innerHTML = `
                        <button type="button" class="remove-image"><i class="fas fa-times"></i></button>
                        <img src="/img/recipes/${recipe.image}" alt="${recipe.title}" style="max-width: 100%; height: auto;">
                    `;
                    imagePreview.style.display = 'block';
                    
                    // Add remove button handler
                    const removeBtn = imagePreview.querySelector('.remove-image');
                    if (removeBtn) {
                        removeBtn.onclick = function() {
                            imagePreview.innerHTML = '<button type="button" class="remove-image"><i class="fas fa-times"></i></button>';
                            imagePreview.style.display = 'none';
                        };
                    }
                }
            }
            
            console.log('Recipe form populated successfully');
        } catch (error) {
            console.error('Error populating recipe form:', error);
            showNotification('Klaida', `Klaida užpildant formą: ${error.message}`, 'error');
        }
    }
    
    // Safely set value to an element
    function safeSetValue(container, elementId, value) {
        const element = container.querySelector(`#${elementId}`);
        if (element) {
            element.value = value || '';
        } else {
            console.warn(`Element not found: #${elementId}`);
        }
    }
    
    // Add ingredient to form
    function addIngredientToForm(value, container) {
        const item = document.createElement('div');
        item.className = 'ingredient-item';
        item.innerHTML = `
            <input type="text" name="ingredients[]" class="form-control" placeholder="Įveskite ingredientą" value="${value || ''}">
            <button type="button" class="remove-ingredient-btn"><i class="fas fa-times"></i></button>
        `;
        container.appendChild(item);
        
        // Add remove button handler
        const removeBtn = item.querySelector('.remove-ingredient-btn');
        if (removeBtn) {
            removeBtn.onclick = function() {
                container.removeChild(item);
            };
        }
    }
    
    // Add step to form
    function addStepToForm(value, number, container) {
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
        
        // Add remove button handler
        const removeBtn = item.querySelector('.remove-ingredient-btn');
        if (removeBtn) {
            removeBtn.onclick = function() {
                container.removeChild(item);
                updateStepNumbers(container);
            };
        }
    }
    
    // Add tag to form
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
        tagRemove.onclick = function() {
            container.removeChild(tag);
        };
        
        tag.appendChild(tagTextEl);
        tag.appendChild(tagRemove);
        
        container.insertBefore(tag, inputElement);
    }
    
    // Update step numbers
    function updateStepNumbers(container) {
        const steps = container.querySelectorAll('.step-item');
        steps.forEach((step, index) => {
            const numberElement = step.querySelector('.step-number');
            if (numberElement) {
                numberElement.textContent = index + 1;
            }
        });
    }
    
    // Function to update an existing recipe
    window.updateRecipe = function() {
        console.log('Updating recipe...');
        
        // Get the form
        const form = document.querySelector('#page-edit-recipe form');
        if (!form) {
            showNotification('Klaida', 'Forma nerasta', 'error');
            return;
        }
        
        // Validate form
        const title = document.getElementById('recipe-title')?.value;
        const recipeId = document.getElementById('recipe-id')?.value;
        
        if (!title) {
            showNotification('Klaida', 'Recepto pavadinimas yra būtinas', 'error');
            return;
        }
        
        if (!recipeId) {
            showNotification('Klaida', 'Recepto ID nerastas', 'error');
            return;
        }
        
        // Create FormData object
        const formData = new FormData(form);
        
        // Get tags
        const tags = [];
        document.querySelectorAll('#page-edit-recipe #tags-container .tag-text').forEach(tag => {
            tags.push(tag.textContent);
        });
        
        // Add tags to FormData as a JSON string
        formData.append('tags', JSON.stringify(tags));
        
        // Get authentication token
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Klaida', 'Nėra autentifikacijos. Prašome prisijungti iš naujo.', 'error');
            return;
        }
        
        // Show loading notification
        showNotification('Informacija', 'Atnaujinamas receptas...', 'success');
        
        // Send the request
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
    };
})();