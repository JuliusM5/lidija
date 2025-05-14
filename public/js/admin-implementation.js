// This file enhances the saveRecipe function in the admin panel
// Add this to the public/js/admin-implementation.js file

function saveRecipe() {
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
    
    // Create FormData object
    const formData = new FormData(form);
    
    // Get tags
    const tags = [];
    document.querySelectorAll('#tags-container .tag-text').forEach(tag => {
        tags.push(tag.textContent);
    });
    
    // Add tags to FormData as a JSON string
    formData.append('tags', JSON.stringify(tags));
    
    // Show loading notification
    showNotification('Informacija', 'Receptas siunčiamas...', 'success');
    
    // Send the form data to the server
    fetch('/api/recipes', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to add recipe: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showNotification('Sėkmė', 'Receptas išsaugotas sėkmingai!', 'success');
            
            // Navigate to recipes page after save
            setTimeout(() => {
                showAdminPage('recipes');
            }, 1000);
        } else {
            showNotification('Klaida', data.error || 'Nežinoma klaida', 'error');
        }
    })
    .catch(error => {
        console.error('Save recipe error:', error);
        showNotification('Klaida', `Klaida išsaugant receptą: ${error.message}`, 'error');
    });
}

function updateRecipe() {
    // Get the form
    const form = document.querySelector('#page-edit-recipe form');
    if (!form) {
        showNotification('Klaida', 'Forma nerasta', 'error');
        return;
    }
    
    // Validate form
    const title = form.querySelector('#recipe-title').value;
    const recipeId = form.querySelector('#recipe-id').value;
    
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
    document.querySelectorAll('#tags-container .tag-text').forEach(tag => {
        tags.push(tag.textContent);
    });
    
    // Add tags to FormData as a JSON string
    formData.append('tags', JSON.stringify(tags));
    
    // Show loading notification
    showNotification('Informacija', 'Receptas atnaujinamas...', 'success');
    
    // Send the form data to the server
    fetch(`/api/recipes/${recipeId}`, {
        method: 'PUT',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to update recipe: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showNotification('Sėkmė', 'Receptas atnaujintas sėkmingai!', 'success');
            
            // Navigate to recipes page after save
            setTimeout(() => {
                showAdminPage('recipes');
            }, 1000);
        } else {
            showNotification('Klaida', data.error || 'Nežinoma klaida', 'error');
        }
    })
    .catch(error => {
        console.error('Update recipe error:', error);
        showNotification('Klaida', `Klaida atnaujinant receptą: ${error.message}`, 'error');
    });
}