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
});// Global State
let allData = [];
let currentFilter = {
    type: null,
    subtype: null,
    searchQuery: ''
};
let currentStoryContent = '';
let currentStoryType = '';

// Daily Strategies Collection
const dailyStrategies = [
    {
        title: "The 4-Day Cash Injection Story Sequence",
        description: "A proven 4-day Instagram Story framework that warms up your audience and generates sales without feeling salesy.",
        steps: [
            {
                day: "Day 1",
                title: "The Problem Agitation",
                content: "Share a story about a SPECIFIC problem your audience faces. Don't sell. Just agitate the pain. End with: 'Anyone else dealing with this? 🙋'"
            },
            {
                day: "Day 2",
                title: "The Social Proof Drop",
                content: "Screenshot a DM, testimonial, or result. Caption: 'This landed in my inbox this morning...' Show transformation without explaining how."
            },
            {
                day: "Day 3",
                title: "The Behind-The-Scenes",
                content: "Show yourself working on your product/service. 'Working on something that fixes [Day 1 problem]... should I share when it's ready?'"
            },
            {
                day: "Day 4",
                title: "The Soft Offer",
                content: "Open cart/link/offer. 'For everyone who asked about this yesterday—here's the link. DM me READY if you want details.'"
            }
        ],
        proTip: "Run this sequence on Mon-Thu for best engagement. Weekends have lower story views."
    },
    {
        title: "The Authority Builder DM Sequence",
        description: "Convert cold followers into warm leads in 5 DMs without being pushy or weird. Works for any niche.",
        steps: [
            {
                day: "DM 1",
                title: "The Genuine Opener",
                content: "Reply to THEIR story with something specific. Not 'Great post!' but 'That tip about [X] is solid—I tried something similar with [Y] and it worked.'"
            },
            {
                day: "DM 2",
                title: "The Value Drop",
                content: "Wait 2-3 days. Send: 'Hey! Saw you're working on [X]. Just came across this resource that might help—[link/tip]. No catch, just thought of you.'"
            },
            {
                day: "DM 3",
                title: "The Curiosity Hook",
                content: "Wait 4-5 days. 'Quick question—what's your biggest challenge with [their niche problem] right now? Working on something and want to make sure I'm solving the right thing.'"
            },
            {
                day: "DM 4",
                title: "The Soft Pitch",
                content: "Based on their answer: 'That's exactly what I help with. Want me to send over how I typically solve that? No pressure either way.'"
            },
            {
                day: "DM 5",
                title: "The Close",
                content: "If interested: 'Cool! Here's [your offer]. Happy to hop on a quick call if you want to see if it's a fit. If not, no worries—glad to help either way.'"
            }
        ],
        proTip: "Space these out. Desperation is felt through the screen. 2-5 days between each DM."
    },
    {
        title: "The Content Ladder Framework",
        description: "Turn one piece of content into 10 pieces across multiple platforms. Work less, reach more.",
        steps: [
            {
                day: "Step 1",
                title: "Start with Long-Form",
                content: "Create ONE comprehensive piece: YouTube video, podcast episode, or detailed blog post (1500+ words or 10+ minutes)."
            },
            {
                day: "Step 2",
                title: "Extract Key Points",
                content: "Pull out 5-7 standalone insights, quotes, or tips. Each should make sense without context."
            },
            {
                day: "Step 3",
                title: "Create Platform-Specific Versions",
                content: "Carousel (Instagram): Top 5 tips as slides. Twitter thread: Break into 7-10 tweets. Reels/TikTok: 30-60 sec video per tip. LinkedIn: 200-word insight post."
            },
            {
                day: "Step 4",
                title: "Repurpose Comments & Questions",
                content: "Every question you get = another piece of content. Answer publicly. FAQ posts perform incredibly well."
            },
            {
                day: "Step 5",
                title: "Schedule the Cascade",
                content: "Day 1: Long-form. Day 2-3: Carousel/Thread. Day 4-7: Individual tips as stories. Next week: Repurpose best performer."
            }
        ],
        proTip: "Track which format performs best. Double down on winners. Kill losers fast."
    },
    {
        title: "The $1K Weekend Launch Formula",
        description: "A 72-hour mini-launch framework perfect for digital products under $200. No ads required.",
        steps: [
            {
                day: "Friday",
                title: "The Teaser",
                content: "Post value content related to your product. End with: 'Dropping something tomorrow that takes this even further. Stay tuned 👀'"
            },
            {
                day: "Saturday AM",
                title: "The Launch Post",
                content: "Launch at 9-10am. Clear offer. Clear price. Clear outcome. Include deadline: 'Price goes up Monday at midnight.'"
            },
            {
                day: "Saturday PM",
                title: "The Social Proof",
                content: "Share first testimonials, DMs, or purchase notifications. 'Can't believe 27 people grabbed this in 3 hours...'"
            },
            {
                day: "Sunday",
                title: "The FAQ Handler",
                content: "Address objections publicly. 'Got a few questions about X—here's the answer...' Each FAQ = trust builder."
            },
            {
                day: "Monday",
                title: "The Final Push",
                content: "Last chance email + stories. 'Price increases in 6 hours. If you've been on the fence, now's the time.'"
            }
        ],
        proTip: "Run this monthly with different offers. Consistency beats perfection."
    },
    {
        title: "The Objection Eliminator Pre-Launch",
        description: "Eliminate every objection BEFORE your launch so buyers have nothing to stop them.",
        steps: [
            {
                day: "Week -2",
                title: "Collect Objections",
                content: "Ask your audience: 'If I created [X], what would stop you from buying?' Screenshot every response."
            },
            {
                day: "Week -2",
                title: "Map Objections to Content",
                content: "Group objections: Price, Time, Trust, Fit. Create one piece of content per objection category."
            },
            {
                day: "Week -1",
                title: "The Price Content",
                content: "Post about ROI, value stacking, or 'cost of not buying.' Show the math of staying stuck vs. investing."
            },
            {
                day: "Week -1",
                title: "The Time Content",
                content: "Share how little time it takes. 'If you have 30 minutes a day, you have enough time for this.'"
            },
            {
                day: "Launch Day",
                title: "The Zero-Objection Offer",
                content: "Your sales post should reference: 'I know you might be thinking [objection]... here's why that's not a factor.'"
            }
        ],
        proTip: "Screenshot the objection DMs and use them in your sales content. Shows you're listening."
    },
    {
        title: "The 9-Grid Authority Profile",
        description: "Set up your Instagram grid so the first 9 posts instantly convert visitors into followers.",
        steps: [
            {
                day: "Row 1",
                title: "The Value Row",
                content: "Posts 1-3: Your BEST educational content. Carousels that teach something valuable. These should be your highest-saved posts."
            },
            {
                day: "Row 2",
                title: "The Proof Row",
                content: "Posts 4-6: Testimonials, case studies, results. Mix of client wins, your wins, and social proof."
            },
            {
                day: "Row 3",
                title: "The Connection Row",
                content: "Posts 7-9: Personal content, behind-the-scenes, your story. Show you're human, not a content robot."
            },
            {
                day: "Bio",
                title: "The Bio Formula",
                content: "Line 1: What you help people do. Line 2: Who you help. Line 3: Credibility proof (numbers/clients). CTA: Link to your main offer."
            },
            {
                day: "Highlights",
                title: "The Highlight Setup",
                content: "5 key highlights: About Me, Testimonials, Free Resources, FAQ, How to Work Together. In that order."
            }
        ],
        proTip: "Archive anything that doesn't fit. Your grid is a landing page, not a diary."
    },
    {
        title: "The DM Closer Follow-Up System",
        description: "Never let a lead go cold again. A 14-day follow-up system that closes without being annoying.",
        steps: [
            {
                day: "Day 0",
                title: "The Initial Response",
                content: "When they show interest but don't buy: 'Totally understand! Happy to answer any questions. What's holding you back?'"
            },
            {
                day: "Day 3",
                title: "The Value Add",
                content: "Send a relevant resource: 'Hey! Just created this and thought of you. [Free resource link]. Hope it helps!'"
            },
            {
                day: "Day 7",
                title: "The Check-In",
                content: "'Hey [name]! Just checking in—did you have a chance to look at [offer]? Happy to hop on a quick call if easier.'"
            },
            {
                day: "Day 10",
                title: "The Case Study",
                content: "'Just helped [client] achieve [result]. Reminded me of your situation. Still interested in figuring this out?'"
            },
            {
                day: "Day 14",
                title: "The Final Touch",
                content: "'Last message from me on this! If you're still interested, door's open. If not, no worries—I'll stop bugging you 😊'"
            }
        ],
        proTip: "Use a spreadsheet to track. Set reminders. Consistency is everything."
    }
];

