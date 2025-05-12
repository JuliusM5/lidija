/**
 * Navigation functionality for Šaukštas Meilės food blog
 */

// Function to handle page switching
function showPage(pageId) {
    console.log(`Showing page: ${pageId}`);
    
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.add('active');
        // Scroll to top when changing pages
        window.scrollTo(0, 0);
        
        // If showing recipe page, load recipe content
        if (pageId === 'recipe-page') {
            loadRecipePage();
        }
    } else {
        console.error(`Page with ID '${pageId}' not found`);
    }
}

// Function to create a styled placeholder that matches the website design
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

// When creating category items, use this function for placeholders
// For example, in the loadCategory function:
/*
const placeholder = createPlaceholderElement(500, 500, '#f8f5f1');
placeholder.style.width = '100%';
placeholder.style.aspectRatio = '1/1';
cardImageContainer.appendChild(placeholder);
*/

// When dynamically creating popular post items, use this:
/*
const placeholder = createPlaceholderElement(60, 60, '#f8f5f1', true);
placeholder.className += ' popular-post-img';
*/

// When creating latest post items, use this:
/*
const placeholder = createPlaceholderElement(200, 200, '#f8f5f1');
placeholder.style.width = '100%';
placeholder.style.height = '100%';
*/
// Function to handle category loading
function loadCategory(categoryName) {
    console.log(`Loading category: ${categoryName}`);
    
    // Create or get category page
    let categoryPage = document.getElementById('category-page');
    if (!categoryPage) {
        categoryPage = createCategoryPage();
    }
    
    // Update category page title and description
    const categoryTitle = document.querySelector('#category-page .category-title');
    if (categoryTitle) {
        categoryTitle.textContent = categoryName;
    }
    
    // Set category descriptions based on category name
    const descriptions = {
        'Gėrimai ir kokteiliai': 'Gardūs, gaivūs ir įdomūs gėrimai bei kokteiliai kiekvienai progai.',
        'Desertai': 'Saldūs gardumynai, pyragai ir deserai jūsų malonumui.',
        'Sriubos': 'Šiltos, gaivios ir maistingos sriubos visais metų laikais.',
        'Užkandžiai': 'Greiti ir skanūs užkandžiai vakarėliams ar kasdieniam malonumui.',
        'Varškė': 'Įvairūs receptai su varške - nuo desertų iki pagrindinio patiekalo.',
        'Kiaušiniai': 'Kūrybiški ir gardūs patiekalai, kurių pagrindas - kiaušiniai.',
        'Daržovės': 'Gardūs ir sveiki daržovių patiekalai visiems metų laikams.',
        'Bulvės': 'Tradiciniai ir modernūs receptai su bulvėmis - lietuviška klasika.',
        'Mėsa': 'Gardūs ir sodrūs mėsos patiekalai šventėms ir kasdienai.',
        'Žuvis ir jūros gėrybės': 'Šviežios žuvies ir jūros gėrybių receptai jūsų stalui.',
        'Kruopos ir grūdai': 'Maistingi ir skanūs patiekalai iš įvairių kruopų ir grūdų.',
        'Be glitimo': 'Skanūs receptai tiems, kas vengia glitimo.',
        'Be laktozės': 'Gardūs patiekalai be laktozės.',
        'Gamta lėkštėje': 'Receptai su laukiniais augalais ir gamtos dovanomis.',
        'Iš močiutės virtuvės': 'Tradiciniai lietuviški receptai, perduodami iš kartos į kartą.',
        'Vasara': 'Vasaros skoniai ir kvapai jūsų virtuvėje.',
    };
    
    const categoryDescription = document.querySelector('#category-page .category-description');
    if (categoryDescription) {
        categoryDescription.textContent = descriptions[categoryName] || 
            `Atraskite mūsų receptų kolekciją kategorijoje "${categoryName}".`;
    }
    
    // Create recipes for this category directly in the HTML
    const contentMain = document.querySelector('#category-page .content-main');
    if (contentMain) {
        // Get or create recipe grid
        let recipeGrid = contentMain.querySelector('.recipe-grid');
        if (!recipeGrid) {
            recipeGrid = document.createElement('div');
            recipeGrid.className = 'recipe-grid';
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'category-header';
            categoryHeader.innerHTML = `
                <h1 class="category-title">${categoryName}</h1>
                <p class="category-description">${descriptions[categoryName] || ''}</p>
            `;
            contentMain.innerHTML = '';
            contentMain.appendChild(categoryHeader);
            contentMain.appendChild(recipeGrid);
        } else {
            // Clear existing recipes
            recipeGrid.innerHTML = '';
        }
        
        // Example recipe titles for each category
        const recipeTitles = {
            'Gėrimai ir kokteiliai': [
                'Uogų limonadas su šviežia mėta',
                'Aviečių ir braškių smoothie',
                'Šaltalankių arbata su medumi',
                'Naminis obuolių sidras',
                'Gaivus vyšnių kokteilis'
            ],
            'Desertai': [
                'Varškės pyragas su braškėmis',
                'Šakotis: lietuviškas medžio tortas',
                'Obuolių pyragas su cinamonu',
                'Tinginys: šokoladinis desertas',
                'Žemuogių ledai su mėtų užpilu'
            ],
            'Sriubos': [
                'Šaltibarščiai: vasaros skonis dubenyje',
                'Burokėlių sriuba su grietine',
                'Rūgštynių sriuba su kiaušiniu',
                'Miško grybų sriuba',
                'Daržovių sriuba su lęšiais'
            ],
            'default': [
                'Įvairūs receptai šioje kategorijoje',
                'Sezono pasiūlymai',
                'Skaniausios idėjos šioje kolekcijoje',
                'Populiarūs receptai',
                'Nauji atradimai'
            ]
        };
        
        // Select titles for this category or use default
        const titles = recipeTitles[categoryName] || recipeTitles['default'];
        
        // Add recipes to the grid - just examples
        const recipesCount = Math.floor(Math.random() * 3) + 3; // Random number of recipes (3-5)
        
        for (let i = 0; i < recipesCount; i++) {
            const recipeIndex = i % titles.length;
            const recipeTitle = titles[recipeIndex];
            
            const recipeCard = document.createElement('div');
            recipeCard.className = 'recipe-card';
            
            // Create the card content with a placeholder div instead of an image
            const cardContent = document.createElement('a');
            cardContent.href = '#';
            cardContent.onclick = function() {
                showPage('recipe-page');
                return false;
            };
            
            const cardImageContainer = document.createElement('div');
            cardImageContainer.className = 'recipe-card-image';
            
            // Create placeholder instead of using external image service
            const placeholder = createPlaceholderElement(500, 500, recipeTitle);
            placeholder.style.width = '100%';
            placeholder.style.aspectRatio = '1/1';
            cardImageContainer.appendChild(placeholder);
            
            const cardTitle = document.createElement('div');
            cardTitle.className = 'recipe-card-title';
            cardTitle.textContent = recipeTitle.toUpperCase();
            
            cardContent.appendChild(cardImageContainer);
            cardContent.appendChild(cardTitle);
            recipeCard.appendChild(cardContent);
            
            recipeGrid.appendChild(recipeCard);
        }
        
        // Add load more button
        let loadMoreContainer = contentMain.querySelector('.load-more-container');
        if (!loadMoreContainer) {
            loadMoreContainer = document.createElement('div');
            loadMoreContainer.className = 'load-more-container';
            loadMoreContainer.innerHTML = `
                <a href="#" class="load-more-button">DAUGIAU RECEPTŲ</a>
            `;
            contentMain.appendChild(loadMoreContainer);
        }
    }
}

