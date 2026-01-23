// Gurfateh Radio - Complete JavaScript

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    initializeApp();
});

function initializeApp() {
    // Hide loading screen after 2 seconds
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('fade-out');
        setTimeout(() => {
            document.getElementById('loadingScreen').style.display = 'none';
        }, 500);
    }, 2000);
    
    // Initialize all components
    initNavigation();
    initAudioPlayer();
    initChannels();
    initSchedule();
    initEventListeners();
    updateLiveListeners();
}

// Navigation
function initNavigation() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Close menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Audio Player
let audioPlayer = null;
let currentChannel = null;
let isPlaying = false;
let currentTime = 0;
let totalTime = 0;

function initAudioPlayer() {
    audioPlayer = document.getElementById('audioPlayer');
    
    // Set initial audio source
    audioPlayer.src = 'https://stream.gurfatehradio.com/kirtan.mp3';
    
    // Player controls
    const playBtn = document.getElementById('playBtn');
    const playIcon = document.getElementById('playIcon');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeIcon = document.getElementById('volumeIcon');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const progressThumb = document.getElementById('progressThumb');
    const currentTimeEl = document.getElementById('currentTime');
    const totalTimeEl = document.getElementById('totalTime');
    const favoriteBtn = document.getElementById('favoriteBtn');
    const repeatBtn = document.getElementById('repeatBtn');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const shareBtn = document.getElementById('shareBtn');
    
    // Play/Pause
    playBtn.addEventListener('click', togglePlayPause);
    
    // Previous/Next
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);
    
    // Volume control
    volumeSlider.addEventListener('input', function() {
        const volume = this.value / 100;
        audioPlayer.volume = volume;
        
        // Update volume icon
        if (volume === 0) {
            volumeIcon.className = 'fas fa-volume-mute';
        } else if (volume < 0.5) {
            volumeIcon.className = 'fas fa-volume-down';
        } else {
            volumeIcon.className = 'fas fa-volume-up';
        }
    });
    
    // Progress bar
    let isDragging = false;
    
    progressBar.addEventListener('click', function(e) {
        if (!audioPlayer.duration) return;
        
        const rect = this.getBoundingClientRect();
        const percentage = (e.clientX - rect.left) / rect.width;
        audioPlayer.currentTime = percentage * audioPlayer.duration;
        updateProgress(percentage);
    });
    
    progressThumb.addEventListener('mousedown', function(e) {
        e.preventDefault();
        isDragging = true;
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', stopDrag);
    });
    
    function handleDrag(e) {
        if (!isDragging || !audioPlayer.duration) return;
        
        const rect = progressBar.getBoundingClientRect();
        let percentage = (e.clientX - rect.left) / rect.width;
        percentage = Math.max(0, Math.min(1, percentage));
        
        audioPlayer.currentTime = percentage * audioPlayer.duration;
        updateProgress(percentage);
    }
    
    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', stopDrag);
    }
    
    // Audio events
    audioPlayer.addEventListener('loadedmetadata', function() {
        totalTime = audioPlayer.duration;
        totalTimeEl.textContent = formatTime(totalTime);
    });
    
    audioPlayer.addEventListener('timeupdate', function() {
        if (isDragging) return;
        
        currentTime = audioPlayer.currentTime;
        const percentage = currentTime / audioPlayer.duration;
        updateProgress(percentage);
        
        currentTimeEl.textContent = formatTime(currentTime);
        totalTimeEl.textContent = formatTime(audioPlayer.duration);
    });
    
    audioPlayer.addEventListener('play', function() {
        isPlaying = true;
        playIcon.className = 'fas fa-pause';
        playBtn.classList.add('playing');
        updateSpinningDisc(true);
    });
    
    audioPlayer.addEventListener('pause', function() {
        isPlaying = false;
        playIcon.className = 'fas fa-play';
        playBtn.classList.remove('playing');
        updateSpinningDisc(false);
    });
    
    audioPlayer.addEventListener('ended', function() {
        playNext();
    });
    
    // Extra controls
    let isFavorite = false;
    favoriteBtn.addEventListener('click', function() {
        isFavorite = !isFavorite;
        const heartIcon = this.querySelector('i');
        heartIcon.className = isFavorite ? 'fas fa-heart' : 'far fa-heart';
        this.classList.toggle('active', isFavorite);
        
        if (isFavorite) {
            showNotification('ਤੁਹਾਡੇ ਪਸੰਦੀਦਾ ਵਿੱਚ ਜੋੜਿਆ ਗਿਆ');
        }
    });
    
    let repeatMode = 'off'; // off, all, one
    repeatBtn.addEventListener('click', function() {
        const modes = ['off', 'all', 'one'];
        const currentIndex = modes.indexOf(repeatMode);
        repeatMode = modes[(currentIndex + 1) % modes.length];
        
        this.classList.toggle('active', repeatMode !== 'off');
        
        switch (repeatMode) {
            case 'all':
                this.title = 'Repeat All';
                break;
            case 'one':
                this.title = 'Repeat One';
                break;
            case 'off':
                this.title = 'Repeat Off';
                break;
        }
    });
    
    let isShuffle = false;
    shuffleBtn.addEventListener('click', function() {
        isShuffle = !isShuffle;
        this.classList.toggle('active', isShuffle);
        this.title = isShuffle ? 'Shuffle On' : 'Shuffle Off';
    });
    
    downloadBtn.addEventListener('click', function() {
        showNotification('ਡਾਊਨਲੋਡ ਸ਼ੁਰੂ ਹੋ ਰਿਹਾ ਹੈ...');
        // In a real app, this would trigger a download
    });
    
    shareBtn.addEventListener('click', function() {
        shareCurrentTrack();
    });
    
    // Live play button
    document.getElementById('playLiveBtn').addEventListener('click', function() {
        if (!isPlaying) {
            playChannel('kirtan');
        } else {
            togglePlayPause();
        }
    });
    
    // Initial volume
    audioPlayer.volume = volumeSlider.value / 100;
}

