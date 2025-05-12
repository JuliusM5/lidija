/**
 * Main JavaScript file for Šaukštas Meilės food blog with updated placeholder functionality
 */

// Initialize app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
    
    // Check for placeholder images and replace with actual placeholders
    replacePlaceholders();
});

// Main initialization function
function initApp() {
    console.log('Šaukštas Meilės - Application initialized');
    
    // Enable dropdown menu functionality for mobile
    setupMobileMenu();
    
    // Add smooth scrolling to all links
    setupSmoothScrolling();
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

// Function to create a styled placeholder that matches the website design
function createPlaceholderElement(width, height, text, isRound = false) {
    // Create a div element instead of using an external image
    const placeholder = document.createElement('div');
    placeholder.className = 'local-placeholder';
    
    // Set dimensions
    placeholder.style.width = width + 'px';
    placeholder.style.height = height + 'px';
    
    // Set border radius if round
    if (isRound) {
        placeholder.style.borderRadius = '50%';
    }
    
    // Base styling to match the website
    placeholder.style.backgroundColor = '#f8f5f1';
    placeholder.style.display = 'flex';
    placeholder.style.alignItems = 'center';
    placeholder.style.justifyContent = 'center';
    placeholder.style.textAlign = 'center';
    placeholder.style.padding = '10px';
    placeholder.style.boxSizing = 'border-box';
    placeholder.style.fontFamily = '"Source Sans Pro", sans-serif';
    placeholder.style.overflow = 'hidden';
    placeholder.style.fontSize = '12px';
    placeholder.style.wordBreak = 'break-word';
    placeholder.style.color = '#7f4937';
    placeholder.style.border = '1px solid #e6ddd6';
    
    // Create an inner span for the text to have better styling control
    const textSpan = document.createElement('span');
    
    // Format the text to look like a HEX code
    textSpan.textContent = '#f8f5f1';
    textSpan.style.opacity = '0.7';
    textSpan.style.fontSize = width < 150 ? '10px' : '12px';
    
    placeholder.appendChild(textSpan);
    
    return placeholder;
}

// Function to replace placeholder image paths with actual placeholders
function replacePlaceholders() {
    // First handle images with src starting with img/placeholders/
    const placeholderImages = document.querySelectorAll('img[src^="img/placeholders/"]');
    
    placeholderImages.forEach(img => {
        // Extract filename from path
        const filename = img.src.split('/').pop();
        
        // Set dimensions based on image type and class
        let width, height, isRound = false;
        
        if (img.classList.contains('popular-post-img')) {
            width = 60;
            height = 60;
            isRound = true; // Popular posts are round
        } else if (img.classList.contains('about-me-img')) {
            width = 120;
            height = 120;
            isRound = true;
        } else if (img.parentElement && img.parentElement.classList.contains('latest-post-image')) {
            width = 200;
            height = 200;
        } else if (filename.startsWith('recipe')) {
            width = 500;
            height = 500;
        } else if (filename.startsWith('popular')) {
            width = 60;
            height = 60;
            isRound = true;
        } else if (filename.startsWith('profile')) {
            width = 200;
            height = 200;
            isRound = true;
        } else {
            width = 200;
            height = 200;
        }
        
        // Try to load actual images
        img.addEventListener('error', function() {
            // Image failed to load, replace with local placeholder div
            const placeholder = createPlaceholderElement(width, height, '#f8f5f1', isRound);
            
            // Add the same classes as the image to maintain styling
            if (this.className) {
                placeholder.className += ' ' + this.className;
            }
            
            if (this.parentNode) {
                this.parentNode.replaceChild(placeholder, this);
            }
        });
        
        // Force error if image is already broken
        if (img.complete && img.naturalWidth === 0) {
            img.dispatchEvent(new Event('error'));
        }
    });
    
    // Also handle any API placeholders (if present)
    const apiPlaceholders = document.querySelectorAll('img[src^="/api/placeholder/"]');
    
    apiPlaceholders.forEach(img => {
        const src = img.getAttribute('src');
        const dimensions = src.match(/\/(\d+)\/(\d+)/);
        
        if (dimensions && dimensions.length === 3) {
            const width = dimensions[1];
            const height = dimensions[2];
            
            // Replace with placeholder div
            const placeholder = createPlaceholderElement(width, height, '#f8f5f1');
            if (img.className) {
                placeholder.className += ' ' + img.className;
            }
            
            img.parentNode.replaceChild(placeholder, img);
        }
    });
}

// Function to handle recipe searching (to be implemented later)
function searchRecipes(query) {
    console.log(`Searching for: ${query}`);
    // This would be implemented with actual search functionality
    alert(`Paieška bus įdiegta netrukus! Jūs ieškojote: ${query}`);
    return false;
}