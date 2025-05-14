// Server API Fix for Categories
// This script directly patches the categories handling

(function() {
    console.log('Server API Categories Fix loaded');
    
    // This is a direct override of the categories submission logic
    // that completely bypasses the FormData handling for categories
    
    // Reference to original functions
    const originalSaveRecipe = window.saveRecipe;
    const originalUpdateRecipe = typeof window.updateRecipeImplementation === 'function' 
        ? window.updateRecipeImplementation 
        : window.updateRecipe;
    
    // Function to convert server data to JSON format
    function dataToJson(formData) {
        const jsonData = {};
        
        // Convert formData to plain object
        for(const [key, value] of formData.entries()) {
            if (key === 'image') continue; // Skip image file
            
            // Handle array fields (with square brackets in name)
            if (key.endsWith('[]')) {
                const baseName = key.substring(0, key.length - 2);
                
                if (!jsonData[baseName]) {
                    jsonData[baseName] = [];
                }
                jsonData[baseName].push(value);
            } else {
                jsonData[key] = value;
            }
        }
        
        return jsonData;
    }
    
    // Replace saveRecipe
    window.saveRecipe = function() {
        console.log('Running server API fix for saveRecipe');
        
        // Get the form
        const addPage = document.getElementById('page-add-recipe');
        if (!addPage) {
            console.error('Add page not found');
            if (originalSaveRecipe) originalSaveRecipe();
            return;
        }
        
        const form = addPage.querySelector('form');
        if (!form) {
            console.error('Form not found');
            if (originalSaveRecipe) originalSaveRecipe();
            return;
        }
        
        // Validate form
        const title = addPage.querySelector('#recipe-title')?.value;
        if (!title) {
            showNotification('Klaida', 'Recepto pavadinimas yra būtinas', 'error');
            return;
        }
        
        // Create FormData object for file upload
        const formData = new FormData(form);
        
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
        
        // Create a merged data object
        const jsonData = dataToJson(formData);
        
        // Override with our collected arrays
        jsonData.categories = categories;
        jsonData.tags = tags;
        jsonData.ingredients = ingredients;
        jsonData.steps = steps;
        
        console.log('Server API fix - sending data:', jsonData);
        
        // Get authentication token
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Klaida', 'Nėra autentifikacijos. Prašome prisijungti iš naujo.', 'error');
            return;
        }
        
        // Show loading notification
        showNotification('Informacija', 'Siunčiamas receptas...', 'success');
        
        // Make API requests - one for uploading the image, one for the data
        const promises = [];
        
        // 1. Upload the image if one is selected
        const fileInput = addPage.querySelector('#recipe-image');
        if (fileInput && fileInput.files && fileInput.files[0]) {
            const imageData = new FormData();
            imageData.append('image', fileInput.files[0]);
            
            const imagePromise = fetch('/admin-api/upload/recipe-image', {
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
                    jsonData.image = data.filename;
                    return data.filename;
                }
                return null;
            });
            
            promises.push(imagePromise);
        }
        
        // Wait for image upload to complete, then send the full data
        Promise.all(promises)
            .then(() => {
                return fetch('/admin-api/recipes', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(jsonData)
                });
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
                        const missingCategories = categories.filter(
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
    
    // Replace updateRecipe
    window.updateRecipeImplementation = function() {
        console.log('Running server API fix for updateRecipe');
        
        // Get the edit page
        const editPage = document.getElementById('page-edit-recipe');
        if (!editPage) {
            console.error('Edit page not found');
            if (originalUpdateRecipe) originalUpdateRecipe();
            return;
        }
        
        // Get the form
        const form = editPage.querySelector('form');
        if (!form) {
            console.error('Form not found');
            if (originalUpdateRecipe) originalUpdateRecipe();
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
        
        // Create FormData object for file upload
        const formData = new FormData(form);
        
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
        
        // Create a merged data object
        const jsonData = dataToJson(formData);
        
        // Override with our collected arrays
        jsonData.categories = categories;
        jsonData.tags = tags;
        jsonData.ingredients = ingredients;
        jsonData.steps = steps;
        
        // Ensure ID is included
        jsonData.id = recipeId;
        
        console.log('Server API fix - sending data:', jsonData);
        
        // Get auth token
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Klaida', 'Nėra autentifikacijos. Prašome prisijungti iš naujo.', 'error');
            return;
        }
        
        // Show loading notification
        showNotification('Informacija', 'Atnaujinamas receptas...', 'success');
        
        // Make API requests - one for uploading the image, one for the data
        const promises = [];
        
        // 1. Upload the image if one is selected
        const fileInput = editPage.querySelector('#recipe-image');
        if (fileInput && fileInput.files && fileInput.files[0]) {
            const imageData = new FormData();
            imageData.append('image', fileInput.files[0]);
            
            const imagePromise = fetch('/admin-api/upload/recipe-image', {
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
                    jsonData.image = data.filename;
                    return data.filename;
                }
                return null;
            });
            
            promises.push(imagePromise);
        }
        
        // Wait for image upload to complete, then send the full data
        Promise.all(promises)
            .then(() => {
                return fetch(`/admin-api/recipes/${recipeId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(jsonData)
                });
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
                        const missingCategories = categories.filter(
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
    
    // Make sure updateRecipe function also uses our implementation
    window.updateRecipe = function() {
        window.updateRecipeImplementation();
    };
    
    console.log('Server API Categories Fix ready - complete override of save/update functions');
})();