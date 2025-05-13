// public/js/admin/auth.js
// Authentication related functionality

import { showNotification, showAdminPage } from './ui.js';

/**
 * Initialize authentication functionality
 */
export function initAuth() {
  setupLoginForm();
}

/**
 * Set up login form submission
 */
export function setupLoginForm() {
  const loginForm = document.getElementById('login-form');
  
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      // Validate form
      if (!username || !password) {
        showNotification('Error', 'Please enter both username and password', 'error');
        return;
      }
      
      // Show loading notification
      showNotification('Please wait', 'Authenticating...', 'success');
      
      // Send login request
      fetch('/admin-api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Login failed: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          // Store authentication data
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('isLoggedIn', 'true');
          
          // Hide login page, show dashboard
          document.getElementById('login-page').style.display = 'none';
          document.getElementById('admin-dashboard').style.display = 'block';
          
          // Load dashboard
          showAdminPage('dashboard');
          
          // Show success notification
          showNotification('Success', 'Login successful!', 'success');
        } else {
          showNotification('Error', data.error || 'Login failed', 'error');
        }
      })
      .catch(error => {
        console.error('Login error:', error);
        showNotification('Error', 'Login failed. Please check your credentials and try again.', 'error');
      });
    });
  }
}

/**
 * Check login status on page load
 */
export function checkLoginStatus() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const token = localStorage.getItem('token');
  
  if (isLoggedIn && token) {
    // Verify token with server
    fetch('/admin-api/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Token verification failed');
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        // Token is valid, show dashboard
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
        showAdminPage('dashboard');
      } else {
        // Token is invalid, show login page
        logout();
      }
    })
    .catch(error => {
      console.error('Token verification error:', error);
      logout();
    });
  } else {
    // No token, show login page
    document.getElementById('login-page').style.display = 'block';
    document.getElementById('admin-dashboard').style.display = 'none';
  }
}

/**
 * Get authentication headers for API requests
 */
export function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  };
}

/**
 * Log out the user
 */
export function logout() {
  // Clear authentication data
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
  
  // Show login page, hide dashboard
  document.getElementById('login-page').style.display = 'block';
  document.getElementById('admin-dashboard').style.display = 'none';
  
  // Clear login form
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  
  if (usernameInput) usernameInput.value = '';
  if (passwordInput) passwordInput.value = '';
  
  // Show notification
  showNotification('Success', 'Logged out successfully!', 'success');
}