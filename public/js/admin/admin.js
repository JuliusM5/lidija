// public/js/admin/admin.js
// Main admin file that initializes and coordinates all admin modules

// Import modules
import { initAuth, checkLoginStatus, logout } from './auth.js';
import { initUI, showAdminPage, closeModal, showNotification, hideNotification } from './ui.js';
import { loadDashboardStats } from './dashboard.js';
import { initRecipeForms, saveRecipe, updateRecipe, deleteRecipe } from './recipes.js';
import { saveComment, viewComment, deleteComment } from './comments.js';
import { uploadMedia, deleteMedia } from './media.js';
import { saveAboutPage } from './about.js';

// Make functions available globally
window.showAdminPage = showAdminPage;
window.closeModal = closeModal;
window.showNotification = showNotification;
window.hideNotification = hideNotification;
window.logout = logout;
window.saveRecipe = saveRecipe;
window.updateRecipe = updateRecipe;
window.deleteRecipe = deleteRecipe;
window.saveComment = saveComment;
window.viewComment = viewComment;
window.deleteComment = deleteComment;
window.uploadMedia = uploadMedia;
window.deleteMedia = deleteMedia;
window.saveAboutPage = saveAboutPage;

// Global variables for tracking current selected items
let currentItemId = null;
let currentItemType = null;

// Set selected item for operations like deletion
window.setCurrentItem = function(itemId, itemType) {
  currentItemId = itemId;
  currentItemType = itemType;
};

window.getCurrentItem = function() {
  return { id: currentItemId, type: currentItemType };
};

// Initialize admin panel when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on the admin page
  if (document.getElementById('admin-dashboard')) {
    console.log('Initializing Admin Panel...');
    
    // Initialize auth functionality
    initAuth();
    
    // Initialize UI components
    initUI();
    
    // Initialize recipe forms
    initRecipeForms();
    
    // Check login status
    checkLoginStatus();
  }
});

// Handle API connection errors
window.handleApiError = function(error, fallbackMessage) {
  console.error('API Error:', error);
  showNotification('Error', fallbackMessage || 'An error occurred. Please try again.', 'error');
};