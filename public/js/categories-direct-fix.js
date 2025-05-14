// Categories Fix for Recipe Forms
// Add this file after your other scripts in admin.html

(function() {
    console.log('Categories Fix script loaded');
    
    // Override updateRecipe function to fix categories submission issue
    const originalUpdateRecipeImplementation = window.updateRecipeImplementation;
    
    if (typeof window.updateRecipeImplementation === 'function') {
        console.log('Found updateRecipeImplementation function, applying override');
        
        window.updateRecipeImplementation = function() {
            console.log('Running fixed updateRecipeImplementation with category fix...');
            
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
            
            // Create form data object manually to ensure categories are handled correctly
            const formData = new FormData();
            
            // Add all standard form fields
            const formElements = form.elements;
            for (let i = 0; i < formElements.length; i++) {
                const element = formElements[i];
                
                // Skip buttons and unchecked checkboxes
                if (element.type === 'button' || 
                    (element.type === 'checkbox' && !element.checked)) {
                    continue;
                }
                
                // Handle special case for categories[] checkboxes
                if (element.name === 'categories[]' && element.checked) {
                    formData.append('categories[]', element.value);
                    console.log(`Adding category to FormData: ${element.value}`);
                }
                // Handle normal form fields
                else if (element.name && element.name !== 'categories[]') {
                    formData.append(element.name, element.value);
                }
            }
            
            // Manually check all selected categories to make absolutely sure they're included
            const selectedCategories = [];
            editPage.querySelectorAll('.category-checkbox input[type="checkbox"]:checked').forEach(checkbox => {
                selectedCategories.push(checkbox.value);
                // Ensure category is in formData (double-check)
                if (!formData.getAll('categories[]').includes(checkbox.value)) {
                    formData.append('categories[]', checkbox.value);
                    console.log(`Added missing category to FormData: ${checkbox.value}`);
                }
            });
            
            console.log('Selected categories:', selectedCategories);
            console.log('Final categories in FormData:', formData.getAll('categories[]'));
            
            // Collect tags and add to form data
            const tags = [];
            editPage.querySelectorAll('#tags-container .tag-text').forEach(tag => {
                tags.push(tag.textContent);
            });
            formData.append('tags', JSON.stringify(tags));
            
            // Handle file upload if present
            const fileInput = editPage.querySelector('#recipe-image');
            if (fileInput && fileInput.files && fileInput.files[0]) {
                formData.append('image', fileInput.files[0]);
            }
            
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
                    
                    // Check if categories were saved correctly
                    if (data.data && Array.isArray(data.data.categories)) {
                        console.log('Categories saved to server:', data.data.categories);
                        
                        // Compare with what we sent
                        const missingCategories = selectedCategories.filter(
                            cat => !data.data.categories.includes(cat)
                        );
                        
                        if (missingCategories.length > 0) {
                            console.warn('Some categories were not saved correctly:', missingCategories);
                        }
                    }
                    
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
    } else {
        console.warn('updateRecipeImplementation function not found, trying to fix saveRecipe instead');
    }
    
    // Also override the original saveRecipe function if it exists
    const originalSaveRecipe = window.saveRecipe;
    
    if (typeof originalSaveRecipe === 'function') {
        console.log('Found saveRecipe function, applying override');
        
        window.saveRecipe = function() {
            console.log('Running fixed saveRecipe with category fix...');
            
            // Get the form
            const addPage = document.getElementById('page-add-recipe');
            if (!addPage) {
                console.error('Add page not found');
                showNotification('Klaida', 'Puslapis nerasta', 'error');
                return;
            }
            
            const form = addPage.querySelector('form');
            if (!form) {
                showNotification('Klaida', 'Forma nerasta', 'error');
                return;
            }
            
            // Validate form
            const title = addPage.querySelector('#recipe-title')?.value;
            if (!title) {
                showNotification('Klaida', 'Recepto pavadinimas yra būtinas', 'error');
                return;
            }
            
            // Create FormData object manually to ensure categories are handled correctly
            const formData = new FormData();
            
            // Add all standard form fields
            const formElements = form.elements;
            for (let i = 0; i < formElements.length; i++) {
                const element = formElements[i];
                
                // Skip buttons and unchecked checkboxes
                if (element.type === 'button' || 
                    (element.type === 'checkbox' && !element.checked)) {
                    continue;
                }
                
                // Handle special case for categories[] checkboxes
                if (element.name === 'categories[]' && element.checked) {
                    formData.append('categories[]', element.value);
                    console.log(`Adding category to FormData: ${element.value}`);
                }
                // Handle normal form fields
                else if (element.name && element.name !== 'categories[]') {
                    formData.append(element.name, element.value);
                }
            }
            
            // Manually check all selected categories to make absolutely sure they're included
            const selectedCategories = [];
            addPage.querySelectorAll('.category-checkbox input[type="checkbox"]:checked').forEach(checkbox => {
                selectedCategories.push(checkbox.value);
                // Ensure category is in formData (double-check)
                if (!formData.getAll('categories[]').includes(checkbox.value)) {
                    formData.append('categories[]', checkbox.value);
                    console.log(`Added missing category to FormData: ${checkbox.value}`);
                }
            });
            
            console.log('Selected categories:', selectedCategories);
            console.log('Final categories in FormData:', formData.getAll('categories[]'));
            
            // Get tags
            const tags = [];
            addPage.querySelectorAll('#tags-container .tag-text').forEach(tag => {
                tags.push(tag.textContent);
            });
            
            // Add tags to FormData as a JSON string
            formData.append('tags', JSON.stringify(tags));
            
            // Handle file upload if present
            const fileInput = addPage.querySelector('#recipe-image');
            if (fileInput && fileInput.files && fileInput.files[0]) {
                formData.append('image', fileInput.files[0]);
            }
            
            // Get authentication token
            const token = localStorage.getItem('token');
            if (!token) {
                showNotification('Klaida', 'Nėra autentifikacijos. Prašome prisijungti iš naujo.', 'error');
                return;
            }
            
            // Show loading notification
            showNotification('Informacija', 'Siunčiamas receptas...', 'success');
            
            // Send request
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
                    
                    // Check if categories were saved correctly
                    if (data.data && Array.isArray(data.data.categories)) {
                        console.log('Categories saved to server:', data.data.categories);
                        
                        // Compare with what we sent
                        const missingCategories = selectedCategories.filter(
                            cat => !data.data.categories.includes(cat)
                        );
                        
                        if (missingCategories.length > 0) {
                            console.warn('Some categories were not saved correctly:', missingCategories);
                        }
                    }
                    
                    showNotification('Sėkmė', 'Receptas išsaugotas sėkmingai!', 'success');
                    
                    // Set flag to reset form when navigating back to add recipe
                    window.shouldResetAddRecipeForm = true;
                    
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
    } else {
        console.warn('saveRecipe function not found, category fix might not work for new recipes');
    }
    
    console.log('Category fix script loaded successfully');
})();