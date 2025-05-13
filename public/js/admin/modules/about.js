// public/js/admin/about.js
// About page management functionality

import { getAuthHeaders } from './auth.js';
import { showNotification } from './ui.js';

/**
 * Fetch about page data
 */
export function fetchAboutData() {
  fetch('/admin-api/about', {
    headers: getAuthHeaders()
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to fetch about data: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      // Populate form fields
      populateAboutForm(data.data);
    } else {
      showNotification('Error', data.error || 'Unknown error', 'error');
    }
  })
  .catch(error => {
    console.error('Fetch about data error:', error);
    showNotification('Error', 'Failed to load about page data', 'error');
  });
}

/**
 * Populate about form with data
 */
function populateAboutForm(aboutData) {
  // Set form fields
  document.getElementById('about-title').value = aboutData.title || '';
  document.getElementById('about-subtitle').value = aboutData.subtitle || '';
  document.getElementById('about-intro').value = aboutData.intro || '';
  document.getElementById('about-email').value = aboutData.email || '';
  
  // Set social links
  if (aboutData.social) {
    document.getElementById('facebook-url').value = aboutData.social.facebook || '';
    document.getElementById('instagram-url').value = aboutData.social.instagram || '';
    document.getElementById('pinterest-url').value = aboutData.social.pinterest || '';
  }
  
  // Clear existing sections
  const sectionContainer = document.querySelector('.about-section');
  const addSectionBtn = document.getElementById('add-section-btn');
  
  // Remove all sections except the first two
  const sections = document.querySelectorAll('.admin-section');
  sections.forEach((section, index) => {
    if (index > 1 && section.closest('.form-group') === document.querySelector('.form-group:nth-of-type(4)')) {
      section.remove();
    }
  });
  
  // Populate sections
  if (aboutData.sections && aboutData.sections.length) {
    // Populate first two sections (these already exist in the HTML)
    if (aboutData.sections.length >= 1) {
      document.getElementById('section-1-title').value = aboutData.sections[0].title || '';
      document.getElementById('section-1-content').value = aboutData.sections[0].content || '';
    }
    
    if (aboutData.sections.length >= 2) {
      document.getElementById('section-2-title').value = aboutData.sections[1].title || '';
      document.getElementById('section-2-content').value = aboutData.sections[1].content || '';
    }
    
    // Add any additional sections
    for (let i = 2; i < aboutData.sections.length; i++) {
      addSection(aboutData.sections[i].title, aboutData.sections[i].content);
    }
  }
  
  // Show image preview if available
  if (aboutData.image) {
    const imagePreview = document.getElementById('about-image-preview');
    
    // Remove any existing image
    const existingImg = imagePreview.querySelector('img');
    if (existingImg) {
      imagePreview.removeChild(existingImg);
    }
    
    // Create new image
    const img = document.createElement('img');
    img.src = `/img/about/${aboutData.image}`;
    img.alt = 'About page image preview';
    imagePreview.appendChild(img);
    imagePreview.style.display = 'block';
  }
  
  // Add section button handler
  if (addSectionBtn) {
    addSectionBtn.onclick = function() {
      addSection();
    };
  }
}

/**
 * Add a new section to the about page form
 */
function addSection(title = '', content = '') {
  const sectionContainer = document.querySelector('.form-group:has(#add-section-btn)');
  if (!sectionContainer) return;
  
  // Count existing sections
  const sections = document.querySelectorAll('.form-group:has(#add-section-btn) .admin-section');
  const sectionNumber = sections.length + 1;
  
  // Create new section
  const section = document.createElement('div');
  section.className = 'admin-section';
  section.style.marginBottom = '20px';
  
  section.innerHTML = `
    <div class="form-group">
      <label for="section-${sectionNumber}-title">Section ${sectionNumber} Title</label>
      <input type="text" id="section-${sectionNumber}-title" name="section_titles[]" class="form-control" value="${title}">
    </div>
    
    <div class="form-group">
      <label for="section-${sectionNumber}-content">Section ${sectionNumber} Content</label>
      <textarea id="section-${sectionNumber}-content" name="section_contents[]" class="form-control" rows="5">${content}</textarea>
    </div>
    
    <button type="button" class="remove-section-btn cancel-button">Remove Section</button>
  `;
  
  // Insert before the add button
  const addSectionBtn = document.getElementById('add-section-btn');
  sectionContainer.insertBefore(section, addSectionBtn);
  
  // Add remove handler
  const removeBtn = section.querySelector('.remove-section-btn');
  if (removeBtn) {
    removeBtn.addEventListener('click', function() {
      section.remove();
    });
  }
}

/**
 * Save about page data
 */
export function saveAboutPage() {
  // Get the form
  const form = document.querySelector('#page-about form');
  if (!form) {
    showNotification('Error', 'Form not found', 'error');
    return;
  }
  
  // Create FormData object
  const formData = new FormData(form);
  
  // Show loading notification
  showNotification('Information', 'Saving about page...', 'success');
  
  // Send request
  fetch('/admin-api/about', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: formData
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to update about page: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      showNotification('Success', 'About page updated successfully!', 'success');
      
      // Navigate to dashboard after save
      setTimeout(() => {
        showAdminPage('dashboard');
      }, 1000);
    } else {
      showNotification('Error', data.error || 'Unknown error', 'error');
    }
  })
  .catch(error => {
    console.error('Update about page error:', error);
    showNotification('Error', `Error updating about page: ${error.message}`, 'error');
  });
}

// Import necessary function
import { showAdminPage } from './ui.js';