function saveComment() {
    // Get form values
    const author = document.getElementById('edit-comment-author').value;
    const email = document.getElementById('edit-comment-email').value;
    const content = document.getElementById('edit-comment-content').value;
    const status = document.getElementById('edit-comment-status').value;
    
    // Validate
    if (!content) {
        showNotification('Klaida', 'Komentaro turinys yra būtinas', 'error');
        return;
    }
    
    // Create request data
    const commentData = {
        id: currentItemId,
        author,
        email,
        content,
        status
    };
    
    // Save using the API
    window.saveComment(commentData);
}

function saveAboutPage() {
    // Get the form
    const form = document.querySelector('#page-about form');
    if (!form) {
        showNotification('Klaida', 'Forma nerasta', 'error');
        return;
    }
    
    // Create FormData object
    const formData = new FormData(form);
    
    // Save using the API
    window.saveAboutPage(formData);
}

function showDeleteConfirmation(itemId, itemType) {
    currentItemId = itemId;
    currentItemType = itemType;
    
    // Show the modal
    const modal = document.getElementById('delete-modal');
    if (modal) {
        modal.classList.add('show');
    }
}

function deleteItem() {
    // Close the modal
    closeModal('delete-modal');
    
    if (!currentItemId || !currentItemType) {
        showNotification('Klaida', 'Nėra pasirinkto elemento', 'error');
        return;
    }
    
    // Delete the item using API
    window.deleteItem(currentItemId, currentItemType);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        
        // Reset comment modal if needed
        if (modalId === 'comment-modal') {
            document.getElementById('comment-view').style.display = 'block';
            document.getElementById('comment-edit').style.display = 'none';
            document.getElementById('comment-save-btn').style.display = 'none';
            document.getElementById('comment-modal-title').textContent = 'Komentaro peržiūra';
        }
    }
}

function showNotification(title, message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    const notificationTitle = notification.querySelector('.notification-title');
    const notificationMessage = notification.querySelector('.notification-message');
    const notificationIcon = notification.querySelector('.notification-icon i');
    
    if (notificationTitle && notificationMessage && notificationIcon) {
        // Set notification content
        notificationTitle.textContent = title;
        notificationMessage.textContent = message;
        
        // Set notification type
        notification.className = 'notification';
        if (type === 'success') {
            notification.classList.add('notification-success');
            notificationIcon.className = 'fas fa-check-circle';
        } else if (type === 'error') {
            notification.classList.add('notification-error');
            notificationIcon.className = 'fas fa-exclamation-circle';
        }
        
        // Show notification
        notification.classList.add('show');
        
        // Auto-hide notification after 5 seconds
        setTimeout(() => {
            hideNotification();
        }, 5000);
    }
}

function hideNotification() {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.classList.remove('show');
    }
}

function getCommentStatusLabel(status) {
    switch (status) {
        case 'approved':
            return 'Patvirtintas';
        case 'pending':
            return 'Laukiantis';
        case 'spam':
            return 'Šlamštas';
        default:
            return 'Nežinomas';
    }
}

// Initialize the admin panel when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the admin page
    if (document.getElementById('admin-dashboard')) {
        // Set up login form handling
        setupLoginForm();
        
        // Check login status
        checkLoginStatus();
        
        // Initialize UI components
        initTabs();
        initIngredientList();
        initStepList();
        initTagsInput();
        initFileUploads();
        initRemoveButtons();
    }
});