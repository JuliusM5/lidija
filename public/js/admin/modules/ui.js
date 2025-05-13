// public/js/admin/ui.js
// UI related functionality for the admin panel

/**
 * Initialize UI components
 */
export function initUI() {
  initTabs();
  initRemoveButtons();
  addEventListeners();
}

/**
 * Add various event listeners for UI interactions
 */
function addEventListeners() {
  // Close modal when clicking outside of it
  document.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal-backdrop');
    modals.forEach(modal => {
      if (event.target === modal) {
        closeModal(modal.id);
      }
    });
  });
}

/**
 * Initialize tabs functionality
 */
export function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const tabContainer = this.closest('.tabs');
      if (!tabContainer) return;
      
      // Remove active class from all tabs
      tabContainer.querySelectorAll('.tab').forEach(t => {
        t.classList.remove('active');
      });
      
      // Add active class to clicked tab
      this.classList.add('active');
      
      // Handle tab-specific actions if needed
      const tabType = this.getAttribute('data-tab');
      if (tabType) {
        // Handle tab change events
        const pageId = tabContainer.closest('.admin-page').id.replace('page-', '');
        
        // Refresh content based on tab type
        if (pageId === 'recipes') {
          fetchRecipes(1, tabType);
        } else if (pageId === 'comments') {
          fetchComments(1, tabType);
        } else if (pageId === 'media') {
          fetchMedia(1, tabType);
        }
      }
    });
  });
}

/**
 * Initialize remove buttons for images
 */
export function initRemoveButtons() {
  // Remove image buttons
  const removeImageButtons = document.querySelectorAll('.remove-image');
  
  removeImageButtons.forEach(button => {
    button.addEventListener('click', function() {
      const imagePreview = this.closest('.image-preview');
      if (!imagePreview) return;
      
      imagePreview.style.display = 'none';
      
      // Clear file input
      const fileInput = document.querySelector('.file-upload-input');
      if (fileInput) {
        fileInput.value = '';
      }
    });
  });
}

/**
 * Show a specific admin page and hide others
 */
export function showAdminPage(pageId) {
  // Hide all pages
  const pages = document.querySelectorAll('.admin-page');
  pages.forEach(page => {
    page.style.display = 'none';
  });
  
  // Show selected page
  const selectedPage = document.getElementById(`page-${pageId}`);
  if (selectedPage) {
    selectedPage.style.display = 'block';
    
    // Load page-specific data if needed
    if (pageId === 'dashboard') {
      loadDashboardStats();
    } else if (pageId === 'recipes') {
      fetchRecipes();
    } else if (pageId === 'comments') {
      fetchComments();
    } else if (pageId === 'media') {
      fetchMedia();
    } else if (pageId === 'about') {
      fetchAboutData();
    }
  }
}

/**
 * Close a modal dialog
 */
export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('show');
    
    // Reset comment modal if needed
    if (modalId === 'comment-modal') {
      document.getElementById('comment-view').style.display = 'block';
      document.getElementById('comment-edit').style.display = 'none';
      document.getElementById('comment-save-btn').style.display = 'none';
      document.getElementById('comment-modal-title').textContent = 'Comment Preview';
    }
  }
}

/**
 * Show a notification
 */
export function showNotification(title, message, type = 'success') {
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

/**
 * Hide the notification
 */
export function hideNotification() {
  const notification = document.getElementById('notification');
  if (notification) {
    notification.classList.remove('show');
  }
}

/**
 * Update pagination
 */
export function updatePagination(meta) {
  const paginationContainer = document.querySelector('.pagination');
  if (!paginationContainer) return;
  
  // Clear pagination
  paginationContainer.innerHTML = '';
  
  if (!meta || meta.pages <= 1) return;
  
  // Create pagination links
  const currentPage = meta.page;
  const totalPages = meta.pages;
  
  // Previous button
  const prevBtn = document.createElement('a');
  prevBtn.href = '#';
  prevBtn.className = 'pagination-link prev' + (currentPage <= 1 ? ' disabled' : '');
  prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
  if (currentPage > 1) {
    prevBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const pageContainer = paginationContainer.closest('.admin-page');
      const pageId = pageContainer.id.replace('page-', '');
      
      switch (pageId) {
        case 'recipes':
          fetchRecipes(currentPage - 1);
          break;
        case 'comments':
          fetchComments(currentPage - 1);
          break;
        case 'media':
          fetchMedia(currentPage - 1);
          break;
      }
    });
  }
  paginationContainer.appendChild(prevBtn);
  
  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (totalPages > 7) {
      // Show first page, last page, current page, and pages around current
      if (i !== 1 && i !== totalPages && i !== currentPage && 
          i !== currentPage - 1 && i !== currentPage + 1 &&
          i !== currentPage - 2 && i !== currentPage + 2) {
        // Skip pages that are far from current
        if (i === 2 || i === totalPages - 1) {
          const dots = document.createElement('span');
          dots.className = 'pagination-ellipsis';
          dots.textContent = '...';
          paginationContainer.appendChild(dots);
        }
        continue;
      }
    }
    
    const pageLink = document.createElement('a');
    pageLink.href = '#';
    pageLink.className = 'pagination-link' + (i === currentPage ? ' active' : '');
    pageLink.textContent = i;
    
    if (i !== currentPage) {
      pageLink.addEventListener('click', function(e) {
        e.preventDefault();
        const pageContainer = paginationContainer.closest('.admin-page');
        const pageId = pageContainer.id.replace('page-', '');
        
        switch (pageId) {
          case 'recipes':
            fetchRecipes(i);
            break;
          case 'comments':
            fetchComments(i);
            break;
          case 'media':
            fetchMedia(i);
            break;
        }
      });
    }
    
    paginationContainer.appendChild(pageLink);
  }
  
  // Next button
  const nextBtn = document.createElement('a');
  nextBtn.href = '#';
  nextBtn.className = 'pagination-link next' + (currentPage >= totalPages ? ' disabled' : '');
  nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
  if (currentPage < totalPages) {
    nextBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const pageContainer = paginationContainer.closest('.admin-page');
      const pageId = pageContainer.id.replace('page-', '');
      
      switch (pageId) {
        case 'recipes':
          fetchRecipes(currentPage + 1);
          break;
        case 'comments':
          fetchComments(currentPage + 1);
          break;
        case 'media':
          fetchMedia(currentPage + 1);
          break;
      }
    });
  }
  paginationContainer.appendChild(nextBtn);
}

// Import functions we need to reference
import { fetchRecipes } from './recipes.js';
import { fetchComments } from './comments.js';
import { fetchMedia } from './media.js';
import { fetchAboutData } from './about.js';
import { loadDashboardStats } from './dashboard.js';