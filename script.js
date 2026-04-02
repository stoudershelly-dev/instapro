// Global State
let allData = [];
let currentFilter = {
    type: null,
    subtype: null,
    searchQuery: ''
};

// DOM Elements
const searchInput = document.getElementById('searchInput');
const randomizeBtn = document.getElementById('randomizeBtn');
const welcomeScreen = document.getElementById('welcomeScreen');
const resultsContainer = document.getElementById('resultsContainer');
const contentGrid = document.getElementById('contentGrid');
const categoryTitle = document.getElementById('categoryTitle');
const categorySubtitle = document.getElementById('categorySubtitle');
const resultCount = document.getElementById('resultCount');

// Load Data
async function loadData() {
    try {
        const response = await fetch('data.json');
        allData = await response.json();
        console.log('Data loaded:', allData.length, 'items');
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load data. Please refresh the page.');
    }
}

// Navigation Event Listeners
document.querySelectorAll('.nav-category').forEach(button => {
    button.addEventListener('click', function() {
        const subcategory = this.nextElementSibling;
        const chevron = this.querySelector('.fa-chevron-down');
        
        // Toggle subcategory
        subcategory.classList.toggle('hidden');
        chevron.style.transform = subcategory.classList.contains('hidden') 
            ? 'rotate(0deg)' 
            : 'rotate(180deg)';
        
        // Toggle active state
        this.classList.toggle('active');
    });
});

document.querySelectorAll('.sub-nav-btn').forEach(button => {
    button.addEventListener('click', function() {
        // Remove active from all
        document.querySelectorAll('.sub-nav-btn').forEach(btn => btn.classList.remove('active'));
        
        // Add active to clicked
        this.classList.add('active');
        
        // Get filter params
        const type = this.dataset.type;
        const subtype = this.dataset.subtype;
        
        // Update current filter
        currentFilter.type = type;
        currentFilter.subtype = subtype;
        
        // Display results
        displayResults();
    });
});

// Search Functionality
searchInput.addEventListener('input', function() {
    currentFilter.searchQuery = this.value.toLowerCase().trim();
    if (currentFilter.type) {
        displayResults();
    }
});

// Randomize Button
randomizeBtn.addEventListener('click', function() {
    if (currentFilter.type) {
        displayResults(true); // true = randomize
    }
});

// Display Results
function displayResults(randomize = false) {
    welcomeScreen.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
    
    // Filter data
    let filteredData = allData.filter(item => {
        const typeMatch = item.type === currentFilter.type;
        const subtypeMatch = currentFilter.subtype === 'all' || item.subtype === currentFilter.subtype;
        const searchMatch = currentFilter.searchQuery === '' || 
            item.niche.toLowerCase().includes(currentFilter.searchQuery) ||
            item.content.toLowerCase().includes(currentFilter.searchQuery);
        
        return typeMatch && subtypeMatch && searchMatch;
    });
    
    // Randomize if requested
    if (randomize) {
        filteredData = shuffleArray(filteredData);
    }
    
    // Limit to 10 items
    filteredData = filteredData.slice(0, 10);
    
    // Update UI
    updateCategoryTitle();
    resultCount.textContent = filteredData.length;
    
    // Render cards
    contentGrid.innerHTML = '';
    
    if (filteredData.length === 0) {
        contentGrid.innerHTML = `
            <div class="text-center py-20">
                <i class="fas fa-search text-6xl text-gray-700 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-400">No results found</h3>
                <p class="text-gray-500 mt-2">Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }
    
    filteredData.forEach((item, index) => {
        const card = createContentCard(item, index);
        contentGrid.appendChild(card);
    });
}

// Create Content Card
function createContentCard(item, index) {
    const card = document.createElement('div');
    card.className = 'content-card';
    card.style.animationDelay = `${index * 0.05}s`;
    
    card.innerHTML = `
        <div class="flex items-start justify-between mb-3">
            <span class="niche-badge">${item.niche}</span>
            <button class="copy-btn" onclick="copyToClipboard(this, ${index})">
                <i class="fas fa-copy"></i>
                <span>Copy</span>
            </button>
        </div>
        
        ${item.title ? `<h3 class="text-lg font-semibold text-white mb-2">${item.title}</h3>` : ''}
        
        <div class="content-text">${item.content}</div>
        
        ${item.notes ? `
            <div class="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                <p class="text-sm text-gray-300">
                    <i class="fas fa-lightbulb text-primary mr-2"></i>
                    ${item.notes}
                </p>
            </div>
        ` : ''}
    `;
    
    return card;
}

// Copy to Clipboard
function copyToClipboard(button, index) {
    const card = button.closest('.content-card');
    const content = card.querySelector('.content-text').textContent;
    
    navigator.clipboard.writeText(content).then(() => {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i><span>Copied!</span>';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Update Category Title
function updateCategoryTitle() {
    const titles = {
        'hooks': {
            'controversy': 'Viral Hooks - Controversy',
            'listicle': 'Viral Hooks - Listicle',
            'transformation': 'Viral Hooks - Transformation'
        },
        'captions': {
            'aida': 'Caption Bank - AIDA Framework',
            'pas': 'Caption Bank - PAS Framework'
        },
        'dm-scripts': {
            'price-objection': 'DM Scripts - Price Objections',
            'scam-objection': 'DM Scripts - Trust Building',
            'timing-objection': 'DM Scripts - Timing Objections'
        },
        'story-templates': {
            '5-slide': 'Story Selling - 5-Slide Sequences'
        },
        'hashtags': {
            'all': 'Hashtag Strategist - Premium Sets'
        }
    };
    
    const title = titles[currentFilter.type]?.[currentFilter.subtype] || 'Results';
    categoryTitle.textContent = title;
    categorySubtitle.textContent = currentFilter.searchQuery 
        ? `Filtered by: "${currentFilter.searchQuery}"` 
        : 'Click randomize for fresh content';
}

// Utility: Shuffle Array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Error Display
function showError(message) {
    contentGrid.innerHTML = `
        <div class="text-center py-20">
            <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
            <h3 class="text-xl font-semibold text-gray-400">${message}</h3>
        </div>
    `;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadData();
});