// DOM Elements
const searchInput = document.getElementById('searchInput');
const randomizeBtn = document.getElementById('randomizeBtn');
const welcomeScreen = document.getElementById('welcomeScreen');
const resultsContainer = document.getElementById('resultsContainer');
const contentGrid = document.getElementById('contentGrid');
const categoryTitle = document.getElementById('categoryTitle');
const categorySubtitle = document.getElementById('categorySubtitle');
const resultCount = document.getElementById('resultCount');
const storyModal = document.getElementById('storyModal');

// Initialize Daily Strategy
function initDailyStrategy() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const strategyIndex = dayOfYear % dailyStrategies.length;
    const todayStrategy = dailyStrategies[strategyIndex];
    
    // Update sidebar
    document.getElementById('dailyStrategyTitle').textContent = todayStrategy.title;
    
    // Update main card
    document.getElementById('dailyStrategyMainTitle').textContent = todayStrategy.title;
    document.getElementById('dailyStrategyDescription').textContent = todayStrategy.description;
    
    // Build steps content
    const stepsHTML = todayStrategy.steps.map((step, index) => `
        <div class="daily-strategy-step">
            <div class="flex items-start space-x-4">
                <div class="daily-strategy-step-number">${index + 1}</div>
                <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-1">
                        <span class="text-xs text-primary font-semibold">${step.day}</span>
                        <span class="text-white font-semibold">${step.title}</span>
                    </div>
                    <p class="text-sm text-gray-400">${step.content}</p>
                </div>
            </div>
        </div>
    `).join('');
    
    const proTipHTML = `
        <div class="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <p class="text-sm text-gray-300">
                <i class="fas fa-lightbulb text-primary mr-2"></i>
                <strong>Pro Tip:</strong> ${todayStrategy.proTip}
            </p>
        </div>
    `;
    
    document.getElementById('dailyStrategyContent').innerHTML = stepsHTML + proTipHTML;
    
    // Random view count for social proof
    const views = 800 + Math.floor(Math.random() * 700);
    document.getElementById('dailyStrategyViews').textContent = views.toLocaleString();
    
    // Setup copy button
    document.getElementById('copyDailyStrategy').addEventListener('click', () => {
        const fullContent = `${todayStrategy.title}\n\n${todayStrategy.description}\n\n${todayStrategy.steps.map((s, i) => `${i + 1}. ${s.day}: ${s.title}\n${s.content}`).join('\n\n')}\n\nPro Tip: ${todayStrategy.proTip}`;
        copyToClipboardText(fullContent, document.getElementById('copyDailyStrategy'));
    });
    
    // Setup share button
    document.getElementById('shareDailyStrategy').addEventListener('click', () => {
        openStoryModal(todayStrategy.title, 'DAILY STRATEGY');
    });
    
    // Setup sidebar button
    document.getElementById('dailyStrategyBtn').addEventListener('click', () => {
        welcomeScreen.classList.remove('hidden');
        resultsContainer.classList.add('hidden');
        document.querySelectorAll('.sub-nav-btn').forEach(btn => btn.classList.remove('active'));
    });
    
    // Start countdown timer
    updateDailyTimer();
    setInterval(updateDailyTimer, 1000);
}

