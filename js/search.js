// Search Functionality for Gurbani Radio
class SearchSystem {
    constructor() {
        this.searchData = [];
        this.searchIndex = null;
        this.initializeSearch();
    }
    
    async initializeSearch() {
        // In a real implementation, this would load from an API
        this.searchData = [
            { 
                id: 1, 
                title: "Japji Sahib", 
                type: "Bani", 
                ang: 1,
                raag: "Jap",
                description: "The first bani in the Guru Granth Sahib",
                audio: "https://example.com/japji-sahib.mp3"
            },
            { 
                id: 2, 
                title: "Asa Di Var", 
                type: "Bani", 
                ang: 462,
                raag: "Asa",
                description: "A morning prayer by Guru Nanak Dev Ji",
                audio: "https://example.com/asa-di-var.mp3"
            },
            { 
                id: 3, 
                title: "Sukhmani Sahib", 
                type: "Bani", 
                ang: 262,
                raag: "Gauri",
                description: "The Psalm of Peace by Guru Arjan Dev Ji",
                audio: "https://example.com/sukhmani-sahib.mp3"
            },
            { 
                id: 4, 
                title: "Anand Sahib", 
                type: "Bani", 
                ang: 917,
                raag: "Ramkali",
                description: "The Song of Bliss by Guru Amar Das Ji",
                audio: "https://example.com/anand-sahib.mp3"
            },
            { 
                id: 5, 
                title: "Bhai Harvinder Singh", 
                type: "Ragi", 
                description: "Renowned classical ragi specializing in traditional raags",
                audio: "https://example.com/harvinder-singh.mp3"
            },
            { 
                id: 6, 
                title: "Bhai Nirmal Singh", 
                type: "Ragi", 
                description: "Hazuri ragi at Golden Temple, Amritsar",
                audio: "https://example.com/nirmal-singh.mp3"
            }
        ];
        
        this.setupSearchUI();
    }
    
    setupSearchUI() {
        // Create search component if it doesn't exist
        if (!document.querySelector('.search-container')) {
            this.createSearchComponent();
        }
        
        const searchInput = document.querySelector('.search-input');
        const searchBtn = document.querySelector('.search-btn');
        
        searchInput.addEventListener('input', (e) => this.performSearch(e.target.value));
        searchBtn.addEventListener('click', () => this.performSearch(searchInput.value));
        
        // Add keyboard shortcut (Ctrl + K)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }
    
    createSearchComponent() {
        const searchHTML = `
            <div class="search-container">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" class="search-input" placeholder="Search Shabads, Ragis, Raags... (Ctrl+K)">
                    <button class="search-btn">Search</button>
                </div>
                <div class="search-results">
                    <!-- Results will be inserted here -->
                </div>
            </div>
        `;
        
        // Add to navbar
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            const searchDiv = document.createElement('div');
            searchDiv.innerHTML = searchHTML;
            navMenu.insertBefore(searchDiv, navMenu.firstChild);
            
            // Add styles
            this.addSearchStyles();
        }
    }
    
    addSearchStyles() {
        const styles = `
            .search-container {
                position: relative;
                width: 300px;
            }
            
            .search-box {
                display: flex;
                align-items: center;
                background: var(--white-off);
                border-radius: var(--radius-lg);
                padding: 8px 15px;
                border: 2px solid transparent;
                transition: var(--transition);
            }
            
            .search-box:focus-within {
                border-color: var(--kesri-primary);
                background: var(--white-pure);
            }
            
            .search-box i {
                color: var(--gray-medium);
                margin-right: 10px;
            }
            
            .search-input {
                flex: 1;
                border: none;
                background: transparent;
                outline: none;
                font-size: 0.95rem;
                color: var(--gray-dark);
            }
            
            .search-input::placeholder {
                color: var(--gray-medium);
            }
            
            .search-btn {
                background: var(--kesri-primary);
                color: var(--white-pure);
                border: none;
                padding: 6px 15px;
                border-radius: var(--radius-md);
                cursor: pointer;
                font-weight: 500;
                transition: var(--transition);
            }
            
            .search-btn:hover {
                background: var(--kesri-dark);
            }
            
            .search-results {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: var(--white-pure);
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-lg);
                max-height: 400px;
                overflow-y: auto;
                display: none;
                z-index: 1000;
                margin-top: 5px;
            }
            
            .search-results.show {
                display: block;
            }
            
            .search-result-item {
                padding: 15px;
                border-bottom: 1px solid var(--gray-light);
                cursor: pointer;
                transition: var(--transition);
            }
            
            .search-result-item:hover {
                background: var(--white-off);
            }
            
            .search-result-item:last-child {
                border-bottom: none;
            }
            
            .result-title {
                font-weight: 600;
                color: var(--blue-dark);
                margin-bottom: 5px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .result-type {
                background: var(--kesri-primary);
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 0.75rem;
            }
            
            .result-description {
                color: var(--gray-medium);
                font-size: 0.9rem;
                margin-bottom: 5px;
            }
            
            .result-meta {
                display: flex;
                gap: 15px;
                font-size: 0.8rem;
                color: var(--gray-medium);
            }
            
            @media (max-width: 768px) {
                .search-container {
                    width: 100%;
                    order: -1;
                }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    performSearch(query) {
        const resultsContainer = document.querySelector('.search-results');
        
        if (!query.trim()) {
            resultsContainer.classList.remove('show');
            return;
        }
        
        const results = this.searchData.filter(item => {
            const searchText = `${item.title} ${item.type} ${item.raag || ''} ${item.description}`.toLowerCase();
            return searchText.includes(query.toLowerCase());
        });
        
        this.displayResults(results);
    }
    
    displayResults(results) {
        const resultsContainer = document.querySelector('.search-results');
        resultsContainer.innerHTML = '';
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-result-item">
                    <div class="result-title">
                        <i class="fas fa-search"></i>
                        No results found
                    </div>
                    <p class="result-description">Try different keywords</p>
                </div>
            `;
        } else {
            results.forEach(result => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                resultItem.innerHTML = this.getResultHTML(result);
                resultItem.addEventListener('click', () => this.handleResultClick(result));
                resultsContainer.appendChild(resultItem);
            });
        }
        
        resultsContainer.classList.add('show');
        
        // Close results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                resultsContainer.classList.remove('show');
            }
        });
    }
    
    getResultHTML(result) {
        return `
            <div class="result-title">
                ${result.title}
                <span class="result-type">${result.type}</span>
            </div>
            <p class="result-description">${result.description}</p>
            <div class="result-meta">
                ${result.ang ? `<span><i class="fas fa-book"></i> Ang ${result.ang}</span>` : ''}
                ${result.raag ? `<span><i class="fas fa-music"></i> ${result.raag}</span>` : ''}
                <span><i class="fas fa-clock"></i> Click to play</span>
            </div>
        `;
    }
    
    handleResultClick(result) {
        // Play the audio
        if (window.audioPlayer && result.audio) {
            window.audioPlayer.playStream(result.audio, result.title);
        }
        
        // Close results
        document.querySelector('.search-results').classList.remove('show');
        
        // Show notification
        this.showNotification(`Now playing: ${result.title}`);
    }
    
    showNotification(message) {
        // Reuse the notification system from main.js
        if (typeof showNotification === 'function') {
            showNotification(message);
        } else {
            alert(message);
        }
    }
}

// Initialize search system
document.addEventListener('DOMContentLoaded', () => {
    window.searchSystem = new SearchSystem();
});