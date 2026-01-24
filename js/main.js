// Main JavaScript File

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    if (savedTheme === 'dark') {
        themeToggle.checked = true;
        document.body.classList.add('dark-theme');
    }
    
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        }
    });
    
    // Current Date Display
    const currentDateElement = document.getElementById('current-date');
    if (currentDateElement) {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        currentDateElement.textContent = now.toLocaleDateString('en-IN', options);
    }
    
    // Channel Stream Buttons
    document.querySelectorAll('.btn-stream').forEach(button => {
        button.addEventListener('click', function() {
            const channel = this.getAttribute('data-channel');
            playChannel(channel);
            
            // Update all buttons
            document.querySelectorAll('.btn-stream').forEach(btn => {
                btn.innerHTML = '<i class="fas fa-play"></i> Play Now';
                btn.style.backgroundColor = '';
            });
            
            // Update clicked button
            this.innerHTML = '<i class="fas fa-pause"></i> Playing';
            this.style.backgroundColor = '#28a745';
            
            // Show notification
            showNotification(`Now playing ${channel} channel`);
        });
    });
    
    // Hukamnama Audio
    document.querySelector('.btn-audio')?.addEventListener('click', function() {
        const audio = new Audio('https://example.com/hukamnama-audio.mp3');
        audio.play();
        this.innerHTML = '<i class="fas fa-volume-up"></i> Listening...';
        
        audio.onended = () => {
            this.innerHTML = '<i class="fas fa-volume-up"></i> Listen';
        };
    });
    
    // Save Hukamnama
    document.querySelector('.btn-save')?.addEventListener('click', function() {
        this.innerHTML = '<i class="fas fa-check"></i> Saved';
        this.style.backgroundColor = '#28a745';
        this.style.color = 'white';
        
        // Save to localStorage
        const hukamnama = {
            date: new Date().toISOString(),
            text: document.querySelector('.gurmukhi-text h3').textContent,
            translation: document.querySelector('.translation p').textContent
        };
        
        localStorage.setItem('savedHukamnama', JSON.stringify(hukamnama));
        showNotification('Hukamnama saved to favorites');
    });
    
    // Share Functionality
    document.querySelector('.btn-share')?.addEventListener('click', async function() {
        const shareData = {
            title: "Today's Hukamnama",
            text: document.querySelector('.gurmukhi-text h3').textContent,
            url: window.location.href
        };
        
        try {
            await navigator.share(shareData);
            showNotification('Shared successfully!');
        } catch (err) {
            // Fallback: Copy to clipboard
            const textToCopy = `${shareData.text}\n\n${shareData.url}`;
            await navigator.clipboard.writeText(textToCopy);
            showNotification('Link copied to clipboard!');
        }
    });
    
    // Notification System
    function showNotification(message) {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--kesri-primary);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 1rem;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Add close button event
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    // Add CSS animations for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .notification-close {
            background: transparent;
            border: none;
            color: white;
            cursor: pointer;
            padding: 0;
            font-size: 1rem;
        }
        
        .dark-theme {
            --white-pure: #1a1a1a;
            --white-off: #2d2d2d;
            --gray-light: #404040;
            --gray-medium: #8a8a8a;
            --gray-dark: #e0e0e0;
            --gray-charcoal: #333333;
        }
        
        .dark-theme .navbar,
        .dark-theme .channel-card,
        .dark-theme .hukamnama-card,
        .dark-theme .raagi-card {
            background-color: #2d2d2d;
            color: #e0e0e0;
        }
        
        .dark-theme h1,
        .dark-theme h2,
        .dark-theme h3,
        .dark-theme h4,
        .dark-theme .track-title {
            color: #e0e0e0;
        }
        
        .dark-theme p,
        .dark-theme .track-artist {
            color: #8a8a8a;
        }
        
        .dark-theme .footer {
            background: linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%);
        }
    `;
    document.head.appendChild(style);
    
    // Sample channel player function
    function playChannel(channel) {
        // In a real implementation, this would connect to actual radio streams
        const channels = {
            kirtan: 'https://stream.sikhnet.com/radio/800/kirtan.mp3',
            katha: 'https://stream.sikhnet.com/radio/800/katha.mp3',
            simran: 'https://stream.sikhnet.com/radio/800/simran.mp3',
            international: 'https://stream.sikhnet.com/radio/800/international.mp3'
        };
        
        // Update audio player
        const audioPlayer = window.audioPlayer;
        if (audioPlayer) {
            audioPlayer.playStream(channels[channel], `Gurbani ${channel.charAt(0).toUpperCase() + channel.slice(1)}`);
        }
        
        console.log(`Playing ${channel} channel: ${channels[channel]}`);
    }
    
    // Initialize other features
    initializeAudioPlayer();
    initializeSearch();
});

// Initialize Audio Player
function initializeAudioPlayer() {
    // This will be implemented in audio-player.js
    console.log('Audio player initialized');
}

// Initialize Search
function initializeSearch() {
    // This will be implemented in search.js
    console.log('Search functionality initialized');
}