// Update Daily Timer
function updateDailyTimer() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    document.getElementById('dailyTimer').textContent = timeString;
    document.getElementById('dailyTimerMain').textContent = timeString;
}

// Load Data
async function loadData() {
    try {
        const response = await fetch('data.json');
        allData = await response.json();
        console.log('Data loaded:', allData.length, 'items');
    } catch (error) {
        console.error('Error loading data:', error);
        // Load sample data if fetch fails
        allData = getSampleData();
    }
}

// Sample data fallback
function getSampleData() {
    return [
        {
            type: "hooks",
            subtype: "controversy",
            niche: "digital marketing",
            title: "Course Graveyard",
            content: "Your $97 course isn't selling because your content is boring. Let's be real.\n\nPeople don't need more information. They need transformation they can see in 7 days.\n\nStop teaching. Start showing.",
            notes: "Hits course creators where it hurts"
        }
    ];
}

// Navigation Event Listeners
document.querySelectorAll('.nav-category').forEach(button => {
    button.addEventListener('click', function() {
        const subcategory = this.nextElementSibling;
        const chevron = this.querySelector('.fa-chevron-down');
        
        subcategory.classList.toggle('hidden');
        chevron.style.transform = subcategory.classList.contains('hidden') 
            ? 'rotate(0deg)' 
            : 'rotate(180deg)';
        
        this.classList.toggle('active');
    });
});

