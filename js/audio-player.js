// Advanced Audio Player
class AudioPlayer {
    constructor() {
        this.audio = new Audio();
        this.isPlaying = false;
        this.currentTrack = 0;
        this.playlist = [];
        this.volume = 0.8;
        this.initializePlayer();
    }
    
    initializePlayer() {
        // Sample playlist
        this.playlist = [
            {
                title: "Asa Di Var - Bhai Harvinder Singh",
                artist: "Raag Asa",
                src: "https://example.com/asa-di-var.mp3",
                duration: "12:45"
            },
            {
                title: "Japji Sahib Path",
                artist: "Golden Temple",
                src: "https://example.com/japji-sahib.mp3",
                duration: "22:30"
            },
            {
                title: "Anand Sahib (Full)",
                artist: "Bhai Nirmal Singh",
                src: "https://example.com/anand-sahib.mp3",
                duration: "18:15"
            },
            {
                title: "Sukhmani Sahib",
                artist: "Hazuri Ragi",
                src: "https://example.com/sukhmani-sahib.mp3",
                duration: "45:20"
            }
        ];
        
        this.setupEventListeners();
        this.loadTrack(this.currentTrack);
        this.updatePlaylistDisplay();
    }
    
    setupEventListeners() {
        const playBtn = document.querySelector('.play-btn');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        const progressBar = document.querySelector('.progress-bar');
        const volumeSlider = document.querySelector('.volume-slider');
        const playlistToggle = document.querySelector('.playlist-toggle');
        
        playBtn.addEventListener('click', () => this.togglePlay());
        prevBtn.addEventListener('click', () => this.prevTrack());
        nextBtn.addEventListener('click', () => this.nextTrack());
        
        progressBar.addEventListener('click', (e) => this.seek(e));
        volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        
        playlistToggle.addEventListener('click', () => this.togglePlaylist());
        
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.nextTrack());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
    }
    
    loadTrack(index) {
        if (index < 0 || index >= this.playlist.length) return;
        
        this.currentTrack = index;
        const track = this.playlist[index];
        
        this.audio.src = track.src;
        this.audio.volume = this.volume;
        
        // Update UI
        document.querySelector('.track-title').textContent = track.title;
        document.querySelector('.track-artist').textContent = track.artist;
        document.querySelector('.duration').textContent = track.duration;
        
        // Update playlist active item
        this.updatePlaylistActive();
        
        // Auto-play if was playing
        if (this.isPlaying) {
            this.audio.play();
        }
    }
    
    togglePlay() {
        const playBtn = document.querySelector('.play-btn i');
        
        if (this.isPlaying) {
            this.audio.pause();
            playBtn.className = 'fas fa-play';
        } else {
            this.audio.play();
            playBtn.className = 'fas fa-pause';
        }
        
        this.isPlaying = !this.isPlaying;
    }
    
    playStream(url, title) {
        this.audio.src = url;
        this.audio.play();
        this.isPlaying = true;
        
        document.querySelector('.track-title').textContent = title;
        document.querySelector('.track-artist').textContent = 'Live Stream';
        document.querySelector('.play-btn i').className = 'fas fa-pause';
    }
    
    prevTrack() {
        let newIndex = this.currentTrack - 1;
        if (newIndex < 0) newIndex = this.playlist.length - 1;
        this.loadTrack(newIndex);
        if (this.isPlaying) this.audio.play();
    }
    
    nextTrack() {
        let newIndex = this.currentTrack + 1;
        if (newIndex >= this.playlist.length) newIndex = 0;
        this.loadTrack(newIndex);
        if (this.isPlaying) this.audio.play();
    }
    
    seek(e) {
        const progressBar = e.currentTarget;
        const clickPosition = e.offsetX;
        const totalWidth = progressBar.clientWidth;
        const percentage = clickPosition / totalWidth;
        
        this.audio.currentTime = percentage * this.audio.duration;
    }
    
    updateProgress() {
        const progress = document.querySelector('.progress');
        const currentTime = document.querySelector('.current-time');
        
        if (!this.audio.duration) return;
        
        const percentage = (this.audio.currentTime / this.audio.duration) * 100;
        progress.style.width = `${percentage}%`;
        
        // Update time display
        currentTime.textContent = this.formatTime(this.audio.currentTime);
    }
    
    updateDuration() {
        const duration = document.querySelector('.duration');
        if (this.audio.duration) {
            duration.textContent = this.formatTime(this.audio.duration);
        }
    }
    
    setVolume(value) {
        this.volume = value / 100;
        this.audio.volume = this.volume;
        
        const volumeIcon = document.querySelector('.volume-container i');
        if (value == 0) {
            volumeIcon.className = 'fas fa-volume-mute';
        } else if (value < 50) {
            volumeIcon.className = 'fas fa-volume-down';
        } else {
            volumeIcon.className = 'fas fa-volume-up';
        }
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    togglePlaylist() {
        const playlistSidebar = document.querySelector('.playlist-sidebar');
        playlistSidebar.classList.toggle('show');
    }
    
    updatePlaylistDisplay() {
        const playlistItems = document.querySelector('.playlist-items');
        playlistItems.innerHTML = '';
        
        this.playlist.forEach((track, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${track.title}</strong>
                <span>${track.artist} • ${track.duration}</span>
            `;
            li.addEventListener('click', () => {
                this.loadTrack(index);
                if (!this.isPlaying) this.togglePlay();
            });
            playlistItems.appendChild(li);
        });
        
        this.updatePlaylistActive();
    }
    
    updatePlaylistActive() {
        const items = document.querySelectorAll('.playlist-items li');
        items.forEach((item, index) => {
            item.classList.toggle('active', index === this.currentTrack);
        });
    }
}

// Initialize audio player when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.audioPlayer = new AudioPlayer();
});