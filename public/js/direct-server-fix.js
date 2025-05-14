// Direct Server API Fix for Categories
// This script bypasses all other implementations and uses a direct API approach

(function() {
    console.log('Direct Server API Fix for Categories - Final Solution');

    // Replace the save and update functions with completely custom implementations
    const originalSaveRecipe = window.saveRecipe;
    
    window.saveRecipe = async function() {
        console.log('Running final server API fix for saveRecipe');
        
        try {
            // Get the add page
            const addPage = document.getElementById('page-add-recipe');
            if (!addPage) {
                console.error('Add page not found');
                return;
            }
            
            // Validate title
            const title = addPage.querySelector('#recipe-title')?.value;
            if (!title || !title.trim()) {
                showNotification('Klaida', 'Recepto pavadinimas yra būtinas', 'error');
                return;
            }
            
            // Get intro text
            const intro = addPage.querySelector('#recipe-intro')?.value || '';
            
            // Get preparation info
            const prepTime = addPage.querySelector('#prep-time')?.value || '';
            const cookTime = addPage.querySelector('#cook-time')?.value || '';
            const servings = addPage.querySelector('#servings')?.value || '';
            
            // Get notes and status
            const notes = addPage.querySelector('#recipe-notes')?.value || '';
            const status = addPage.querySelector('#recipe-status')?.value || 'draft';
            
            // Get categories
            const categories = [];
            addPage.querySelectorAll('.category-checkbox input[type="checkbox"]:checked').forEach(checkbox => {
                categories.push(checkbox.value);
            });
            
            console.log('Selected categories:', categories);
            
            // Get tags
            const tags = [];
            addPage.querySelectorAll('#tags-container .tag-text').forEach(tag => {
                tags.push(tag.textContent);
            });
            
            // Get ingredients
            const ingredients = [];
            addPage.querySelectorAll('#ingredient-list input[name="ingredients[]"]').forEach(input => {
                if (input.value.trim()) {
                    ingredients.push(input.value.trim());
                }
            });
            
            // Get steps
            const steps = [];
            addPage.querySelectorAll('#step-list textarea[name="steps[]"]').forEach(textarea => {
                if (textarea.value.trim()) {
                    steps.push(textarea.value.trim());
                }
            });
            
            // Get auth token
            const token = localStorage.getItem('token');
            if (!token) {
                showNotification('Klaida', 'Nėra autentifikacijos. Prašome prisijungti iš naujo.', 'error');
                return;
            }
            
            // Show loading notification
            showNotification('Informacija', 'Siunčiamas receptas...', 'success');
            
            // PATCH: Try to debug the expected server format by logging network requests
            // Add network request monitoring
            const originalFetch = window.fetch;
            window.fetch = function(url, options) {
                if (url.includes('/api/recipes') && options && options.method) {
                    console.log(`Intercepted fetch to ${url} with method ${options.method}`);
                    if (options.body) {
                        try {
                            if (options.body instanceof FormData) {
                                console.log('Request contains FormData:');
                                for (const pair of options.body.entries()) {
                                    console.log(`   ${pair[0]}: ${pair[1]}`);
                                }
                            } else {
                                console.log('Request body:', options.body);
                            }
                        } catch (e) {
                            console.log('Error logging request body:', e);
                        }
                    }
                }
                return originalFetch.apply(this, arguments);
            };
            
            // Handle image upload first (if any)
            let imageFileName = null;
            const fileInput = addPage.querySelector('#recipe-image');
            if (fileInput && fileInput.files && fileInput.files[0]) {
                // Create a FormData object for the file upload
                const formData = new FormData();
                formData.append('image', fileInput.files[0]);
                
                // Upload the image first
                try {
                    const imageResponse = await fetch('/admin-api/upload/recipe-image', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        body: formData
                    });
                    
                    if (!imageResponse.ok) {
                        throw new Error('Failed to upload image');
                    }
                    
                    const imageData = await imageResponse.json();
                    if (imageData.success && imageData.filename) {
                        imageFileName = imageData.filename;
                        console.log('Image uploaded successfully:', imageFileName);
                    }
                } catch (error) {
                    console.error('Image upload error:', error);
                    // Continue anyway, image is optional
                }
            }
            
            // Prepare the recipe data
            const recipeData = {
                title: title.trim(),
                intro: intro,
                image: imageFileName,
                prep_time: prepTime,
                cook_time: cookTime,
                servings: servings,
                notes: notes,
                status: status,
                categories: categories,
                tags: tags,
                ingredients: ingredients,
                steps: steps
            };
            
            console.log('Sending recipe data to server:', recipeData);
            
            // Send the recipe data in JSON format
            try {
                // Try to send the data in JSON format directly to the server
                const response = await fetch('/admin-api/recipes', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(recipeData)
                });
                
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Success! Check the results
                if (data.success) {
                    console.log('Recipe saved successfully:', data);
                    
                    // Check if categories were saved correctly
                    if (data.data && Array.isArray(data.data.categories)) {
                        console.log('Categories saved to server:', data.data.categories);
                        
                        // Compare with what we sent
                        if (data.data.categories.length === 0 && categories.length > 0) {
                            console.warn('Categories were not saved correctly! Server returned empty categories array.');
                            
                            // Try one more fallback approach - send a PATCH request with just the categories
                            try {
                                console.log('Attempting fallback PATCH for categories');
                                const patchResponse = await fetch(`/admin-api/recipes/${data.data.id}/categories`, {
                                    method: 'PATCH',
                                    headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ categories: categories })
                                });
                                
                                if (patchResponse.ok) {
                                    const patchData = await patchResponse.json();
                                    console.log('Category PATCH result:', patchData);
                                } else {
                                    console.warn('Category PATCH failed');
                                }
                            } catch (patchError) {
                                console.error('Category PATCH error:', patchError);
                            }
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
            } catch (error) {
                console.error('JSON API call failed:', error);
                
                // Fallback to traditional FormData approach if JSON fails
                console.log('Falling back to FormData approach');
                
                try {
                    // Create a new FormData object
                    const formData = new FormData();
                    
                    // Add all fields to FormData
                    formData.append('title', title.trim());
                    formData.append('intro', intro);
                    if (imageFileName) {
                        formData.append('image', imageFileName);
                    }
                    formData.append('prep_time', prepTime);
                    formData.append('cook_time', cookTime);
                    formData.append('servings', servings);
                    formData.append('notes', notes);
                    formData.append('status', status);
                    
                    // Add categories one by one
                    categories.forEach(category => {
                        formData.append('categories[]', category);
                    });
                    
                    // Add tags as JSON
                    formData.append('tags', JSON.stringify(tags));
                    
                    // Add ingredients one by one
                    ingredients.forEach(ingredient => {
                        formData.append('ingredients[]', ingredient);
                    });
                    
                    // Add steps one by one
                    steps.forEach(step => {
                        formData.append('steps[]', step);
                    });
                    
                    console.log('Falling back to FormData approach with categories:', categories);
                    
                    // Try with the FormData approach
                    const formDataResponse = await fetch('/admin-api/recipes', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        body: formData
                    });
                    
                    if (!formDataResponse.ok) {
                        throw new Error(`Server error: ${formDataResponse.status}`);
                    }
                    
                    const formDataResult = await formDataResponse.json();
                    
                    if (formDataResult.success) {
                        console.log('Recipe saved successfully with FormData:', formDataResult);
                        
                        // Check if categories were saved
                        if (formDataResult.data && Array.isArray(formDataResult.data.categories)) {
                            console.log('Categories saved via FormData:', formDataResult.data.categories);
                        }
                        
                        showNotification('Sėkmė', 'Receptas išsaugotas sėkmingai!', 'success');
                        
                        // Set flag to reset form when navigating back to add recipe
                        window.shouldResetAddRecipeForm = true;
                        
                        // Navigate to recipes page after a short delay
                        setTimeout(() => {
                            showAdminPage('recipes');
                        }, 1500);
                    } else {
                        throw new Error(formDataResult.error || 'Unknown error');
                    }
                } catch (formDataError) {
                    console.error('FormData fallback error:', formDataError);
                    showNotification('Klaida', `Klaida išsaugant receptą: ${formDataError.message}`, 'error');
                }
            }
        } catch (error) {
            console.error('Save recipe error:', error);
            showNotification('Klaida', `Klaida išsaugant receptą: ${error.message}`, 'error');
        }
    };
    
    // Similarly for updateRecipe
    window.updateRecipeImplementation = async function() {
        console.log('Running final server API fix for updateRecipe');
        
        try {
            // Get the edit page
            const editPage = document.getElementById('page-edit-recipe');
            if (!editPage) {
                console.error('Edit page not found');
                showNotification('Klaida', 'Redagavimo puslapis nerastas', 'error');
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
            
            // Get intro text
            const intro = editPage.querySelector('#recipe-intro')?.value || '';
            
            // Get preparation info
            const prepTime = editPage.querySelector('#prep-time')?.value || '';
            const cookTime = editPage.querySelector('#cook-time')?.value || '';
            const servings = editPage.querySelector('#servings')?.value || '';
            
            // Get notes and status
            const notes = editPage.querySelector('#recipe-notes')?.value || '';
            const status = editPage.querySelector('#recipe-status')?.value || 'draft';
            
            // Get categories
            const categories = [];
            editPage.querySelectorAll('.category-checkbox input[type="checkbox"]:checked').forEach(checkbox => {
                categories.push(checkbox.value);
            });
            
            console.log('Selected categories:', categories);
            
            // Get tags
            const tags = [];
            editPage.querySelectorAll('#tags-container .tag-text').forEach(tag => {
                tags.push(tag.textContent);
            });
            
            // Get ingredients
            const ingredients = [];
            editPage.querySelectorAll('#ingredient-list input[name="ingredients[]"]').forEach(input => {
                if (input.value.trim()) {
                    ingredients.push(input.value.trim());
                }
            });
            
            // Get steps
            const steps = [];
            editPage.querySelectorAll('#step-list textarea[name="steps[]"]').forEach(textarea => {
                if (textarea.value.trim()) {
                    steps.push(textarea.value.trim());
                }
            });
            
            // Get auth token
            const token = localStorage.getItem('token');
            if (!token) {
                showNotification('Klaida', 'Nėra autentifikacijos. Prašome prisijungti iš naujo.', 'error');
                return;
            }
            
            // Show loading notification
            showNotification('Informacija', 'Atnaujinamas receptas...', 'success');
            
            // PATCH: Try to debug the expected server format by logging network requests
            // Add network request monitoring
            const originalFetch = window.fetch;
            window.fetch = function(url, options) {
                if (url.includes('/api/recipes') && options && options.method) {
                    console.log(`Intercepted fetch to ${url} with method ${options.method}`);
                    if (options.body) {
                        try {
                            if (options.body instanceof FormData) {
                                console.log('Request contains FormData:');
                                for (const pair of options.body.entries()) {
                                    console.log(`   ${pair[0]}: ${pair[1]}`);
                                }
                            } else {
                                console.log('Request body:', options.body);
                            }
                        } catch (e) {
                            console.log('Error logging request body:', e);
                        }
                    }
                }
                return originalFetch.apply(this, arguments);
            };
            
            // Handle image upload first (if any)
            let imageFileName = null;
            const fileInput = editPage.querySelector('#recipe-image');
            if (fileInput && fileInput.files && fileInput.files[0]) {
                // Create a FormData object for the file upload
                const formData = new FormData();
                formData.append('image', fileInput.files[0]);
                
                // Upload the image first
                try {
                    const imageResponse = await fetch('/admin-api/upload/recipe-image', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        body: formData
                    });
                    
                    if (!imageResponse.ok) {
                        throw new Error('Failed to upload image');
                    }
                    
                    const imageData = await imageResponse.json();
                    if (imageData.success && imageData.filename) {
                        imageFileName = imageData.filename;
                        console.log('Image uploaded successfully:', imageFileName);
                    }
                } catch (error) {
                    console.error('Image upload error:', error);
                    // Continue anyway, image is optional
                }
            }
            
            // Prepare the recipe data
            const recipeData = {
                id: recipeId,
                title: recipeTitle,
                intro: intro,
                prep_time: prepTime,
                cook_time: cookTime,
                servings: servings,
                notes: notes,
                status: status,
                categories: categories,
                tags: tags,
                ingredients: ingredients,
                steps: steps
            };
            
            // Add image only if there's a new one
            if (imageFileName) {
                recipeData.image = imageFileName;
            }
            
            console.log('Sending recipe data to server:', recipeData);
            
            // Try several approaches to update the recipe with proper categories
            try {
                // First, try a direct JSON update
                const response = await fetch(`/admin-api/recipes/${recipeId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(recipeData)
                });
                
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.success) {
                    console.log('Recipe updated successfully:', data);
                    
                    // Check if categories were saved correctly
                    if (data.data && Array.isArray(data.data.categories)) {
                        console.log('Categories saved to server:', data.data.categories);
                        
                        // If categories weren't saved properly, try a direct update
                        if (data.data.categories.length === 0 && categories.length > 0) {
                            console.warn('Categories not saved! Trying direct category update...');
                            
                            // Attempt to update just the categories
                            try {
                                const categoriesResponse = await fetch(`/admin-api/recipes/${recipeId}/categories`, {
                                    method: 'PUT',
                                    headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ categories: categories })
                                });
                                
                                if (categoriesResponse.ok) {
                                    const categoryData = await categoriesResponse.json();
                                    console.log('Direct category update succeeded:', categoryData);
                                } else {
                                    console.error('Failed to update categories directly');
                                }
                            } catch (categoryError) {
                                console.error('Category update error:', categoryError);
                            }
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
            } catch (error) {
                console.error('JSON API call failed:', error);
                
                // Try FormData approach as fallback
                try {
                    console.log('Falling back to FormData approach');
                    
                    // Create a new FormData object
                    const formData = new FormData();
                    
                    // Add all fields to FormData
                    formData.append('title', recipeTitle);
                    formData.append('intro', intro);
                    if (imageFileName) {
                        formData.append('image', imageFileName);
                    }
                    formData.append('prep_time', prepTime);
                    formData.append('cook_time', cookTime);
                    formData.append('servings', servings);
                    formData.append('notes', notes);
                    formData.append('status', status);
                    
                    // Add categories one by one
                    categories.forEach(category => {
                        formData.append('categories[]', category);
                    });
                    
                    // Add tags as JSON
                    formData.append('tags', JSON.stringify(tags));
                    
                    // Add ingredients one by one
                    ingredients.forEach(ingredient => {
                        formData.append('ingredients[]', ingredient);
                    });
                    
                    // Add steps one by one
                    steps.forEach(step => {
                        formData.append('steps[]', step);
                    });
                    
                    // Try with FormData
                    const formDataResponse = await fetch(`/admin-api/recipes/${recipeId}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        body: formData
                    });
                    
                    if (!formDataResponse.ok) {
                        throw new Error(`Server error: ${formDataResponse.status}`);
                    }
                    
                    const formDataResult = await formDataResponse.json();
                    
                    if (formDataResult.success) {
                        console.log('Recipe updated successfully with FormData:', formDataResult);
                        
                        // Check if categories were saved
                        if (formDataResult.data && Array.isArray(formDataResult.data.categories)) {
                            console.log('Categories saved via FormData:', formDataResult.data.categories);
                            
                            // If categories still not saved, try one more approach
                            if (formDataResult.data.categories.length === 0 && categories.length > 0) {
                                // Last resort: Send a direct request for categories
                                const directCategoriesData = new FormData();
                                categories.forEach(category => {
                                    directCategoriesData.append('categories[]', category);
                                });
                                
                                try {
                                    const directResponse = await fetch(`/admin-api/recipes/${recipeId}/categories`, {
                                        method: 'POST',
                                        headers: {
                                            'Authorization': `Bearer ${token}`
                                        },
                                        body: directCategoriesData
                                    });
                                    
                                    if (directResponse.ok) {
                                        console.log('Direct categories update response:', await directResponse.json());
                                    }
                                } catch (directError) {
                                    console.error('Direct categories update error:', directError);
                                }
                            }
                        }
                        
                        showNotification('Sėkmė', 'Receptas atnaujintas sėkmingai!', 'success');
                        
                        // Navigate to recipes page after a short delay
                        setTimeout(() => {
                            showAdminPage('recipes');
                        }, 1500);
                    } else {
                        throw new Error(formDataResult.error || 'Unknown error');
                    }
                } catch (formDataError) {
                    console.error('FormData fallback error:', formDataError);
                    showNotification('Klaida', `Klaida atnaujinant receptą: ${formDataError.message}`, 'error');
                }
            }
        } catch (error) {
            console.error('Update recipe error:', error);
            showNotification('Klaida', `Klaida atnaujinant receptą: ${error.message}`, 'error');
        }
    };
    
    // Make sure updateRecipe function also uses our implementation
    window.updateRecipe = function() {
        window.updateRecipeImplementation();
    };
    
    console.log('Direct Server API Categories Fix ready - completely replaced save/update functions');
})();