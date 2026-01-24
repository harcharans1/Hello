// Advanced Audio Player with Playlist Management

const AudioPlayer = (function() {
    // Private variables
    let currentTrackIndex = 0;
    let isPlaying = false;
    let isPlaylistVisible = false;
    let volume = 80;
    
    // Sample playlist data
    const playlist = [
        {
            id: 1,
            title: "Japji Sahib (Complete)",
            artist: "Bhai Nirmal Singh",
            duration: "20:45",
            src: "https://docs.google.com/uc?export=download&id=1YhKsTpKCoAPcmtybBF8T_bmq2Vb9K2Vk"
        },
        {
            id: 2,
            title: "Asa Di Var - Part 1",
            artist: "Bhai Harvinder Singh",
            duration: "15:30",
            src: "https://docs.google.com/uc?export=download&id=1YhKsTpKCoAPcmtybBF8T_bmq2Vb9K2Vk"
        },
        {
            id: 3,
            title: "Anand Sahib (6 Pauris)",
            artist: "Golden Temple Hazuri Ragi",
            duration: "12:15",
            src: "https://docs.google.com/uc?export=download&id=1YhKsTpKCoAPcmtybBF8T_bmq2Vb9K2Vk"
        },
        {
            id: 4,
            title: "Sukhmani Sahib - First Astpadi",
            artist: "Bibi Jaswinder Kaur",
            duration: "8:45",
            src: "https://docs.google.com/uc?export=download&id=1YhKsTpKCoAPcmtybBF8T_bmq2Vb9K2Vk"
        },
        {
            id: 5,
            title: "Rehras Sahib (Evening Prayer)",
            artist: "Sangat Live Recording",
            duration: "25:20",
            src: "https://docs.google.com/uc?export=download&id=1YhKsTpKCoAPcmtybBF8T_bmq2Vb9K2Vk"
        }
    ];
    
    // DOM Elements
    const audioElement = document.getElementById('audioElement');
    const playBtn = document.getElementById('playBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const progressBar = document.getElementById('progressBar');
    const progress = document.getElementById('progress');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeIcon = document.getElementById('volumeIcon');
    const playlistToggle = document.getElementById('playlistToggle');
    const playlistSidebar = document.getElementById('playlistSidebar');
    const playlistItems = document.getElementById('playlistItems');
    const trackTitle = document.querySelector('.track-title');
    const trackArtist = document.querySelector('.track-artist');
    
    // Initialize the audio player
    function init() {
        if (!audioElement) {
            console.error('Audio element not found');
            return;
        }
        
        setupEventListeners();
        loadTrack(currentTrackIndex);
        renderPlaylist();
        updatePlaylistActive();
    }
    
    // Setup all event listeners
    function setupEventListeners() {
        // Play/Pause button
        if (playBtn) {
            playBtn.addEventListener('click', togglePlay);
        }
        
        // Previous button
        if (prevBtn) {
            prevBtn.addEventListener('click', prevTrack);
        }
        
        // Next button
        if (nextBtn) {
            nextBtn.addEventListener('click', nextTrack);
        }
        
        // Progress bar click
        if (progressBar) {
            progressBar.addEventListener('click', seek);
        }
        
        // Volume slider
        if (volumeSlider) {
            volumeSlider.addEventListener('input', updateVolume);
        }
        
        // Playlist toggle
        if (playlistToggle) {
            playlistToggle.addEventListener('click', togglePlaylist);
        }
        
        // Audio element events
        if (audioElement) {
            audioElement.addEventListener('timeupdate', updateProgress);
            audioElement.addEventListener('loadedmetadata', updateDuration);
            audioElement.addEventListener('ended', nextTrack);
            audioElement.addEventListener('play', () => {
                isPlaying = true;
                updatePlayButton();
            });
            audioElement.addEventListener('pause', () => {
                isPlaying = false;
                updatePlayButton();
            });
        }
        
        // Close playlist when clicking outside
        document.addEventListener('click', (e) => {
            if (isPlaylistVisible && 
                !e.target.closest('.playlist-sidebar') && 
                !e.target.closest('.playlist-toggle')) {
                togglePlaylist(false);
            }
        });
    }
    
    // Load a track by index
    function loadTrack(index) {
        if (index < 0 || index >= playlist.length) {
            index = 0;
        }
        
        currentTrackIndex = index;
        const track = playlist[index];
        
        if (audioElement && track.src) {
            audioElement.src = track.src;
            audioElement.volume = volume / 100;
            
            // Update UI
            updateTrackInfo(track);
            updatePlaylistActive();
            
            // Auto-play if was playing
            if (isPlaying) {
                audioElement.play().catch(e => {
                    console.log('Auto-play prevented:', e);
                    isPlaying = false;
                    updatePlayButton();
                });
            }
        }
    }
    
    // Play a stream (for live radio)
    function playStream(streamName) {
        if (!audioElement) return;
        
        // For demo, use a sample stream URL
        // In production, use actual radio stream URLs
        const streamUrl = "https://docs.google.com/uc?export=download&id=1YhKsTpKCoAPcmtybBF8T_bmq2Vb9K2Vk";
        
        audioElement.src = streamUrl;
        audioElement.volume = volume / 100;
        
        // Update UI for stream
        trackTitle.textContent = `Live: ${streamName}`;
        trackArtist.textContent = 'Gurbani Radio Stream';
        durationEl.textContent = 'LIVE';
        
        // Play the stream
        audioElement.play().then(() => {
            isPlaying = true;
            updatePlayButton();
        }).catch(e => {
            console.error('Error playing stream:', e);
            showErrorToast('Unable to play stream. Please try again.');
        });
    }
    
    // Play a specific track object
    function playTrack(track) {
        if (!audioElement) return;
        
        // Update UI
        updateTrackInfo(track);
        
        // For demo, use sample audio
        // In production, use track.src
        audioElement.src = "https://docs.google.com/uc?export=download&id=1YhKsTpKCoAPcmtybBF8T_bmq2Vb9K2Vk";
        audioElement.volume = volume / 100;
        
        audioElement.play().then(() => {
            isPlaying = true;
            updatePlayButton();
        }).catch(e => {
            console.error('Error playing track:', e);
        });
    }
    
    // Add tracks to playlist
    function addToPlaylist(tracks) {
        if (!Array.isArray(tracks)) tracks = [tracks];
        
        tracks.forEach(track => {
            playlist.push({
                id: playlist.length + 1,
                ...track,
                src: track.src || "https://docs.google.com/uc?export=download&id=1YhKsTpKCoAPcmtybBF8T_bmq2Vb9K2Vk"
            });
        });
        
        renderPlaylist();
        
        // Show notification
        if (window.GurbaniRadio && window.GurbaniRadio.showToast) {
            window.GurbaniRadio.showToast(`Added ${tracks.length} track(s) to playlist`, 'success');
        }
    }
    
    // Toggle play/pause
    function togglePlay() {
        if (!audioElement) return;
        
        if (isPlaying) {
            audioElement.pause();
        } else {
            audioElement.play().catch(e => {
                console.log('Play failed:', e);
                // If no source is loaded, load first track
                if (!audioElement.src) {
                    loadTrack(0);
                    audioElement.play();
                }
            });
        }
    }
    
    // Previous track
    function prevTrack() {
        let newIndex = currentTrackIndex - 1;
        if (newIndex < 0) newIndex = playlist.length - 1;
        loadTrack(newIndex);
        if (isPlaying) audioElement.play();
    }
    
    // Next track
    function nextTrack() {
        let newIndex = currentTrackIndex + 1;
        if (newIndex >= playlist.length) newIndex = 0;
        loadTrack(newIndex);
        if (isPlaying) audioElement.play();
    }
    
    // Seek in track
    function seek(e) {
        if (!audioElement || !audioElement.duration) return;
        
        const progressBarRect = progressBar.getBoundingClientRect();
        const clickPosition = e.clientX - progressBarRect.left;
        const totalWidth = progressBarRect.width;
        const percentage = clickPosition / totalWidth;
        
        audioElement.currentTime = percentage * audioElement.duration;
    }
    
    // Update volume
    function updateVolume(e) {
        volume = e.target.value;
        
        if (audioElement) {
            audioElement.volume = volume / 100;
        }
        
        // Update volume icon
        if (volumeIcon) {
            if (volume == 0) {
                volumeIcon.className = 'fas fa-volume-mute';
            } else if (volume < 50) {
                volumeIcon.className = 'fas fa-volume-down';
            } else {
                volumeIcon.className = 'fas fa-volume-up';
            }
        }
    }
    
    // Toggle playlist visibility
    function togglePlaylist(show) {
        isPlaylistVisible = show !== undefined ? show : !isPlaylistVisible;
        
        if (playlistSidebar) {
            if (isPlaylistVisible) {
                playlistSidebar.classList.add('show');
            } else {
                playlistSidebar.classList.remove('show');
            }
        }
    }
    
    // Update progress bar
    function updateProgress() {
        if (!audioElement || !audioElement.duration) return;
        
        const currentTime = audioElement.currentTime;
        const duration = audioElement.duration;
        const percentage = (currentTime / duration) * 100;
        
        if (progress) {
            progress.style.width = `${percentage}%`;
        }
        
        if (currentTimeEl) {
            currentTimeEl.textContent = formatTime(currentTime);
        }
    }
    
    // Update duration display
    function updateDuration() {
        if (durationEl && audioElement.duration) {
            durationEl.textContent = formatTime(audioElement.duration);
        }
    }
    
    // Update play button state
    function updatePlayButton() {
        if (!playBtn) return;
        
        const icon = playBtn.querySelector('i');
        if (icon) {
            icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
        }
    }
    
    // Update track info display
    function updateTrackInfo(track) {
        if (trackTitle) {
            trackTitle.textContent = track.title || 'Unknown Track';
        }
        
        if (trackArtist) {
            trackArtist.textContent = track.artist || 'Unknown Artist';
        }
        
        if (durationEl && track.duration) {
            durationEl.textContent = track.duration;
        }
    }
    
    // Render playlist items
    function renderPlaylist() {
        if (!playlistItems) return;
        
        playlistItems.innerHTML = '';
        
        playlist.forEach((track, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div>
                    <strong>${track.title}</strong>
                    <span>${track.artist} • ${track.duration}</span>
                </div>
                <button class="play-track-btn" data-index="${index}">
                    <i class="fas fa-play"></i>
                </button>
            `;
            
            li.addEventListener('click', (e) => {
                if (!e.target.closest('.play-track-btn')) {
                    loadTrack(index);
                    if (!isPlaying) togglePlay();
                }
            });
            
            // Play button for each track
            const playBtn = li.querySelector('.play-track-btn');
            if (playBtn) {
                playBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    loadTrack(index);
                    if (!isPlaying) togglePlay();
                });
            }
            
            playlistItems.appendChild(li);
        });
    }
    
    // Update active track in playlist
    function updatePlaylistActive() {
        if (!playlistItems) return;
        
        const items = playlistItems.querySelectorAll('li');
        items.forEach((item, index) => {
            item.classList.toggle('active', index === currentTrackIndex);
        });
    }
    
    // Format time (seconds to MM:SS)
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    // Show error toast
    function showErrorToast(message) {
        if (window.GurbaniRadio && window.GurbaniRadio.showToast) {
            window.GurbaniRadio.showToast(message, 'error');
        } else {
            alert(message);
        }
    }
    
    // Public API
    return {
        init,
        playStream,
        playTrack,
        addToPlaylist,
        togglePlay,
        prevTrack,
        nextTrack,
        togglePlaylist,
        getCurrentTrack: () => playlist[currentTrackIndex],
        getPlaylist: () => [...playlist],
        isPlaying: () => isPlaying
    };
})();

// Make AudioPlayer globally available
window.AudioPlayer = AudioPlayer;