// Add this to the top of your public/js/admin.js file or create a new fix file

(function() {
    console.log('Category Fix Implementation - Final');
    
    // Create a unified recipe submission function that properly handles categories
    function submitRecipeWithCategories(isUpdate = false) {
        // Get the appropriate page based on whether we're updating or creating
        const page = document.getElementById(isUpdate ? 'page-edit-recipe' : 'page-add-recipe');
        if (!page) {
            console.error(`${isUpdate ? 'Edit' : 'Add'} page not found`);
            showNotification('Klaida', 'Puslapis nerastas', 'error');
            return;
        }
        
        // Get form and validate title
        const form = page.querySelector('form');
        const title = page.querySelector('#recipe-title')?.value;
        
        if (!title || !title.trim()) {
            showNotification('Klaida', 'Recepto pavadinimas yra būtinas', 'error');
            return;
        }
        
        // Get recipe ID for updates
        let recipeId = null;
        if (isUpdate) {
            recipeId = page.querySelector('#recipe-id')?.value;
            if (!recipeId) {
                showNotification('Klaida', 'Recepto ID nerastas', 'error');
                return;
            }
        }
        
        // Create a JSON object with all recipe data
        const recipeData = {};
        
        // Add basic fields
        recipeData.title = title.trim();
        recipeData.intro = page.querySelector('#recipe-intro')?.value || '';
        recipeData.prep_time = page.querySelector('#prep-time')?.value || '';
        recipeData.cook_time = page.querySelector('#cook-time')?.value || '';
        recipeData.servings = page.querySelector('#servings')?.value || '';
        recipeData.notes = page.querySelector('#recipe-notes')?.value || '';
        recipeData.status = page.querySelector('#recipe-status')?.value || 'draft';
        
        // Add ID for updates
        if (isUpdate && recipeId) {
            recipeData.id = recipeId;
        }
        
        // Collect categories - KEY PART OF THE FIX
        const categories = [];
        page.querySelectorAll('.category-checkbox input[type="checkbox"]:checked').forEach(checkbox => {
            categories.push(checkbox.value);
        });
        recipeData.categories = categories;
        console.log('Selected categories:', categories);
        
        // Collect tags
        const tags = [];
        page.querySelectorAll('#tags-container .tag-text').forEach(tag => {
            tags.push(tag.textContent);
        });
        recipeData.tags = tags;
        
        // Collect ingredients
        const ingredients = [];
        page.querySelectorAll('#ingredient-list input[name="ingredients[]"]').forEach(input => {
            if (input.value.trim()) {
                ingredients.push(input.value.trim());
            }
        });
        recipeData.ingredients = ingredients;
        
        // Collect steps
        const steps = [];
        page.querySelectorAll('#step-list textarea[name="steps[]"]').forEach(textarea => {
            if (textarea.value.trim()) {
                steps.push(textarea.value.trim());
            }
        });
        recipeData.steps = steps;
        
        // Get authentication token
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Klaida', 'Nėra autentifikacijos. Prašome prisijungti iš naujo.', 'error');
            return;
        }
        
        // Show loading notification
        showNotification('Informacija', `${isUpdate ? 'Atnaujinamas' : 'Siunčiamas'} receptas...`, 'success');
        
        // Handle image upload first if there's a new image
        const fileInput = page.querySelector('#recipe-image');
        const hasNewImage = fileInput && fileInput.files && fileInput.files[0];
        
        // Define the submission process
        const submitData = (imageFilename = null) => {
            // Add image filename if one was uploaded
            if (imageFilename) {
                recipeData.image = imageFilename;
            }
            
            // Determine URL and method based on whether we're creating or updating
            const url = isUpdate ? `/admin-api/recipes/${recipeId}` : '/admin-api/recipes';
            const method = isUpdate ? 'PUT' : 'POST';
            
            // Send the data as JSON
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
                    
                    // Check if categories were properly saved
                    if (data.data && Array.isArray(data.data.categories)) {
                        if (data.data.categories.length === 0 && categories.length > 0) {
                            // Categories weren't saved, try direct approach
                            console.warn('Categories not saved in main request, trying direct API call...');
                            
                            const savedRecipeId = data.data.id || recipeId;
                            fetch(`/admin-api/recipes/${savedRecipeId}/categories`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ categories: categories })
                            })
                            .then(resp => resp.json())
                            .then(catData => {
                                console.log('Category update result:', catData);
                            })
                            .catch(catError => {
                                console.error('Failed to update categories directly:', catError);
                            });
                        } else {
                            console.log('Categories saved successfully:', data.data.categories);
                        }
                    }
                    
                    showNotification('Sėkmė', `Receptas ${isUpdate ? 'atnaujintas' : 'išsaugotas'} sėkmingai!`, 'success');
                    
                    // Set flag to reset form when navigating back to add recipe
                    if (!isUpdate) {
                        window.shouldResetAddRecipeForm = true;
                    }
                    
                    // Navigate to recipes page after a short delay
                    setTimeout(() => {
                        showAdminPage('recipes');
                    }, 1500);
                } else {
                    throw new Error(data.error || 'Unknown error');
                }
            })
            .catch(error => {
                console.error(`${isUpdate ? 'Update' : 'Save'} recipe error:`, error);
                showNotification('Klaida', `Klaida ${isUpdate ? 'atnaujinant' : 'išsaugant'} receptą: ${error.message}`, 'error');
            });
        };
        
        // Handle image upload if there's a new image
        if (hasNewImage) {
            const imageData = new FormData();
            imageData.append('image', fileInput.files[0]);
            
            fetch('/admin-api/upload/recipe-image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: imageData
            })
            .then(response => {
                if (!response.ok) throw new Error('Failed to upload image');
                return response.json();
            })
            .then(data => {
                if (data.success && data.filename) {
                    submitData(data.filename);
                } else {
                    submitData();
                }
            })
            .catch(error => {
                console.error('Image upload error:', error);
                // Continue without the image
                submitData();
            });
        } else {
            // No new image, submit with existing data
            submitData();
        }
    }
    
    // Override the saveRecipe function
    window.saveRecipe = function() {
        submitRecipeWithCategories(false);
    };
    
    // Override the updateRecipe function 
    window.updateRecipe = function() {
        submitRecipeWithCategories(true);
    };
    
    // Also override updateRecipeImplementation if it exists
    window.updateRecipeImplementation = function() {
        submitRecipeWithCategories(true);
    };
    
    console.log('Category Fix Implementation complete - overriding save/update functions');
})();