document.querySelectorAll('.sub-nav-btn').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('.sub-nav-btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        const type = this.dataset.type;
        const subtype = this.dataset.subtype;
        
        currentFilter.type = type;
        currentFilter.subtype = subtype;
        
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
        displayResults(true);
    }
});

// Display Results
function displayResults(randomize = false) {
    welcomeScreen.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
    
    let filteredData = allData.filter(item => {
        const typeMatch = item.type === currentFilter.type;
        const subtypeMatch = currentFilter.subtype === 'all' || item.subtype === currentFilter.subtype;
        const searchMatch = currentFilter.searchQuery === '' || 
            item.niche.toLowerCase().includes(currentFilter.searchQuery) ||
            item.content.toLowerCase().includes(currentFilter.searchQuery);
        
        return typeMatch && subtypeMatch && searchMatch;
    });
    
    if (randomize) {
        filteredData = shuffleArray(filteredData);
    }
    
    filteredData = filteredData.slice(0, 10);
    
    updateCategoryTitle();
    resultCount.textContent = filteredData.length;
    
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

// Create Content Card with Share Button
function createContentCard(item, index) {
    const card = document.createElement('div');
    card.className = 'content-card';
    card.style.animationDelay = `${index * 0.05}s`;
    
    const contentType = getContentTypeLabel(item.type, item.subtype);
    
    card.innerHTML = `
        <div class="flex items-start justify-between mb-3">
            <span class="niche-badge">${item.niche}</span>
            <div class="action-buttons flex gap-2">
                <button class="share-btn" onclick="openStoryModal(\`${escapeHtml(item.content.substring(0, 150))}\`, '${contentType}')">
                    <i class="fas fa-share"></i>
                    <span>Share</span>
                </button>
                <button class="copy-btn" onclick="copyContent(this, '${index}')">
                    <i class="fas fa-copy"></i>
                    <span>Copy</span>
                </button>
            </div>
        </div>
        
        ${item.title ? `<h3 class="text-lg font-semibold text-white mb-2">${item.title}</h3>` : ''}
        
        <div class="content-text" id="content-${index}">${item.content}</div>
        
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

// Get Content Type Label
function getContentTypeLabel(type, subtype) {
    const labels = {
        'hooks': 'VIRAL HOOK',
        'captions': 'CAPTION',
        'dm-scripts': 'DM SCRIPT',
        'story-templates': 'STORY TEMPLATE',
        'hashtags': 'HASHTAG SET'
    };
    return labels[type] || 'CONTENT';
}

// Escape HTML for safe insertion
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// Copy Content
function copyContent(button, index) {
    const contentEl = document.getElementById(`content-${index}`);
    const content = contentEl.textContent;
    copyToClipboardText(content, button);
}

// Copy to Clipboard with feedback
function copyToClipboardText(text, button) {
    navigator.clipboard.writeText(text).then(() => {
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

// Story Modal Functions
function openStoryModal(content, contentType) {
    currentStoryContent = content;
    currentStoryType = contentType;
    
    document.getElementById('storyContentType').textContent = contentType;
    document.getElementById('storyMainContent').innerHTML = `<p>${content}</p>`;
    
    storyModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeStoryModal() {
    storyModal.classList.add('hidden');
    document.body.style.overflow = '';
}

function changeStoryStyle(style) {
    const storyCard = document.querySelector('.story-card');
    
    // Remove all style classes
    storyCard.classList.remove('gradient-green', 'gradient-purple', 'gradient-orange', 'solid-dark', 'solid-black');
    
    // Add selected style
    storyCard.classList.add(style);
    
    // Update active button
    document.querySelectorAll('.style-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.style === style) {
            btn.classList.add('active');
        }
    });
}

function updateStoryHandle() {
    const handle = document.getElementById('storyHandle').value;
    document.querySelector('.story-handle').textContent = handle;
}

function downloadStory() {
    // Create a visual alert
    const btn = document.querySelector('.story-download-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-camera mr-2"></i>Take Screenshot Now!';
    btn.style.background = 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)';
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
    }, 3000);
    
    // Flash effect on preview
    const preview = document.querySelector('.story-preview');
    preview.style.boxShadow = '0 0 60px rgba(99, 102, 241, 0.8)';
    setTimeout(() => {
        preview.style.boxShadow = '';
    }, 500);
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

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !storyModal.classList.contains('hidden')) {
        closeStoryModal();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initDailyStrategy();
});