// Function to load recipe page content
function loadRecipePage() {
    console.log('Loading recipe page content');
    
    const recipePage = document.getElementById('recipe-page');
    if (!recipePage) {
        console.error('Recipe page element not found');
        return;
    }
    
    // Check if the page is already loaded
    if (recipePage.querySelector('.recipe-main')) {
        console.log('Recipe page already loaded');
        return;
    }
    
    // Clone header from home page
    const homePage = document.getElementById('home-page');
    if (!homePage) {
        console.error('Home page not found');
        return;
    }
    
    const header = homePage.querySelector('header').cloneNode(true);
    
    // Create the recipe page layout
    const mainContent = document.createElement('div');
    mainContent.className = 'container main-content';
    
    // Add content main
    const contentMain = document.createElement('div');
    contentMain.className = 'content-main';
    
    // Try to load the recipe template from the server
    fetch('pages/recipe-template.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load recipe template');
            }
            return response.text();
        })
        .then(html => {
            contentMain.innerHTML = html;
            
            // Replace any existing placeholder images with local placeholders
            const images = contentMain.querySelectorAll('img');
            images.forEach(img => {
                const src = img.getAttribute('src');
                if (src && src.includes('placeholder.com')) {
                    const dimensions = src.match(/\/(\d+)x(\d+)/);
                    if (dimensions && dimensions.length === 3) {
                        const width = dimensions[1];
                        const height = dimensions[2];
                        const altText = img.alt || 'Recipe Image';
                        
                        const placeholder = createPlaceholderElement(width, height, altText);
                        placeholder.style.width = '100%';
                        
                        if (img.parentNode) {
                            img.parentNode.replaceChild(placeholder, img);
                        }
                    }
                }
            });
            
            // Create sidebar
            const sidebar = homePage.querySelector('.sidebar').cloneNode(true);
            mainContent.appendChild(contentMain);
            mainContent.appendChild(sidebar);
            
            // Add footer clone
            const footer = homePage.querySelector('footer').cloneNode(true);
            
            // Clear page and add elements
            recipePage.innerHTML = '';
            recipePage.appendChild(header);
            recipePage.appendChild(mainContent);
            recipePage.appendChild(footer);
            
            console.log('Recipe page loaded successfully');
        })
        .catch(error => {
            console.error('Error loading recipe template:', error);
            // Fallback content if fetch fails
            contentMain.innerHTML = `
                <div class="recipe-main">
                    <div class="recipe-header">
                        <h1 class="recipe-title">Šaltibarščiai: vasaros skonis dubenyje</h1>
                        <div class="recipe-meta">
                            <span>Gegužės 3, 2025</span>
                            <span>•</span>
                            <span><a href="#" onclick="showPage('category-page'); loadCategory('Sriubos'); return false;">Sriubos</a></span>
                            <span>•</span>
                            <span>Vasaros patiekalai</span>
                        </div>
                    </div>
                    
                    <div class="recipe-image">
                        ${createPlaceholderElement(800, 500, 'Šaltibarščiai').outerHTML}
                    </div>
                    
                    <p class="recipe-intro">Ką tik prasidėjus šiltajam sezonui, lietuviškoje virtuvėje atsiranda vienas ryškiausių patiekalų – šaltibarščiai. Ši šalta, ryškiai rožinė sriuba yra tapusi Lietuvos vasaros simboliu ir mano vaikystės atsiminimų dalimi.</p>
                    
                    <!-- Recipe content truncated for brevity -->
                    <div class="recipe-content">
                        <p>Kai buvau maža, mama visada žinodavo, kad atėjo laikas gaminti šaltibarščius, kai termometras pakildavo virš 20 laipsnių. Virtuvėje pasklisdavo žemiškas virtų burokėlių kvapas, o aš su didžiausiu susidomėjimu stebėdavau, kaip raudonieji burokėliai, susijungę su baltu kefyru, sukurdavo tą nepakartojamą, ryškiai rožinę spalvą.</p>
                        
                        <div class="recipe-box">
                            <h3>Šaltibarščiai</h3>
                            
                            <div class="recipe-time">
                                <div class="recipe-time-item">
                                    <span class="time-label">Paruošimas</span>
                                    <span class="time-value">20 min</span>
                                </div>
                                <div class="recipe-time-item">
                                    <span class="time-label">Atvėsinimas</span>
                                    <span class="time-value">2 val</span>
                                </div>
                                <div class="recipe-time-item">
                                    <span class="time-label">Porcijos</span>
                                    <span class="time-value">4</span>
                                </div>
                            </div>
                            
                            <h4>Ingredientai</h4>
                            <ul>
                                <li>500 ml kefyro</li>
                                <li>2-3 vidutinio dydžio virti burokėliai (apie 300g)</li>
                                <li>1 didelis agurkas</li>
                                <li>3-4 laiškiniai svogūnai</li>
                                <li>Didelis kuokštas šviežių krapų (apie 30g)</li>
                                <li>2 kietai virti kiaušiniai</li>
                                <li>Druskos ir pipirų pagal skonį</li>
                                <li>Žiupsnelis citrinų sulčių (nebūtina)</li>
                                <li>500g mažų bulvių patiekimui</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;
            
            // Create sidebar
            const sidebar = homePage.querySelector('.sidebar').cloneNode(true);
            mainContent.appendChild(contentMain);
            mainContent.appendChild(sidebar);
            
            // Add footer clone
            const footer = homePage.querySelector('footer').cloneNode(true);
            
            // Clear page and add elements
            recipePage.innerHTML = '';
            recipePage.appendChild(header);
            recipePage.appendChild(mainContent);
            recipePage.appendChild(footer);
        });
}

// Create category page if it doesn't exist
function createCategoryPage() {
    console.log('Creating category page');
    
    let categoryPage = document.getElementById('category-page');
    
    // If it already exists, return it
    if (categoryPage) {
        return categoryPage;
    }
    
    categoryPage = document.createElement('div');
    categoryPage.id = 'category-page';
    categoryPage.className = 'page';
    
    // Copy header and footer from home page
    const homePage = document.getElementById('home-page');
    if (!homePage) {
        console.error('Home page not found');
        return;
    }
    
    const header = homePage.querySelector('header').cloneNode(true);
    const footer = homePage.querySelector('footer').cloneNode(true);
    
    // Create main content structure
    const mainContent = document.createElement('div');
    mainContent.className = 'container main-content';
    
    // Add content main
    const contentMain = document.createElement('div');
    contentMain.className = 'content-main';
    contentMain.innerHTML = `
        <div class="category-header">
            <h1 class="category-title"></h1>
            <p class="category-description"></p>
        </div>
        <div class="recipe-grid">
            <!-- Recipe cards will be loaded here -->
        </div>
        <div class="load-more-container">
            <a href="#" class="load-more-button">DAUGIAU RECEPTŲ</a>
        </div>
    `;
    
    mainContent.appendChild(contentMain);
    
    // Add sidebar clone from home page
    const sidebar = homePage.querySelector('.sidebar').cloneNode(true);
    mainContent.appendChild(sidebar);
    
    // Assemble the page
    categoryPage.appendChild(header);
    categoryPage.appendChild(mainContent);
    categoryPage.appendChild(footer);
    
    // Add to the document
    document.body.appendChild(categoryPage);
    
    console.log('Category page created successfully');
    return categoryPage;
}

// Execute on page load
document.addEventListener('DOMContentLoaded', function() {
    // Ensure the placeholder styles are added
    const style = document.createElement('style');
    style.textContent = `
        .local-placeholder {
            max-width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 10px;
            box-sizing: border-box;
            font-family: 'Playfair Display', serif;
            overflow: hidden;
            word-break: break-word;
            background-color: #f8f5f1;
            color: #7f4937;
            border: 1px solid #e6ddd6;
            border-radius: 0;
            font-weight: normal;
            line-height: 1.3;
        }
        
        .local-placeholder span {
            font-family: 'Playfair Display', serif;
            text-transform: uppercase;
            font-weight: normal;
            color: #7f4937;
        }
        
        .recipe-card-image .local-placeholder {
            width: 100% !important;
            aspect-ratio: 1/1;
        }
    `;
    document.head.appendChild(style);
    
    // Initialize event listeners for navigation links
    const navLinks = document.querySelectorAll('nav a, .dropdown-content a');
    navLinks.forEach(link => {
        if (link.hasAttribute('onclick')) {
            // Already has onclick handler
            return;
        }
        
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const href = this.getAttribute('href');
            if (href === '#') {
                // Dropdown parent link, do nothing
                return;
            }
            
            if (href.startsWith('#')) {
                const pageId = href.substring(1);
                showPage(pageId);
            } else {
                window.location.href = href;
            }
        });
    });
});