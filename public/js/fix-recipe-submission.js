//============================================================
// DIRECT RECIPE SUBMISSION SOLUTION
// This JavaScript file implements a standalone solution for submitting recipes
// It completely bypasses the existing admin.js implementation
//============================================================

// INSTRUCTIONS:
// 1. Save this as fix-recipe-submission.js in the public/js folder
// 2. Add a script tag to admin.html: <script src="js/fix-recipe-submission.js"></script>
// 3. When on the Add Recipe page, press F12 to open Developer Tools
// 4. Type submitRecipeDirectly() in the console and press Enter

function submitRecipeDirectly() {
    // Display a status message on the page
    const statusArea = document.createElement('div');
    statusArea.style.backgroundColor = '#f8f9fa';
    statusArea.style.border = '1px solid #dee2e6';
    statusArea.style.borderRadius = '4px';
    statusArea.style.padding = '15px';
    statusArea.style.margin = '20px 0';
    statusArea.style.maxHeight = '300px';
    statusArea.style.overflow = 'auto';
    statusArea.innerHTML = '<h3>Recipe Submission Status</h3><p>Starting submission process...</p>';
    
    // Insert it at the top of the form
    const form = document.querySelector('#page-add-recipe form');
    if (form) {
        form.parentNode.insertBefore(statusArea, form);
    } else {
        document.querySelector('#page-add-recipe').appendChild(statusArea);
    }
    
    // Add a log function to update status
    function log(message, isError = false) {
        const p = document.createElement('p');
        p.style.margin = '5px 0';
        p.style.fontFamily = 'monospace';
        if (isError) {
            p.style.color = 'red';
        }
        p.textContent = message;
        statusArea.appendChild(p);
        
        // Also log to console
        if (isError) {
            console.error(message);
        } else {
            console.log(message);
        }
        
        // Scroll to the bottom
        statusArea.scrollTop = statusArea.scrollHeight;
    }
    
    log("Collecting form data...");
    
    // Get the recipe title
    const title = document.getElementById('recipe-title')?.value;
    if (!title) {
        log("ERROR: Recipe title is required", true);
        return;
    }
    
    log(`Title: ${title}`);
    
    // Create a simple object with the essential recipe data
    const recipeData = {
        title: title,
        intro: document.getElementById('recipe-intro')?.value || "",
        status: document.getElementById('recipe-status')?.value || "draft"
    };
    
    // Get categories
    const categories = [];
    document.querySelectorAll('.category-checkbox input[type="checkbox"]:checked').forEach(checkbox => {
        categories.push(checkbox.value);
    });
    recipeData.categories = categories;
    
    log(`Categories: ${categories.length > 0 ? categories.join(', ') : 'None'}`);
    
    // Get tags
    const tags = [];
    document.querySelectorAll('#tags-container .tag-text').forEach(tag => {
        tags.push(tag.textContent);
    });
    recipeData.tags = tags;
    
    log(`Tags: ${tags.length > 0 ? tags.join(', ') : 'None'}`);
    
    // Get recipe info
    recipeData.prep_time = document.getElementById('prep-time')?.value || "";
    recipeData.cook_time = document.getElementById('cook-time')?.value || "";
    recipeData.servings = document.getElementById('servings')?.value || "";
    
    // Get ingredients
    const ingredients = [];
    document.querySelectorAll('.ingredient-item input[type="text"]').forEach(input => {
        if (input.value.trim()) {
            ingredients.push(input.value.trim());
        }
    });
    recipeData.ingredients = ingredients;
    
    log(`Ingredients: ${ingredients.length} items`);
    
    // Get steps
    const steps = [];
    document.querySelectorAll('.step-item textarea').forEach(textarea => {
        if (textarea.value.trim()) {
            steps.push(textarea.value.trim());
        }
    });
    recipeData.steps = steps;
    
    log(`Steps: ${steps.length} items`);
    
    // Get notes
    recipeData.notes = document.getElementById('recipe-notes')?.value || "";
    
    // Check if we have an image
    const imageInput = document.getElementById('recipe-image');
    let hasImage = false;
    if (imageInput && imageInput.files && imageInput.files.length > 0) {
        hasImage = true;
        log(`Image: ${imageInput.files[0].name} (${Math.round(imageInput.files[0].size / 1024)} KB)`);
    } else {
        log("No image selected");
    }
    
    // Now we'll try two different approaches to submit the recipe
    
    log("Attempting to submit the recipe with JSON data...");
    
    // Approach 1: Send as JSON
    const token = localStorage.getItem('token') || '';
    
    fetch('/admin-api/recipes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(recipeData)
    })
    .then(response => {
        if (!response.ok) {
            log(`JSON submission failed with status: ${response.status} ${response.statusText}`, true);
            
            // Try to get more details from the response
            return response.text().then(text => {
                try {
                    const data = JSON.parse(text);
                    log(`Error details: ${data.error || text}`, true);
                } catch (e) {
                    log(`Response body: ${text}`, true);
                }
                
                // If JSON approach failed and we have an image, try FormData approach
                if (hasImage) {
                    log("Trying alternate approach with FormData...");
                    return submitWithFormData();
                }
                throw new Error('JSON submission failed');
            });
        }
        
        return response.json();
    })
    .then(data => {
        if (data.success) {
            log("✅ Recipe submitted successfully!");
            log(`Recipe ID: ${data.data?.id || 'N/A'}`);
            log(`Message: ${data.message || 'Success'}`);
        }
    })
    .catch(error => {
        if (error.message !== 'JSON submission failed') {
            log(`Error: ${error.message}`, true);
        }
    });
    
    // Approach 2: Send as FormData (needed for image upload)
    function submitWithFormData() {
        log("Attempting to submit with FormData...");
        
        const formData = new FormData();
        
        // Add basic data
        formData.append('title', recipeData.title);
        formData.append('intro', recipeData.intro);
        formData.append('status', recipeData.status);
        
        // Add recipe info
        formData.append('prep_time', recipeData.prep_time);
        formData.append('cook_time', recipeData.cook_time);
        formData.append('servings', recipeData.servings);
        formData.append('notes', recipeData.notes);
        
        // Add categories
        recipeData.categories.forEach(category => {
            formData.append('categories[]', category);
        });
        
        // Add tags as JSON string
        formData.append('tags', JSON.stringify(recipeData.tags));
        
        // Add ingredients
        recipeData.ingredients.forEach(ingredient => {
            formData.append('ingredients[]', ingredient);
        });
        
        // Add steps
        recipeData.steps.forEach(step => {
            formData.append('steps[]', step);
        });
        
        // Add image if present
        if (hasImage) {
            formData.append('image', imageInput.files[0]);
        }
        
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
                log(`FormData submission failed with status: ${response.status} ${response.statusText}`, true);
                return response.text().then(text => {
                    try {
                        const data = JSON.parse(text);
                        log(`Error details: ${data.error || text}`, true);
                    } catch (e) {
                        log(`Response body: ${text}`, true);
                    }
                    throw new Error('FormData submission failed');
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                log("✅ Recipe submitted successfully with FormData!");
                log(`Recipe ID: ${data.data?.id || 'N/A'}`);
                log(`Message: ${data.message || 'Success'}`);
            }
        })
        .catch(error => {
            if (error.message !== 'FormData submission failed') {
                log(`FormData error: ${error.message}`, true);
            }
        });
    }
}

// Add a small floating button to activate this function
document.addEventListener('DOMContentLoaded', function() {
    // Wait for the add recipe page to be visible
    const checkInterval = setInterval(function() {
        if (document.getElementById('page-add-recipe')?.style.display !== 'none') {
            // Create the button
            const button = document.createElement('button');
            button.textContent = 'Fix Recipe Submission';
            button.style.position = 'fixed';
            button.style.bottom = '20px';
            button.style.right = '20px';
            button.style.zIndex = '9999';
            button.style.padding = '10px 15px';
            button.style.backgroundColor = '#7f4937';
            button.style.color = 'white';
            button.style.border = 'none';
            button.style.borderRadius = '4px';
            button.style.cursor = 'pointer';
            button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
            
            // Add hover effect
            button.onmouseover = function() {
                this.style.backgroundColor = '#aa5f44';
            };
            button.onmouseout = function() {
                this.style.backgroundColor = '#7f4937';
            };
            
            // Add click handler
            button.onclick = function() {
                submitRecipeDirectly();
            };
            
            // Add to the page
            document.body.appendChild(button);
            
            // Clear the interval
            clearInterval(checkInterval);
        }
    }, 1000);
});