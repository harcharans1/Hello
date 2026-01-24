// Search System for Gurbani Radio

const SearchSystem = (function() {
    // Search database
    const searchData = [
        {
            id: 1,
            title: "Japji Sahib",
            type: "Bani",
            category: "Nitnem",
            duration: "20:00",
            ang: "1",
            raag: "Jap",
            description: "The first bani in the Guru Granth Sahib, composed by Guru Nanak Dev Ji",
            keywords: ["morning prayer", "nitnem", "guru nanak"]
        },
        {
            id: 2,
            title: "Asa Di Var",
            type: "Bani",
            category: "Morning Prayer",
            duration: "45:00",
            ang: "462-475",
            raag: "Asa",
            description: "A collection of 24 shabads by Guru Nanak Dev Ji, sung in the morning",
            keywords: ["asa", "morning", "var"]
        },
        {
            id: 3,
            title: "Sukhmani Sahib",
            type: "Bani",
            category: "Psalm of Peace",
            duration: "60:00",
            ang: "262-296",
            raag: "Gauri",
            description: "The prayer of peace composed by Guru Arjan Dev Ji",
            keywords: ["peace", "sukhmani", "meditation"]
        },
        {
            id: 4,
            title: "Bhai Harvinder Singh",
            type: "Ragi",
            category: "Classical Kirtan",
            shabads: 125,
            raags: ["Asa", "Bilawal", "Marwa", "Todi"],
            description: "Renowned classical ragi specializing in traditional raags",
            keywords: ["classical", "traditional", "raga"]
        },
        {
            id: 5,
            title: "Raag Asa",
            type: "Raag",
            category: "Morning Raag",
            time: "4-7 AM",
            thaats: "Bilawal",
            description: "A morning raag that creates a devotional mood",
            keywords: ["morning", "devotional", "classical"]
        },
        {
            id: 6,
            title: "Anand Sahib",
            type: "Bani",
            category: "Song of Bliss",
            duration: "15:00",
            ang: "917-922",
            raag: "Ramkali",
            description: "Composed by Guru Amar Das Ji, expresses spiritual bliss",
            keywords: ["bliss", "anand", "happiness"]
        },
        {
            id: 7,
            title: "Rehras Sahib",
            type: "Bani",
            category: "Evening Prayer",
            duration: "25:00",
            ang: "8-12",
            description: "Evening prayer recited after sunset",
            keywords: ["evening", "rehras", "prayer"]
        },
        {
            id: 8,
            title: "Bhai Nirmal Singh",
            type: "Ragi",
            category: "Hazuri Ragi",
            shabads: 89,
            raags: ["Darbari", "Kalyan", "Todi"],
            description: "Hazuri ragi at Golden Temple, Amritsar",
            keywords: ["golden temple", "hazuri", "amritsar"]
        }
    ];
    
    // DOM Elements
    let searchInput, searchBtn, resultsContainer;
    
    // Initialize search system
    function init() {
        // Create search components if they don't exist
        createSearchUI();
        
        // Get DOM elements
        searchInput = document.querySelector('.search-input');
        searchBtn = document.querySelector('.search-btn');
        resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results';
        
        // Insert results container after search input
        if (searchInput && searchInput.parentNode) {
            searchInput.parentNode.appendChild(resultsContainer);
        }
        
        setupEventListeners();
        setupKeyboardShortcuts();
        
        console.log('Search system initialized');
    }
    
    // Create search UI components
    function createSearchUI() {
        // Check if search already exists
        if (document.querySelector('.search-container')) return;
        
        // Find nav-actions container
        const navActions = document.querySelector('.nav-actions');
        if (!navActions) return;
        
        // Create search container
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <input type="text" class="search-input" placeholder="Search Shabads, Ragis, Raags...">
            <button class="search-btn">
                <i class="fas fa-search"></i>
            </button>
        `;
        
        // Insert at beginning of nav-actions
        navActions.insertBefore(searchContainer, navActions.firstChild);
        
        // Add search styles
        addSearchStyles();
    }
    
    // Add search-specific styles
    function addSearchStyles() {
        const styles = `
            .search-results {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: var(--white);
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-xl);
                max-height: 400px;
                overflow-y: auto;
                display: none;
                z-index: var(--z-dropdown);
                margin-top: 5px;
                border: 1px solid var(--gray-light);
            }
            
            .search-results.show {
                display: block;
            }
            
            .search-result-item {
                padding: 1rem;
                border-bottom: 1px solid var(--gray-light);
                cursor: pointer;
                transition: var(--transition);
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
            }
            
            .search-result-item:hover {
                background: var(--white-off);
            }
            
            .search-result-item:last-child {
                border-bottom: none;
            }
            
            .search-result-content {
                flex: 1;
            }
            
            .result-title {
                font-weight: 600;
                color: var(--blue);
                margin-bottom: 0.25rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .result-type {
                background: var(--kesri);
                color: white;
                padding: 0.125rem 0.5rem;
                border-radius: 12px;
                font-size: 0.75rem;
                font-weight: 500;
            }
            
            .result-description {
                color: var(--gray);
                font-size: 0.875rem;
                margin-bottom: 0.5rem;
            }
            
            .result-meta {
                display: flex;
                gap: 1rem;
                font-size: 0.75rem;
                color: var(--gray);
            }
            
            .result-meta span {
                display: flex;
                align-items: center;
                gap: 0.25rem;
            }
            
            .result-action {
                background: var(--blue);
                color: white;
                border: none;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: var(--transition);
            }
            
            .result-action:hover {
                background: var(--blue-dark);
                transform: scale(1.1);
            }
            
            .no-results {
                padding: 2rem;
                text-align: center;
                color: var(--gray);
            }
            
            .no-results i {
                font-size: 2rem;
                margin-bottom: 1rem;
                color: var(--gray-light);
            }
            
            @media (max-width: 768px) {
                .search-container {
                    width: 100%;
                    order: -1;
                }
                
                .search-results {
                    position: fixed;
                    top: 70px;
                    left: 1rem;
                    right: 1rem;
                    max-height: 60vh;
                }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    // Setup event listeners
    function setupEventListeners() {
        if (!searchInput || !searchBtn) return;
        
        // Search button click
        searchBtn.addEventListener('click', performSearch);
        
        // Input events
        searchInput.addEventListener('input', function() {
            if (this.value.trim()) {
                performSearch();
            } else {
                hideResults();
            }
        });
        
        // Close results when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.search-container') && 
                !e.target.closest('.search-results')) {
                hideResults();
            }
        });
        
        // Prevent form submission
        if (searchInput.form) {
            searchInput.form.addEventListener('submit', function(e) {
                e.preventDefault();
                performSearch();
            });
        }
    }
    
    // Setup keyboard shortcuts
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }
            
            // Escape to close results
            if (e.key === 'Escape') {
                hideResults();
                if (searchInput) {
                    searchInput.blur();
                }
            }
            
            // Arrow keys navigation in results
            if (resultsContainer.classList.contains('show')) {
                const items = resultsContainer.querySelectorAll('.search-result-item');
                const activeItem = resultsContainer.querySelector('.search-result-item.active');
                
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    navigateResults(1, items, activeItem);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    navigateResults(-1, items, activeItem);
                } else if (e.key === 'Enter' && activeItem) {
                    e.preventDefault();
                    activeItem.click();
                }
            }
        });
    }
    
    // Perform search
    function performSearch() {
        if (!searchInput || !resultsContainer) return;
        
        const query = searchInput.value.trim().toLowerCase();
        
        if (!query) {
            hideResults();
            return;
        }
        
        // Filter search data
        const results = searchData.filter(item => {
            const searchString = `
                ${item.title} 
                ${item.type} 
                ${item.category || ''} 
                ${item.description || ''} 
                ${item.raag || ''} 
                ${(item.keywords || []).join(' ')}
            `.toLowerCase();
            
            return searchString.includes(query);
        });
        
        // Display results
        displayResults(results);
    }
    
    // Display search results
    function displayResults(results) {
        if (!resultsContainer) return;
        
        resultsContainer.innerHTML = '';
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>No results found</p>
                    <small>Try different keywords</small>
                </div>
            `;
        } else {
            results.forEach(result => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                resultItem.innerHTML = getResultHTML(result);
                resultItem.addEventListener('click', () => handleResultClick(result));
                resultsContainer.appendChild(resultItem);
            });
        }
        
        resultsContainer.classList.add('show');
    }
    
    // Generate HTML for a search result
    function getResultHTML(result) {
        return `
            <div class="search-result-content">
                <div class="result-title">
                    ${result.title}
                    <span class="result-type">${result.type}</span>
                </div>
                <p class="result-description">${result.description}</p>
                <div class="result-meta">
                    ${result.ang ? `<span><i class="fas fa-book"></i> Ang ${result.ang}</span>` : ''}
                    ${result.raag ? `<span><i class="fas fa-music"></i> ${result.raag}</span>` : ''}
                    ${result.duration ? `<span><i class="fas fa-clock"></i> ${result.duration}</span>` : ''}
                    ${result.shabads ? `<span><i class="fas fa-list"></i> ${result.shabads} shabads</span>` : ''}
                </div>
            </div>
            <button class="result-action" title="Play">
                <i class="fas fa-play"></i>
            </button>
        `;
    }
    
    // Handle result click
    function handleResultClick(result) {
        // Play the result
        playResult(result);
        
        // Hide results
        hideResults();
        
        // Clear search input
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Show notification
        showNotification(`Now playing: ${result.title}`);
    }
    
    // Play a search result
    function playResult(result) {
        if (window.AudioPlayer) {
            const track = {
                title: result.title,
                artist: result.type === 'Ragi' ? result.category : result.description,
                duration: result.duration || '3:45'
            };
            
            if (result.type === 'Ragi') {
                // Add multiple tracks for ragi
                const tracks = [
                    { ...track, title: `${result.title} - Shabad 1` },
                    { ...track, title: `${result.title} - Shabad 2` },
                    { ...track, title: `${result.title} - Shabad 3` }
                ];
                window.AudioPlayer.addToPlaylist(tracks);
                window.AudioPlayer.playTrack(tracks[0]);
            } else {
                window.AudioPlayer.playTrack(track);
            }
        }
    }
    
    // Navigate results with arrow keys
    function navigateResults(direction, items, activeItem) {
        let nextIndex = 0;
        
        if (activeItem) {
            const currentIndex = Array.from(items).indexOf(activeItem);
            nextIndex = currentIndex + direction;
            
            if (nextIndex < 0) nextIndex = items.length - 1;
            if (nextIndex >= items.length) nextIndex = 0;
        }
        
        // Remove active class from all items
        items.forEach(item => item.classList.remove('active'));
        
        // Add active class to selected item
        if (items[nextIndex]) {
            items[nextIndex].classList.add('active');
            items[nextIndex].scrollIntoView({ block: 'nearest' });
        }
    }
    
    // Hide search results
    function hideResults() {
        if (resultsContainer) {
            resultsContainer.classList.remove('show');
        }
    }
    
    // Show notification
    function showNotification(message) {
        if (window.GurbaniRadio && window.GurbaniRadio.showToast) {
            window.GurbaniRadio.showToast(message, 'success');
        }
    }
    
    // Public API
    return {
        init,
        performSearch,
        hideResults,
        addToSearchData: function(items) {
            if (Array.isArray(items)) {
                searchData.push(...items);
            } else {
                searchData.push(items);
            }
        },
        getSearchData: function() {
            return [...searchData];
        }
    };
})();

// Initialize search system
document.addEventListener('DOMContentLoaded', function() {
    SearchSystem.init();
});

// Make SearchSystem globally available
window.SearchSystem = SearchSystem;