function togglePlayPause() {
    if (!audioPlayer) return;
    
    if (isPlaying) {
        audioPlayer.pause();
    } else {
        audioPlayer.play().catch(e => {
            console.log('Play failed:', e);
            // Show error to user
            showNotification('ਆਡੀਓ ਪਲੇ ਕਰਨ ਵਿੱਚ ਅਸਫਲ. ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ.');
        });
    }
}

function playPrevious() {
    if (!currentChannel) return;
    
    const channels = document.querySelectorAll('.channel-card');
    const currentIndex = Array.from(channels).findIndex(card => 
        card.dataset.channel === currentChannel
    );
    
    let prevIndex;
    if (isShuffle) {
        prevIndex = Math.floor(Math.random() * channels.length);
    } else {
        prevIndex = (currentIndex - 1 + channels.length) % channels.length;
    }
    
    const prevChannel = channels[prevIndex].dataset.channel;
    playChannel(prevChannel);
}

function playNext() {
    if (!currentChannel) return;
    
    const channels = document.querySelectorAll('.channel-card');
    const currentIndex = Array.from(channels).findIndex(card => 
        card.dataset.channel === currentChannel
    );
    
    let nextIndex;
    if (isShuffle) {
        nextIndex = Math.floor(Math.random() * channels.length);
    } else {
        nextIndex = (currentIndex + 1) % channels.length;
    }
    
    const nextChannel = channels[nextIndex].dataset.channel;
    playChannel(nextChannel);
}

function playChannel(channelId) {
    if (!audioPlayer) return;
    
    const channelData = channelsData[channelId];
    if (!channelData) return;
    
    // Update current channel
    currentChannel = channelId;
    
    // Update audio source
    audioPlayer.src = channelData.streamUrl;
    
    // Update UI
    document.getElementById('currentTrack').textContent = channelData.currentTrack;
    document.getElementById('currentArtist').textContent = channelData.artist;
    document.getElementById('currentChannel').textContent = channelData.name;
    
    // Update channel cards
    document.querySelectorAll('.channel-card').forEach(card => {
        const playBtn = card.querySelector('.channel-play');
        if (card.dataset.channel === channelId) {
            card.classList.add('active');
            if (playBtn) {
                playBtn.innerHTML = '<i class="fas fa-pause"></i> ਲਾਈਵ';
                playBtn.classList.add('playing');
            }
        } else {
            card.classList.remove('active');
            if (playBtn) {
                playBtn.innerHTML = '<i class="fas fa-play"></i> ਸੁਣੋ';
                playBtn.classList.remove('playing');
            }
        }
    });
    
    // Play audio
    audioPlayer.play().catch(e => {
        console.log('Channel switch play failed:', e);
    });
    
    // Show notification
    showNotification(`${channelData.name} ਚੈਨਲ ਚਲ ਰਿਹਾ ਹੈ`);
    
    // Update live listeners
    updateLiveListeners();
}

