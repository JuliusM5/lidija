// Recipe Categories Fix - Comprehensive Solution
(function() {
    console.log('Recipe Categories Fix loaded - comprehensive solution');
    
    // Override the saveRecipe function to ensure categories are properly submitted
    window.saveRecipe = function() {
        console.log('Running enhanced saveRecipe with category fix');
        
        // Get the form
        const addPage = document.getElementById('page-add-recipe');
        if (!addPage) {
            showNotification('Klaida', 'Puslapis nerasta', 'error');
            return;
        }
        
        // Validate form
        const title = document.getElementById('recipe-title').value;
        if (!title) {
            showNotification('Klaida', 'Recepto pavadinimas yra būtinas', 'error');
            return;
        }
        
        // Create a JSON object for the recipe data
        const recipeData = {
            title: title,
            intro: document.getElementById('recipe-intro').value || '',
            prep_time: document.getElementById('prep-time').value || '',
            cook_time: document.getElementById('cook-time').value || '',
            servings: document.getElementById('servings').value || '',
            notes: document.getElementById('recipe-notes').value || '',
            status: document.getElementById('recipe-status').value || 'draft'
        };
        
        // Collect selected categories
        const categories = [];
        addPage.querySelectorAll('.category-checkbox input[type="checkbox"]:checked').forEach(checkbox => {
            categories.push(checkbox.value);
        });
        recipeData.categories = categories;
        
        console.log('Selected categories:', categories);
        
        // Collect tags
        const tags = [];
        addPage.querySelectorAll('#tags-container .tag-text').forEach(tag => {
            tags.push(tag.textContent);
        });
        recipeData.tags = tags;
        
        // Collect ingredients
        const ingredients = [];
        addPage.querySelectorAll('#ingredient-list input[name="ingredients[]"]').forEach(input => {
            if (input.value.trim()) {
                ingredients.push(input.value.trim());
            }
        });
        recipeData.ingredients = ingredients;
        
        // Collect steps
        const steps = [];
        addPage.querySelectorAll('#step-list textarea[name="steps[]"]').forEach(textarea => {
            if (textarea.value.trim()) {
                steps.push(textarea.value.trim());
            }
        });
        recipeData.steps = steps;
        
        // Get auth token
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Klaida', 'Nėra autentifikacijos. Prašome prisijungti iš naujo.', 'error');
            return;
        }
        
        // Show loading notification
        showNotification('Informacija', 'Receptas siunčiamas...', 'success');
        
        // First handle the image upload if there is one
        const imageInput = document.getElementById('recipe-image');
        let imageUploadPromise = Promise.resolve(null);
        
        if (imageInput && imageInput.files && imageInput.files[0]) {
            const imageFormData = new FormData();
            imageFormData.append('image', imageInput.files[0]);
            
            imageUploadPromise = fetch('/admin-api/upload/recipe-image', {
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
                    return data.filename;
                }
                return null;
            });
        }
        
        // After image upload (if any), send the recipe data
        imageUploadPromise
            .then(filename => {
                // Add the image filename if we got one
                if (filename) {
                    recipeData.image = filename;
                }
                
                // Send the JSON data to create the recipe
                return fetch('/admin-api/recipes', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(recipeData)
                });
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to add recipe: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    console.log('Recipe saved successfully:', data);
                    
                    // Check if categories were saved correctly
                    if (data.data && Array.isArray(data.data.categories) && 
                        data.data.categories.length === 0 && categories.length > 0) {
                        
                        console.log('Categories were not saved with the recipe. Attempting direct category update...');
                        
                        // Try to update the categories directly
                        return fetch(`/admin-api/recipes/${data.data.id}/categories`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ categories: categories })
                        })
                        .then(catResponse => catResponse.json())
                        .then(catData => {
                            console.log('Category update result:', catData);
                            return data; // Return the original data
                        })
                        .catch(catError => {
                            console.error('Category update error:', catError);
                            return data; // Return the original data even if category update failed
                        });
                    }
                    
                    return data;
                } else {
                    throw new Error(data.error || 'Unknown error');
                }
            })
            .then(data => {
                showNotification('Sėkmė', 'Receptas išsaugotas sėkmingai!', 'success');
                
                // Navigate to recipes page after save
                setTimeout(() => {
                    showAdminPage('recipes');
                }, 1000);
            })
            .catch(error => {
                console.error('Save recipe error:', error);
                showNotification('Klaida', `Klaida išsaugant receptą: ${error.message}`, 'error');
            });
    };
    
    // Similar fix for the updateRecipe function
    window.updateRecipe = function() {
        console.log('Running enhanced updateRecipe with category fix');
        
        // Get the form
        const editPage = document.getElementById('page-edit-recipe');
        if (!editPage) {
            showNotification('Klaida', 'Redagavimo puslapis nerastas', 'error');
            return;
        }
        
        // Validate form
        const title = editPage.querySelector('#recipe-title').value;
        const recipeId = editPage.querySelector('#recipe-id').value;
        
        if (!title) {
            showNotification('Klaida', 'Recepto pavadinimas yra būtinas', 'error');
            return;
        }
        
        if (!recipeId) {
            showNotification('Klaida', 'Recepto ID nerastas', 'error');
            return;
        }
        
        // Create a JSON object for the recipe data
        const recipeData = {
            id: recipeId,
            title: title,
            intro: editPage.querySelector('#recipe-intro').value || '',
            prep_time: editPage.querySelector('#prep-time').value || '',
            cook_time: editPage.querySelector('#cook-time').value || '',
            servings: editPage.querySelector('#servings').value || '',
            notes: editPage.querySelector('#recipe-notes').value || '',
            status: editPage.querySelector('#recipe-status').value || 'draft'
        };
        
        // Collect selected categories
        const categories = [];
        editPage.querySelectorAll('.category-checkbox input[type="checkbox"]:checked').forEach(checkbox => {
            categories.push(checkbox.value);
        });
        recipeData.categories = categories;
        
        console.log('Selected categories:', categories);
        
        // Collect tags
        const tags = [];
        editPage.querySelectorAll('#tags-container .tag-text').forEach(tag => {
            tags.push(tag.textContent);
        });
        recipeData.tags = tags;
        
        // Collect ingredients
        const ingredients = [];
        editPage.querySelectorAll('#ingredient-list input[name="ingredients[]"]').forEach(input => {
            if (input.value.trim()) {
                ingredients.push(input.value.trim());
            }
        });
        recipeData.ingredients = ingredients;
        
        // Collect steps
        const steps = [];
        editPage.querySelectorAll('#step-list textarea[name="steps[]"]').forEach(textarea => {
            if (textarea.value.trim()) {
                steps.push(textarea.value.trim());
            }
        });
        recipeData.steps = steps;
        
        // Get auth token
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Klaida', 'Nėra autentifikacijos. Prašome prisijungti iš naujo.', 'error');
            return;
        }
        
        // Show loading notification
        showNotification('Informacija', 'Receptas atnaujinamas...', 'success');
        
        // First handle the image upload if there is one
        const imageInput = editPage.querySelector('#recipe-image');
        let imageUploadPromise = Promise.resolve(null);
        
        if (imageInput && imageInput.files && imageInput.files[0]) {
            const imageFormData = new FormData();
            imageFormData.append('image', imageInput.files[0]);
            
            imageUploadPromise = fetch('/admin-api/upload/recipe-image', {
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
                    return data.filename;
                }
                return null;
            });
        }
        
        // After image upload (if any), send the recipe data
        imageUploadPromise
            .then(filename => {
                // Add the image filename if we got one
                if (filename) {
                    recipeData.image = filename;
                }
                
                // Send the JSON data to update the recipe
                return fetch(`/admin-api/recipes/${recipeId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(recipeData)
                });
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to update recipe: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    console.log('Recipe updated successfully:', data);
                    
                    // Check if categories were saved correctly
                    if (data.data && Array.isArray(data.data.categories) && 
                        data.data.categories.length === 0 && categories.length > 0) {
                        
                        console.log('Categories were not saved with the recipe update. Attempting direct category update...');
                        
                        // Try to update the categories directly
                        return fetch(`/admin-api/recipes/${recipeId}/categories`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ categories: categories })
                        })
                        .then(catResponse => catResponse.json())
                        .then(catData => {
                            console.log('Category update result:', catData);
                            return data; // Return the original data
                        })
                        .catch(catError => {
                            console.error('Category update error:', catError);
                            return data; // Return the original data even if category update failed
                        });
                    }
                    
                    return data;
                } else {
                    throw new Error(data.error || 'Unknown error');
                }
            })
            .then(data => {
                showNotification('Sėkmė', 'Receptas atnaujintas sėkmingai!', 'success');
                
                // Navigate to recipes page after save
                setTimeout(() => {
                    showAdminPage('recipes');
                }, 1000);
            })
            .catch(error => {
                console.error('Update recipe error:', error);
                showNotification('Klaida', `Klaida atnaujinant receptą: ${error.message}`, 'error');
            });
    };
    
    // Also set for the updateRecipeImplementation if it exists
    if (typeof window.updateRecipeImplementation !== 'undefined') {
        window.updateRecipeImplementation = window.updateRecipe;
    }
    
    console.log('Recipe Categories Fix successfully applied');
})();