/**
 * Main JavaScript file for Šaukštas Meilės food blog
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

// Function to create a colored placeholder div instead of using external placeholder services
function createPlaceholderElement(width, height, bgColor, textColor, text) {
    // Create a div element instead of using an external image
    const placeholder = document.createElement('div');
    placeholder.className = 'local-placeholder';
    placeholder.style.width = width + 'px';
    placeholder.style.height = height + 'px';
    placeholder.style.backgroundColor = bgColor || '#f8f5f1';
    placeholder.style.color = textColor || '#7f4937';
    placeholder.style.display = 'flex';
    placeholder.style.alignItems = 'center';
    placeholder.style.justifyContent = 'center';
    placeholder.style.textAlign = 'center';
    placeholder.style.padding = '10px';
    placeholder.style.boxSizing = 'border-box';
    placeholder.style.fontFamily = 'Arial, sans-serif';
    placeholder.style.overflow = 'hidden';
    placeholder.style.fontSize = '14px';
    placeholder.style.wordBreak = 'break-word';
    
    // Add text to the placeholder
    placeholder.textContent = text || 'Placeholder';
    
    return placeholder;
}

// Function to replace placeholder image paths with actual placeholders
function replacePlaceholders() {
    // Add a style for the placeholder divs to ensure they work as image replacements
    const style = document.createElement('style');
    style.textContent = `
        .local-placeholder {
            max-width: 100%;
            border-radius: 5px;
            font-weight: bold;
            text-transform: uppercase;
            line-height: 1.3;
        }
        .recipe-card-image .local-placeholder, 
        .latest-post-image .local-placeholder,
        .recipe-image .local-placeholder {
            width: 100% !important;
        }
    `;
    document.head.appendChild(style);
    
    // First handle images with src starting with img/placeholders/
    const placeholderImages = document.querySelectorAll('img[src^="img/placeholders/"]');
    
    placeholderImages.forEach(img => {
        // Extract filename from path
        const filename = img.src.split('/').pop();
        const nameWithoutExt = filename.split('.')[0];
        
        // Get alt text for meaningful placeholder
        const altText = img.alt || nameWithoutExt;
        
        // Set dimensions based on image type
        let width, height;
        
        if (filename.startsWith('recipe')) {
            width = 500;
            height = 500;
        } else if (filename.startsWith('latest')) {
            width = 200;
            height = 200;
        } else if (filename.startsWith('popular')) {
            width = 100;
            height = 100;
        } else if (filename.startsWith('profile')) {
            width = 200;
            height = 200;
        } else if (filename.startsWith('recipe-detail')) {
            width = 800;
            height = 500;
        } else if (filename.startsWith('user')) {
            width = 50;
            height = 50;
        } else {
            width = 300;
            height = 300;
        }
        
        // Try to load actual images from img/placeholders/ folder first
        if (img.naturalWidth === 0) {
            // Image failed to load, replace with local placeholder div
            const placeholder = createPlaceholderElement(width, height, '#f8f5f1', '#7f4937', altText);
            img.parentNode.replaceChild(placeholder, img);
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
            const placeholder = createPlaceholderElement(width, height, '#f8f5f1', '#7f4937', 'Šaukštas Meilės');
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