function updateProgress(percentage) {
    const progressFill = document.getElementById('progressFill');
    const progressThumb = document.getElementById('progressThumb');
    
    if (progressFill && progressThumb) {
        progressFill.style.width = `${percentage * 100}%`;
        progressThumb.style.left = `${percentage * 100}%`;
    }
}

function updateSpinningDisc(shouldSpin) {
    const disc = document.querySelector('.spinning');
    if (disc) {
        if (shouldSpin) {
            disc.style.animation = 'spin 10s linear infinite';
        } else {
            disc.style.animation = 'spin 10s linear infinite paused';
        }
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function shareCurrentTrack() {
    const track = document.getElementById('currentTrack').textContent;
    const artist = document.getElementById('currentArtist').textContent;
    const channel = document.getElementById('currentChannel').textContent;
    
    const shareText = `ਮੈਂ ਇਹ ਸੁਣ ਰਿਹਾ ਹਾਂ: "${track}" - ${artist} (${channel})`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: 'Gurfateh Radio',
            text: shareText,
            url: shareUrl
        }).catch(console.error);
    } else {
        // Fallback: copy to clipboard
        const textToCopy = `${shareText}\n${shareUrl}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            showNotification('ਲਿੰਕ ਕਲਿੱਪਬੋਰਡ ਵਿੱਚ ਕਾਪੀ ਕੀਤਾ ਗਿਆ!');
        }).catch(console.error);
    }
}

// Channels Data
const channelsData = {
    kirtan: {
        id: 'kirtan',
        name: 'ਕੀਰਤਨ ਚੈਨਲ',
        description: 'ਸ਼ਾਂਤੀਪੂਰਣ ਗੁਰਬਾਣੀ ਕੀਰਤਨ',
        icon: 'music',
        color: '#FF9800',
        streamUrl: 'https://stream.gurfatehradio.com/kirtan.mp3',
        currentTrack: 'ਗੁਰਬਾਣੀ ਕੀਰਤਨ',
        artist: 'ਭਾਈ ਹਰਭਜਨ ਸਿੰਘ',
        listeners: 1250,
        tags: ['ਕੀਰਤਨ', 'ਗੁਰਬਾਣੀ', 'ਸ਼ਾਂਤੀ']
    },
    katha: {
        id: 'katha',
        name: 'ਕਥਾ ਚੈਨਲ',
        description: 'ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਕਥਾ',
        icon: 'book-open',
        color: '#4CAF50',
        streamUrl: 'https://stream.gurfatehradio.com/katha.mp3',
        currentTrack: 'ਸੁਖਮਨੀ ਸਾਹਿਬ ਕਥਾ',
        artist: 'ਗਿਆਨੀ ਗੁਰਬਚਨ ਸਿੰਘ',
        listeners: 890,
        tags: ['ਕਥਾ', 'ਵਿਆਖਿਆ', 'ਗਿਆਨ']
    },
    simran: {
        id: 'simran',
        name: 'ਸਿਮਰਨ ਚੈਨਲ',
        description: 'ਨਾਮ ਸਿਮਰਨ ਅਤੇ ਭਜਨ',
        icon: 'pray',
        color: '#2196F3',
        streamUrl: 'https://stream.gurfatehradio.com/simran.mp3',
        currentTrack: 'ਵਾਹਿਗੁਰੂ ਸਿਮਰਨ',
        artist: 'ਸੰਤ ਸਿੰਘ',
        listeners: 1050,
        tags: ['ਸਿਮਰਨ', 'ਭਜਨ', 'ਮੈਡੀਟੇਸ਼ਨ']
    },
    history: {
        id: 'history',
        name: 'ਇਤਿਹਾਸ ਚੈਨਲ',
        description: 'ਸਿੱਖ ਇਤਿਹਾਸ ਅਤੇ ਸਾਖੀਆਂ',
        icon: 'landmark',
        color: '#9C27B0',
        streamUrl: 'https://stream.gurfatehradio.com/history.mp3',
        currentTrack: 'ਸਿੱਖ ਇਤਿਹਾਸ',
        artist: 'ਪ੍ਰੋਫੈਸਰ ਕਿਰਪਾਲ ਸਿੰਘ',
        listeners: 750,
        tags: ['ਇਤਿਹਾਸ', 'ਸਾਖੀ', 'ਗਾਥਾ']
    },
    live: {
        id: 'live',
        name: 'ਲਾਈਵ ਚੈਨਲ',
        description: 'ਲਾਈਵ ਹਰਿਮੰਦਰ ਸਾਹਿਬ',
        icon: 'broadcast-tower',
        color: '#F44336',
        streamUrl: 'https://stream.gurfatehradio.com/live.mp3',
        currentTrack: 'ਲਾਈਵ ਹਰਿਮੰਦਰ ਸਾਹਿਬ',
        artist: 'ਅੰਮ੍ਰਿਤਸਰ',
        listeners: 3500,
        tags: ['ਲਾਈਵ', 'ਅੰਮ੍ਰਿਤਸਰ', 'ਕੀਰਤਨ']
    },
    japji: {
        id: 'japji',
        name: 'ਜਪੁਜੀ ਚੈਨਲ',
        description: 'ਮੁੱਖ ਨਿਤਨੇਮ ਪਾਠ',
        icon: 'praying-hands',
        color: '#FF5722',
        streamUrl: 'https://stream.gurfatehradio.com/japji.mp3',
        currentTrack: 'ਜਪੁਜੀ ਸਾਹਿਬ',
        artist: 'ਭਾਈ ਜਸਵਿੰਦਰ ਸਿੰਘ',
        listeners: 2100,
        tags: ['ਨਿਤਨੇਮ', 'ਜਪੁਜੀ', 'ਪਾਠ']
    },
    kids: {
        id: 'kids',
        name: 'ਬੱਚਿਆਂ ਲਈ',
        description: 'ਬੱਚਿਆਂ ਲਈ ਕਹਾਣੀਆਂ ਅਤੇ ਕੀਰਤਨ',
        icon: 'child',
        color: '#E91E63',
        streamUrl: 'https://stream.gurfatehradio.com/kids.mp3',
        currentTrack: 'ਬੱਚਿਆਂ ਦੀਆਂ ਕਹਾਣੀਆਂ',
        artist: 'ਭਾਈ ਬਲਜਿੰਦਰ ਸਿੰਘ',
        listeners: 620,
        tags: ['ਬੱਚੇ', 'ਕਹਾਣੀ', 'ਸਿੱਖਿਆ']
    },
    english: {
        id: 'english',
        name: 'ਅੰਗਰੇਜ਼ੀ ਚੈਨਲ',
        description: 'English Katha & Kirtan',
        icon: 'language',
        color: '#3F51B5',
        streamUrl: 'https://stream.gurfatehradio.com/english.mp3',
        currentTrack: 'Sikh History in English',
        artist: 'Dr. Harbans Singh',
        listeners: 940,
        tags: ['English', 'ਕਥਾ', 'ਅਨੁਵਾਦ']
    }
};

// Initialize Channels
function initChannels() {
    const channelsGrid = document.getElementById('channelsGrid');
    if (!channelsGrid) return;
    
    // Clear existing content
    channelsGrid.innerHTML = '';
    
    // Create channel cards
    Object.values(channelsData).forEach(channel => {
        const channelCard = document.createElement('div');
        channelCard.className = 'channel-card';
        channelCard.dataset.channel = channel.id;
        
        channelCard.innerHTML = `
            <div class="channel-header">
                <div class="channel-icon">
                    <i class="fas fa-${channel.icon}"></i>
                </div>
                <div class="channel-status">
                    <span class="live-badge">ਲਾਈਵ</span>
                    <span class="listeners">${channel.listeners.toLocaleString()} ਸੁਣ ਰਹੇ</span>
                </div>
            </div>
            <h3 class="channel-name">${channel.name}</h3>
            <p class="channel-desc">${channel.description}</p>
            <div class="channel-tags">
                ${channel.tags.map(tag => `<span class="channel-tag">${tag}</span>`).join('')}
            </div>
            <button class="channel-play">
                <i class="fas fa-play"></i>
                ਸੁਣੋ
            </button>
        `;
        
        // Add click event to play channel
        const playBtn = channelCard.querySelector('.channel-play');
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playChannel(channel.id);
        });
        
        // Add click event to entire card
        channelCard.addEventListener('click', (e) => {
            if (!e.target.closest('.channel-play')) {
                playChannel(channel.id);
            }
        });
        
        channelsGrid.appendChild(channelCard);
    });
    
    // View all channels button
    document.getElementById('viewAllChannels').addEventListener('click', () => {
        // Scroll to channels section
        document.getElementById('channels').scrollIntoView({ behavior: 'smooth' });
    });
}

// Schedule Data
const scheduleData = {
    today: [
        { time: '4:00 AM', program: 'ਅੰਮ੍ਰਿਤ ਵੇਲਾ', channel: 'ਸਿਮਰਨ' },
        { time: '5:00 AM', program: 'ਜਪੁਜੀ ਸਾਹਿਬ', channel: 'ਜਪੁਜੀ' },
        { time: '6:00 AM', program: 'ਸੋਹਿਲਾ ਸਾਹਿਬ', channel: 'ਨਿਤਨੇਮ' },
        { time: '7:00 AM', program: 'ਕੀਰਤਨ', channel: 'ਕੀਰਤਨ', now: true },
        { time: '8:00 AM', program: 'ਸੁਖਮਨੀ ਸਾਹਿਬ', channel: 'ਕਥਾ' },
        { time: '9:00 AM', program: 'ਸਿੱਖ ਇਤਿਹਾਸ', channel: 'ਇਤਿਹਾਸ' },
        { time: '10:00 AM', program: 'ਕਥਾ', channel: 'ਕਥਾ' },
        { time: '11:00 AM', program: 'ਲਾਈਵ ਕੀਰਤਨ', channel: 'ਲਾਈਵ' },
        { time: '12:00 PM', program: 'ਰਹਿਰਾਸ ਸਾਹਿਬ', channel: 'ਨਿਤਨੇਮ' },
        { time: '1:00 PM', program: 'ਬੱਚਿਆਂ ਲਈ ਕਹਾਣੀਆਂ', channel: 'ਬੱਚੇ' },
        { time: '2:00 PM', program: 'ਅੰਗਰੇਜ਼ੀ ਕਥਾ', channel: 'ਅੰਗਰੇਜ਼ੀ' },
        { time: '3:00 PM', program: 'ਕੀਰਤਨ ਦਰਬਾਰ', channel: 'ਕੀਰਤਨ' },
        { time: '4:00 PM', program: 'ਸੁਖਮਨੀ ਸਾਹਿਬ', channel: 'ਕਥਾ' },
        { time: '5:00 PM', program: 'ਇਤਿਹਾਸ', channel: 'ਇਤਿਹਾਸ' },
        { time: '6:00 PM', program: 'ਰਹਿਰਾਸ ਸਾਹਿਬ', channel: 'ਨਿਤਨੇਮ' },
        { time: '7:00 PM', program: 'ਕੀਰਤਨ', channel: 'ਕੀਰਤਨ' },
        { time: '8:00 PM', program: 'ਕਥਾ', channel: 'ਕਥਾ' },
        { time: '9:00 PM', program: 'ਸੋਹਿਲਾ ਸਾਹਿਬ', channel: 'ਨਿਤਨੇਮ' },
        { time: '10:00 PM', program: 'ਸਿਮਰਨ', channel: 'ਸਿਮਰਨ' }
    ],
    tomorrow: [
        { time: '4:00 AM', program: 'ਅੰਮ੍ਰਿਤ ਵੇਲਾ', channel: 'ਸਿਮਰਨ' },
        { time: '5:00 AM', program: 'ਜਪੁਜੀ ਸਾਹਿਬ', channel: 'ਜਪੁਜੀ' },
        { time: '6:00 AM', program: 'ਸੋਹਿਲਾ ਸਾਹਿਬ', channel: 'ਨਿਤਨੇਮ' },
        { time: '7:00 AM', program: 'ਕੀਰਤਨ', channel: 'ਕੀਰਤਨ' },
        { time: '8:00 AM', program: 'ਸੁਖਮਨੀ ਸਾਹਿਬ', channel: 'ਕਥਾ' },
        { time: '9:00 AM', program: 'ਵਿਸ਼ੇਸ਼ ਕਥਾ', channel: 'ਕਥਾ' },
        { time: '10:00 AM', program: 'ਇਤਿਹਾਸ', channel: 'ਇਤਿਹਾਸ' },
        { time: '11:00 AM', program: 'ਲਾਈਵ ਕੀਰਤਨ', channel: 'ਲਾਈਵ' },
        { time: '12:00 PM', program: 'ਰਹਿਰਾਸ ਸਾਹਿਬ', channel: 'ਨਿਤਨੇਮ' },
        { time: '1:00 PM', program: 'ਬੱਚਿਆਂ ਲਈ ਕਹਾਣੀਆਂ', channel: 'ਬੱਚੇ' },
        { time: '2:00 PM', program: 'ਅੰਗਰੇਜ਼ੀ ਕਥਾ', channel: 'ਅੰਗਰੇਜ਼ੀ' },
        { time: '3:00 PM', program: 'ਕੀਰਤਨ ਦਰਬਾਰ', channel: 'ਕੀਰਤਨ' },
        { time: '4:00 PM', program: 'ਸੁਖਮਨੀ ਸਾਹਿਬ', channel: 'ਕਥਾ' },
        { time: '5:00 PM', program: 'ਇਤਿਹਾਸ', channel: 'ਇਤਿਹਾਸ' },
        { time: '6:00 PM', program: 'ਰਹਿਰਾਸ ਸਾਹਿਬ', channel: 'ਨਿਤਨੇਮ' },
        { time: '7:00 PM', program: 'ਕੀਰਤਨ', channel: 'ਕੀਰਤਨ' },
        { time: '8:00 PM', program: 'ਕਥਾ', channel: 'ਕਥਾ' },
        { time: '9:00 PM', program: 'ਸੋਹਿਲਾ ਸਾਹਿਬ', channel: 'ਨਿਤਨੇਮ' },
        { time: '10:00 PM', program: 'ਸਿਮਰਨ', channel: 'ਸਿਮਰਨ' }
    ],
    week: [
        { time: 'Mon', program: 'ਸਪੈਸ਼ਲ ਕੀਰਤਨ', channel: 'ਕੀਰਤਨ' },
        { time: 'Tue', program: 'ਸੁਖਮਨੀ ਕਥਾ', channel: 'ਕਥਾ' },
        { time: 'Wed', program: 'ਇਤਿਹਾਸ ਸਪੈਸ਼ਲ', channel: 'ਇਤਿਹਾਸ' },
        { time: 'Thu', program: 'ਯੁਵਾ ਕੀਰਤਨ', channel: 'ਕੀਰਤਨ' },
        { time: 'Fri', program: 'ਲਾਈਵ ਦਰਬਾਰ', channel: 'ਲਾਈਵ' },
        { time: 'Sat', program: 'ਪਰਿਵਾਰਕ ਕਥਾ', channel: 'ਕਥਾ' },
        { time: 'Sun', program: 'ਮਹਾਂ ਕੀਰਤਨ', channel: 'ਕੀਰਤਨ' }
    ]
};

// Initialize Schedule
function initSchedule() {
    const scheduleList = document.getElementById('scheduleList');
    const scheduleTabs = document.querySelectorAll('.schedule-tab');
    
    // Load today's schedule by default
    loadSchedule('today');
    
    // Tab switching
    scheduleTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            scheduleTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            // Load corresponding schedule
            loadSchedule(tab.dataset.day);
        });
    });
    
    function loadSchedule(day) {
        if (!scheduleList) return;
        
        const schedule = scheduleData[day];
        if (!schedule) return;
        
        scheduleList.innerHTML = '';
        
        schedule.forEach((item, index) => {
            const scheduleItem = document.createElement('div');
            scheduleItem.className = `schedule-item ${item.now ? 'now' : ''}`;
            
            scheduleItem.innerHTML = `
                <span class="schedule-time">${item.time}</span>
                <span class="schedule-program">${item.program}</span>
                <span class="schedule-channel">${item.channel}</span>
            `;
            
            // Add click event to play program
            if (item.channel) {
                scheduleItem.style.cursor = 'pointer';
                scheduleItem.addEventListener('click', () => {
                    const channelId = getChannelIdByName(item.channel);
                    if (channelId) {
                        playChannel(channelId);
                    }
                });
            }
            
            // Add animation delay
            scheduleItem.style.animationDelay = `${index * 0.1}s`;
            
            scheduleList.appendChild(scheduleItem);
        });
    }
}

function getChannelIdByName(channelName) {
    const channelMap = {
        'ਕੀਰਤਨ': 'kirtan',
        'ਕਥਾ': 'katha',
        'ਸਿਮਰਨ': 'simran',
        'ਇਤਿਹਾਸ': 'history',
        'ਲਾਈਵ': 'live',
        'ਜਪੁਜੀ': 'japji',
        'ਨਿਤਨੇਮ': 'japji',
        'ਬੱਚੇ': 'kids',
        'ਅੰਗਰੇਜ਼ੀ': 'english'
    };
    
    return channelMap[channelName];
}

// Update Live Listeners
function updateLiveListeners() {
    const liveListenersEl = document.getElementById('liveListeners');
    if (!liveListenersEl) return;
    
    // Simulate live listener count
    let baseCount = 1250;
    let channelBonus = 0;
    
    if (currentChannel && channelsData[currentChannel]) {
        channelBonus = channelsData[currentChannel].listeners;
    }
    
    // Random fluctuation
    const fluctuation = Math.floor(Math.random() * 200) - 100;
    const total = baseCount + channelBonus + fluctuation;
    
    // Animate the number change
    animateNumber(liveListenersEl, parseInt(liveListenersEl.textContent.replace(/,/g, '')), total);
}

function animateNumber(element, start, end, duration = 1000) {
    if (start === end) return;
    
    const range = end - start;
    const startTime = Date.now();
    
    function updateNumber() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const eased = progress < 0.5 
            ? 2 * progress * progress 
            : -1 + (4 - 2 * progress) * progress;
        
        const current = Math.floor(start + range * eased);
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            element.textContent = end.toLocaleString();
        }
    }
    
    updateNumber();
}

// Event Listeners
function initEventListeners() {
    // Newsletter subscription
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = document.getElementById('newsletterEmail');
            const email = emailInput.value.trim();
            
            if (email && isValidEmail(email)) {
                showNotification('ਤੁਹਾਡਾ ਈਮੇਲ ਸਬਸਕ੍ਰਾਈਬ ਕੀਤਾ ਗਿਆ!');
                emailInput.value = '';
            } else {
                showNotification('ਕਿਰਪਾ ਕਰਕੇ ਵੈਧ ਈਮੇਲ ਦਰਜ ਕਰੋ', 'error');
            }
        });
    }
    
    // Login button
    document.querySelector('.btn-login').addEventListener('click', () => {
        showNotification('ਲਾਗਇਨ ਸਿਸਟਮ ਜਲਦੀ ਹੀ ਉਪਲੱਬਧ ਹੋਵੇਗਾ');
    });
    
    // Download buttons
    document.querySelectorAll('.btn-download, .btn-app').forEach(btn => {
        btn.addEventListener('click', function() {
            const platform = this.textContent.includes('Google') ? 'Android' :
                           this.textContent.includes('App Store') ? 'iOS' : 'Desktop';
            showNotification(`${platform} ਐਪ ਡਾਊਨਲੋਡ ਸ਼ੁਰੂ ਹੋ ਰਿਹਾ ਹੈ...`);
        });
    });
    
    // Social links
    document.querySelectorAll('.social-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.querySelector('i').className.split('-')[1];
            showNotification(`${platform} ਪੇਜ ਜਲਦੀ ਹੀ ਉਪਲੱਬਧ ਹੋਵੇਗੀ`);
        });
    });
}

// Utility Functions
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#F44336'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        z-index: 9999;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add animation styles
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
`;
document.head.appendChild(style);

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Auto-refresh live listeners every 30 seconds
setInterval(updateLiveListeners, 30000);

// Initialize with a channel
setTimeout(() => {
    playChannel('kirtan');
}, 3000);