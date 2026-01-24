// Main JavaScript - Gurbani Radio Website

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const themeToggle = document.getElementById('theme-toggle');
const currentDateEl = document.getElementById('currentDate');
const audioPlayer = document.getElementById('audioPlayer');
const toast = document.getElementById('toast');

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // 1. Mobile Navigation
    setupMobileNav();
    
    // 2. Theme Toggle
    setupThemeToggle();
    
    // 3. Set Current Date
    setCurrentDate();
    
    // 4. Initialize Channel Buttons
    setupChannelButtons();
    
    // 5. Initialize Hukamnama Features
    setupHukamnamaFeatures();
    
    // 6. Initialize Raagi Buttons
    setupRaagiButtons();
    
    // 7. Newsletter Subscription
    setupNewsletter();
    
    // 8. Search Functionality
    setupSearch();
    
    // 9. Smooth Scroll for Links
    setupSmoothScroll();
    
    // 10. Initialize Audio Player
    if (window.AudioPlayer) {
        window.AudioPlayer.init();
    }
    
    console.log('Gurbani Radio Website initialized successfully');
});

// 1. Mobile Navigation Setup
function setupMobileNav() {
    if (!hamburger || !navMenu) return;
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Toggle body scroll
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });
    
    // Close mobile menu when clicking on links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-menu') && !e.target.closest('.hamburger')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// 2. Theme Toggle Setup
function setupThemeToggle() {
    if (!themeToggle) return;
    
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('gurbani-theme') || 'light';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (savedTheme === 'auto' && prefersDark)) {
        document.body.classList.add('dark-theme');
        themeToggle.checked = true;
    }
    
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-theme');
            localStorage.setItem('gurbani-theme', 'dark');
            showToast('Dark theme enabled', 'success');
        } else {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('gurbani-theme', 'light');
            showToast('Light theme enabled', 'success');
        }
    });
}

// 3. Set Current Date
function setCurrentDate() {
    if (!currentDateEl) return;
    
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    currentDateEl.textContent = now.toLocaleDateString('en-IN', options);
    
    // Update time every minute
    setInterval(() => {
        const now = new Date();
        currentDateEl.textContent = now.toLocaleDateString('en-IN', options);
    }, 60000);
}

// 4. Channel Buttons Setup
function setupChannelButtons() {
    const channelButtons = document.querySelectorAll('.btn-stream');
    
    channelButtons.forEach(button => {
        button.addEventListener('click', function() {
            const channel = this.dataset.channel;
            const channelName = this.parentElement.querySelector('h3').textContent;
            const listeners = this.parentElement.querySelector('.listeners').textContent;
            
            // Update button state
            channelButtons.forEach(btn => {
                const icon = btn.querySelector('i');
                btn.innerHTML = '<i class="fas fa-play"></i> Play Now';
                btn.classList.remove('playing');
            });
            
            this.innerHTML = '<i class="fas fa-pause"></i> Playing';
            this.classList.add('playing');
            
            // Simulate playing the channel
            playChannel(channel, channelName);
            
            // Show notification
            showToast(`Now playing: ${channelName} (${listeners})`, 'success');
        });
    });
}

// 5. Hukamnama Features Setup
function setupHukamnamaFeatures() {
    // Play Hukamnama Audio
    const playHukamnamaBtn = document.getElementById('playHukamnama');
    if (playHukamnamaBtn) {
        playHukamnamaBtn.addEventListener('click', function() {
            // In a real implementation, this would play actual Hukamnama audio
            const hukamnamaText = document.querySelector('.gurbani-text h3').textContent;
            const raag = document.querySelector('.raag-badge').textContent;
            
            if (window.AudioPlayer) {
                window.AudioPlayer.playTrack({
                    title: `Hukamnama - ${raag}`,
                    artist: 'Sri Harmandir Sahib',
                    duration: '2:45'
                });
            }
            
            this.innerHTML = '<i class="fas fa-volume-up"></i> Listening...';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-volume-up"></i> Listen Audio';
            }, 3000);
            
            showToast('Playing Hukamnama audio', 'success');
        });
    }
    
    // Save Hukamnama
    const saveHukamnamaBtn = document.getElementById('saveHukamnama');
    if (saveHukamnamaBtn) {
        saveHukamnamaBtn.addEventListener('click', function() {
            const hukamnama = {
                date: new Date().toISOString(),
                text: document.querySelector('.gurbani-text h3').textContent,
                translation: document.querySelector('.translation p').textContent,
                raag: document.querySelector('.raag-badge').textContent,
                ang: document.querySelector('.ang-badge').textContent
            };
            
            // Save to localStorage
            let savedHukamnamas = JSON.parse(localStorage.getItem('savedHukamnamas') || '[]');
            savedHukamnamas.push(hukamnama);
            localStorage.setItem('savedHukamnamas', JSON.stringify(savedHukamnamas));
            
            this.innerHTML = '<i class="fas fa-check"></i> Saved';
            this.style.background = 'var(--success)';
            
            showToast('Hukamnama saved to favorites', 'success');
            
            // Reset after 3 seconds
            setTimeout(() => {
                this.innerHTML = '<i class="far fa-bookmark"></i> Save';
                this.style.background = '';
            }, 3000);
        });
    }
    
    // Share Hukamnama
    const shareHukamnamaBtn = document.getElementById('shareHukamnama');
    if (shareHukamnamaBtn) {
        shareHukamnamaBtn.addEventListener('click', async function() {
            const shareData = {
                title: "Today's Hukamnama",
                text: document.querySelector('.gurbani-text h3').textContent + '\n' +
                      document.querySelector('.translation p').textContent,
                url: window.location.href
            };
            
            try {
                if (navigator.share) {
                    await navigator.share(shareData);
                    showToast('Shared successfully!', 'success');
                } else {
                    // Fallback: Copy to clipboard
                    await navigator.clipboard.writeText(
                        `${shareData.text}\n\n${shareData.url}`
                    );
                    showToast('Link copied to clipboard!', 'success');
                }
            } catch (err) {
                console.error('Error sharing:', err);
                showToast('Failed to share', 'error');
            }
        });
    }
}

