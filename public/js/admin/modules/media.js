// public/js/admin/media.js
// Media management functionality

import { getAuthHeaders } from './auth.js';
import { showNotification, updatePagination } from './ui.js';
import { setCurrentItem, getCurrentItem } from './utils.js';

/**
 * Fetch media files for the media page
 */
export function fetchMedia(page = 1, type = 'all') {
  const mediaGrid = document.querySelector('#page-media .gallery-grid');
  if (!mediaGrid) return;
  
  // Show loading message
  mediaGrid.innerHTML = '<div class="loading-message">Loading media files...</div>';
  
  // Get active tab if type is not specified
  if (type === 'all') {
    const activeTab = document.querySelector('#page-media .tab.active');
    if (activeTab) {
      type = activeTab.getAttribute('data-tab');
    }
  }
  
  fetch(`/admin-api/media?type=${type}&page=${page}`, {
    headers: getAuthHeaders()
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to fetch media: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      if (data.data.length === 0) {
        // No media
        mediaGrid.innerHTML = '<div class="empty-message">No media files found</div>';
        return;
      }
      
      // Clear loading message
      mediaGrid.innerHTML = '';
      
      // Add media to the grid
      data.data.forEach(media => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        item.innerHTML = `
          <img src="${media.url}" alt="${media.name}">
          <div class="gallery-item-actions">
            <button type="button" class="gallery-item-action delete-btn" onclick="showDeleteConfirmation('${media.id}', 'media')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `;
        
        mediaGrid.appendChild(item);
      });
      
      // Update pagination
      updatePagination(data.meta);
    } else {
      showNotification('Error', data.error || 'Unknown error', 'error');
    }
  })
  .catch(error => {
    console.error('Fetch media error:', error);
    mediaGrid.innerHTML = '<div class="error-message">Failed to load media files. Please try again.</div>';
    showNotification('Error', 'Failed to load media files', 'error');
  });
}

/**
 * Upload media files
 */
export function uploadMedia() {
  const fileInput = document.getElementById('media-upload');
  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    showNotification('Error', 'No files selected', 'error');
    return;
  }
  
  // Create FormData
  const formData = new FormData();
  
  // Add each file to the FormData
  for (let i = 0; i < fileInput.files.length; i++) {
    formData.append('files[]', fileInput.files[i]);
  }
  
  // Get upload type
  const activeTab = document.querySelector('#page-media .tab.active');
  const type = activeTab ? activeTab.getAttribute('data-tab') : 'gallery';
  
  if (type !== 'all') {
    formData.append('type', type);
  }
  
  // Show loading notification
  showNotification('Information', 'Uploading files...', 'success');
  
  // Send upload request
  fetch('/admin-api/media', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to upload files: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      showNotification('Success', 'Files uploaded successfully!', 'success');
      
      // Clear file input
      fileInput.value = '';
      
      // Refresh media
      fetchMedia();
    } else {
      showNotification('Error', data.error || 'Unknown error', 'error');
    }
  })
  .catch(error => {
    console.error('Upload media error:', error);
    showNotification('Error', `Error uploading files: ${error.message}`, 'error');
  });
}

/**
 * Delete a media file
 */
export function deleteMedia(mediaId) {
  if (!mediaId) {
    const { id, type } = getCurrentItem();
    mediaId = id;
    
    if (type !== 'media') {
      console.error('Invalid item type for deleteMedia');
      return;
    }
  }
  
  if (!mediaId) {
    showNotification('Error', 'Media ID is required', 'error');
    return;
  }
  
  // Split the ID into directory and filename
  // Format should be directory/filename
  const parts = mediaId.split('/');
  if (parts.length !== 2) {
    showNotification('Error', 'Invalid media ID', 'error');
    return;
  }
  
  const directory = parts[0];
  const filename = parts[1];
  
  // Show loading notification
  showNotification('Information', 'Deleting media file...', 'success');
  
  // Send request
  fetch(`/admin-api/media/${directory}/${filename}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to delete media: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      showNotification('Success', 'Media file deleted successfully!', 'success');
      
      // Close delete modal if open
      closeModal('delete-modal');
      
      // Refresh media
      fetchMedia();
    } else {
      showNotification('Error', data.error || 'Unknown error', 'error');
    }
  })
  .catch(error => {
    console.error('Delete media error:', error);
    showNotification('Error', `Error deleting media file: ${error.message}`, 'error');
  });
}

/**
 * Show delete confirmation dialog
 */
export function showDeleteConfirmation(itemId, itemType) {
  // Set current item for deletion
  setCurrentItem(itemId, itemType);
  
  // Show the modal
  const modal = document.getElementById('delete-modal');
  if (modal) {
    modal.classList.add('show');
  }
}

// Import necessary functions
import { closeModal } from './ui.js';