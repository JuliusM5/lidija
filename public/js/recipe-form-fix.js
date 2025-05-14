// Direct recipe form submit override
// This script directly replaces the saveRecipe function with a working implementation

(function() {
    // Wait for page to load
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Recipe form fix loaded - replacing saveRecipe function');
        
        // Replace the saveRecipe function
        window.saveRecipe = function() {
            console.log('Using fixed saveRecipe function');
            
            // Get the form
            const form = document.querySelector('#page-add-recipe form');
            if (!form) {
                showNotification('Klaida', 'Forma nerasta', 'error');
                return;
            }
            
            // Validate form
            const title = document.getElementById('recipe-title').value;
            if (!title) {
                showNotification('Klaida', 'Recepto pavadinimas yra būtinas', 'error');
                return;
            }
            
            // Show progress notification
            showNotification('Informacija', 'Ruošiamas receptas...', 'success');
            
            // Get all form fields directly
            const recipeData = {
                title: title,
                intro: document.getElementById('recipe-intro')?.value || '',
                prep_time: document.getElementById('prep-time')?.value || '',
                cook_time: document.getElementById('cook-time')?.value || '',
                servings: document.getElementById('servings')?.value || '',
                notes: document.getElementById('recipe-notes')?.value || '',
                status: document.getElementById('recipe-status')?.value || 'draft'
            };
            
            // Get categories from checkboxes
            const categories = [];
            document.querySelectorAll('.category-checkbox input[type="checkbox"]:checked').forEach(checkbox => {
                categories.push(checkbox.value);
            });
            
            // Get tags
            const tags = [];
            document.querySelectorAll('#tags-container .tag-text').forEach(tag => {
                tags.push(tag.textContent);
            });
            
            // Get ingredients
            const ingredients = [];
            document.querySelectorAll('.ingredient-item input[type="text"]').forEach(input => {
                if (input.value.trim()) {
                    ingredients.push(input.value.trim());
                }
            });
            
            // Get steps
            const steps = [];
            document.querySelectorAll('.step-item textarea').forEach(textarea => {
                if (textarea.value.trim()) {
                    steps.push(textarea.value.trim());
                }
            });
            
            // Create FormData object for the submission
            const formData = new FormData();
            
            // Add simple fields
            formData.append('title', recipeData.title);
            formData.append('intro', recipeData.intro);
            formData.append('prep_time', recipeData.prep_time);
            formData.append('cook_time', recipeData.cook_time);
            formData.append('servings', recipeData.servings);
            formData.append('notes', recipeData.notes);
            formData.append('status', recipeData.status);
            
            // Add arrays
            categories.forEach(category => {
                formData.append('categories', category);
            });
            
            // Add tags as JSON string
            formData.append('tags', JSON.stringify(tags));
            
            // Add ingredients
            ingredients.forEach(ingredient => {
                formData.append('ingredients', ingredient);
            });
            
            // Add steps
            steps.forEach(step => {
                formData.append('steps', step);
            });
            
            // Add image if present
            const imageInput = document.getElementById('recipe-image');
            if (imageInput && imageInput.files && imageInput.files[0]) {
                formData.append('image', imageInput.files[0]);
            }
            
            // Get authentication token
            const token = localStorage.getItem('token');
            if (!token) {
                showNotification('Klaida', 'Nėra autentifikacijos. Prašome prisijungti iš naujo.', 'error');
                return;
            }
            
            // Add a custom X-Debug header to track this request
            const headers = {
                'Authorization': `Bearer ${token}`,
                'X-Debug': 'recipe-form-fix'
            };
            
            // Log what we're about to send
            console.log('Submitting recipe with form data:', {
                title: recipeData.title,
                categories: categories,
                ingredients: ingredients.length + ' items',
                steps: steps.length + ' items',
                hasImage: imageInput && imageInput.files && imageInput.files.length > 0
            });
            
            // Show sending notification
            showNotification('Informacija', 'Siunčiamas receptas...', 'success');
            
            // Send the request
            fetch('/admin-api/recipes', {
                method: 'POST',
                headers: headers,
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    // Try to get detailed error information
                    return response.text().then(text => {
                        try {
                            // See if it's JSON
                            const errorData = JSON.parse(text);
                            throw new Error(errorData.error || `Failed to add recipe: ${response.status}`);
                        } catch (e) {
                            // Not JSON, use the text or status
                            if (text) {
                                throw new Error(`Failed to add recipe: ${text}`);
                            } else {
                                throw new Error(`Failed to add recipe: ${response.status}`);
                            }
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
                    showNotification('Klaida', data.error || 'Nežinoma klaida', 'error');
                }
            })
            .catch(error => {
                console.error('Save recipe error:', error);
                showNotification('Klaida', `Klaida išsaugant receptą: ${error.message}`, 'error');
                
                // Log the detailed error
                console.error('Detailed error information:', error);
            });
        };
        
        // Also replace the updateRecipe function
        window.updateRecipe = function() {
            console.log('Using fixed updateRecipe function');
            
            // Get the form
            const form = document.querySelector('#page-edit-recipe form');
            if (!form) {
                showNotification('Klaida', 'Forma nerasta', 'error');
                return;
            }
            
            // Validate form
            const title = document.getElementById('recipe-title').value;
            const recipeId = document.getElementById('recipe-id').value;
            
            if (!title) {
                showNotification('Klaida', 'Recepto pavadinimas yra būtinas', 'error');
                return;
            }
            
            if (!recipeId) {
                showNotification('Klaida', 'Recepto ID nerastas', 'error');
                return;
            }
            
            // Show progress notification
            showNotification('Informacija', 'Ruošiamas receptas...', 'success');
            
            // Get all form fields directly
            const recipeData = {
                id: recipeId,
                title: title,
                intro: document.getElementById('recipe-intro')?.value || '',
                prep_time: document.getElementById('prep-time')?.value || '',
                cook_time: document.getElementById('cook-time')?.value || '',
                servings: document.getElementById('servings')?.value || '',
                notes: document.getElementById('recipe-notes')?.value || '',
                status: document.getElementById('recipe-status')?.value || 'draft'
            };
            
            // Get categories from checkboxes
            const categories = [];
            document.querySelectorAll('.category-checkbox input[type="checkbox"]:checked').forEach(checkbox => {
                categories.push(checkbox.value);
            });
            
            // Get tags
            const tags = [];
            document.querySelectorAll('#tags-container .tag-text').forEach(tag => {
                tags.push(tag.textContent);
            });
            
            // Get ingredients
            const ingredients = [];
            document.querySelectorAll('.ingredient-item input[type="text"]').forEach(input => {
                if (input.value.trim()) {
                    ingredients.push(input.value.trim());
                }
            });
            
            // Get steps
            const steps = [];
            document.querySelectorAll('.step-item textarea').forEach(textarea => {
                if (textarea.value.trim()) {
                    steps.push(textarea.value.trim());
                }
            });
            
            // Create FormData object for the submission
            const formData = new FormData();
            
            // Add ID
            formData.append('id', recipeData.id);
            
            // Add simple fields
            formData.append('title', recipeData.title);
            formData.append('intro', recipeData.intro);
            formData.append('prep_time', recipeData.prep_time);
            formData.append('cook_time', recipeData.cook_time);
            formData.append('servings', recipeData.servings);
            formData.append('notes', recipeData.notes);
            formData.append('status', recipeData.status);
            
            // Add arrays
            categories.forEach(category => {
                formData.append('categories', category);
            });
            
            // Add tags as JSON string
            formData.append('tags', JSON.stringify(tags));
            
            // Add ingredients
            ingredients.forEach(ingredient => {
                formData.append('ingredients', ingredient);
            });
            
            // Add steps
            steps.forEach(step => {
                formData.append('steps', step);
            });
            
            // Add image if present
            const imageInput = document.getElementById('recipe-image');
            if (imageInput && imageInput.files && imageInput.files[0]) {
                formData.append('image', imageInput.files[0]);
            }
            
            // Get authentication token
            const token = localStorage.getItem('token');
            if (!token) {
                showNotification('Klaida', 'Nėra autentifikacijos. Prašome prisijungti iš naujo.', 'error');
                return;
            }
            
            // Add a custom X-Debug header to track this request
            const headers = {
                'Authorization': `Bearer ${token}`,
                'X-Debug': 'recipe-form-fix'
            };
            
            // Show sending notification
            showNotification('Informacija', 'Atnaujinamas receptas...', 'success');
            
            // Send the request
            fetch(`/admin-api/recipes/${recipeId}`, {
                method: 'PUT',
                headers: headers,
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    // Try to get detailed error information
                    return response.text().then(text => {
                        try {
                            // See if it's JSON
                            const errorData = JSON.parse(text);
                            throw new Error(errorData.error || `Failed to update recipe: ${response.status}`);
                        } catch (e) {
                            // Not JSON, use the text or status
                            if (text) {
                                throw new Error(`Failed to update recipe: ${text}`);
                            } else {
                                throw new Error(`Failed to update recipe: ${response.status}`);
                            }
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
                    showNotification('Klaida', data.error || 'Nežinoma klaida', 'error');
                }
            })
            .catch(error => {
                console.error('Update recipe error:', error);
                showNotification('Klaida', `Klaida atnaujinant receptą: ${error.message}`, 'error');
            });
        };
    });
})();