// 6. Raagi Buttons Setup
function setupRaagiButtons() {
    const raagiButtons = document.querySelectorAll('[data-raagi]');
    
    raagiButtons.forEach(button => {
        button.addEventListener('click', function() {
            const raagiName = this.parentElement.querySelector('h3').textContent;
            const raags = Array.from(this.parentElement.querySelectorAll('.raag-tags span'))
                .map(span => span.textContent)
                .join(', ');
            
            // Add tracks to playlist
            if (window.AudioPlayer) {
                const tracks = [
                    {
                        title: `${raagiName} - Shabad 1`,
                        artist: raags,
                        duration: '4:32'
                    },
                    {
                        title: `${raagiName} - Shabad 2`,
                        artist: raags,
                        duration: '5:15'
                    },
                    {
                        title: `${raagiName} - Shabad 3`,
                        artist: raags,
                        duration: '3:45'
                    }
                ];
                
                window.AudioPlayer.addToPlaylist(tracks);
            }
            
            showToast(`Added ${raagiName}'s shabads to playlist`, 'success');
        });
    });
}

// 7. Newsletter Subscription
function setupNewsletter() {
    const newsletterEmail = document.getElementById('newsletterEmail');
    const subscribeBtn = document.getElementById('subscribeBtn');
    
    if (subscribeBtn && newsletterEmail) {
        subscribeBtn.addEventListener('click', function() {
            const email = newsletterEmail.value.trim();
            
            if (!email || !isValidEmail(email)) {
                showToast('Please enter a valid email address', 'error');
                newsletterEmail.focus();
                return;
            }
            
            // Simulate subscription
            newsletterEmail.value = '';
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-check"></i>';
                
                // Save subscription
                let subscriptions = JSON.parse(localStorage.getItem('newsletterSubscriptions') || '[]');
                subscriptions.push({
                    email: email,
                    date: new Date().toISOString()
                });
                localStorage.setItem('newsletterSubscriptions', JSON.stringify(subscriptions));
                
                showToast('Successfully subscribed to newsletter!', 'success');
                
                // Reset button
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-paper-plane"></i>';
                }, 2000);
            }, 1500);
        });
        
        // Allow Enter key to submit
        newsletterEmail.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                subscribeBtn.click();
            }
        });
    }
}

// 8. Search Functionality
function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    if (!searchInput || !searchBtn) return;
    
    const searchData = [
        { title: "Japji Sahib", type: "Bani", category: "Nitnem", duration: "20:00" },
        { title: "Asa Di Var", type: "Bani", category: "Morning Prayer", duration: "45:00" },
        { title: "Sukhmani Sahib", type: "Bani", category: "Psalm of Peace", duration: "60:00" },
        { title: "Bhai Harvinder Singh", type: "Ragi", category: "Classical Kirtan", shabads: "125" },
        { title: "Raag Asa", type: "Raag", category: "Morning Raag", time: "4-7 AM" },
        { title: "Anand Sahib", type: "Bani", category: "Song of Bliss", duration: "15:00" }
    ];
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    
    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        
        if (!query) {
            showToast('Please enter search terms', 'warning');
            return;
        }
        
        const results = searchData.filter(item => 
            item.title.toLowerCase().includes(query) ||
            item.type.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query)
        );
        
        if (results.length > 0) {
            const resultText = results.map(r => r.title).join(', ');
            showToast(`Found ${results.length} results: ${resultText}`, 'success');
            
            // In a real implementation, you would show these in a dropdown
            // For now, we'll just log them
            console.log('Search Results:', results);
        } else {
            showToast('No results found. Try different keywords.', 'error');
        }
    }
}

// 9. Smooth Scroll
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                
                // Close mobile menu if open
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
                
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Helper Functions
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showToast(message, type = 'info') {
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = 'toast show';
    toast.classList.add(type);
    
    // Add icon based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    toast.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

function playChannel(channelId, channelName) {
    // This is a simulation - in real implementation, connect to actual radio streams
    console.log(`Playing channel: ${channelId} - ${channelName}`);
    
    // Update audio player
    if (window.AudioPlayer) {
        window.AudioPlayer.playStream(channelName);
    }
    
    // Update listeners count (simulation)
    setTimeout(() => {
        const listenersEl = document.querySelector(`[data-channel="${channelId}"]`).parentElement.querySelector('.listeners');
        if (listenersEl) {
            const current = parseInt(listenersEl.textContent.match(/\d+/)[0]);
            listenersEl.innerHTML = `<i class="fas fa-headphones"></i> ${current + 1} listening`;
        }
    }, 1000);
}

// Export functions for use in other modules
window.GurbaniRadio = {
    showToast,
    playChannel,
    setupMobileNav,
    setupThemeToggle
};