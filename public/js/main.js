/**
 * Main JavaScript file for Šaukštas Meilės food blog
 */

// Initialize app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
});

// Main initialization function
function initApp() {
    console.log('Šaukštas Meilės - Application initialized');
    
    // Enable dropdown menu functionality for mobile
    setupMobileMenu();
    
    // Add smooth scrolling to all links
    setupSmoothScrolling();
    
    // Enhance dropdown menus
    enhanceDropdownMenus();
}

// Function to handle mobile menu
function setupMobileMenu() {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    
    function handleMobileMenu() {
        if (mediaQuery.matches) {
            // Create mobile menu toggle if it doesn't exist
            if (!document.querySelector('.mobile-menu-toggle')) {
                const nav = document.querySelector('nav');
                if (nav) {
                    const toggle = document.createElement('button');
                    toggle.className = 'mobile-menu-toggle';
                    toggle.innerHTML = '<i class="fa fa-bars"></i>';
                    toggle.setAttribute('aria-label', 'Toggle menu');
                    
                    toggle.addEventListener('click', function() {
                        nav.classList.toggle('active');
                    });
                    
                    const header = document.querySelector('header');
                    if (header) {
                        header.insertBefore(toggle, nav);
                    }
                }
            }
        }
    }
    
    // Initial call
    handleMobileMenu();
    
    // Setup listener for screen size changes
    mediaQuery.addEventListener('change', handleMobileMenu);
}

// Function to set up smooth scrolling
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            // Only apply to links that point to an ID on the page
            const href = this.getAttribute('href');
            if (href.length > 1) { // Skip '#' links
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// Function to enhance dropdown menus
function enhanceDropdownMenus() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        const content = dropdown.querySelector('.dropdown-content');
        
        if (!link || !content) return;
        
        // Variable to track if we should keep the menu open
        let shouldKeepOpen = false;
        
        // Add event listeners to manage hover states
        dropdown.addEventListener('mouseenter', () => {
            clearTimeout(dropdown.timeout);
            content.style.display = 'block';
        });
        
        dropdown.addEventListener('mouseleave', () => {
            // Don't close immediately, wait a bit in case user is moving to the dropdown
            dropdown.timeout = setTimeout(() => {
                if (!shouldKeepOpen) {
                    content.style.display = 'none';
                }
            }, 50);
        });
        
        // Special handling for the dropdown content
        content.addEventListener('mouseenter', () => {
            shouldKeepOpen = true;
            clearTimeout(dropdown.timeout);
        });
        
        content.addEventListener('mouseleave', () => {
            shouldKeepOpen = false;
            content.style.display = 'none';
        });
        
        // Handle click on parent link
        link.addEventListener('click', (e) => {
            // Prevent default only if it's the direct dropdown parent
            if (link.parentNode === dropdown && link.getAttribute('href') === '#') {
                e.preventDefault();
                
                // Toggle the display
                if (content.style.display === 'block') {
                    content.style.display = 'none';
                } else {
                    content.style.display = 'block';
                }
            }
        });
    });
}

// Function to handle recipe searching
function searchRecipes(query) {
    console.log(`Searching for: ${query}`);
    
    // Fetch search results from the server
    fetch(`search.php?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            // Process and display search results
            displaySearchResults(data);
        })
        .catch(error => {
            console.error('Search error:', error);
            alert('Įvyko klaida ieškant receptų. Prašome bandyti vėliau.');
        });
    
    return false;
}

// Function to display search results
function displaySearchResults(results) {
    // Implementation depends on how you want to display search results
    // For example, you might redirect to a search results page
    // or update the current page with the results
    
    // For now, just log the results
    console.log('Search results:', results);
    
    // TODO: Implement proper search results display
}