// public/js/admin/utils.js
// Utility functions for the admin panel

// Global variables for tracking current selected items
let currentItemId = null;
let currentItemType = null;

/**
 * Store information about the currently selected item
 * @param {string} itemId - ID of the item
 * @param {string} itemType - Type of the item (recipe, comment, media)
 */
export function setCurrentItem(itemId, itemType) {
  currentItemId = itemId;
  currentItemType = itemType;
}

/**
 * Get information about the currently selected item
 * @returns {Object} - Object with id and type properties
 */
export function getCurrentItem() {
  return {
    id: currentItemId,
    type: currentItemType
  };
}

/**
 * Clear the current item selection
 */
export function clearCurrentItem() {
  currentItemId = null;
  currentItemType = null;
}

/**
 * Format a date string
 * @param {string} dateString - Date string to format
 * @returns {string} - Formatted date string
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Handle deletion of an item
 * @param {Function} deleteFunction - The function to call to delete the item
 */
export function handleDeleteItem(deleteFunction) {
  if (!currentItemId || !currentItemType || typeof deleteFunction !== 'function') {
    return;
  }
  
  // Call the appropriate delete function based on item type
  deleteFunction(currentItemId);
  
  // Clear current item
  clearCurrentItem();
}

/**
 * Show a delete confirmation dialog
 * @param {string} itemId - ID of the item to delete
 * @param {string} itemType - Type of the item (recipe, comment, media)
 */
export function showDeleteConfirmation(itemId, itemType) {
  // Store item info
  setCurrentItem(itemId, itemType);
  
  // Show confirmation dialog
  const modal = document.getElementById('delete-modal');
  if (modal) {
    modal.classList.add('show');
  }
}

/**
 * Get a formatted string representation of an item type
 * @param {string} itemType - The item type (recipe, comment, media)
 * @returns {string} - Human-readable item type
 */
export function getItemTypeLabel(itemType) {
  switch (itemType) {
    case 'recipe':
      return 'Recipe';
    case 'comment':
      return 'Comment';
    case 'media':
      return 'Media File';
    default:
      return 'Item';
  }
}