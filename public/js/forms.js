/**
 * Enhanced Forms Handler - Consolidated Form Functionality
 * 
 * This file consolidates form handling functionality from:
 * - forms.js (original)
 * - form-reset-fix.js
 */

(function() {
    console.log('Enhanced Forms Handler loaded');

    // Document ready initialization
    document.addEventListener('DOMContentLoaded', function() {
        setupEventListeners();
        setupFormResetHandling();
    });

    // ======================================================
    // CORE FORM HANDLING (from original forms.js)
    // ======================================================

    // Function to set up event listeners
    function setupEventListeners() {
        // Handle newsletter form submission
        setupNewsletterForms();
        
        // Handle comment form submission
        setupCommentForms();
        
        // Handle "Load More" buttons
        setupLoadMoreButtons();
    }

    // Setup newsletter form submissions
    function setupNewsletterForms() {
        document.addEventListener('submit', function(event) {
            if (event.target.matches('.newsletter-form')) {
                event.preventDefault();
                const emailInput = event.target.querySelector('.newsletter-input');
                if (emailInput && emailInput.value && isValidEmail(emailInput.value)) {
                    alert(`Ačiū už prenumeratą! Naujienlaiškis bus siunčiamas adresu: ${emailInput.value}`);
                    emailInput.value = '';
                } else {
                    alert('Prašome įvesti teisingą el. pašto adresą.');
                }
            }
        });
    }

    // Setup comment form submissions
    function setupCommentForms() {
        document.addEventListener('submit', function(event) {
            // Comment form submission
            if (event.target.closest('.comment-form')) {
                event.preventDefault();
                
                const form = event.target;
                const nameInput = form.querySelector('#name');
                const emailInput = form.querySelector('#email');
                const commentInput = form.querySelector('#comment');
                
                if (nameInput && nameInput.value && 
                    emailInput && emailInput.value && isValidEmail(emailInput.value) && 
                    commentInput && commentInput.value) {
                    alert('Ačiū už komentarą! Jis bus paskelbtas po peržiūros.');
                    nameInput.value = '';
                    emailInput.value = '';
                    commentInput.value = '';
                } else {
                    alert('Prašome užpildyti visus būtinus laukus teisingai.');
                }
            }
        });
        
        // Handle reply links
        document.addEventListener('click', function(event) {
            if (event.target.matches('.comment-reply-link')) {
                event.preventDefault();
                
                const comment = event.target.closest('.comment');
                let replyForm = comment.querySelector('.reply-form');
                
                // If reply form already exists, toggle its visibility
                if (replyForm) {
                    replyForm.style.display = replyForm.style.display === 'none' ? 'block' : 'none';
                    return;
                }
                
                // Otherwise, create a new reply form
                replyForm = document.createElement('div');
                replyForm.className = 'reply-form';
                replyForm.innerHTML = `
                    <form class="comment-form">
                        <h4>Atsakyti į komentarą</h4>
                        <div class="form-group">
                            <label for="reply-name">Vardas</label>
                            <input type="text" id="reply-name" name="name" class="form-control" required autocomplete="name">
                        </div>
                        <div class="form-group">
                            <label for="reply-email">El. paštas (nebus skelbiamas)</label>
                            <input type="email" id="reply-email" name="email" class="form-control" required autocomplete="email">
                        </div>
                        <div class="form-group">
                            <label for="reply-comment">Komentaras</label>
                            <textarea id="reply-comment" name="comment" class="form-control" required></textarea>
                        </div>
                        <button type="submit" class="submit-button">Atsakyti</button>
                        <button type="button" class="cancel-button">Atšaukti</button>
                    </form>
                `;
                
                // Insert the reply form after the current comment
                comment.appendChild(replyForm);
                
                // Add cancel button handler
                const cancelButton = replyForm.querySelector('.cancel-button');
                if (cancelButton) {
                    cancelButton.addEventListener('click', function() {
                        replyForm.style.display = 'none';
                    });
                }
            }
        });
    }

    // Setup load more buttons
    function setupLoadMoreButtons() {
        document.addEventListener('click', function(event) {
            if (event.target.matches('.load-more-button')) {
                event.preventDefault();
                
                // In a real application, this would load more recipes
                // For now, just show a message
                alert('Daugiau receptų bus įkelta netrukus!');
            }
        });
    }

    // ======================================================
    // FORM RESET FUNCTIONALITY (from form-reset-fix.js)
    // ======================================================

    // Setup form reset handling
    function setupFormResetHandling() {
        // Add event listener for when recipes are successfully saved
        document.addEventListener('click', function(event) {
            // Check if this is the save recipe button
            if (event.target.matches('.submit-button') && 
                event.target.textContent.includes('Išsaugoti receptą')) {
                
                // Set a timeout to check for success notification and then clear the form
                setTimeout(function() {
                    const notification = document.querySelector('.notification');
                    if (notification && 
                        notification.classList.contains('show') && 
                        notification.querySelector('.notification-title').textContent.includes('Sėkmė')) {
                        
                        console.log('Recipe saved successfully, will reset form when navigating back to add-recipe');
                        
                        // Set a flag to clear the form next time the add recipe page is shown
                        window.shouldResetAddRecipeForm = true;
                    }
                }, 1000);
            }
        });
        
        // Override the original showAdminPage function if it exists
        if (typeof window.showAdminPage === 'function') {
            const originalShowAdminPage = window.showAdminPage;
            
            window.showAdminPage = function(pageId) {
                // Call the original function
                originalShowAdminPage(pageId);
                
                // If we're showing the add recipe page and we have a flag to reset it
                if (pageId === 'add-recipe' && window.shouldResetAddRecipeForm) {
                    setTimeout(function() {
                        resetAddRecipeForm();
                        window.shouldResetAddRecipeForm = false;
                    }, 100);
                }
            };
        }
        
        // Find all "Pridėti naują" buttons that navigate to the add-recipe page
        const addNewButtons = document.querySelectorAll('a[onclick*="showAdminPage(\'add-recipe\')"]');
        
        addNewButtons.forEach(button => {
            // Clone the button
            const newButton = button.cloneNode(true);
            
            // Replace the original button with our new one
            button.parentNode.replaceChild(newButton, button);
            
            // Add our custom handler
            newButton.addEventListener('click', function(e) {
                // Allow the default onclick to execute first
                setTimeout(function() {
                    // Then clear the form
                    resetAddRecipeForm();
                }, 100);
            });
        });
        
        // Clear the form on initial page load
        setTimeout(resetAddRecipeForm, 500);
    }

    // Function to reset the add recipe form
    function resetAddRecipeForm() {
        console.log('Resetting add recipe form...');
        const addPage = document.getElementById('page-add-recipe');
        if (!addPage) {
            console.warn('Add recipe page not found');
            return;
        }
        
        try {
            // Reset basic form fields
            const form = addPage.querySelector('form');
            if (form) {
                form.reset();
            }
            
            // Clear text inputs manually
            const textInputs = [
                'recipe-title', 'recipe-intro', 'recipe-notes'
            ];
            textInputs.forEach(id => {
                const field = addPage.querySelector(`#${id}`);
                if (field) {
                    field.value = '';
                }
            });
            
            // Clear number inputs
            const numberInputs = ['prep-time', 'cook-time', 'servings'];
            numberInputs.forEach(id => {
                const field = addPage.querySelector(`#${id}`);
                if (field) {
                    field.value = '';
                }
            });
            
            // Set status back to draft
            const statusField = addPage.querySelector('#recipe-status');
            if (statusField) {
                statusField.value = 'draft';
            }
            
            // Reset ingredient list
            const ingredientList = addPage.querySelector('#ingredient-list');
            if (ingredientList) {
                // Keep only one empty ingredient
                ingredientList.innerHTML = `
                    <div class="ingredient-item">
                        <input type="text" name="ingredients[]" class="form-control" placeholder="Įveskite ingredientą">
                        <button type="button" class="remove-ingredient-btn"><i class="fas fa-times"></i></button>
                    </div>
                `;
                
                // Set up event handler for the remove button
                const removeBtn = ingredientList.querySelector('.remove-ingredient-btn');
                if (removeBtn) {
                    removeBtn.onclick = function() {
                        this.closest('.ingredient-item').remove();
                    };
                }
            }
            
            // Reset step list
            const stepList = addPage.querySelector('#step-list');
            if (stepList) {
                // Keep only one empty step
                stepList.innerHTML = `
                    <div class="step-item">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <textarea name="steps[]" class="form-control" placeholder="Įveskite žingsnio aprašymą"></textarea>
                        </div>
                        <div class="step-actions">
                            <button type="button" class="remove-ingredient-btn"><i class="fas fa-times"></i></button>
                        </div>
                    </div>
                `;
                
                // Set up event handler for the remove button
                const removeBtn = stepList.querySelector('.remove-ingredient-btn');
                if (removeBtn) {
                    removeBtn.onclick = function() {
                        this.closest('.step-item').remove();
                    };
                }
            }
            
            // Uncheck all categories
            const categoryCheckboxes = addPage.querySelectorAll('.category-checkbox input[type="checkbox"]');
            categoryCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            
            // Clear tags
            const tagsContainer = addPage.querySelector('#tags-container');
            const tagsInput = addPage.querySelector('#tags-input');
            if (tagsContainer && tagsInput) {
                // Keep only the input
                Array.from(tagsContainer.children).forEach(child => {
                    if (child !== tagsInput) {
                        tagsContainer.removeChild(child);
                    }
                });
            }
            
            // Clear image preview
            const imagePreview = addPage.querySelector('#image-preview');
            if (imagePreview) {
                imagePreview.innerHTML = '<button type="button" class="remove-image"><i class="fas fa-times"></i></button>';
                imagePreview.style.display = 'none';
                
                // Set up event handler for the remove button
                const removeBtn = imagePreview.querySelector('.remove-image');
                if (removeBtn) {
                    removeBtn.onclick = function() {
                        imagePreview.style.display = 'none';
                    };
                }
            }
            
            // Reset file input
            const fileInput = addPage.querySelector('#recipe-image');
            if (fileInput) {
                fileInput.value = '';
            }
            
            console.log('Add recipe form has been reset');
        } catch (error) {
            console.error('Error resetting add recipe form:', error);
        }
    }

    // ======================================================
    // UTILITY FUNCTIONS
    // ======================================================

    // Function to validate email format
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    // ======================================================
    // PUBLIC API
    // ======================================================

    // Expose functions that need to be accessed from other scripts
    window.resetAddRecipeForm = resetAddRecipeForm;
    window.isValidEmail = isValidEmail;

})();