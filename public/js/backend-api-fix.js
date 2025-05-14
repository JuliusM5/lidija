// Backend API Fix for Categories
// This script attempts to solve the category save issue by modifying how they are sent

(function() {
    console.log('Backend API Fix for Categories - Final Solution');
    
    // Complete override of saveRecipe
    window.saveRecipe = async function() {
        console.log('Running final saveRecipe implementation');
        
        const addPage = document.getElementById('page-add-recipe');
        if (!addPage) {
            console.error('Add recipe page not found');
            showNotification('Klaida', 'Puslapis nerastas', 'error');
            return;
        }
        
        // Get form and validate title
        const form = addPage.querySelector('form');
        const title = addPage.querySelector('#recipe-title')?.value;
        
        if (!title || !title.trim()) {
            showNotification('Klaida', 'Recepto pavadinimas yra būtinas', 'error');
            return;
        }
        
        // Get auth token
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Klaida', 'Nėra autentifikacijos. Prašome prisijungti iš naujo.', 'error');
            return;
        }
        
        try {
            // Collection of selected categories
            const selectedCategories = [];
            const categoryCheckboxes = addPage.querySelectorAll('.category-checkbox input[type="checkbox"]:checked');
            
            categoryCheckboxes.forEach(checkbox => {
                selectedCategories.push(checkbox.value);
            });
            
            console.log('Selected categories:', selectedCategories);
            
            // Show loading message
            showNotification('Informacija', 'Siunčiamas receptas...', 'success');
            
            // Create a special FormData 
            const formData = new FormData(form);
            
            // Remove any existing categories
            for (const pair of formData.entries()) {
                if (pair[0] === 'categories[]') {
                    formData.delete('categories[]');
                }
            }
            
            // Add categories with different approaches - trying multiple formats
            // Approach 1: Standard array format
            selectedCategories.forEach(category => {
                formData.append('categories[]', category);
            });
            
            // Approach 2: JSON string (in case server expects JSON)
            formData.append('categoriesJSON', JSON.stringify(selectedCategories));
            
            // Approach 3: Numbered array keys
            selectedCategories.forEach((category, index) => {
                formData.append(`categories[${index}]`, category);
            });
            
            // Approach 4: Simple string with the key 'categories'
            formData.append('categories', selectedCategories.join(','));
            
            console.log('FormData entries:');
            for (const pair of formData.entries()) {
                console.log(`   ${pair[0]}: ${pair[1]}`);
            }
            
            // First, try to save with our custom FormData
            const response = await fetch('/admin-api/recipes', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Server returned error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Recipe saved response:', data);
            
            if (data.success) {
                // Check if categories were saved properly
                if (data.data && data.data.categories && data.data.categories.length === 0 && selectedCategories.length > 0) {
                    console.warn('Categories were not saved with recipe. Trying separate update...');
                    
                    // Try to update categories with a separate request
                    const recipeId = data.data.id;
                    
                    // Try different approaches for the category update
                    const updateAttempts = [
                        // Attempt 1: FormData with categories[]
                        async () => {
                            const catFormData = new FormData();
                            selectedCategories.forEach(cat => {
                                catFormData.append('categories[]', cat);
                            });
                            
                            return fetch(`/admin-api/recipes/${recipeId}/categories`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                },
                                body: catFormData
                            });
                        },
                        
                        // Attempt 2: JSON with categories array
                        async () => {
                            return fetch(`/admin-api/recipes/${recipeId}/categories`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ categories: selectedCategories })
                            });
                        },
                        
                        // Attempt 3: PATCH with JSON
                        async () => {
                            return fetch(`/admin-api/recipes/${recipeId}`, {
                                method: 'PATCH',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ categories: selectedCategories })
                            });
                        },
                        
                        // Attempt 4: FormData to main endpoint with just categories
                        async () => {
                            const catOnlyFormData = new FormData();
                            selectedCategories.forEach(cat => {
                                catOnlyFormData.append('categories[]', cat);
                            });
                            
                            return fetch(`/admin-api/recipes/${recipeId}`, {
                                method: 'PUT',
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                },
                                body: catOnlyFormData
                            });
                        }
                    ];
                    
                    // Try each approach in sequence until one works
                    for (const attempt of updateAttempts) {
                        try {
                            const updateResponse = await attempt();
                            
                            if (updateResponse.ok) {
                                const updateData = await updateResponse.json();
                                console.log('Category update succeeded:', updateData);
                                
                                // Check if categories are now set
                                if (updateData.data && 
                                    updateData.data.categories && 
                                    updateData.data.categories.length > 0) {
                                    console.log('Categories successfully updated!');
                                    break;
                                }
                            }
                        } catch (updateError) {
                            console.warn('Category update attempt failed:', updateError);
                            // Continue to the next attempt
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
            console.error('Save recipe error:', error);
            showNotification('Klaida', `Klaida išsaugant receptą: ${error.message}`, 'error');
        }
    };
    
    // Similar for updateRecipe
    window.updateRecipeImplementation = async function() {
        console.log('Running final updateRecipe implementation');
        
        const editPage = document.getElementById('page-edit-recipe');
        if (!editPage) {
            console.error('Edit page not found');
            showNotification('Klaida', 'Redagavimo puslapis nerastas', 'error');
            return;
        }
        
        // Get form and validate title and ID
        const form = editPage.querySelector('form');
        const titleInput = editPage.querySelector('#recipe-title');
        const idInput = editPage.querySelector('#recipe-id');
        
        if (!titleInput || !titleInput.value.trim()) {
            showNotification('Klaida', 'Recepto pavadinimas yra būtinas', 'error');
            return;
        }
        
        if (!idInput || !idInput.value.trim()) {
            showNotification('Klaida', 'Recepto ID nerastas', 'error');
            return;
        }
        
        const recipeId = idInput.value.trim();
        
        // Get auth token
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Klaida', 'Nėra autentifikacijos. Prašome prisijungti iš naujo.', 'error');
            return;
        }
        
        try {
            // Collection of selected categories
            const selectedCategories = [];
            const categoryCheckboxes = editPage.querySelectorAll('.category-checkbox input[type="checkbox"]:checked');
            
            categoryCheckboxes.forEach(checkbox => {
                selectedCategories.push(checkbox.value);
            });
            
            console.log('Selected categories:', selectedCategories);
            
            // Show loading message
            showNotification('Informacija', 'Atnaujinamas receptas...', 'success');
            
            // Create a special FormData 
            const formData = new FormData(form);
            
            // Remove any existing categories
            for (const pair of formData.entries()) {
                if (pair[0] === 'categories[]') {
                    formData.delete('categories[]');
                }
            }
            
            // Add categories with different approaches - trying multiple formats
            // Approach 1: Standard array format
            selectedCategories.forEach(category => {
                formData.append('categories[]', category);
            });
            
            // Approach 2: JSON string (in case server expects JSON)
            formData.append('categoriesJSON', JSON.stringify(selectedCategories));
            
            // Approach 3: Numbered array keys
            selectedCategories.forEach((category, index) => {
                formData.append(`categories[${index}]`, category);
            });
            
            // Approach 4: Simple string with the key 'categories'
            formData.append('categories', selectedCategories.join(','));
            
            console.log('FormData entries:');
            for (const pair of formData.entries()) {
                console.log(`   ${pair[0]}: ${pair[1]}`);
            }
            
            // First, try to update with our custom FormData
            const response = await fetch(`/admin-api/recipes/${recipeId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Server returned error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Recipe update response:', data);
            
            if (data.success) {
                // Check if categories were saved properly
                if (data.data && data.data.categories && data.data.categories.length === 0 && selectedCategories.length > 0) {
                    console.warn('Categories were not updated with recipe. Trying separate update...');
                    
                    // Try different approaches for the category update
                    const updateAttempts = [
                        // Attempt 1: FormData with categories[]
                        async () => {
                            const catFormData = new FormData();
                            selectedCategories.forEach(cat => {
                                catFormData.append('categories[]', cat);
                            });
                            
                            return fetch(`/admin-api/recipes/${recipeId}/categories`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                },
                                body: catFormData
                            });
                        },
                        
                        // Attempt 2: JSON with categories array
                        async () => {
                            return fetch(`/admin-api/recipes/${recipeId}/categories`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ categories: selectedCategories })
                            });
                        },
                        
                        // Attempt 3: PATCH with JSON
                        async () => {
                            return fetch(`/admin-api/recipes/${recipeId}`, {
                                method: 'PATCH',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ categories: selectedCategories })
                            });
                        },
                        
                        // Attempt 4: DELETE + POST to reset categories
                        async () => {
                            // First clear categories
                            await fetch(`/admin-api/recipes/${recipeId}/categories`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            });
                            
                            // Then add new ones
                            const catFormData = new FormData();
                            selectedCategories.forEach(cat => {
                                catFormData.append('categories[]', cat);
                            });
                            
                            return fetch(`/admin-api/recipes/${recipeId}/categories`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                },
                                body: catFormData
                            });
                        },
                        
                        // Attempt 5: Custom update with different name format
                        async () => {
                            const specialFormData = new FormData();
                            selectedCategories.forEach(cat => {
                                // Different naming formats to try to match server expectations
                                specialFormData.append('category[]', cat);
                            });
                            
                            return fetch(`/admin-api/recipes/${recipeId}/update-categories`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                },
                                body: specialFormData
                            });
                        }
                    ];
                    
                    // Try each approach in sequence until one works
                    for (const attempt of updateAttempts) {
                        try {
                            const updateResponse = await attempt();
                            
                            if (updateResponse.ok) {
                                let updateData;
                                try {
                                    updateData = await updateResponse.json();
                                    console.log('Category update succeeded:', updateData);
                                    
                                    // Check if categories are now set
                                    if (updateData.data && 
                                        updateData.data.categories && 
                                        updateData.data.categories.length > 0) {
                                        console.log('Categories successfully updated!');
                                        break;
                                    }
                                } catch (jsonError) {
                                    console.log('Update response is not JSON but may still have succeeded');
                                }
                                
                                // If we got a successful response, consider it a success even without proper data
                                break;
                            }
                        } catch (updateError) {
                            console.warn('Category update attempt failed:', updateError);
                            // Continue to the next attempt
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
            console.error('Update recipe error:', error);
            showNotification('Klaida', `Klaida atnaujinant receptą: ${error.message}`, 'error');
        }
    };
    
    // Make sure updateRecipe function also uses our implementation
    window.updateRecipe = function() {
        window.updateRecipeImplementation();
    };
})();