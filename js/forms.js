/**
 * Form handling functionality for Šaukštas Meilės food blog
 */

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

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

// Function to validate email format
function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}